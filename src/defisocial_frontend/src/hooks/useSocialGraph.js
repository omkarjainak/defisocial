import { social_graph } from 'declarations/social_graph';

export function useSocialGraph() {
  const principal = window.authPrincipal || 'demo-user';

  async function follow(userId) {
    return social_graph.follow(principal, userId);
  }

  async function unfollow(userId) {
    return social_graph.unfollow(principal, userId);
  }

  async function getFollowers(userId = principal) {
    return social_graph.get_followers(userId);
  }

  async function getFollowing(userId = principal) {
    return social_graph.get_following(userId);
  }

  return { follow, unfollow, getFollowers, getFollowing };
} 