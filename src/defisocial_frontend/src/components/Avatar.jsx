import React, { useState } from 'react';

const defaultAvatar = 'https://robohash.org/default.png';

export default function Avatar({ user, size = 40, style = {}, className = '' }) {
  const [loaded, setLoaded] = useState(false);
  // Use avatar_url if present, else generate a dynamic avatar
  const dicebearAvatar = `https://avatars.dicebear.com/api/initials/${encodeURIComponent(user?.username || user?.id || 'U')}.svg`;
  const dynamicAvatar = user?.avatar_url || dicebearAvatar;
  const avatarUrl = dynamicAvatar;

  return (
    <span
      className={`avatar-wrapper ${className}`}
      style={{
        display: 'inline-block',
        width: size,
        height: size,
        position: 'relative',
        boxShadow: loaded ? '0 8px 32px #7F5AF0aa' : '0 2px 8px #7F5AF033',
        borderRadius: '50%',
        border: '2.5px solid rgba(127,90,240,0.13)',
        background: 'rgba(255,255,255,0.65)',
        backdropFilter: 'blur(8px)',
        transition: 'box-shadow 0.18s, border 0.18s, transform 0.18s',
        fontFamily: 'Montserrat, Open Sans, Arial, sans-serif',
        ...style,
      }}
      tabIndex={0}
      aria-label={user?.username || user?.id || 'User'}
    >
      {!loaded && (
        <span className="avatar-skeleton shimmer" style={{ width: size, height: size }} />
      )}
      <img
        src={avatarUrl}
        alt="avatar"
        style={{
          width: size,
          height: size,
          borderRadius: '50%',
          objectFit: 'cover',
          border: loaded ? '2.5px solid #7F5AF0' : '1px solid #ccc',
          background: '#f7f7f7',
          display: loaded ? 'block' : 'none',
          boxShadow: loaded ? '0 4px 16px #7F5AF0aa' : '0 2px 8px #7F5AF033',
          transition: 'box-shadow 0.18s, border 0.18s, transform 0.18s',
        }}
        onLoad={() => setLoaded(true)}
        onError={e => {
          e.target.onerror = null;
          e.target.src = defaultAvatar;
          setLoaded(true);
        }}
        className="avatar-img"
      />
      <style>{`
        .avatar-skeleton {
          display: block;
          border-radius: 50%;
          background: linear-gradient(90deg, #f3f3f3 25%, #e0e7ff 50%, #f3f3f3 75%);
          background-size: 200% 100%;
          animation: shimmer 1.2s infinite linear;
          position: absolute;
          top: 0; left: 0;
        }
        .avatar-wrapper:hover .avatar-img {
          box-shadow: 0 12px 36px #7F5AF0cc;
          border: 2.5px solid #2CB67D;
          transform: scale(1.10);
        }
        @keyframes shimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
      `}</style>
    </span>
  );
} 