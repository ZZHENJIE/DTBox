use crate::entity::login_logs;
use crate::entity::users::{self, ActiveModel, Column, Model, Role};
use sea_orm::{
    ActiveModelTrait, ColumnTrait, DatabaseConnection, EntityTrait, PaginatorTrait, QueryFilter,
    Set,
};
use shared::AdminInfoResult;

pub async fn check_user_exists(
    db: &DatabaseConnection,
    name: &str,
) -> Result<bool, Box<dyn std::error::Error>> {
    let exists = users::Entity::find()
        .filter(Column::Name.eq(name))
        .one(db)
        .await?
        .is_some();
    Ok(exists)
}

pub async fn create_user(
    db: &DatabaseConnection,
    name: &str,
    password_hash: &str,
) -> Result<i32, Box<dyn std::error::Error>> {
    let model = users::ActiveModel {
        name: Set(name.to_string()),
        password_hash: Set(password_hash.to_string()),
        role: Set(Role::User),
        settings: Set(serde_json::Value::Object(serde_json::Map::new())),
        avatar: Set(String::new()),
        created_at: Set(chrono::Utc::now().naive_utc()),
        ..Default::default()
    };

    let result = model.insert(db).await?;
    Ok(result.id)
}

pub async fn find_user_by_id(
    db: &DatabaseConnection,
    user_id: i32,
) -> Result<Option<Model>, Box<dyn std::error::Error>> {
    let user = users::Entity::find_by_id(user_id).one(db).await?;
    Ok(user)
}

pub async fn find_user_by_name(
    db: &DatabaseConnection,
    name: &str,
) -> Result<Option<Model>, Box<dyn std::error::Error>> {
    let user = users::Entity::find()
        .filter(Column::Name.eq(name))
        .one(db)
        .await?;
    Ok(user)
}

pub async fn update_password(
    db: &DatabaseConnection,
    user_id: i32,
    new_password_hash: &str,
) -> Result<(), Box<dyn std::error::Error>> {
    let model = users::Entity::find_by_id(user_id)
        .one(db)
        .await?
        .ok_or("User not found")?;

    let mut active: ActiveModel = model.into();
    active.password_hash = Set(new_password_hash.to_string());
    active.update(db).await?;

    Ok(())
}

pub async fn update_profile(
    db: &DatabaseConnection,
    user_id: i32,
    name: Option<String>,
    avatar: Option<String>,
    settings: Option<serde_json::Value>,
) -> Result<Model, Box<dyn std::error::Error>> {
    let model = users::Entity::find_by_id(user_id)
        .one(db)
        .await?
        .ok_or("User not found")?;

    let mut active: ActiveModel = model.into();
    if let Some(n) = name {
        active.name = Set(n);
    }
    if let Some(a) = avatar {
        active.avatar = Set(a);
    }
    if let Some(s) = settings {
        active.settings = Set(s);
    }
    let result = active.update(db).await?;
    Ok(result)
}

pub async fn admin_get_users(
    db: &DatabaseConnection,
    page: u64,
    page_size: u64,
) -> Result<AdminInfoResult, Box<dyn std::error::Error>> {
    let paginator = users::Entity::find().paginate(db, page_size);
    let total = paginator.num_items().await?;
    let users_data = paginator.fetch_page(page - 1).await?;

    let users: Vec<shared::InfoResult> = users_data.into_iter().map(|u| u.into()).collect();

    Ok(AdminInfoResult {
        users,
        total,
        page,
        page_size,
    })
}

pub async fn admin_update_user(
    db: &DatabaseConnection,
    user_id: i32,
    name: Option<String>,
    avatar: Option<String>,
    role: Option<u8>,
    settings: Option<serde_json::Value>,
) -> Result<Model, Box<dyn std::error::Error>> {
    let model = users::Entity::find_by_id(user_id)
        .one(db)
        .await?
        .ok_or("User not found")?;

    let mut active: ActiveModel = model.into();
    if let Some(n) = name {
        active.name = Set(n);
    }
    if let Some(a) = avatar {
        active.avatar = Set(a);
    }
    if let Some(r) = role {
        active.role = Set(Role::from(r));
    }
    if let Some(s) = settings {
        active.settings = Set(s);
    }
    let result = active.update(db).await?;
    Ok(result)
}

pub async fn record_login_log(
    db: &DatabaseConnection,
    user_id: i32,
    ip: &str,
    success: bool,
) -> Result<(), Box<dyn std::error::Error>> {
    let model = login_logs::ActiveModel {
        user_id: Set(user_id),
        ip: Set(ip.to_string()),
        success: Set(success),
        created_at: Set(chrono::Utc::now().naive_utc()),
        ..Default::default()
    };
    model.insert(db).await?;
    Ok(())
}

pub async fn handle_failed_login(
    db: &DatabaseConnection,
    user_id: i32,
) -> Result<(), Box<dyn std::error::Error>> {
    let model = users::Entity::find_by_id(user_id)
        .one(db)
        .await?
        .ok_or("User not found")?;

    let attempts = model.failed_attempts.saturating_add(1);

    let mut active: ActiveModel = model.into();
    active.failed_attempts = Set(attempts);

    if attempts >= 5 {
        let lock_until = chrono::Utc::now() + chrono::Duration::minutes(15);
        active.locked_until = Set(Some(lock_until.naive_utc()));
    }

    active.update(db).await?;
    Ok(())
}

pub async fn handle_successful_login(
    db: &DatabaseConnection,
    user_id: i32,
) -> Result<(), Box<dyn std::error::Error>> {
    let model = users::Entity::find_by_id(user_id)
        .one(db)
        .await?
        .ok_or("User not found")?;

    let mut active: ActiveModel = model.into();
    active.failed_attempts = Set(0);
    active.locked_until = Set(None);
    active.update(db).await?;
    Ok(())
}

pub async fn is_account_locked(
    db: &DatabaseConnection,
    user_id: i32,
) -> Result<bool, Box<dyn std::error::Error>> {
    let user = users::Entity::find_by_id(user_id)
        .one(db)
        .await?
        .ok_or("User not found")?;

    if let Some(locked_until) = user.locked_until {
        if locked_until > chrono::Utc::now().naive_utc() {
            return Ok(true);
        }
    }
    Ok(false)
}

pub fn validate_username(name: &str) -> Result<(), String> {
    let re = regex::Regex::new(r"^[a-zA-Z0-9_]{5,}$").unwrap();
    if !re.is_match(name) {
        return Err("Username must be at least 5 characters, only letters, digits, and underscores allowed".to_string());
    }
    Ok(())
}

pub fn validate_password(password: &str) -> Result<(), String> {
    if password.len() < 8 {
        return Err("Password must be at least 8 characters".to_string());
    }
    let has_upper = password.chars().any(|c| c.is_ascii_uppercase());
    let has_lower = password.chars().any(|c| c.is_ascii_lowercase());
    let has_digit = password.chars().any(|c| c.is_ascii_digit());
    if !has_upper || !has_lower || !has_digit {
        return Err("Password must contain uppercase, lowercase, and digits".to_string());
    }
    Ok(())
}
