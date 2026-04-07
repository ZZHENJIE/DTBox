use crate::state::AppState;
use axum::{
    Router,
    routing::{get, post},
};
mod finviz;
mod integrations;

/// Market data routes
pub fn routes() -> Router<AppState> {
    Router::new()
        // Finviz data endpoints
        .route("/market/finviz/screener", post(finviz::screener))
        .route("/market/finviz/candlestick", post(finviz::candlestick))
        .route(
            "/market/finviz/calendar_economy",
            post(finviz::calendar_economy),
        )
        .route("/market/finviz/quote", post(finviz::quote))
        .route("/market/finviz/event", post(finviz::event))
        // Market integration endpoints
        .route(
            "/market/integrations/ipo_scoop",
            get(integrations::ipo_scoop),
        )
        .route(
            "/market/integrations/spac_research",
            get(integrations::spac_research),
        )
}
