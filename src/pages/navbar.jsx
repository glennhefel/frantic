import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../components/navbar.css';

function NavBar() {
  const username = localStorage.getItem('username');
  const [search, setSearch] = useState('');
  const navigate = useNavigate();

  const handleSearch = (e) => {
    e.preventDefault(); 
    const q = search.trim();
    if (!q) return;
    navigate(`/search?q=${encodeURIComponent(q)}`);
    setSearch('');
  };

  const handleLogout = () => {
    // Remove all tokens and user info
    localStorage.clear();
    sessionStorage.clear();
    // Optionally, you can add more cleanup here if needed
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-dark px-4 py-2 professional-navbar">
      <div className="container-fluid">
        
        <Link className="navbar-brand navbar-brand-professional" to="/home">
          🎬 VoidRift
        </Link>

        {/* Navigation Links */}
        <ul className="navbar-nav me-auto mb-0" style={{ gap: '0.5rem' }}>
          <li className="nav-item">
            <Link className="nav-link nav-link-professional" to="/home">
               Home
            </Link>
          </li>
          <li className="nav-item">
            <Link className="nav-link nav-link-professional" to="/top100">
               Top 100
            </Link>
          </li>
          <li className="nav-item">
            <Link className="nav-link nav-link-professional" to="/addmedia">
               Add Media
            </Link>
          </li>
          <li className="nav-item">
            <Link className="nav-link nav-link-professional" to="/watchlist">
               Watchlist
            </Link>
          </li>
        </ul>

        {/* Search Form */}
        <form className="d-flex me-3 search-container-professional" onSubmit={handleSearch}>
          <div className="input-group">
            <input
              className="form-control search-input-professional"
              type="search"
              placeholder="Search"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
            <button className="btn btn-outline-success btn-sm " type="submit">
                 Search 
            </button>
          </div>
        </form>

        {/* User Section */}
        <div className="d-flex align-items-center" style={{ gap: '12px' }}>
          <div className="user-section-professional">
            Welcome,
            <Link className="username-link-professional" to="/profile">
              {username || "Guest"}
            </Link>
          </div>
          <Link className="btn btn-outline-danger btn-sm" to="/" onClick={handleLogout}>
            Logout
          </Link>
        </div>
      </div>
    </nav>
  );
}

export default NavBar;
