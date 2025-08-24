import React, { useState } from 'react';
import Avatar from './Avatar';

const defaultAvatar = 'https://robohash.org/default.png';
const defaultCover = 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80';

export default function Profile({ user, onUpdate, followers = [], following = [], isFollowing = false, onFollow, onUnfollow, principal, onLogout, postCount = 0 }) {
  const [editing, setEditing] = useState(false);
  // Always use fallback for missing fields
  const safeUser = {
    username: user?.username || 'user',
    name: user?.name || 'User',
    bio: user?.bio || '',
    avatar_url: user?.avatar_url || defaultAvatar,
    cover_url: user?.cover_url || defaultCover,
    id: user?.id || 'user-id',
  };
  const coverUrl = safeUser.cover_url;

  if (!user) return <div>Loading profile...</div>;

  const isOwnProfile = principal && (user.id === principal || user.username === principal);

  if (editing) {
    return (
      <section className="profile-card card scale-in responsive-container p-4" style={{ margin: 'var(--space-4) auto' }}>
        <h2 className="responsive-title mb-3" style={{ fontSize: 28, fontWeight: 700, color: '#4f46e5', marginBottom: 16 }}>Edit Profile</h2>
        {/* Live preview of banner and avatar */}
        <div style={{ position: 'relative', marginBottom: 24 }}>
          <div style={{
            background: banner ? `linear-gradient(120deg, #f3f8ff 60%, #ffe3f9 100%), url('${banner}')` : 'linear-gradient(120deg, #f3f8ff 60%, #ffe3f9 100%)',
            backgroundBlendMode: 'lighten',
            borderRadius: '16px 16px 0 0',
            boxShadow: '0 4px 16px rgba(0,0,0,0.05)',
            height: 120,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            position: 'relative',
            overflow: 'hidden',
            width: '100%',
            minWidth: 260,
          }}>
            <div style={{
              position: 'absolute',
              top: 0, left: 0, right: 0, bottom: 0,
              background: 'linear-gradient(180deg, rgba(0,0,0,0.08) 0%, rgba(0,0,0,0.18) 100%)',
              zIndex: 1,
            }} />
            <div style={{
              position: 'absolute',
              bottom: -40,
              left: 24,
              zIndex: 3,
              width: 80,
              height: 80,
              borderRadius: '50%',
              border: '3px solid #fff',
              boxShadow: '0 4px 16px rgba(0,0,0,0.10)',
              background: '#f7f7f7',
              overflow: 'hidden',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <Avatar user={{ ...safeUser, avatar_url: avatar }} size={80} className="profile-banner-avatar" />
            </div>
          </div>
        </div>
        <form onSubmit={e => { e.preventDefault(); onUpdate(username, name, bio, avatar, banner); setEditing(false); }} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
          <input
            type="text"
            placeholder="Username (unique, cannot change later)"
            value={username}
            onChange={e => setUsername(e.target.value)}
            required
            disabled={!!safeUser.username}
            style={{ width: '100%', marginBottom: 16, padding: 12, borderRadius: 8, border: '1px solid #c7d2fe', background: safeUser.username ? '#f3f4f6' : 'white', fontSize: 16 }}
          />
          <input
            type="text"
            placeholder="Name"
            value={name}
            onChange={e => setName(e.target.value)}
            required
            style={{ width: '100%', marginBottom: 16, padding: 12, borderRadius: 8, border: '1px solid #c7d2fe', fontSize: 16 }}
          />
          <input
            type="text"
            placeholder="Bio"
            value={bio}
            onChange={e => setBio(e.target.value)}
            style={{ width: '100%', marginBottom: 16, padding: 12, borderRadius: 8, border: '1px solid #c7d2fe', fontSize: 16 }}
          />
          <input
            type="text"
            placeholder="Avatar URL (optional)"
            value={avatar}
            onChange={e => setAvatar(e.target.value)}
            style={{ width: '100%', marginBottom: 16, padding: 12, borderRadius: 8, border: '1px solid #c7d2fe', fontSize: 16 }}
          />
          <input
            type="text"
            placeholder="Banner URL (optional)"
            value={banner}
            onChange={e => setBanner(e.target.value)}
            style={{ width: '100%', marginBottom: 20, padding: 12, borderRadius: 8, border: '1px solid #c7d2fe', fontSize: 16 }}
          />
          <button type="submit" className="button scale-in" style={{ width: '100%', fontWeight: 600, fontSize: 18, borderRadius: 8, padding: '12px 0', marginBottom: 8 }}>Save</button>
        </form>
        <button onClick={() => setEditing(false)} className="button" style={{ width: '100%', background: '#f3f4f6', color: '#4f46e5', fontWeight: 600, fontSize: 16, border: 'none', borderRadius: 8, padding: '10px 0', marginTop: 4, cursor: 'pointer' }}>Cancel</button>
      </section>
    );
  }

  return (
    <main className="profile-main-container responsive-container fade-in p-4" style={{ maxWidth: 600, margin: '0 auto', padding: 0, position: 'relative', zIndex: 2 }}>
      {/* Floating blobs for background */}
      <div className="bg-blob bg-blob1" />
      <div className="bg-blob bg-blob2" />
      <div className="bg-blob bg-blob3" />
      <div className="profile-banner-container glass" style={{ maxWidth: 600, margin: '0 auto', boxShadow: 'var(--shadow)', borderRadius: 'var(--border-radius) var(--border-radius) 0 0', position: 'relative', zIndex: 2 }}>
        <div
          className="profile-banner"
          style={{
            background: coverUrl ? `linear-gradient(120deg, #e0c3fc 60%, #8ec5fc 100%), url('${coverUrl}')` : 'linear-gradient(120deg, #e0c3fc 60%, #8ec5fc 100%)',
            backgroundBlendMode: 'lighten',
            borderRadius: 'var(--border-radius) var(--border-radius) 0 0',
            boxShadow: '0 8px 32px 0 rgba(127,90,240,0.08)',
            height: 200,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            position: 'relative',
            overflow: 'hidden',
            display: 'flex',
            alignItems: 'flex-end',
            justifyContent: 'center',
          }}
        >
          <div className="profile-banner-overlay" style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'linear-gradient(180deg, rgba(0,0,0,0.08) 0%, rgba(0,0,0,0.18) 100%)', zIndex: 1 }} />
          <div className="profile-banner-content" style={{ position: 'relative', zIndex: 2, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, padding: '0 0 18px 0', width: '100%' }}>
            <div style={{ position: 'relative', marginBottom: 8 }}>
              <div style={{ width: 120, height: 120, borderRadius: '50%', background: 'rgba(255,255,255,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 8px 32px #7F5AF0cc', border: '4px solid #fff', margin: '0 auto', transition: 'box-shadow 0.18s, border 0.18s, transform 0.18s' }}>
                <Avatar user={safeUser} size={110} className="profile-banner-avatar" />
                {/* Verified badge */}
                <span className="verified-badge" style={{ position: 'absolute', bottom: 12, right: 12, background: 'var(--primary-gradient)', borderRadius: '50%', width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 8px #7F5AF033', color: '#fff', fontSize: 18, border: '2px solid #fff' }} title="Verified" aria-label="Verified user">✔️</span>
              </div>
            </div>
            <div className="profile-banner-username gradient-text" style={{ fontSize: '1.5rem', fontWeight: 700, textShadow: '0 2px 8px #0008', marginBottom: 4, textAlign: 'center' }}>@{safeUser.username}</div>
            <div className="profile-bio bio" style={{ fontSize: 16, marginBottom: 8, textAlign: 'center', color: '#444' }}>{safeUser.bio ? safeUser.bio : <span style={{ color: '#bbb', fontStyle: 'italic' }}>No bio yet. Click to add one.</span>}</div>
          </div>
        </div>
      </div>
      <div className="profile-card card glass scale-in p-4" style={{ background: 'radial-gradient(ellipse at 60% 0%, #e0c3fc 60%, #8ec5fc 100%)', borderRadius: '0 0 var(--border-radius) var(--border-radius)', padding: 32, boxShadow: 'var(--shadow)', marginBottom: 32, marginTop: -60, position: 'relative', zIndex: 3 }}>
        <div className="profile-header" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
          <div className="profile-info" style={{ textAlign: 'center' }}>
            <div className="profile-display-name" style={{ fontWeight: 700, fontSize: 22, color: '#23272f', marginBottom: 2, letterSpacing: '0.01em' }}>{safeUser.name}</div>
            <div className="profile-username gradient-text" style={{ fontWeight: 600, fontSize: 18, marginBottom: 6 }}>@{safeUser.username}</div>
            <div className="profile-bio bio" style={{ fontSize: 16, marginBottom: 8, color: '#444' }}>{safeUser.bio ? safeUser.bio : <span style={{ color: '#bbb', fontStyle: 'italic' }}>No bio yet. Click to add one.</span>}</div>
          </div>
          {/* Stats as glass buttons with hover/active animation */}
          <div className="profile-stats-row" style={{ display: 'flex', gap: 18, margin: '18px 0 8px 0', justifyContent: 'center' }}>
            <button className="glass stats stat-btn" aria-label="Posts" style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 600, fontSize: 17, padding: '10px 22px', border: 'none', cursor: 'pointer', transition: 'box-shadow 0.18s, transform 0.18s, background 0.18s', color: '#2D2D2D', background: 'rgba(255,255,255,0.7)' }}><span role="img" aria-label="posts">📝</span> Posts <span style={{ fontWeight: 700, marginLeft: 6 }}>0</span></button>
            <button className="glass stats stat-btn" aria-label="Followers" style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 600, fontSize: 17, padding: '10px 22px', border: 'none', cursor: 'pointer', transition: 'box-shadow 0.18s, transform 0.18s, background 0.18s', color: '#2D2D2D', background: 'rgba(255,255,255,0.7)' }}><span role="img" aria-label="followers">👥</span> Followers <span style={{ fontWeight: 700, marginLeft: 6 }}>0</span></button>
            <button className="glass stats stat-btn" aria-label="Following" style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 600, fontSize: 17, padding: '10px 22px', border: 'none', cursor: 'pointer', transition: 'box-shadow 0.18s, transform 0.18s, background 0.18s', color: '#2D2D2D', background: 'rgba(255,255,255,0.7)' }}><span role="img" aria-label="following">🔗</span> Following <span style={{ fontWeight: 700, marginLeft: 6 }}>0</span></button>
          </div>
        </div>
        {/* Add more profile info, stats, and actions here */}
      </div>
      {/* Tabs with pill style */}
      <div className="pill-tabs" style={{ margin: '0 auto 24px auto', maxWidth: 420 }}>
        <button className="pill-tab active"><span className="tab-icon" role="img" aria-label="posts">📝</span> Posts</button>
        <button className="pill-tab"><span className="tab-icon" role="img" aria-label="media">🖼️</span> Media</button>
        <button className="pill-tab"><span className="tab-icon" role="img" aria-label="likes">❤️</span> Likes</button>
      </div>
      {/* Tab Content Placeholder */}
      <div style={{ minHeight: 120, maxWidth: 600, margin: '0 auto' }}>
        Posts content goes here.
      </div>
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
        .verified-badge {
          animation: fade-in-up 0.7s cubic-bezier(.4,0,.2,1);
        }
        .pill-tabs {
          animation: fade-in-up 0.7s cubic-bezier(.4,0,.2,1);
        }
        .stat-btn {
          box-shadow: 0 2px 8px #7F5AF033;
        }
        .stat-btn:hover, .stat-btn:focus {
          background: var(--primary-gradient);
          color: #fff !important;
          transform: scale(1.06) translateY(-2px);
          box-shadow: 0 8px 32px #7F5AF0cc;
        }
        .stat-btn:active {
          transform: scale(0.97);
          box-shadow: 0 2px 8px #7F5AF033;
        }
      `}</style>
    </main>
  );
} 