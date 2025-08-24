import { user_manager } from 'declarations/user_manager';
import { AuthClient } from '@dfinity/auth-client';
import { useState, useEffect } from 'react';

export function useUserManager() {
  const [principal, setPrincipal] = useState(null);
  const [authClient, setAuthClient] = useState(null);

  useEffect(() => {
    AuthClient.create().then(client => {
      setAuthClient(client);
      // Do NOT auto-set principal if already authenticated
      // if (client.isAuthenticated()) {
      //   const identity = client.getIdentity();
      //   setPrincipal(identity.getPrincipal().toText());
      // }
    });
  }, []);

  async function login() {
    if (!authClient) return;
    await authClient.login({
      identityProvider: "https://identity.ic0.app/#authorize",
      onSuccess: () => {
        const identity = authClient.getIdentity();
        setPrincipal(identity.getPrincipal().toText());
      },
    });
  }

  async function logout() {
    if (!authClient) return;
    await authClient.logout();
    setPrincipal(null);
  }

  async function registerUser(name, bio, avatar_url, cover_url) {
    return user_manager.register_user(principal, name, bio, avatar_url || null, cover_url || null);
  }

  async function updateProfile(name, bio, avatar_url, cover_url) {
    return user_manager.update_profile(principal, name, bio, avatar_url || null, cover_url || null);
  }

  async function getUser(id = principal) {
    const user = await user_manager.get_user(id);
    return user; // user is Option<UserProfile> (null or object)
  }

  async function seedDemoUsers() {
    return user_manager.seed_demo_users();
  }

  return { principal, login, logout, registerUser, updateProfile, getUser, seedDemoUsers };
} 