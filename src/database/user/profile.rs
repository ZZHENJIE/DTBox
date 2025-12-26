use crate::{Api, database::user::operation::find_for_id};

pub struct Profile {
    pub id: i64,
    pub name: String,
    pub config: serde_json::Value,
    pub follow: Option<Vec<String>>,
    pub create_time: chrono::DateTime<chrono::Utc>,
}

// impl Api for Profile {
//     async fn fetch(
//         &self,
//         state: std::sync::Arc<crate::AppState>,
//     ) -> Result<Self::Output, Self::Error> {
//         let user = find_for_id(self.id, &state.database_pool()).await?;
//         Ok(user)
//     }
// }
