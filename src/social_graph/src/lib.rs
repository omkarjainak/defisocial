use ic_cdk::query;
use ic_cdk::update;
use std::collections::{HashMap, HashSet};

type UserId = String;

type Followers = HashSet<UserId>;
type Following = HashSet<UserId>;

type FollowersMap = HashMap<UserId, Followers>;
type FollowingMap = HashMap<UserId, Following>;

thread_local! {
    static FOLLOWERS: std::cell::RefCell<FollowersMap> = std::cell::RefCell::new(HashMap::new());
    static FOLLOWING: std::cell::RefCell<FollowingMap> = std::cell::RefCell::new(HashMap::new());
}

#[update]
pub fn follow(follower: String, followee: String) {
    FOLLOWING.with(|map| {
        map.borrow_mut().entry(follower.clone()).or_default().insert(followee.clone());
    });
    FOLLOWERS.with(|map| {
        map.borrow_mut().entry(followee).or_default().insert(follower);
    });
}

#[update]
pub fn unfollow(follower: String, followee: String) {
    FOLLOWING.with(|map| {
        if let Some(set) = map.borrow_mut().get_mut(&follower) {
            set.remove(&followee);
        }
    });
    FOLLOWERS.with(|map| {
        if let Some(set) = map.borrow_mut().get_mut(&followee) {
            set.remove(&follower);
        }
    });
}

#[query]
pub fn get_followers(user: String) -> Vec<String> {
    FOLLOWERS.with(|map| map.borrow().get(&user).map(|s| s.iter().cloned().collect()).unwrap_or_default())
}

#[query]
pub fn get_following(user: String) -> Vec<String> {
    FOLLOWING.with(|map| map.borrow().get(&user).map(|s| s.iter().cloned().collect()).unwrap_or_default())
} 