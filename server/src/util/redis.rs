use std::collections::HashMap;
use std::sync::{Arc, OnceLock};
use std::time::{Duration, Instant};

use redis::aio::MultiplexedConnection;
use sha2::{Digest, Sha256};
use tokio::sync::Mutex;

fn hash_token(token: &str) -> String {
    let mut hasher = Sha256::new();
    hasher.update(token.as_bytes());
    hex::encode(hasher.finalize())
}

fn blacklist_key(token_hash: &str) -> String {
    format!("blacklist:{}", token_hash)
}

static MEMORY_BLACKLIST: OnceLock<Arc<Mutex<HashMap<String, Instant>>>> = OnceLock::new();

fn memory_blacklist() -> &'static Arc<Mutex<HashMap<String, Instant>>> {
    MEMORY_BLACKLIST.get_or_init(|| Arc::new(Mutex::new(HashMap::new())))
}

pub async fn blacklist_access_token(
    redis: &Option<MultiplexedConnection>,
    token: &str,
    ttl_seconds: usize,
) -> Result<(), Box<dyn std::error::Error>> {
    let token_hash = hash_token(token);

    if let Some(redis) = redis {
        let mut conn = redis.clone();
        redis::cmd("SETEX")
            .arg(blacklist_key(&token_hash))
            .arg(ttl_seconds)
            .arg("1")
            .query_async::<()>(&mut conn)
            .await?;
    } else {
        memory_blacklist().lock().await.insert(token_hash, Instant::now() + Duration::from_secs(ttl_seconds as u64));
    }

    Ok(())
}

pub async fn is_token_blacklisted(
    redis: &Option<MultiplexedConnection>,
    token: &str,
) -> Result<bool, Box<dyn std::error::Error>> {
    let token_hash = hash_token(token);

    if let Some(redis) = redis {
        let mut conn = redis.clone();
        let exists: bool = redis::cmd("EXISTS")
            .arg(blacklist_key(&token_hash))
            .query_async(&mut conn)
            .await?;
        Ok(exists)
    } else {
        let mut map = memory_blacklist().lock().await;
        let now = Instant::now();
        map.retain(|_, expires| *expires > now);
        Ok(map.contains_key(&token_hash))
    }
}
