use serde::{Deserialize, Serialize};

#[derive(Debug, Deserialize, Serialize)]
pub struct User {
    pub id: i64,
    pub name: String,
    pub pass_hash: String,
    pub config: serde_json::Value,
    pub follow: Option<Vec<String>>,
    pub create_time: chrono::DateTime<chrono::Utc>,
}

pub async fn find_for_name(
    name: &str,
    pool: &sqlx::Pool<sqlx::Postgres>,
) -> sqlx::Result<Option<User>> {
    let user = sqlx::query_as!(
        User,
        r#"
        SELECT id,
               name,
               pass_hash,
               config,
               follow,
               create_time
        FROM   users
        WHERE  name = $1
        LIMIT  1
        "#,
        name
    )
    .fetch_optional(pool)
    .await?;

    Ok(user)
}
