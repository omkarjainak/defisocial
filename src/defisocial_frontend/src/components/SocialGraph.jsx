import React from 'react';

export default function SocialGraph({ followers, following, onFollow, onUnfollow }) {
  return (
    <section>
      <h3>Followers</h3>
      <ul>
        {followers.map(f => <li key={f}>{f}</li>)}
      </ul>
      <h3>Following</h3>
      <ul>
        {following.map(f => <li key={f}>{f} <button onClick={() => onUnfollow(f)}>Unfollow</button></li>)}
      </ul>
      <button onClick={onFollow}>Follow someone new</button>
    </section>
  );
} 