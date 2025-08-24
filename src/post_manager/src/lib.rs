use ic_cdk::query;
use ic_cdk::update;
use ic_cdk::api::call::call;
use candid::{CandidType, Deserialize, Principal};
use std::collections::HashMap;

#[derive(CandidType, Deserialize, Clone, Debug)]
pub struct Post {
    pub id: String,
    pub author: String,
    pub content: String,
    pub timestamp: u64,
    pub version: u8, // New field to force Candid UI reload
}

#[derive(CandidType, Deserialize, Clone)]
pub struct UserProfile {
    pub id: String,
    pub name: String,
    pub bio: String,
    pub avatar_url: Option<String>,
}

type PostId = String;
type PostStore = HashMap<PostId, Post>;

thread_local! {
    static POSTS: std::cell::RefCell<PostStore> = std::cell::RefCell::new(HashMap::new());
}

#[update]
pub async fn add_post(author: String, content: String) -> Result<Post, String> {
    ic_cdk::println!("add_post called with author: {}, content: {}", author, content);

    // Check if user exists in user_manager
    let user_manager_id = Principal::from_text("aovwi-4maaa-aaaaa-qaagq-cai").unwrap();
    let (user_opt,): (Option<UserProfile>,) = call(
        user_manager_id,
        "get_user",
        (author.clone(),)
    ).await.map_err(|e| {
        let msg = format!("Failed to call user_manager: {}", e.1);
        ic_cdk::println!("{}", msg);
        msg
    })?;

    if user_opt.is_none() {
        let msg = "User does not exist. Please register first.".to_string();
        ic_cdk::println!("{}", msg);
        return Err(msg);
    }

    let id = format!("{}-{}", author, ic_cdk::api::time());
    let post = Post {
        id: id.clone(),
        author,
        content,
        timestamp: ic_cdk::api::time(),
        version: 1, // Set version
    };
    POSTS.with(|posts| {
        posts.borrow_mut().insert(id.clone(), post.clone());
    });
    ic_cdk::println!("Post created: {:?}", post);
    Ok(post)
}

#[update]
pub fn seed_demo_posts() {
    let demo_users = vec![
        "demo-user-1",
        "demo-user-2",
        "demo-user-3",
    ];
    let demo_contents = vec![
        "Hello, this is Alice's first post!",
        "Bob here, excited to join!",
        "Charlie says hi to everyone!",
        "Another day, another post.",
        "ICP is awesome!",
    ];
    for (i, user_id) in demo_users.iter().enumerate() {
        let content = demo_contents.get(i % demo_contents.len()).unwrap();
        let id = format!("{}-{}", user_id, ic_cdk::api::time() + i as u64);
        let post = Post {
            id: id.clone(),
            author: user_id.to_string(),
            content: content.to_string(),
            timestamp: ic_cdk::api::time() + i as u64,
            version: 1, // Set version
        };
        POSTS.with(|posts| {
            posts.borrow_mut().insert(id.clone(), post);
        });
    }
    // Also create demo posts for the current caller if not already a demo user
    let caller = ic_cdk::api::caller().to_text();
    if !demo_users.contains(&caller.as_str()) {
        for (i, content) in demo_contents.iter().enumerate() {
            let id = format!("{}-{}", caller, ic_cdk::api::time() + (i as u64));
            let post = Post {
                id: id.clone(),
                author: caller.clone(),
                content: content.to_string(),
                timestamp: ic_cdk::api::time() + (i as u64),
                version: 1,
            };
            POSTS.with(|posts| {
                posts.borrow_mut().insert(id.clone(), post);
            });
        }
    }
}

#[query]
pub fn fetch_posts() -> Vec<Post> {
    POSTS.with(|posts| posts.borrow().values().cloned().collect())
}

#[query]
pub fn get_post(id: String) -> Option<Post> {
    POSTS.with(|posts| posts.borrow().get(&id).cloned())
} 