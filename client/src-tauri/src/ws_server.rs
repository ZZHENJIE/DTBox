use std::sync::Arc;

use futures_util::{SinkExt, StreamExt};
use tokio::net::TcpListener;
use tokio_tungstenite::tungstenite::Message;

use crate::state::AppState;
use crate::{auth, vault};

pub async fn start(state: Arc<AppState>) -> Result<u16, String> {
    let listener = TcpListener::bind("127.0.0.1:0")
        .await
        .map_err(|e| format!("bind failed: {}", e))?;

    let port = listener
        .local_addr()
        .map_err(|e| format!("local_addr failed: {}", e))?
        .port();

    tokio::spawn(async move {
        loop {
            let (stream, _) = match listener.accept().await {
                Ok(conn) => conn,
                Err(_) => continue,
            };

            let state = state.clone();
            tokio::spawn(async move {
                let ws_stream = match tokio_tungstenite::accept_async(stream).await {
                    Ok(ws) => ws,
                    Err(_) => return,
                };

                let (mut sender, mut receiver) = ws_stream.split();

                {
                    let token = state.access_token.read().unwrap().clone();
                    if let Some(t) = token {
                        let msg = serde_json::json!({ "type": "access_token", "token": t });
                        let _ = sender
                            .send(Message::Text(msg.to_string()))
                            .await;
                    }
                }

                while let Some(Ok(msg)) = receiver.next().await {
                    if let Message::Text(text) = msg {
                        if let Ok(req) = serde_json::from_str::<serde_json::Value>(&text) {
                            if req.get("type").and_then(|v| v.as_str()) == Some("refresh") {
                                let server_url = state.server_url.read().unwrap().clone();
                                let user_id = { *state.user_id.read().unwrap() };

                                if let Some(uid) = user_id {
                                    if let Ok(refresh_token) = vault::load(uid) {
                                        if let Ok(new_token) =
                                            auth::refresh(&server_url, &refresh_token).await
                                        {
                                            *state.access_token.write().unwrap() = Some(new_token.clone());
                                            let msg = serde_json::json!({
                                                "type": "access_token",
                                                "token": new_token
                                            });
                                            let _ = sender
                                                .send(Message::Text(msg.to_string()))
                                                .await;
                                        } else {
                                            let msg = serde_json::json!({
                                                "type": "error",
                                                "message": "token refresh failed"
                                            });
                                            let _ = sender
                                                .send(Message::Text(msg.to_string()))
                                                .await;
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            });
        }
    });

    Ok(port)
}
