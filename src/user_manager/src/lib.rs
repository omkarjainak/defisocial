
use ic_cdk::query;
use ic_cdk::update;
use candid::{CandidType, Deserialize};
use std::collections::HashMap;

#[derive(CandidType, Deserialize, Clone, Default)]
pub struct UserProfile {
    pub id: String,
    pub username: String,
    pub name: String,
    pub bio: String,
    pub avatar_url: Option<String>,
    pub cover_url: Option<String>,
}

type UserId = String;

type UserStore = HashMap<UserId, UserProfile>;

thread_local! {
    static USERS: std::cell::RefCell<UserStore> = std::cell::RefCell::new(HashMap::new());
}

#[update]
pub fn register_user(id: String, username: String, name: String, bio: String, avatar_url: Option<String>, cover_url: Option<String>) -> UserProfile {
    // Enforce username uniqueness
    let exists = USERS.with(|users| {
        users.borrow().values().any(|u| u.username == username)
    });
    if exists {
        return UserProfile::default(); // Or handle error as needed
    }
    let profile = UserProfile {
        id: id.clone(),
        username: username.clone(),
        name: name.clone(),
        bio: bio.clone(),
        avatar_url,
        cover_url,
    };
    USERS.with(|users| {
        users.borrow_mut().insert(id.clone(), profile.clone());
    });
    profile
}

#[update]
pub fn update_profile(id: String, name: String, bio: String, avatar_url: Option<String>, cover_url: Option<String>) -> UserProfile {
    USERS.with(|users| {
        let mut users = users.borrow_mut();
        if let Some(user) = users.get_mut(&id) {
            user.name = name.clone();
            user.bio = bio.clone();
            user.avatar_url = avatar_url.clone();
            user.cover_url = cover_url.clone();
            user.clone()
        } else {
            UserProfile::default()
        }
    })
}

#[update]
pub fn seed_demo_users() {
    let demo_users = vec![
        ("demo-user-1", "Emma Watson", Some("https://randomuser.me/api/portraits/women/65.jpg")),
        ("demo-user-2", "Scarlett Johansson", Some("https://randomuser.me/api/portraits/women/68.jpg")),
        ("demo-user-3", "Zendaya", Some("https://randomuser.me/api/portraits/women/69.jpg")),
    ];
    for (id, name, avatar_url) in demo_users {
        let profile = UserProfile {
            id: id.to_string(),
            username: id.to_string(), // Use id as username for demo
            name: name.to_string(),
            bio: format!("Hi, I'm {}!", name),
            avatar_url: avatar_url.map(|s| s.to_string()),
            cover_url: None,
        };
        USERS.with(|users| {
            users.borrow_mut().insert(id.to_string(), profile);
        });
    }
}

#[query]
pub fn get_user(id: String) -> Option<UserProfile> {
    USERS.with(|users| users.borrow().get(&id).cloned())
} 