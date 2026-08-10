use std::sync::Arc;

use serde::Serialize;
use serde::de::DeserializeOwned;
use shared::ApiResponse;

use crate::state::AppState;
use crate::{auth, vault};

async fn do_get<T: DeserializeOwned + Serialize>(
    url: &str,
    token: &str,
) -> Result<(T, u16), String> {
    let client = reqwest::Client::new();
    let resp = client
        .get(url)
        .header("Authorization", format!("Bearer {}", token))
        .send()
        .await
        .map_err(|e| format!("network error: {}", e))?;

    let status = resp.status().as_u16();

    let api_resp: ApiResponse<T> = resp
        .json()
        .await
        .map_err(|e| format!("parse error: {}", e))?;

    if api_resp.success {
        api_resp
            .data
            .map(|d| (d, status))
            .ok_or_else(|| "no data in response".to_string())
    } else {
        Err(api_resp
            .message
            .unwrap_or_else(|| format!("server error ({})", status)))
    }
}

pub async fn get_with_auth<T: DeserializeOwned + Serialize>(
    state: &Arc<AppState>,
    path: &str,
) -> Result<T, String> {
    let server_url = state.server_url.read().unwrap().clone();
    let url = format!("{}{}", server_url, path);

    let token = state
        .access_token
        .read()
        .unwrap()
        .clone()
        .ok_or_else(|| "not logged in".to_string())?;

    match do_get(&url, &token).await {
        Ok((data, _)) => Ok(data),
        Err(_) => {
            let user_id = *state.user_id.read().unwrap();
            let uid = user_id.ok_or_else(|| "no user id".to_string())?;
            let refresh_token =
                vault::load(uid).map_err(|_| "failed to load refresh token".to_string())?;
            let new_token = auth::refresh(&server_url, &refresh_token).await?;
            *state.access_token.write().unwrap() = Some(new_token.clone());
            let (data, _) = do_get(&url, &new_token).await?;
            Ok(data)
        }
    }
}

async fn do_post<T: DeserializeOwned + Serialize, B: Serialize>(
    url: &str,
    token: &str,
    body: &B,
) -> Result<(T, u16), String> {
    let client = reqwest::Client::new();
    let resp = client
        .post(url)
        .header("Authorization", format!("Bearer {}", token))
        .json(body)
        .send()
        .await
        .map_err(|e| format!("network error: {}", e))?;

    let status = resp.status().as_u16();

    let api_resp: ApiResponse<T> = resp
        .json()
        .await
        .map_err(|e| format!("parse error: {}", e))?;

    if api_resp.success {
        api_resp
            .data
            .map(|d| (d, status))
            .ok_or_else(|| "no data in response".to_string())
    } else {
        Err(api_resp
            .message
            .unwrap_or_else(|| format!("server error ({})", status)))
    }
}

pub async fn post_with_auth<T: DeserializeOwned + Serialize, B: Serialize>(
    state: &Arc<AppState>,
    path: &str,
    body: &B,
) -> Result<T, String> {
    let server_url = state.server_url.read().unwrap().clone();
    let url = format!("{}{}", server_url, path);

    let token = state
        .access_token
        .read()
        .unwrap()
        .clone()
        .ok_or_else(|| "not logged in".to_string())?;

    match do_post(&url, &token, body).await {
        Ok((data, _)) => Ok(data),
        Err(_) => {
            let user_id = *state.user_id.read().unwrap();
            let uid = user_id.ok_or_else(|| "no user id".to_string())?;
            let refresh_token =
                vault::load(uid).map_err(|_| "failed to load refresh token".to_string())?;
            let new_token = auth::refresh(&server_url, &refresh_token).await?;
            *state.access_token.write().unwrap() = Some(new_token.clone());
            let (data, _) = do_post(&url, &new_token, body).await?;
            Ok(data)
        }
    }
}
