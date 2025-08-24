import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useSocialGraph } from '../hooks/useSocialGraph';
import { useUserManager } from '../hooks/useUserManager';
import Profile from './Profile';

export default function ProfilePage() {
  const { username } = useParams();
  const { getUser, principal, updateProfile } = useUserManager();
  const { getFollowers, getFollowing, follow, unfollow } = useSocialGraph();
  const [user, setUser] = useState(null);
  const [followers, setFollowers] = useState([]);
  const [following, setFollowing] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [isFollowing, setIsFollowing] = useState(false);

  useEffect(() => {
    async function fetchProfile() {
      setLoading(true);
      setError('');
      try {
        const userData = await getUser(username);
        if (!userData) {
          setError('User not found.');
          setUser(null);
        } else {
          setUser(userData);
          // Fetch followers/following for this user
          const [f, g] = await Promise.all([
            getFollowers(userData.id || userData.username),
            getFollowing(userData.id || userData.username),
          ]);
          setFollowers(f || []);
          setFollowing(g || []);
          // Check if current principal is following this user
          if (principal && f && Array.isArray(f)) {
            setIsFollowing(f.includes(principal));
          } else {
            setIsFollowing(false);
          }
        }
      } catch (e) {
        setError('Failed to load profile.');
        setUser(null);
      }
      setLoading(false);
    }
    fetchProfile();
  }, [username, principal]);

  const handleFollow = async () => {
    if (!user) return;
    await follow(user.id || user.username);
    // Refresh followers
    const f = await getFollowers(user.id || user.username);
    setFollowers(f || []);
    setIsFollowing(f && Array.isArray(f) ? f.includes(principal) : false);
  };

  const handleUnfollow = async () => {
    if (!user) return;
    await unfollow(user.id || user.username);
    // Refresh followers
    const f = await getFollowers(user.id || user.username);
    setFollowers(f || []);
    setIsFollowing(f && Array.isArray(f) ? f.includes(principal) : false);
  };

  // Add update handler for profile editing
  const handleUpdateProfile = async (username, name, bio, avatar_url, cover_url) => {
    try {
      await updateProfile(name, bio, avatar_url, cover_url);
      // Refresh user data
      const updatedUser = await getUser(username);
      setUser(updatedUser);
      window.dispatchEvent(new CustomEvent('toast', { detail: { type: 'success', message: 'Profile updated!' } }));
    } catch (e) {
      window.dispatchEvent(new CustomEvent('toast', { detail: { type: 'error', message: 'Failed to update profile.' } }));
    }
  };

  if (loading) return <div>Loading profile...</div>;
  if (error) return (
    <div className="card" style={{ maxWidth: 420, margin: '60px auto', textAlign: 'center', padding: '2.5rem 2rem', borderRadius: 'var(--border-radius)', boxShadow: 'var(--shadow)' }}>
      <div style={{ fontSize: 48, marginBottom: 12 }}>😕</div>
      <div style={{ fontWeight: 700, fontSize: 22, color: 'var(--text)' }}>{error}</div>
      <div style={{ color: 'var(--text-light)', marginTop: 8 }}>The profile you’re looking for doesn’t exist or is unavailable.</div>
      <button onClick={() => window.location.reload()} className="button" style={{ marginTop: 24, display: 'inline-block', textDecoration: 'none' }}>Retry</button>
      <a href="/" className="button" style={{ marginTop: 12, display: 'inline-block', textDecoration: 'none' }}>Go to Home</a>
    </div>
  );
  return (
    <Profile
      user={user}
      onUpdate={handleUpdateProfile}
      followers={followers}
      following={following}
      isFollowing={isFollowing}
      onFollow={handleFollow}
      onUnfollow={handleUnfollow}
      principal={principal}
    />
  );
} 