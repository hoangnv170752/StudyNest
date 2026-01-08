// define Messages here

use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "lowercase")]
pub enum Role {
    User,
    Assistant,
    System,
    Tool,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Message {
    pub role: Role,
    pub content: String,
}

#[macro_export]
macro_rules! Msg {
    ($role:expr, $content:expr) => {
        $crate::chat::Message {
            role: $role,
            content: $content.into(),
        }
    };
}
