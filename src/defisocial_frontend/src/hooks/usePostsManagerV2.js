import { post_manager } from 'declarations/post_manager';

export function usePostsManagerV2() {
  async function addPost(author, content) {
    const result = await post_manager.add_post(author, content);
    if ('err' in result) {
      throw new Error(result.err);
    }
    return result.ok;
  }

  async function fetchPosts() {
    return post_manager.fetch_posts();
  }

  async function seedDemoPosts() {
    await post_manager.seed_demo_posts();
  }

  return { addPost, fetchPosts, seedDemoPosts };
} 