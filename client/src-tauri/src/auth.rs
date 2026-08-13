use shared::{
    ApiResponse, HealthCheckResult, UserCreateRequest, UserCreateResult, UserLoginRequest,
    UserLoginResult, UserRefreshResult,
};

pub async fn health(server_url: &str) -> Result<String, String> {
    let client = reqwest::Client::new();
    let resp = client
        .get(format!("{}/api/health", server_url))
        .send()
        .await
        .map_err(|e| format!("network error: {}", e))?;

    let status = resp.status().as_u16();
    if status != 200 {
        return Err(format!("server returned status {}", status));
    }

    let api_resp: ApiResponse<HealthCheckResult> = resp
        .json()
        .await
        .map_err(|e| format!("parse error: {}", e))?;

    if api_resp.success {
        api_resp
            .data
            .map(|d| d.version)
            .ok_or_else(|| "no data in response".to_string())
    } else {
        Err(api_resp
            .message
            .unwrap_or_else(|| "unknown error".to_string()))
    }
}

pub async fn login(
    server_url: &str,
    name: &str,
    password: &str,
) -> Result<UserLoginResult, String> {
    let client = reqwest::Client::new();
    let resp = client
        .post(format!("{}/api/user/login", server_url))
        .json(&UserLoginRequest {
            name: name.to_string(),
            password: password.to_string(),
        })
        .send()
        .await
        .map_err(|e| format!("network error: {}", e))?;

    let api_resp: ApiResponse<UserLoginResult> = resp
        .json()
        .await
        .map_err(|e| format!("parse error: {}", e))?;

    if api_resp.success {
        api_resp
            .data
            .ok_or_else(|| "no data in response".to_string())
    } else {
        Err(api_resp
            .message
            .unwrap_or_else(|| "unknown error".to_string()))
    }
}

pub async fn refresh(server_url: &str, refresh_token: &str) -> Result<String, String> {
    let client = reqwest::Client::new();
    let resp = client
        .get(format!("{}/api/user/refresh", server_url))
        .header("Refresh-Token", refresh_token)
        .send()
        .await
        .map_err(|e| format!("network error: {}", e))?;

    let api_resp: ApiResponse<UserRefreshResult> = resp
        .json()
        .await
        .map_err(|e| format!("parse error: {}", e))?;

    if api_resp.success {
        api_resp
            .data
            .map(|r| r.access_token)
            .ok_or_else(|| "no data in response".to_string())
    } else {
        Err(api_resp
            .message
            .unwrap_or_else(|| "unknown error".to_string()))
    }
}

pub async fn register(
    server_url: &str,
    name: &str,
    password: &str,
) -> Result<UserCreateResult, String> {
    let client = reqwest::Client::new();
    let resp = client
        .post(format!("{}/api/user/create", server_url))
        .json(&UserCreateRequest {
            name: name.to_string(),
            password: password.to_string(),
        })
        .send()
        .await
        .map_err(|e| format!("network error: {}", e))?;

    let api_resp: ApiResponse<UserCreateResult> = resp
        .json()
        .await
        .map_err(|e| format!("parse error: {}", e))?;

    if api_resp.success {
        api_resp
            .data
            .ok_or_else(|| "no data in response".to_string())
    } else {
        Err(api_resp
            .message
            .unwrap_or_else(|| "unknown error".to_string()))
    }
}

pub async fn logout(server_url: &str, access_token: &str) -> Result<(), String> {
    let client = reqwest::Client::new();
    let resp = client
        .post(format!("{}/api/user/logout", server_url))
        .header("Authorization", format!("Bearer {}", access_token))
        .send()
        .await
        .map_err(|e| format!("network error: {}", e))?;

    let api_resp: ApiResponse<()> = resp
        .json()
        .await
        .map_err(|e| format!("parse error: {}", e))?;

    if api_resp.success {
        Ok(())
    } else {
        Err(api_resp
            .message
            .unwrap_or_else(|| "unknown error".to_string()))
    }
}
