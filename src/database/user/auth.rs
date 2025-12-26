use axum::{extract::Request, middleware::Next, response::Response};
use reqwest::StatusCode;

async fn auth<B>(mut req: Request<B>, next: Next<B>) -> Result<Response, StatusCode> {
    // 3.1 取 header
    let hdr = req.headers();
    let token = hdr
        .get("authorization")
        .and_then(|hv| hv.to_str().ok())
        .and_then(|s| s.strip_prefix("Bearer "))
        .ok_or(StatusCode::UNAUTHORIZED)?;

    // 3.2 验签 + 解析
    let claims = decode::<Claims>(
        token,
        &DecodingKey::from_secret(SECRET),
        &Validation::default(),
    )
    .map_err(|_| StatusCode::UNAUTHORIZED)?
    .claims;

    // 3.3 把 uid 塞进 extensions，下游直接取
    req.extensions_mut().insert(claims.sub);

    Ok(next.run(req).await)
}
