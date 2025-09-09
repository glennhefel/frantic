import React, { useEffect, useState, useCallback } from 'react';
import NavBar from './navbar';
import { Link } from 'react-router-dom';
import './Profile.css';

function safeDecodeToken(token) {
  if (!token) return null;
  try {
    const part = token.split('.')[1];
    const json = atob(part.replace(/-/g, '+').replace(/_/g, '/'));
    return JSON.parse(json);
  } catch {
    return null;
  }
}

export default function WatchlistPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem('token');

  const fetchWatchlist = useCallback(async () => {
    setLoading(true);
    if (!token) {
      setItems([]);
      setLoading(false);
      return;
    }

    try {
      const res = await fetch('http://localhost:5000/users/me/watchlist', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error(`Status ${res.status}`);
      const data = await res.json().catch(() => []);
      
      // Extract media objects from the watchlist items
      const list = Array.isArray(data) ? data.map(item => item.media || item) : [];
      setItems(list);
    } catch (err) {
      console.error('Error fetching watchlist:', err);
      const decoded = safeDecodeToken(token);
      setItems(decoded?.watchlist || []);
    } finally {
      setLoading(false);
    }
  }, [token]);

  const removeFromWatchlist = async (mediaId) => {
    if (!token) {
      alert('Please log in to manage your watchlist.');
      return;
    }

    try {
      const res = await fetch(`http://localhost:5000/users/me/watchlist/${mediaId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        // Refresh the watchlist
        fetchWatchlist();
      } else {
        alert('Failed to remove from watchlist');
      }
    } catch (err) {
      console.error('Error removing from watchlist:', err);
      alert('Failed to remove from watchlist');
    }
  };

  useEffect(() => {
    fetchWatchlist();
  }, [fetchWatchlist]);

  return (
    <>
      <NavBar />
      <div className="homepage-dark" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <div className="container py-4" style={{ flex: 1 }}>
          <h2 className="mb-3">My Watchlist</h2>

          {loading ? (
            <p>Loading...</p>
          ) : items.length === 0 ? (
            <div className="alert alert-info">Your watchlist is empty.</div>
          ) : (
            <div className="row row-cols-1 row-cols-sm-2 row-cols-md-3 g-3">
              {items.map((m) => (
                <div className="col" key={m._id || m.id || m.tmdbId || JSON.stringify(m).slice(0,20)}>
                  <div className="card h-100 bg-dark text-light">
                    <img src={m.poster || m.image || '/logo192.png'} alt={m.title || m.name} style={{ height: 220, objectFit: 'cover' }} className="card-img-top" />
                    <div className="card-body d-flex flex-column">
                      <h5 className="card-title">{m.title || m.name || 'Untitled'}</h5>
                      <p className="card-text text-muted small flex-grow-1">{m.genre || m.genres?.join(', ') || ''}</p>
                      <div className="mt-auto">
                        <Link to={`/media/${m._id || m.id || ''}`} className="btn btn-sm btn-outline-primary me-2">View</Link>
                        <button 
                          onClick={() => removeFromWatchlist(m._id || m.id)} 
                          className="btn btn-sm btn-outline-danger"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}