use keyring::Entry;

const SERVICE: &str = "dtbox";
const LAST_USER_KEY: &str = "_last_user";
const LAST_USERNAME_KEY: &str = "_last_username";

pub fn store(user_id: i32, refresh_token: &str) -> Result<(), keyring::Error> {
    let entry = Entry::new(SERVICE, &user_id.to_string())?;
    entry.set_password(refresh_token)
}

pub fn load(user_id: i32) -> Result<String, keyring::Error> {
    let entry = Entry::new(SERVICE, &user_id.to_string())?;
    entry.get_password()
}

pub fn delete(user_id: i32) -> Result<(), keyring::Error> {
    let entry = Entry::new(SERVICE, &user_id.to_string())?;
    entry.delete_credential()
}

pub fn store_last_user_id(user_id: i32) -> Result<(), keyring::Error> {
    let entry = Entry::new(SERVICE, LAST_USER_KEY)?;
    entry.set_password(&user_id.to_string())
}

pub fn load_last_user_id() -> Option<i32> {
    let entry = Entry::new(SERVICE, LAST_USER_KEY).ok()?;
    entry.get_password().ok()?.parse().ok()
}

pub fn clear_last_user_id() -> Result<(), keyring::Error> {
    let entry = Entry::new(SERVICE, LAST_USER_KEY)?;
    entry.delete_credential()
}

pub fn store_last_username(username: &str) -> Result<(), keyring::Error> {
    let entry = Entry::new(SERVICE, LAST_USERNAME_KEY)?;
    entry.set_password(username)
}

pub fn load_last_username() -> Option<String> {
    let entry = Entry::new(SERVICE, LAST_USERNAME_KEY).ok()?;
    entry.get_password().ok()
}

pub fn clear_last_username() -> Result<(), keyring::Error> {
    let entry = Entry::new(SERVICE, LAST_USERNAME_KEY)?;
    entry.delete_credential()
}
