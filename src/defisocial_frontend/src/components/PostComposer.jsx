import React, { useState, useRef, useEffect } from 'react';
import Avatar from './Avatar';

const defaultAvatar = 'https://robohash.org/default.png';

export default function PostComposer({ onPost, user }) {
  const [content, setContent] = useState('');
  const textareaRef = useRef();
  const charCount = content.length;
  const maxChars = 280;
  const progress = Math.min(100, (charCount / maxChars) * 100);
  const charColor = charCount > 0.8 * maxChars ? '#f87171' : '#aaa';
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
    }
  }, [content]);

  const handleImageChange = e => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      setImagePreview(URL.createObjectURL(file));
    } else {
      setImage(null);
      setImagePreview(null);
    }
  };

  const handleSubmit = async e => {
    e.preventDefault();
    if (!content.trim()) return;
    setLoading(true);
    await new Promise(r => setTimeout(r, 800)); // Simulate async post
    onPost(content, image);
    setContent('');
    setImage(null);
    setImagePreview(null);
    setLoading(false);
    setSuccess(true);
    setTimeout(() => setSuccess(false), 1200);
  };

  const safeUser = user || { username: 'Guest', avatar_url: defaultAvatar };
  const avatarUrl = safeUser.avatar_url || defaultAvatar;
  const username = safeUser.username || 'Guest';

  return (
    <div className="composer-card card glass fade-in responsive-container p-4" style={{ margin: 'var(--space-4) auto', fontFamily: 'Open Sans, Montserrat, Arial, sans-serif', background: 'rgba(255,255,255,0.82)', borderRadius: 32, boxShadow: '0 8px 32px rgba(127,90,240,0.13), 0 1.5px 6px rgba(44,182,125,0.09)', backdropFilter: 'blur(18px)', border: '1.5px solid rgba(127,90,240,0.08)' }}>
      <form onSubmit={handleSubmit} className="composer-form" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
        <div className="composer-header" style={{ display: 'flex', alignItems: 'flex-start', gap: 'var(--space-3)' }}>
          <Avatar user={safeUser} size={40} className="composer-avatar" />
          <div className="composer-meta" style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
            <div className="composer-username gradient-text" style={{ fontSize: 15, fontWeight: 600, marginBottom: 2 }}>Posting as <span style={{ color: 'var(--text)', fontWeight: 700 }}>@{username}</span></div>
            <textarea
              ref={textareaRef}
              value={content}
              onChange={e => setContent(e.target.value)}
              placeholder="What's on your mind?"
              rows={4}
              maxLength={maxChars}
              className="composer-textarea glass"
              aria-label="Post content"
              style={{ fontFamily: 'var(--font-family)', marginBottom: 0 }}
            />
            <div className="composer-progress-row" style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginTop: 2 }}>
              <div className="composer-progress-bar-bg glass">
                <div className="composer-progress-bar" style={{ width: `${progress}%` }} />
              </div>
              <span className="composer-charcount" style={{ color: charColor }}>{charCount}/{maxChars}</span>
            </div>
            {imagePreview && (
              <div className="composer-image-preview" style={{ margin: '10px 0', textAlign: 'left' }}>
                <img src={imagePreview} alt="preview" style={{ maxWidth: 120, maxHeight: 120, borderRadius: 8, boxShadow: 'var(--shadow)' }} />
                <button type="button" className="button" style={{ marginLeft: 12, padding: '4px 10px', fontSize: 13, background: '#eee', color: '#888' }} onClick={() => { setImage(null); setImagePreview(null); }}>Remove</button>
              </div>
            )}
            {/* Emoji/Icon Row */}
            <div className="composer-icons-row" style={{ display: 'flex', alignItems: 'center', gap: 18, marginTop: 2 }}>
              <span className="composer-icon" title="Add emoji" role="img" aria-label="emoji" style={{ fontSize: 22, cursor: 'pointer', opacity: 0.7, transition: 'opacity 0.15s, transform 0.15s' }} onMouseOver={e => e.currentTarget.style.opacity = 1} onMouseOut={e => e.currentTarget.style.opacity = 0.7}>😊</span>
              <span className="composer-icon" title="Attach image" role="img" aria-label="image" style={{ fontSize: 22, cursor: 'pointer', opacity: 0.7, transition: 'opacity 0.15s, transform 0.15s' }} onMouseOver={e => e.currentTarget.style.opacity = 1} onMouseOut={e => e.currentTarget.style.opacity = 0.7}>🖼️</span>
              <span className="composer-icon" title="Mention user" role="img" aria-label="mention" style={{ fontSize: 22, cursor: 'pointer', opacity: 0.7, transition: 'opacity 0.15s, transform 0.15s' }} onMouseOver={e => e.currentTarget.style.opacity = 1} onMouseOut={e => e.currentTarget.style.opacity = 0.7}>@</span>
            </div>
            <button
              type="submit"
              className={`composer-post-btn button${loading ? ' shimmer' : ''}`}
              style={{
                marginTop: 10,
                alignSelf: 'flex-end',
                minWidth: 120,
                fontFamily: 'Montserrat, Open Sans, Arial, sans-serif',
                fontWeight: 800,
                fontSize: '1.13rem',
                background: 'linear-gradient(90deg, #7F5AF0 0%, #2CB67D 100%)',
                boxShadow: '0 4px 24px #7F5AF055',
                border: 'none',
                borderRadius: 20,
                padding: '12px 0',
                transition: 'box-shadow 0.18s, transform 0.18s, background 0.18s',
                outline: 'none',
                position: 'relative',
                zIndex: 2,
                cursor: loading || !content.trim() ? 'not-allowed' : 'pointer',
                opacity: loading || !content.trim() ? 0.7 : 1
              }}
              disabled={loading || !content.trim()}
            >
              {loading ? 'Posting...' : 'Post'}
            </button>
            {success && <div className="composer-success fade-in" style={{ color: 'var(--success)', fontWeight: 600, marginTop: 8 }}>Posted!</div>}
          </div>
        </div>
      </form>
      <style>{`
        .gradient-text {
          background: linear-gradient(90deg, #7F5AF0 0%, #2CB67D 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          text-fill-color: transparent;
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
        .composer-card {
          max-width: 600px;
          margin: 20px auto;
          padding: 20px;
          background: #fff;
          border-radius: 12px;
          box-shadow: 0 4px 12px rgba(0,0,0,0.05);
        }
        .composer-form {
          display: flex;
          flex-direction: column;
        }
        .composer-header {
          display: flex;
          align-items: flex-start;
        }
        .composer-avatar {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          margin-right: 16px;
          object-fit: cover;
          border: 2px solid #e0e0e0;
          background: #f7f7f7;
          flex-shrink: 0;
        }
        .composer-meta {
          flex: 1;
          display: flex;
          flex-direction: column;
        }
        .composer-username {
          font-size: 15px;
          color: #4a90e2;
          font-weight: 600;
          margin-bottom: 6px;
        }
        .composer-username span {
          color: #222;
          font-weight: 700;
        }
        .composer-textarea {
          width: 100%;
          min-height: 80px;
          max-height: 120px;
          font-size: 15px;
          border-radius: 8px;
          border: 1px solid #ddd;
          padding: 10px 14px;
          resize: none;
          background: #f9f9f9;
          transition: border 0.18s, box-shadow 0.18s;
          outline: none;
          margin-bottom: 6px;
        }
        .composer-textarea:focus {
          border: 1.5px solid #4a90e2;
          box-shadow: 0 0 0 2px #e3f0fc;
        }
        .composer-icons-row {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-top: 2px;
        }
        .composer-icon {
          font-size: 18px;
          cursor: pointer;
          opacity: 0.7;
          transition: opacity 0.15s;
        }
        .composer-icon:hover {
          opacity: 1;
        }
        .composer-charcount {
          margin-left: auto;
          font-size: 13px;
          color: #aaa;
        }
        .composer-post-btn {
          background: linear-gradient(90deg, #4a90e2 0%, #a855f7 100%);
          color: #fff;
          padding: 10px 20px;
          border-radius: 8px;
          border: none;
          font-size: 16px;
          font-weight: 700;
          margin-top: 10px;
          align-self: flex-end;
          cursor: pointer;
          box-shadow: 0 2px 8px #a855f71a;
          transition: background 0.18s, box-shadow 0.18s, transform 0.18s;
        }
        .composer-post-btn:hover:not(.disabled) {
          background: linear-gradient(90deg, #2CB67D 0%, #7F5AF0 100%);
          box-shadow: 0 6px 24px #7F5AF033;
          transform: scale(1.045);
        }
        .composer-post-btn:active {
          transform: scale(0.97);
          box-shadow: 0 2px 8px rgba(127,90,240,0.10);
        }
        .composer-post-btn.disabled {
          background: #e0e0e0;
          color: #aaa;
          cursor: not-allowed;
          box-shadow: none;
        }
        .composer-progress-row {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-top: 2px;
        }
        .composer-progress-bar-bg {
          flex: 1;
          height: 6px;
          background: #e0e7ff;
          border-radius: 4px;
          overflow: hidden;
          margin-right: 8px;
        }
        .composer-progress-bar {
          height: 100%;
          background: linear-gradient(90deg, #4a90e2 0%, #a855f7 100%);
          border-radius: 4px;
          transition: width 0.25s cubic-bezier(.4,0,.2,1);
        }
        @media (max-width: 600px) {
          .composer-card {
            padding: 10px;
          }
          .composer-header {
            flex-direction: column;
            align-items: stretch;
          }
          .composer-avatar {
            width: 32px;
            height: 32px;
            margin-right: 0;
            margin-bottom: 8px;
          }
        }
        .composer-card:focus-within {
          box-shadow: 0 16px 48px rgba(127,90,240,0.18), 0 2px 8px rgba(44,182,125,0.13);
          background: rgba(255,255,255,0.92);
          backdrop-filter: blur(22px);
        }
        .composer-icon:hover {
          opacity: 1 !important;
          transform: scale(1.18);
        }
      `}</style>
    </div>
  );
} 