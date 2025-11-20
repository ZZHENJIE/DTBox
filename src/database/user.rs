use serde::{Deserialize, Serialize};

#[derive(Deserialize, Serialize)]
pub struct NewUser {
    pub name: String,
    pub pass_hash: String,
}

#[derive(Deserialize, Serialize)]
pub struct Authenticate {
    pub user_id: i64,
    pub token: String,
}

#[derive(Deserialize, Serialize)]
pub struct User {
    pub id: i64,
    pub name: String,
    pub pass_hash: String,
    pub token: Option<String>,
    pub config: Option<String>,
}

impl User {
    pub async fn create(
        db_pool: &sqlx::Pool<sqlx::Sqlite>,
        user: NewUser,
    ) -> anyhow::Result<(), anyhow::Error> {
        sqlx::query(
            r#"
            INSERT INTO "users" (name, pass_hash)
            VALUES (?, ?)
            "#,
        )
        .bind(user.name)
        .bind(user.pass_hash)
        .execute(db_pool)
        .await?;
        Ok(())
    }
    // pub async fn login(
    //     db_pool: &sqlx::Pool<sqlx::Sqlite>,
    //     user: NewUser,
    // ) -> anyhow::Result<String, anyhow::Error> {
    //     let
    // }
}
