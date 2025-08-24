use ic_cdk::query;
use ic_cdk::update;
use candid::{CandidType, Deserialize};
use std::collections::{HashMap, HashSet};

#[derive(CandidType, Deserialize, Clone)]
pub struct Comment {
    pub id: String,
    pub post_id: String,
    pub author: String,
    pub content: String,
    pub timestamp: u64,
}

type PostId = String;
type UserId = String;

type LikesMap = HashMap<PostId, HashSet<UserId>>;
type CommentsMap = HashMap<PostId, Vec<Comment>>;

thread_local! {
    static LIKES: std::cell::RefCell<LikesMap> = std::cell::RefCell::new(HashMap::new());
    static COMMENTS: std::cell::RefCell<CommentsMap> = std::cell::RefCell::new(HashMap::new());
}

#[update]
pub fn like_post(user: String, post_id: String) {
    LIKES.with(|likes| {
        likes.borrow_mut().entry(post_id).or_default().insert(user);
    });
}

#[update]
pub fn unlike_post(user: String, post_id: String) {
    LIKES.with(|likes| {
        if let Some(set) = likes.borrow_mut().get_mut(&post_id) {
            set.remove(&user);
        }
    });
}

#[query]
pub fn get_likes(post_id: String) -> Vec<String> {
    LIKES.with(|likes| likes.borrow().get(&post_id).map(|s| s.iter().cloned().collect()).unwrap_or_default())
}

#[update]
pub fn add_comment(user: String, post_id: String, content: String) -> Comment {
    let comment = Comment {
        id: format!("{}-{}", user, ic_cdk::api::time()),
        post_id: post_id.clone(),
        author: user,
        content,
        timestamp: ic_cdk::api::time(),
    };
    COMMENTS.with(|comments| {
        comments.borrow_mut().entry(post_id).or_default().push(comment.clone());
    });
    comment
}

#[query]
pub fn get_comments(post_id: String) -> Vec<Comment> {
    COMMENTS.with(|comments| comments.borrow().get(&post_id).cloned().unwrap_or_default())
} 