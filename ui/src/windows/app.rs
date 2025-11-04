// use gpui::{
//     App, ClickEvent, IntoElement, ParentElement, RenderOnce, SharedString, Styled, Window, div,
// };
// use std::sync::{Arc, Mutex};

// pub struct DTBox {
//     test_text: Arc<Mutex<String>>,
//     counter: Arc<Mutex<u32>>,
//     http_client: Arc<Mutex<reqwest::Client>>,
//     test: Test,
// }

// #[derive(IntoElement, Clone, Copy)]
// struct Test;
// impl RenderOnce for Test {
//     fn render(self, window: &mut Window, cx: &mut App) -> impl gpui::IntoElement {
//         div().child("Test Child").text_color(gpui::white())
//     }
// }

// impl DTBox {
//     pub fn new(cx: &mut gpui::Context<Self>) -> Self {
//         Self {
//             test_text: Arc::new(Mutex::new(String::from("Test"))),
//             counter: Arc::new(Mutex::new(0)),
//             http_client: Arc::new(Mutex::new(reqwest::Client::new())),
//             test: Test,
//         }
//     }
// }

// impl gpui::Render for DTBox {
//     fn render(
//         &mut self,
//         window: &mut gpui::Window,
//         cx: &mut gpui::Context<Self>,
//     ) -> impl gpui::IntoElement {
//         let shared_text = Arc::clone(&self.test_text);
//         let shared_counter = Arc::clone(&self.counter);
//         let shared_http_client = Arc::clone(&self.http_client);

//         let text = format!(
//             "{}:{}",
//             shared_counter.lock().unwrap().to_string(),
//             shared_text.lock().unwrap()
//         );

//         div().child(self.test).child(test_button(
//             SharedString::from(text),
//             move |event, window, app| {
//                 let shared_text = Arc::clone(&shared_text);
//                 let shared_counter = Arc::clone(&shared_counter);
//                 let shared_http_client = Arc::clone(&shared_http_client);
//                 // let async_app = app.to_async();
//                 let task = app.spawn(async move |async_app| {
//                     *shared_counter.lock().unwrap() += 1;
//                     match shared_http_client
//                         .lock()
//                         .unwrap()
//                         .get("https://time.akamai.com")
//                         .send()
//                         .await
//                     {
//                         Ok(response) => {
//                             if response.status().is_success() {
//                                 let text = response.text().await.unwrap();
//                                 *shared_text.lock().unwrap() = text;
//                                 async_app.refresh().unwrap();
//                             }
//                         }
//                         Err(err) => {
//                             *shared_text.lock().unwrap() = format!("Error: {}", err);
//                             async_app.refresh().unwrap();
//                         }
//                     }
//                 });
//                 tokio::spawn(async move { task.await });
//             },
//         ))
//     }
// }

// fn test_button(
//     label: SharedString,
//     onclick: impl Fn(&ClickEvent, &mut Window, &mut App) + 'static,
// ) -> impl gpui::IntoElement {
//     gpui_component::button::Button::new("Ok")
//         .label(label)
//         .on_click(onclick)
// }
