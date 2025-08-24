import { post_manager } from 'declarations/post_manager';

export function usePostManager() {
  const principal = window.authPrincipal || 'demo-user';

  async function createPost(content) {
    return post_manager.create_post(principal, content);
  }

  async function listPosts() {
    return post_manager.list_posts();
  }

  async function getPost(id) {
    return post_manager.get_post(id);
  }

  async function seedDemoPosts() {
    return post_manager.seed_demo_posts();
  }

  return { createPost, listPosts, getPost, seedDemoPosts };
} 