use axum::response::IntoResponse;
use serde::Serialize;

#[derive(Serialize)]
pub enum ErrorCode {
    DataBase,
    UserNotFound,
    PasswordIncorrect,
    ClaimsNone,
    Argon2,
    CookieNotFound,
    StringParse,
    RefreshTokenNotFound,
    RefreshTokenExpired,
    RefreshTokenRevoked,
    RefreshTokenIncorrect,
    RefreshTokenFormatInvalid,
    PasswordHashParse,
    NumberParse,
    JsonWebToken,
    Reqwest,
    CSVParse,
    Scraper,
}

impl Into<i32> for ErrorCode {
    fn into(self) -> i32 {
        match self {
            ErrorCode::DataBase => -1,
            ErrorCode::Argon2 => -2,
            ErrorCode::StringParse => -3,
            ErrorCode::PasswordHashParse => -4,
            ErrorCode::NumberParse => -5,
            ErrorCode::Reqwest => -6,
            ErrorCode::CSVParse => -7,
            ErrorCode::Scraper => -8,
            // Auth
            ErrorCode::ClaimsNone => -101,
            ErrorCode::RefreshTokenNotFound => -102,
            ErrorCode::CookieNotFound => -103,
            ErrorCode::RefreshTokenExpired => -104,
            ErrorCode::RefreshTokenRevoked => -105,
            ErrorCode::RefreshTokenIncorrect => -106,
            ErrorCode::RefreshTokenFormatInvalid => -107,
            ErrorCode::JsonWebToken => -108,
            // User
            ErrorCode::UserNotFound => -201,
            ErrorCode::PasswordIncorrect => -202,
        }
    }
}

#[derive(Serialize)]
pub struct Error {
    pub code: ErrorCode,
    pub message: String,
}

impl IntoResponse for Error {
    fn into_response(self) -> axum::response::Response {
        axum::Json(&self).into_response()
    }
}

impl From<sea_orm::DbErr> for Error {
    fn from(value: sea_orm::DbErr) -> Self {
        Error {
            code: ErrorCode::DataBase,
            message: value.to_string(),
        }
    }
}

impl From<argon2::Error> for Error {
    fn from(value: argon2::Error) -> Self {
        Error {
            code: ErrorCode::Argon2,
            message: value.to_string(),
        }
    }
}

impl From<ErrorCode> for Error {
    fn from(value: ErrorCode) -> Self {
        Error {
            code: value,
            message: "Please check the error according to the error code.".into(),
        }
    }
}

impl From<std::string::ParseError> for Error {
    fn from(value: std::string::ParseError) -> Self {
        Error {
            code: ErrorCode::StringParse,
            message: value.to_string(),
        }
    }
}

impl From<argon2::password_hash::Error> for Error {
    fn from(value: argon2::password_hash::Error) -> Self {
        Error {
            code: ErrorCode::PasswordHashParse,
            message: value.to_string(),
        }
    }
}

impl From<jsonwebtoken::errors::Error> for Error {
    fn from(value: jsonwebtoken::errors::Error) -> Self {
        Error {
            code: ErrorCode::JsonWebToken,
            message: value.to_string(),
        }
    }
}

impl From<std::num::ParseIntError> for Error {
    fn from(value: std::num::ParseIntError) -> Self {
        Error {
            code: ErrorCode::NumberParse,
            message: value.to_string(),
        }
    }
}

impl From<reqwest::Error> for Error {
    fn from(value: reqwest::Error) -> Self {
        Error {
            code: ErrorCode::Reqwest,
            message: value.to_string(),
        }
    }
}

impl From<csv::Error> for Error {
    fn from(value: csv::Error) -> Self {
        Error {
            code: ErrorCode::CSVParse,
            message: value.to_string(),
        }
    }
}

impl From<scraper::error::SelectorErrorKind<'_>> for Error {
    fn from(value: scraper::error::SelectorErrorKind<'_>) -> Self {
        Error {
            code: ErrorCode::CSVParse,
            message: value.to_string(),
        }
    }
}
