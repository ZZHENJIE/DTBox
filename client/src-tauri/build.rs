fn main() {
    tauri_build::try_build(
        tauri_build::Attributes::new().app_manifest(
            tauri_build::AppManifest::new().commands(&[
                "do_login",
                "do_register",
                "do_logout",
                "get_access_token",
                "refresh_access_token",
                "get_user_id",
                "get_user_info",
                "set_server_url",
                "get_server_url",
                "test_connection",
                "open_web",
                "open_url",
                "open_time_window",
                "auto_login",
            ]),
        ),
    )
    .expect("error while running tauri-build");
}
