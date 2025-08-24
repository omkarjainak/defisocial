import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Avatar from './Avatar';
import { FaUserCircle, FaSignOutAlt, FaBell, FaEnvelope } from 'react-icons/fa';

const defaultAvatar = 'https://robohash.org/default.png';

export default function Navbar({ principal, onLogout, user }) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const drawerRef = useRef();
  const navigate = useNavigate();

  // Close drawer on outside click
  useEffect(() => {
    if (!drawerOpen) return;
    function handleClick(e) {
      if (drawerRef.current && !drawerRef.current.contains(e.target)) {
        setDrawerOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [drawerOpen]);

  // Close dropdown on outside click
  useEffect(() => {
    if (!dropdownOpen) return;
    function handleClick(e) {
      if (!e.target.closest('.navbar-avatar-dropdown')) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [dropdownOpen]);

  const navLinks = (
    <>
      <span className="navbar-logo" title="Home" role="img" aria-label="logo">🧱</span>
      <Link to="/" className={`navbar-link${window.location.pathname === '/' ? ' navbar-link-active' : ''}`}>Feed</Link>
      <Link to="/profile" className={`navbar-link${window.location.pathname.startsWith('/profile') && window.location.pathname.split('/').length === 2 ? ' navbar-link-active' : ''}`}>Profile</Link>
      {user && (
        <Link to={`/profile/${user.username}`} className={`navbar-link navbar-link-strong${window.location.pathname === `/profile/${user.username}` ? ' navbar-link-active' : ''}`}>My Profile</Link>
      )}
    </>
  );

  const navRight = (
    <>
      {user && (
        <span onClick={() => navigate(`/profile/${user.username}`)} style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Avatar user={user} size={40} className="navbar-avatar" />
        </span>
      )}
      <span className="navbar-username">
        {user ? user.username : (principal ? principal.slice(0, 8) + '...' : 'Guest')}
      </span>
      {principal && (
        <button
          onClick={onLogout}
          className="navbar-logout-btn button"
        >
          Logout
        </button>
      )}
    </>
  );

  return (
    <header className="navbar-container glass fade-in" style={{ position: 'sticky', top: 0, zIndex: 100, background: 'rgba(255,255,255,0.85)', boxShadow: '0 8px 32px rgba(127,90,240,0.13)' }}>
      <nav className="navbar responsive-container" style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '18px 32px', fontFamily: 'Montserrat, Poppins, Arial, sans-serif' }}>
        {/* Logo */}
        <div className="navbar-logo" style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }} onClick={() => navigate('/feed')}>
          <span style={{ fontSize: 28, marginRight: 2 }}>🧱</span>
          <span style={{ fontWeight: 900, fontSize: 22, letterSpacing: '-1px', background: 'linear-gradient(90deg, #2CB67D 0%, #7F5AF0 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text', textFillColor: 'transparent' }}>DeFi Social</span>
        </div>
        {/* Nav Links */}
        <div className="navbar-links" style={{ display: 'flex', alignItems: 'center', gap: 32 }}>
          <Link to="/feed" className="navbar-link" style={{ fontWeight: 700, fontSize: 16, color: '#7F5AF0', padding: '6px 18px', borderRadius: 12, transition: 'background 0.18s, color 0.18s', textDecoration: 'none' }}>Feed</Link>
          <Link to="/profile" className="navbar-link" style={{ fontWeight: 700, fontSize: 16, color: '#2CB67D', padding: '6px 18px', borderRadius: 12, transition: 'background 0.18s, color 0.18s', textDecoration: 'none' }}>My Profile</Link>
        </div>
        {/* Right Side: Avatar/Login/Logout */}
        <div className="navbar-right" style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
          {/* Utility icons (optional) */}
          <FaBell style={{ fontSize: 20, color: '#b0b0c3', marginRight: 8, cursor: 'pointer', transition: 'color 0.18s' }} />
          <FaEnvelope style={{ fontSize: 20, color: '#b0b0c3', marginRight: 8, cursor: 'pointer', transition: 'color 0.18s' }} />
          {user ? (
            <div className="navbar-avatar-dropdown" style={{ position: 'relative' }}>
              <span onClick={() => setDropdownOpen(v => !v)} style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Avatar user={user} size={40} className="navbar-avatar" />
              </span>
              <span className="navbar-username" style={{ fontWeight: 700, fontSize: 15, color: '#23272f', marginLeft: 8 }}>{user.username}</span>
              {dropdownOpen && (
                <div className="navbar-dropdown-menu" style={{ position: 'absolute', right: 0, top: 48, background: '#fff', borderRadius: 16, boxShadow: '0 8px 32px #7F5AF033', padding: '16px 0', minWidth: 180, zIndex: 100 }}>
                  <Link to="/profile" className="navbar-dropdown-item" style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 24px', color: '#7F5AF0', fontWeight: 700, textDecoration: 'none', fontSize: 15, transition: 'background 0.18s' }} onClick={() => setDropdownOpen(false)}><FaUserCircle /> My Profile</Link>
                  <button onClick={onLogout} className="navbar-dropdown-item" style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 24px', color: '#e57373', fontWeight: 700, background: 'none', border: 'none', width: '100%', textAlign: 'left', fontSize: 15, cursor: 'pointer', transition: 'background 0.18s' }}><FaSignOutAlt /> Logout</button>
                </div>
              )}
            </div>
          ) : (
            <button onClick={() => navigate('/')} className="navbar-login-btn" style={{ fontWeight: 700, fontSize: 16, color: '#fff', background: 'linear-gradient(90deg, #7F5AF0 0%, #2CB67D 100%)', border: 'none', borderRadius: 16, padding: '10px 28px', boxShadow: '0 4px 24px #7F5AF055', cursor: 'pointer', transition: 'background 0.18s, box-shadow 0.18s' }}>Login</button>
          )}
        </div>
      </nav>
      <style>{`
        .navbar-link:hover {
          background: #f3f4f6;
          color: #7F5AF0;
        }
        .navbar-link:active {
          background: #e0c3fc;
        }
        .navbar-avatar {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          object-fit: cover;
          border: 2px solid #fff;
          box-shadow: 0 2px 8px #7F5AF033;
          background: #f7f7f7;
          cursor: pointer;
          transition: box-shadow 0.18s, border 0.18s, transform 0.18s;
        }
        .navbar-avatar:hover {
          box-shadow: 0 8px 32px #7F5AF0cc;
          border: 2.5px solid #2CB67D;
          transform: scale(1.08);
        }
        .navbar-dropdown-item:hover {
          background: #f3f4f6;
        }
        .navbar-login-btn:hover {
          background: linear-gradient(90deg, #2CB67D 0%, #7F5AF0 100%);
          box-shadow: 0 8px 32px #7F5AF0cc;
        }
      `}</style>
    </header>
  );
} 