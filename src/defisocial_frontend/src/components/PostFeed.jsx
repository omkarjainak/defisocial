import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUserManager } from '../hooks/useUserManager';
import { usePostsManagerV2 } from '../hooks/usePostsManagerV2';
import Avatar from './Avatar';
import { FaRegHeart, FaRegCommentDots, FaRegShareSquare } from 'react-icons/fa';

const defaultAvatar = 'https://robohash.org/default.png';

function formatRelativeTime(ts) {
  if (!ts) return '';
  const now = Date.now();
  const date = new Date(Number(ts) / 1e6 || Number(ts));
  const diff = Math.floor((now - date.getTime()) / 1000); // seconds
  if (diff < 60) return 'just now';
  if (diff < 3600) return `${Math.floor(diff / 60)} minute${Math.floor(diff / 60) === 1 ? '' : 's'} ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} hour${Math.floor(diff / 3600) === 1 ? '' : 's'} ago`;
  if (diff < 172800) return 'yesterday';
  return date.toLocaleDateString();
}

const TABS = [
  { key: 'posts', label: 'Posts' },
  { key: 'media', label: 'Media' },
  { key: 'likes', label: 'Likes' },
];

// Helper to extract image URL from post content
function extractImageUrl(content) {
  const match = content.match(/(https?:\/\/[^\s]+\.(jpg|jpeg|png|gif|webp))/i);
  return match ? match[1] : null;
}
// Helper to render hashtags as clickable pills
function renderHashtags(content) {
  return content.split(/(#[\w]+)/g).map((part, i) => {
    if (/^#[\w]+$/.test(part)) {
      return <span key={i} className="hashtag-pill">{part}</span>;
    }
    return part;
  });
}
// Helper to render basic markdown (bold, italic) and emoji
function renderMarkdown(content) {
  let out = content;
  // Bold **text**
  out = out.replace(/\*\*(.*?)\*\*/g, '<b>$1</b>');
  // Italic *text*
  out = out.replace(/\*(.*?)\*/g, '<i>$1</i>');
  // Emoji :smile: (very basic)
  out = out.replace(/:([a-z0-9_]+):/g, (m, code) => {
    // Could use an emoji map, but fallback to unicode emoji shortcodes
    return m;
  });
  return out;
}

// Demo posts to show if real posts are empty
const DEMO_POSTS = [
  {
    id: 'demo-1',
    author: 'alice',
    author_username: 'alice',
    content: "Excited to join the decentralized world! 🚀",
    timestamp: Date.now() - 2 * 60 * 60 * 1000, // 2 hours ago
    avatar_url: 'https://robohash.org/alice.png',
    isDemo: true,
  },
  {
    id: 'demo-2',
    author: 'bob',
    author_username: 'bob',
    content: "On-chain proof is the future! 🔗",
    timestamp: Date.now() - 60 * 60 * 1000, // 1 hour ago
    avatar_url: 'https://robohash.org/bob.png',
    isDemo: true,
  },
  {
    id: 'demo-3',
    author: 'eve',
    author_username: 'eve',
    content: "Tokens for engagement? Yes please! 🎁",
    timestamp: Date.now() - 30 * 60 * 1000, // 30 min ago
    avatar_url: 'https://robohash.org/eve.png',
    isDemo: true,
  },
];

export default function PostFeed({ posts, onLike, onComment, currentUser }) {
  const navigate = useNavigate();
  const { getUser } = useUserManager();
  const { seedDemoPosts, fetchPosts } = usePostsManagerV2();
  const [authorAvatars, setAuthorAvatars] = useState({});
  const cacheRef = useRef({});
  const [activeTab, setActiveTab] = useState('posts');
  const [commentingPostId, setCommentingPostId] = useState(null);
  const [commentContent, setCommentContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Deduplicate posts by id
  // Always show all posts in the feed, regardless of author
  let uniquePosts = Array.isArray(posts) ? Array.from(new Map(posts.map(p => [p.id, p])).values()) : [];
  // If no real posts, use demo posts
  if (uniquePosts.length === 0) {
    uniquePosts = DEMO_POSTS;
  }

  useEffect(() => {
    let isMounted = true;
    async function fetchAvatars() {
      const uniqueAuthors = Array.from(new Set(uniquePosts.map(post => post.author)));
      const avatars = {};
      for (const author of uniqueAuthors) {
        if (cacheRef.current[author]) {
          avatars[author] = cacheRef.current[author];
        } else {
          try {
            const user = await getUser(author);
            const url = user && user.avatar_url ? user.avatar_url : defaultAvatar;
            avatars[author] = url;
            cacheRef.current[author] = url;
          } catch {
            avatars[author] = defaultAvatar;
            cacheRef.current[author] = defaultAvatar;
          }
        }
      }
      if (isMounted) setAuthorAvatars(avatars);
    }
    if (uniquePosts && uniquePosts.length > 0) fetchAvatars();
    return () => { isMounted = false; };
  }, [uniquePosts, getUser]);

  // Filter posts for each tab
  let filteredPosts = uniquePosts;
  if (activeTab === 'media') {
    // For demo: treat posts with an image URL in content as media
    filteredPosts = uniquePosts.filter(post => /https?:\/\/.+\.(jpg|jpeg|png|gif|webp)/i.test(post.content));
  } else if (activeTab === 'likes') {
    // Placeholder: show all posts (replace with liked posts logic if available)
    filteredPosts = uniquePosts;
  }

  // Avatar fallback for author
  function getSafeAuthor(post) {
    return {
      username: post.author_username || post.author || 'User',
      avatar_url: authorAvatars[post.author] || defaultAvatar,
    };
  }

  async function handleSeedDemoPosts() {
    setLoading(true);
    setError('');
    try {
      await seedDemoPosts();
      await fetchPosts();
      setError('Demo posts seeded!');
    } catch (e) {
      setError('Failed to seed demo posts.');
    }
    setLoading(false);
  }

  async function handleRetryFetch() {
    setLoading(true);
    setError('');
    try {
      await fetchPosts();
    } catch (e) {
      setError('Failed to fetch posts.');
    }
    setLoading(false);
  }

  return (
    <div className="feed-container responsive-container p-4 fade-in">
      {/* Tab Bar */}
      <div className="feed-tabs gap-3 glass" style={{ display: 'flex', justifyContent: 'center', gap: 'var(--space-3)', marginBottom: 'var(--space-3)', borderBottom: '1.5px solid #e0e7ff', maxWidth: 600, margin: '0 auto var(--space-3) auto', borderRadius: 'var(--border-radius)', boxShadow: 'var(--shadow)' }}>
        {TABS.map(tab => (
          <button
            key={tab.key}
            className={`feed-tab${activeTab === tab.key ? ' active' : ''}`}
            onClick={() => setActiveTab(tab.key)}
            type="button"
            style={{
              background: 'none',
              border: 'none',
              fontWeight: activeTab === tab.key ? 700 : 500,
              fontSize: activeTab === tab.key ? 17 : 15,
              color: activeTab === tab.key ? 'var(--primary-dark)' : 'var(--text-light)',
              borderBottom: activeTab === tab.key ? '2.5px solid var(--primary)' : '2.5px solid transparent',
              padding: '10px 0',
              marginBottom: -2,
              cursor: 'pointer',
              transition: 'all 0.18s',
              outline: 'none',
              minWidth: 70,
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>
      {/* Posts */}
      {loading && <div className="feed-loading">Loading posts...</div>}
      {error && <div className="feed-error" style={{ color: 'red', marginBottom: 16 }}>{error}</div>}
      {filteredPosts.length === 0 && !loading ? (
        <div className="feed-empty-state text-center mt-12 text-xl fade-in" style={{ marginTop: 'var(--space-5)' }}>
          <div className="feed-empty-icon text-5xl mb-2">🦄</div>
          <div className="feed-empty-text">No posts yet. Be the first to share something!</div>
        </div>
      ) : (
        filteredPosts.map((post, idx) => {
          const safeAuthor = getSafeAuthor(post);
          const isCommenting = commentingPostId === post.id;
          return (
            <div
              key={post.id}
              className="post-card card glass animate-fade-in scale-in"
              style={{ animationDelay: `${idx * 60}ms`, marginBottom: 'var(--space-4)' }}
              onMouseEnter={e => e.currentTarget.style.boxShadow = 'var(--shadow-hover)'}
              onMouseLeave={e => e.currentTarget.style.boxShadow = 'var(--shadow)'}
            >
              {/* Header: Avatar + Username + Timestamp */}
              <div className="post-header" style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', marginBottom: 8 }}>
                <Avatar user={safeAuthor} size={48} className="avatar" style={authorAvatars[post.author] ? {} : { filter: 'grayscale(1)', opacity: 0.5 }} />
                <div className="user-meta" style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', marginLeft: 8 }}>
                  <span
                    className="username gradient-text"
                    onClick={() => navigate(`/profile/${safeAuthor.username}`)}
                    style={{ fontWeight: 700, cursor: 'pointer', fontSize: 16 }}
                  >
                    @{safeAuthor.username}
                  </span>
                  <span className="post-meta-line" style={{ fontSize: 13, color: 'var(--text-light)', marginTop: 2 }}>{formatRelativeTime(post.timestamp)}</span>
                </div>
                {post.isDemo && (
                  <span style={{ marginLeft: 8, color: '#6366f1', fontWeight: 600, fontSize: 13, background: '#e0e7ff', borderRadius: 8, padding: '2px 8px' }}>Demo</span>
                )}
                {currentUser && (post.author === currentUser.id || post.author_username === currentUser.username) && (
                  <span className="you-badge">You</span>
                )}
              </div>
              {/* Content */}
              <div className="post-content" style={{ fontSize: 16, color: 'var(--text)', margin: '8px 0 0 0', textAlign: 'left', lineHeight: 1.6 }}>
                <span dangerouslySetInnerHTML={{ __html: renderMarkdown(post.content) }} />
                {renderHashtags(post.content)}
                {extractImageUrl(post.content) && (
                  <img
                    src={extractImageUrl(post.content)}
                    alt="media"
                    className="post-media-img"
                    style={{ marginTop: 10, maxWidth: '100%', borderRadius: 12, boxShadow: '0 2px 12px #7F5AF033' }}
                  />
                )}
              </div>
              {/* Actions */}
              <div className="post-actions" style={{ display: 'flex', gap: 24, marginTop: 16, alignItems: 'center' }}>
                <button className="post-action-btn" title="Like" style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#7F5AF0', fontSize: 22, transition: 'color 0.18s, transform 0.18s' }} onClick={() => onLike(post.id)}>
                  <FaRegHeart />
                </button>
                <button className="post-action-btn" title="Comment" style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#2CB67D', fontSize: 22, transition: 'color 0.18s, transform 0.18s' }} onClick={() => setCommentingPostId(post.id)}>
                  <FaRegCommentDots />
                </button>
                <button className="post-action-btn" title="Share" style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6366f1', fontSize: 22, transition: 'color 0.18s, transform 0.18s' }}>
                  <FaRegShareSquare />
                </button>
              </div>
              {/* Inline comment box shimmer placeholder for loading */}
              {isCommenting && (
                <div className="inline-comment-box open glass" style={{ marginTop: 12, marginBottom: 8, padding: '12px 8px 8px 8px', boxShadow: '0 2px 8px #7F5AF01a' }}>
                  <textarea
                    className="inline-comment-textarea"
                    value={commentContent}
                    onChange={e => setCommentContent(e.target.value)}
                    placeholder="Write a comment..."
                    rows={2}
                    style={{ fontFamily: 'var(--font-family)' }}
                  />
                  <div style={{ display: 'flex', gap: 8, marginTop: 6 }}>
                    <button className="button" style={{ padding: '6px 18px', fontSize: 15 }} onClick={() => { onComment(post.id, commentContent); setCommentContent(''); setCommentingPostId(null); }}>Send</button>
                    <button className="inline-comment-cancel" onClick={() => setCommentingPostId(null)}>Cancel</button>
                  </div>
                </div>
              )}
            </div>
          );
        })
      )}
      <style>
        {`
          .feed-container {
            max-width: 600px;
            margin: 0 auto;
            padding: 16px;
            display: flex;
            flex-direction: column;
            gap: 12px;
            background: none;
          }
          .post-card {
            background: rgba(255,255,255,0.82);
            border-radius: 32px;
            box-shadow: 0 8px 32px rgba(127,90,240,0.13), 0 1.5px 6px rgba(44,182,125,0.09);
            padding: 2.2rem 2rem;
            margin-bottom: 2.5rem;
            transition: box-shadow 0.22s, transform 0.22s, background 0.18s;
            backdrop-filter: blur(18px);
            border: 1.5px solid rgba(127,90,240,0.08);
            font-family: 'Open Sans', 'Montserrat', Arial, sans-serif;
          }
          .post-card:hover {
            box-shadow: 0 16px 48px rgba(127,90,240,0.18), 0 2px 8px rgba(44,182,125,0.13);
            transform: translateY(-4px) scale(1.012);
            background: rgba(255,255,255,0.92);
            backdrop-filter: blur(22px);
          }
          .post-header {
            display: flex;
            align-items: flex-start;
            gap: 12px;
            margin-bottom: 0;
          }
          .user-meta {
            display: flex;
            flex-direction: column;
            flex: 1;
            gap: 2px;
          }
          .username {
            font-weight: 800;
            font-size: 1.13rem;
            color: #a855f7;
            cursor: pointer;
            margin-bottom: 0;
            letter-spacing: 0.2px;
            background: linear-gradient(90deg, #a855f7 0%, #6366f1 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
            text-fill-color: transparent;
            transition: text-shadow 0.2s;
          }
          .username:hover {
            text-shadow: 0 2px 8px #a855f733;
          }
          .post-meta-line {
            font-size: 13px;
            color: #8a8a8a;
            font-family: 'Menlo', 'Consolas', 'monospace';
            margin-top: 1px;
            font-weight: 400;
          }
          .post-content {
            font-size: 15.5px;
            color: #3b0764;
            margin: 10px 0 0 0;
            line-height: 1.7;
            word-break: break-word;
            letter-spacing: 0.01em;
            font-family: 'Menlo', 'Consolas', 'monospace', 'sans-serif';
            font-weight: 400;
            position: relative;
          }
          .post-media-img {
            width: 100%;
            max-width: 100%;
            border-radius: 10px;
            margin-top: 8px;
            box-shadow: 0 2px 12px #a855f71a;
            object-fit: cover;
          }
          .hashtag-pill {
            display: inline-block;
            background: #e0e7ff;
            color: #4a90e2;
            border-radius: 8px;
            padding: 2px 10px;
            margin: 0 4px;
            font-size: 13px;
            font-weight: 600;
            cursor: pointer;
            transition: background 0.18s, color 0.18s;
          }
          .hashtag-pill:hover {
            background: #a855f7;
            color: #fff;
          }
          .actions {
            display: flex;
            gap: 18px;
            margin-top: 10px;
            justify-content: flex-end;
            align-items: center;
          }
          .action-btn {
            display: flex;
            align-items: center;
            gap: 6px;
            background: #f0f0f0;
            color: #6366f1;
            border: none;
            border-radius: 20px;
            padding: 7px 18px;
            font-size: 15px;
            font-weight: 600;
            cursor: pointer;
            transition: background 0.18s, color 0.18s, box-shadow 0.18s, transform 0.18s;
            position: relative;
            overflow: hidden;
          }
          .action-btn:hover {
            background: #e0e7ff;
            color: #a855f7;
            box-shadow: 0 2px 8px #a855f71a;
            transform: scale(1.05);
          }
          .action-btn:active::after {
            content: '';
            position: absolute;
            left: 50%; top: 50%;
            width: 120%; height: 120%;
            background: rgba(168,85,247,0.13);
            border-radius: 50%;
            transform: translate(-50%, -50%) scale(1.1);
            animation: ripple 0.4s linear;
            pointer-events: none;
            z-index: 1;
          }
          @keyframes ripple {
            0% { opacity: 0.5; }
            100% { opacity: 0; }
          }
          .action-count {
            color: #a855f7;
            font-weight: 700;
            font-size: 1.01rem;
            margin-left: 8px;
            text-shadow: 0 1px 4px #f3e8ff;
            transition: opacity 0.18s, transform 0.18s;
            display: inline-block;
          }
          .action-count-animate {
            opacity: 0.2;
            transform: scale(1.3);
          }
          .feed-tabs {
            display: flex;
            gap: 0;
            margin-bottom: 18px;
            border-bottom: 1.5px solid #e0e7ff;
            padding-bottom: 2px;
            justify-content: space-between;
          }
          .feed-tab {
            background: none;
            border: none;
            outline: none;
            flex: 1 1 0;
            font-size: 17px;
            font-weight: 600;
            color: #888;
            padding: 8px 0 10px 0;
            cursor: pointer;
            border-bottom: 2px solid transparent;
            transition: color 0.18s, border-bottom 0.18s, transform 0.18s;
            text-align: center;
          }
          .feed-tab.active {
            background: linear-gradient(90deg, #7F5AF0 0%, #2CB67D 100%);
            color: #fff !important;
            border-radius: 16px 16px 0 0;
            font-weight: 800;
            box-shadow: 0 2px 8px #7F5AF033;
          }
          .feed-tab:hover:not(.active) {
            color: #a855f7;
            transform: scale(1.05);
          }
          .avatar {
            width: 48px !important;
            height: 48px !important;
            border-radius: 50%;
            object-fit: cover;
            border: 1px solid #ccc;
            background: #f7f7f7;
            flex-shrink: 0;
            transition: box-shadow 0.2s, border 0.2s, transform 0.2s;
          }
          .avatar:hover {
            box-shadow: 0 4px 16px #a855f7aa;
            border: 1px solid #6366f1;
            transform: scale(1.07);
          }
          .inline-comment-box {
            max-height: 0;
            opacity: 0;
            overflow: hidden;
            transition: max-height 0.3s cubic-bezier(.4,0,.2,1), opacity 0.2s;
            background: #f8fafc;
            border-radius: 10px;
            margin-top: 0;
            margin-bottom: 0;
            padding: 0 2px;
          }
          .inline-comment-box.open {
            max-height: 120px;
            opacity: 1;
            margin-top: 12px;
            margin-bottom: 8px;
            padding: 12px 8px 8px 8px;
            box-shadow: 0 2px 8px #a855f71a;
          }
          .inline-comment-textarea {
            width: 100%;
            border-radius: 7px;
            border: 1px solid #e0e7ff;
            padding: 8px 12px;
            font-size: 15px;
            background: #f9f9ff;
            resize: none;
            transition: border 0.18s;
            outline: none;
          }
          .inline-comment-textarea:focus {
            border: 1.5px solid #4a90e2;
          }
          .inline-comment-cancel {
            background: #f3f4f6;
            color: #4a90e2;
            border: none;
            border-radius: 7px;
            padding: 7px 16px;
            font-size: 15px;
            font-weight: 600;
            cursor: pointer;
            transition: background 0.18s;
          }
          .inline-comment-cancel:hover {
            background: #e0e7ff;
          }
          .inline-comment-post {
            background: linear-gradient(90deg, #4a90e2 0%, #a855f7 100%);
            color: #fff;
            border: none;
            border-radius: 7px;
            padding: 7px 18px;
            font-size: 15px;
            font-weight: 700;
            cursor: pointer;
            transition: background 0.18s;
          }
          .inline-comment-post:disabled {
            background: #e0e0e0;
            color: #aaa;
            cursor: not-allowed;
          }
          .inline-comment-post:hover:not(:disabled) {
            background: linear-gradient(90deg, #357abd 0%, #9333ea 100%);
          }
          .gradient-text {
            background: linear-gradient(90deg, #7F5AF0 0%, #2CB67D 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
            text-fill-color: transparent;
          }
          .pulse {
            animation: pulse-btn 0.4s cubic-bezier(.4,0,.2,1);
          }
          @keyframes pulse-btn {
            0% { transform: scale(1); }
            50% { transform: scale(1.18); box-shadow: 0 0 0 8px #7F5AF033; }
            100% { transform: scale(1); }
          }
          .glass {
            background: var(--glass-bg);
            backdrop-filter: var(--glass-blur);
            border-radius: var(--border-radius);
            box-shadow: var(--shadow);
            border: 1.5px solid rgba(127,90,240,0.10);
          }
          .shimmer {
            background: linear-gradient(90deg, #f3f3f3 25%, #e0eafc 50%, #f3f3f3 75%);
            background-size: 200% 100%;
            animation: shimmer 1.2s infinite linear;
          }
          @keyframes shimmer {
            0% { background-position: 200% 0; }
            100% { background-position: -200% 0; }
          }
          .post-actions .post-action-btn:hover {
            color: #FF5470;
            transform: scale(1.18);
          }
          .feed-tabs {
            font-family: 'Montserrat', 'Open Sans', Arial, sans-serif;
            background: rgba(255,255,255,0.82);
            border-radius: 24px;
            box-shadow: 0 4px 16px #7F5AF022;
            padding: 0.5rem 0.5rem 0 0.5rem;
            margin-bottom: 2.5rem;
          }
          .feed-tab.active {
            background: linear-gradient(90deg, #7F5AF0 0%, #2CB67D 100%);
            color: #fff !important;
            border-radius: 16px 16px 0 0;
            font-weight: 800;
            box-shadow: 0 2px 8px #7F5AF033;
          }
          .feed-empty-state {
            font-family: 'Montserrat', 'Open Sans', Arial, sans-serif;
            color: #7F5AF0;
            background: rgba(255,255,255,0.92);
            border-radius: 28px;
            box-shadow: 0 4px 24px #7F5AF022;
            padding: 2.5rem 2rem;
            margin-top: 3rem;
          }
        `}
      </style>
    </div>
  );
} 