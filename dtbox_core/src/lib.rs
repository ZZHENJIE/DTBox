pub mod request {
    pub mod cboe;
    pub mod finviz;
    pub mod nasdaq;
    pub mod utils;
}

#[cfg(test)]
mod tests {
    use crate::request;
    // #[tokio::test]
    // async fn test_timestamper() {
    //     let client = reqwest::Client::new();
    //     let response = request::utils::time_stamper(&client).await.unwrap();
    //     println!("{:#?}", response);
    // }
    // #[tokio::test]
    // async fn test_nasdaq_quote() {
    //     let client = reqwest::Client::new();
    //     let response = request::nasdaq::quote(&client, "ABEV").await.unwrap();
    //     println!("{:#?}", response);
    // }
    // #[tokio::test]
    // async fn test_cboe_market_quote() {
    //     let client = reqwest::Client::new();
    //     let response = request::cboe::market_quote(&client, request::cboe::Market::EDGA)
    //         .await
    //         .unwrap();
    //     println!("{:#?}", response.items[0]);
    // }
    #[tokio::test]
    async fn test_cboe_symbal_market_quote() {
        let client = reqwest::Client::new();
        let response =
            request::cboe::symbal_market_quote(&client, request::cboe::Market::EDGA, "ABEV")
                .await
                .unwrap();
        println!("{:#?}", response);
    }
}
