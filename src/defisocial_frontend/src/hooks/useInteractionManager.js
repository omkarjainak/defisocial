import { interaction_manager } from 'declarations/interaction_manager';

export function useInteractionManager() {
  const principal = window.authPrincipal || 'demo-user';

  async function likePost(postId) {
    return interaction_manager.like_post(principal, postId);
  }

  async function unlikePost(postId) {
    return interaction_manager.unlike_post(principal, postId);
  }

  async function getLikes(postId) {
    return interaction_manager.get_likes(postId);
  }

  async function addComment(postId, content) {
    return interaction_manager.add_comment(principal, postId, content);
  }

  async function getComments(postId) {
    return interaction_manager.get_comments(postId);
  }

  return { likePost, unlikePost, getLikes, addComment, getComments };
} 