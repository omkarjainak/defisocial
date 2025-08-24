import React, { useState, useEffect, createContext, useContext } from 'react';
import { HashRouter as Router, Routes, Route, useNavigate, Navigate, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import PostFeed from './components/PostFeed';
import PostComposer from './components/PostComposer';
import Profile from './components/Profile';
import SocialGraph from './components/SocialGraph';
import ProfilePage from './components/ProfilePage';
import { useUserManager } from './hooks/useUserManager';
import { usePostsManagerV2 } from './hooks/usePostsManagerV2';
import { useSocialGraph } from './hooks/useSocialGraph';
import { useInteractionManager } from './hooks/useInteractionManager';
// Add icon imports for impact lines
import { FaShieldAlt, FaBullhorn, FaCoins } from 'react-icons/fa';

// Toast Context and Provider
const ToastContext = createContext();
export function useToast() { return useContext(ToastContext); }

function Toast({ toasts, removeToast }) {
  return (
    <div className="toast-container">
      {toasts.map(t => (
        <div key={t.id} className={`toast toast-${t.type}`}> 
          <span className="toast-icon">{t.icon}</span>
          <span>{t.message}</span>
          <button className="toast-close" onClick={() => removeToast(t.id)}>&times;</button>
        </div>
      ))}
      <style>{`
        .toast-container {
          position: fixed;
          bottom: 32px;
          right: 32px;
          z-index: 9999;
          display: flex;
          flex-direction: column;
          gap: 14px;
        }
        .toast {
          display: flex;
          align-items: center;
          background: #fff;
          border-radius: 10px;
          box-shadow: 0 4px 16px #0002;
          padding: 12px 20px;
          min-width: 180px;
          font-size: 15px;
          color: #333;
          animation: toast-in 0.3s cubic-bezier(.4,0,.2,1);
          border-left: 4px solid #4a90e2;
          position: relative;
        }
        .toast-success { border-left-color: #4ade80; }
        .toast-like { border-left-color: #f87171; }
        .toast-comment { border-left-color: #6366f1; }
        .toast-icon {
          font-size: 1.3em;
          margin-right: 10px;
        }
        .toast-close {
          background: none;
          border: none;
          color: #aaa;
          font-size: 1.2em;
          margin-left: 10px;
          cursor: pointer;
          transition: color 0.18s;
        }
        .toast-close:hover { color: #f87171; }
        @keyframes toast-in {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: none; }
        }
      `}</style>
    </div>
  );
}

function AppErrorBoundary({ children }) {
  const [error, setError] = useState(null);
  useEffect(() => {
    const handler = (event) => {
      setError(event.error || event.reason || 'Unknown error');
      console.error('Uncaught error:', event.error || event.reason);
    };
    window.addEventListener('error', handler);
    window.addEventListener('unhandledrejection', handler);
    return () => {
      window.removeEventListener('error', handler);
      window.removeEventListener('unhandledrejection', handler);
    };
  }, []);
  if (error) {
    return <div style={{ color: 'red', padding: 32, fontSize: 20 }}>An unexpected error occurred: {error?.message || error?.toString() || 'Unknown error'}<br/><br/>Check the browser console for details.</div>;
  }
  return children;
}

function LoginPage({ onLogin, loading, error }) {
  // Demo posts for preview
  const DEMO_POSTS = [
    {
      username: 'alice',
      avatar: 'https://robohash.org/alice.png',
      text: 'Excited to join the decentralized future! 🚀',
    },
    {
      username: 'bob',
      avatar: 'https://robohash.org/bob.png',
      text: 'On-chain proof is the new trust layer. 🔗',
    },
    {
      username: 'eve',
      avatar: 'https://robohash.org/eve.png',
      text: 'Earning tokens for my posts? Yes please! 🎁',
    },
  ];
  return (
    <div className="login-bg luxury-bg">
      <div className="login-container">
        {/* Left Section */}
        <div className="login-left glass-card">
          <div className="login-logo-row">
            <span className="login-logo" style={{ fontSize: '2.6rem', marginRight: 8 }}>🧱</span>
            <span className="login-logo-text" style={{ fontWeight: 900, fontSize: '2.3rem', letterSpacing: '-1.5px' }}>DeFi <span className="gradient-green">Social</span></span>
          </div>
          <h1 className="login-title" style={{ fontFamily: 'Montserrat, Poppins, Arial, sans-serif', fontWeight: 900, fontSize: '2.4rem', marginBottom: 16 }}>
            Welcome to <span className="gradient-green">DeFi Social</span>
          </h1>
          <div className="login-desc" style={{ fontFamily: 'Open Sans, Arial, sans-serif', fontSize: '1.13rem', color: '#5a5a6e', marginBottom: 24 }}>
            Your Voice, Uncensored. Your Identity, Unbreakable. Welcome to DeFi Social.
          </div>
          <div className="login-impact-lines" style={{ marginBottom: 32 }}>
            <div className="impact gradient-green" style={{ fontSize: '1.18rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}><FaShieldAlt /> Own your identity.</div>
            <div className="impact gradient-green" style={{ fontSize: '1.18rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}><FaBullhorn /> Prove your voice.</div>
            <div className="impact gradient-green" style={{ fontSize: '1.18rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 10 }}><FaCoins /> Earn for your impact.</div>
          </div>
          <button className="login-btn glass-btn" onClick={onLogin} disabled={loading} style={{ fontFamily: 'Montserrat, Poppins, Arial, sans-serif', fontWeight: 800, fontSize: '1.18rem', background: 'linear-gradient(90deg, #7F5AF0 0%, #2CB67D 100%)', boxShadow: '0 4px 24px #7F5AF055', border: 'none', borderRadius: 20, padding: '16px 0', width: '100%', marginTop: 18, marginBottom: 8, cursor: 'pointer', transition: 'box-shadow 0.18s, transform 0.18s, background 0.18s', outline: 'none', position: 'relative', zIndex: 2 }}>
            {loading ? <span className="login-btn-spinner" style={{ marginRight: 10, verticalAlign: 'middle' }}><svg width="22" height="22" viewBox="0 0 38 38" xmlns="http://www.w3.org/2000/svg" stroke="#fff"><g fill="none" fillRule="evenodd"><g transform="translate(1 1)" strokeWidth="4"><circle strokeOpacity=".3" cx="18" cy="18" r="18"/><path d="M36 18c0-9.94-8.06-18-18-18"><animateTransform attributeName="transform" type="rotate" from="0 18 18" to="360 18 18" dur="1s" repeatCount="indefinite"/></path></g></g></svg></span> : null}
            {loading ? 'Logging in...' : 'Login with Internet Identity'}
          </button>
          {error && <div className="login-error" style={{ color: '#e57373', marginTop: 10, fontWeight: 600 }}>{error}</div>}
        </div>
        {/* Right Section: Feed Preview */}
        <div className="login-right glass-feed-card">
          <div className="feed-heading gradient-purple" style={{ fontFamily: 'Montserrat, Poppins, Arial, sans-serif', fontWeight: 800, fontSize: '1.5rem', marginBottom: 18 }}>Feed</div>
          <div className="feed-demo-posts">
            {DEMO_POSTS.map((post, i) => (
              <div className="feed-demo-post animate-fade-in" key={post.username} style={{ animationDelay: `${i * 120}ms`, background: 'rgba(255,255,255,0.96)', borderRadius: 20, boxShadow: '0 2px 12px #7F5AF022', marginBottom: 18, padding: '18px 18px 14px 18px', transition: 'box-shadow 0.18s, transform 0.18s', cursor: 'pointer', fontFamily: 'Open Sans, Arial, sans-serif' }}>
                <div className="feed-demo-header" style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
                  <img src={post.avatar} alt={post.username} className="feed-demo-avatar" style={{ width: 38, height: 38, borderRadius: '50%', objectFit: 'cover', boxShadow: '0 2px 8px #7F5AF033' }} />
                  <span className="feed-demo-username" style={{ fontWeight: 700, fontSize: '1.08rem', color: '#7F5AF0', letterSpacing: '-0.5px' }}>@{post.username}</span>
                </div>
                <div className="feed-demo-text" style={{ fontSize: '1.08rem', color: '#444', marginBottom: 10 }}>{post.text}</div>
                <div className="feed-demo-actions" style={{ display: 'flex', gap: 18, fontSize: '1.18rem', color: '#7F5AF0' }}>
                  <span className="feed-demo-action" style={{ transition: 'color 0.18s, transform 0.18s' }}>❤️</span>
                  <span className="feed-demo-action" style={{ transition: 'color 0.18s, transform 0.18s' }}>💬</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      {/* Animated background blobs/particles */}
      <div className="bg-blob bg-blob1" />
      <div className="bg-blob bg-blob2" />
      <div className="bg-blob bg-blob3" />
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@700;900&family=Open+Sans:wght@400;600&display=swap');
        .luxury-bg {
          min-height: 100vh;
          width: 100vw;
          background: linear-gradient(135deg, #f7f8fa 0%, #e0c3fc 60%, #8ec5fc 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          overflow: hidden;
        }
        .login-container {
          display: flex;
          flex-direction: row;
          gap: 48px;
          max-width: 980px;
          margin: 0 auto;
          z-index: 2;
        }
        .glass-card {
          background: rgba(255,255,255,0.82);
          box-shadow: 0 8px 32px rgba(127,90,240,0.13), 0 1.5px 6px rgba(44,182,125,0.09);
          border-radius: 32px;
          padding: 48px 40px 40px 40px;
          display: flex;
          flex-direction: column;
          min-width: 340px;
          max-width: 400px;
          align-items: flex-start;
          backdrop-filter: blur(18px);
        }
        .login-left {
          flex: 1;
        }
        .login-logo-row {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 18px;
        }
        .login-logo {
          font-size: 2.6rem;
        }
        .login-logo-text {
          font-size: 2.3rem;
          font-weight: 900;
          letter-spacing: -1.5px;
          color: #23272f;
        }
        .gradient-green {
          background: linear-gradient(90deg, #2CB67D 0%, #7F5AF0 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          text-fill-color: transparent;
          font-weight: 900;
        }
        .login-title {
          font-size: 2.4rem;
          font-weight: 900;
          margin-bottom: 16px;
          color: #23272f;
        }
        .login-desc {
          font-size: 1.13rem;
          color: #5a5a6e;
          margin-bottom: 24px;
        }
        .login-impact-lines {
          margin-bottom: 32px;
        }
        .impact {
          font-size: 1.18rem;
          font-weight: 700;
          margin-bottom: 6px;
        }
        .login-btn {
          width: 100%;
          padding: 16px 0;
          font-size: 1.18rem;
          font-weight: 800;
          border-radius: 20px;
          border: none;
          background: linear-gradient(90deg, #7F5AF0 0%, #2CB67D 100%);
          color: #fff;
          box-shadow: 0 4px 24px #7F5AF055, 0 1.5px 6px #2CB67D22;
          margin-top: 18px;
          margin-bottom: 8px;
          cursor: pointer;
          transition: box-shadow 0.18s, transform 0.18s, background 0.18s;
          backdrop-filter: blur(8px);
          outline: none;
          position: relative;
          z-index: 2;
        }
        .login-btn:hover, .login-btn:focus {
          box-shadow: 0 8px 32px #7F5AF0cc, 0 2px 8px #2CB67D33;
          background: linear-gradient(90deg, #2CB67D 0%, #7F5AF0 100%);
          transform: scale(1.04);
          outline: 2px solid #2CB67D;
        }
        .login-btn-spinner {
          display: inline-block;
          vertical-align: middle;
        }
        .login-error {
          color: #e57373;
          margin-top: 10px;
          font-weight: 600;
        }
        .glass-feed-card {
          background: rgba(255,255,255,0.92);
          box-shadow: 0 8px 32px #7F5AF033, 0 1.5px 6px #2CB67D11;
          border-radius: 32px;
          padding: 36px 32px 32px 32px;
          min-width: 340px;
          max-width: 340px;
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          backdrop-filter: blur(18px);
        }
        .feed-heading {
          font-size: 1.5rem;
          font-weight: 800;
          margin-bottom: 18px;
        }
        .gradient-purple {
          background: linear-gradient(90deg, #7F5AF0 0%, #8ec5fc 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          text-fill-color: transparent;
        }
        .feed-demo-posts {
          width: 100%;
        }
        .feed-demo-post {
          background: rgba(255,255,255,0.96);
          border-radius: 20px;
          box-shadow: 0 2px 12px #7F5AF022;
          margin-bottom: 18px;
          padding: 18px 18px 14px 18px;
          transition: box-shadow 0.18s, transform 0.18s;
          cursor: pointer;
          animation: fade-in-up 0.7s cubic-bezier(.4,0,.2,1);
        }
        .feed-demo-post:hover {
          box-shadow: 0 8px 32px #7F5AF0cc, 0 2px 8px #2CB67D33;
          transform: translateY(-4px) scale(1.03) rotate(-1deg);
        }
        .feed-demo-header {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 8px;
        }
        .feed-demo-avatar {
          width: 38px;
          height: 38px;
          border-radius: 50%;
          object-fit: cover;
          box-shadow: 0 2px 8px #7F5AF033;
        }
        .feed-demo-username {
          font-weight: 700;
          font-size: 1.08rem;
          color: #7F5AF0;
          letter-spacing: -0.5px;
        }
        .feed-demo-text {
          font-size: 1.08rem;
          color: #444;
          margin-bottom: 10px;
        }
        .feed-demo-actions {
          display: flex;
          gap: 18px;
          font-size: 1.18rem;
          color: #7F5AF0;
        }
        .feed-demo-action {
          transition: color 0.18s, transform 0.18s;
        }
        .feed-demo-action:hover {
          color: #2CB67D;
          transform: scale(1.18);
        }
        @keyframes fade-in-up {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: none; }
        }
        .bg-blob {
          position: fixed;
          z-index: 1;
          border-radius: 50%;
          filter: blur(32px);
          opacity: 0.35;
          pointer-events: none;
          animation: blob-float 18s ease-in-out infinite alternate;
        }
        .bg-blob1 { width: 340px; height: 340px; background: #e0c3fc; top: 8%; left: 4%; animation-delay: 0s; }
        .bg-blob2 { width: 260px; height: 260px; background: #8ec5fc; bottom: 10%; right: 8%; animation-delay: 4s; }
        .bg-blob3 { width: 180px; height: 180px; background: #7F5AF0; top: 60%; left: 70%; animation-delay: 8s; }
        @keyframes blob-float {
          0% { transform: translateY(0) scale(1); }
          100% { transform: translateY(-30px) scale(1.08); }
        }
        @media (max-width: 900px) {
          .login-container { flex-direction: column; align-items: center; gap: 32px; }
          .glass-card, .glass-feed-card { max-width: 98vw; min-width: 0; }
        }
      `}</style>
    </div>
  );
}

function App() {
  // Auth state with real Internet Identity integration
  // Removed manual route state and hashchange logic
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showRegister, setShowRegister] = useState(false);
  const [registerName, setRegisterName] = useState('');
  const [registerBio, setRegisterBio] = useState('');
  const [registerAvatar, setRegisterAvatar] = useState('');
  const [posts, setPosts] = useState([]);
  const [user, setUser] = useState(null);
  const [followers, setFollowers] = useState([]);
  const [following, setFollowing] = useState([]);
  const [toasts, setToasts] = useState([]);

  // Hooks for backend
  const { principal, login, logout, registerUser, updateProfile, getUser, seedDemoUsers } = useUserManager();
  const { addPost, fetchPosts, seedDemoPosts } = usePostsManagerV2();
  const { follow, unfollow, getFollowers, getFollowing } = useSocialGraph();
  const { likePost, unlikePost, getLikes, addComment, getComments } = useInteractionManager();

  function showToast({ message, type = 'success', icon }) {
    const id = Math.random().toString(36).slice(2);
    setToasts(ts => [...ts, { id, message, type, icon }]);
    setTimeout(() => setToasts(ts => ts.filter(t => t.id !== id)), 3500);
  }
  function removeToast(id) {
    setToasts(ts => ts.filter(t => t.id !== id));
  }

  // Robust loadData: always seed demo users/posts if missing, always auto-register principal
  async function loadData() {
    setLoading(true);
    setError('');
    try {
      await seedDemoUsers();
      let posts = await fetchPosts();
      if (posts.length === 0) {
        await seedDemoPosts();
        posts = await fetchPosts();
      }
      setPosts(posts);
      let userObj = await getUser();
      if (!userObj && principal) {
        await registerUser(
          principal.slice(0, 8) + '...',
          '',
          'https://robohash.org/' + principal + '.png' || null
        );
        userObj = await getUser();
      }
      if (!userObj) {
        setUser(null);
        setShowRegister(true);
        setError('No profile found. Please register.');
      } else {
        setUser(userObj);
        setShowRegister(false);
      }
      const [followers, following] = await Promise.all([
        getFollowers(),
        getFollowing(),
      ]);
      setFollowers(followers);
      setFollowing(following);
    } catch (e) {
      setError(e?.message || e?.toString() || 'Failed to load data.');
      console.error('loadData error:', e);
    }
    setLoading(false);
  }

  async function handleRegister(e) {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await registerUser(registerName, registerBio, registerAvatar || null);
      setShowRegister(false);
      setRegisterName('');
      setRegisterBio('');
      setRegisterAvatar('');
      await loadData();
    } catch (e) {
      setError('Failed to register profile.');
      console.error('handleRegister error:', e);
    }
    setLoading(false);
  }

  async function refreshFeed() {
    setLoading(true);
    setError('');
    try {
      const posts = await fetchPosts();
      setPosts(posts);
    } catch (e) {
      setError(e?.message || e?.toString() || 'Failed to refresh feed.');
      console.error('refreshFeed error:', e);
    }
    setLoading(false);
  }

  async function handlePost(content) {
    setLoading(true);
    setError('');
    try {
      if (!content || content.trim().length === 0) {
        setError('Post content cannot be empty.');
        setLoading(false);
        return;
      }
      let userObj = await getUser();
      if (!userObj && principal) {
        await registerUser(
          principal.slice(0, 8) + '...',
          '',
          'https://robohash.org/' + principal + '.png' || null
        );
        userObj = await getUser();
      }
      if (!userObj) {
        setError('You must register a profile before posting.');
        setLoading(false);
        return;
      }
      const author = userObj.id || principal;
      await addPost(author, content);
      await refreshFeed();
      showToast({ message: 'Post created!', type: 'success', icon: '✅' });
    } catch (e) {
      setError(e?.message || e?.toString() || 'Failed to create post.');
      console.error('handlePost error:', e);
    }
    setLoading(false);
  }

  async function handleLike(postId) {
    setLoading(true);
    setError('');
    try {
      await likePost(postId);
      await loadData();
      showToast({ message: 'You liked a post!', type: 'like', icon: '❤️' });
    } catch (e) {
      setError('Failed to like post.');
      console.error('handleLike error:', e);
    }
    setLoading(false);
  }

  async function handleComment(postId) {
    const content = prompt('Enter your comment:');
    if (!content) return;
    setLoading(true);
    setError('');
    try {
      await addComment(postId, content);
      await loadData();
      showToast({ message: 'Comment added!', type: 'comment', icon: '💬' });
    } catch (e) {
      setError('Failed to add comment.');
      console.error('handleComment error:', e);
    }
    setLoading(false);
  }

  async function handleFollow(userId) {
    setLoading(true);
    setError('');
    try {
      await follow(userId);
      await loadData();
    } catch (e) {
      setError('Failed to follow user.');
      console.error('handleFollow error:', e);
    }
    setLoading(false);
  }

  async function handleUnfollow(userId) {
    setLoading(true);
    setError('');
    try {
      await unfollow(userId);
      await loadData();
    } catch (e) {
      setError('Failed to unfollow user.');
      console.error('handleUnfollow error:', e);
    }
    setLoading(false);
  }

  async function handleLogout() {
    await logout();
    setUser(null);
    setPosts([]);
    setFollowers([]);
    setFollowing([]);
    setShowRegister(false);
    setError('');
  }

  // Add go to profile navigation
  function goToProfile() {
    // This function is no longer needed as routing is handled by HashRouter
    // setRoute('profile');
    // window.location.hash = '#/profile';
  }

  // Add this helper to generate random demo user data
  function getRandomDemoUser() {
    const names = ["Demo Alice", "Demo Bob", "Demo Charlie", "Demo Eve", "Demo Satoshi"];
    const bios = [
      "Exploring the decentralized world!",
      "Web3 enthusiast. #DeFi",
      "Just here for the memes.",
      "Building the future on-chain.",
      "Privacy is power."
    ];
    const avatars = [
      "https://robohash.org/alice.png",
      "https://robohash.org/bob.png",
      "https://robohash.org/charlie.png",
      "https://robohash.org/eve.png",
      "https://robohash.org/satoshi.png"
    ];
    const idx = Math.floor(Math.random() * names.length);
    return {
      name: names[idx],
      username: `demo${idx}${Math.floor(Math.random()*10000)}`,
      bio: bios[idx],
      avatar: avatars[idx]
    };
  }

  // Add this function to handle demo profile creation
  async function handleCreateDemoProfile() {
    setLoading(true);
    setError("");
    try {
      const demo = getRandomDemoUser();
      // Register demo user (username as name, since username is immutable)
      await registerUser(demo.username, demo.bio, demo.avatar);
      try {
      await seedDemoPosts();
      } catch (e) {
        setError("Failed to seed demo posts. Try again.");
        showToast({ message: 'Failed to seed demo posts.', type: 'error', icon: '❌' });
      }
      await loadData();
      setShowRegister(false);
      showToast({ message: 'Demo profile created!', type: 'success', icon: '✅' });
    } catch (e) {
      setError("Failed to create demo profile. Try again.");
      showToast({ message: 'Failed to create demo profile.', type: 'error', icon: '❌' });
    }
    setLoading(false);
  }

  const location = useLocation();
  const navigate = useNavigate();
  const [hasRedirected, setHasRedirected] = useState(false);

  // Force redirect to / if not authenticated and on a protected route
  useEffect(() => {
    if (!principal && location.pathname !== '/' && location.pathname !== '/feed') {
      navigate('/', { replace: true });
    }
  }, [principal, location, navigate]);

  // Call loadData on mount and when principal changes
  useEffect(() => {
    if (principal) {
      loadData();
    }
  }, [principal]);

  // Redirect to /feed only once after login
  useEffect(() => {
    if (principal && !showRegister && !hasRedirected) {
      navigate('/feed', { replace: true });
      setHasRedirected(true);
    }
    if (!principal && hasRedirected) {
      setHasRedirected(false);
    }
  }, [principal, showRegister, hasRedirected, navigate]);

  // In App function, replace the login/register UI with LoginPage
  if (!principal || !user || showRegister) {
    return <LoginPage onLogin={login} loading={loading} error={error} />;
  }

  return (
    <AppErrorBoundary>
    <ToastContext.Provider value={{ showToast }}>
        <Navbar principal={principal} onLogout={handleLogout} user={user} />
        <div className="app-luxury-bg" style={{ minHeight: '100vh', minWidth: '100vw', background: 'linear-gradient(135deg, #f7f8fa 0%, #e0c3fc 60%, #8ec5fc 100%)', fontFamily: 'Montserrat, Open Sans, Arial, sans-serif' }}>
          <Routes>
            <Route path="/feed" element={
              <>
                <PostComposer onPost={handlePost} user={user} />
                <PostFeed posts={posts} onLike={handleLike} onComment={handleComment} />
              </>
            } />
            <Route path="/profile" element={<Profile user={user} onUpdate={updateProfile} />} />
            <Route path="/profile/:username" element={<ProfilePage />} />
            <Route path="*" element={<Navigate to="/feed" replace />} />
          </Routes>
          {error && <div style={{ color: 'red', margin: 16 }}>{error}</div>}
        </div>
      <Toast toasts={toasts} removeToast={removeToast} />
    </ToastContext.Provider>
    </AppErrorBoundary>
  );
}

export default App;
