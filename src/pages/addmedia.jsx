import React, { useState, useEffect } from 'react';
import { jwtDecode } from "jwt-decode";
import NavBar from './navbar';
import './addmedia.css';

function AddMediaForm() {
  const [form, setForm] = useState({
    title: '',
    release_date: '',
    media: '',
    genre: '',
    director: '',
    description: '',
    poster: '',
  });

  const [loading, setLoading] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    // Check if user is admin
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const decoded = jwtDecode(token);
        setIsAdmin(decoded.isAdmin || false);
      } catch (e) {
        setIsAdmin(false);
      }
    }
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    const token = localStorage.getItem('token');
    if (!token) {
      alert('Please log in to add media');
      setLoading(false);
      return;
    }
    
    try {
      const endpoint = isAdmin 
        ? 'http://localhost:5000/media/add' 
        : 'http://localhost:5000/media/request';
      
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(form),
      });
      
      if (!res.ok) throw new Error('Failed to submit request');
      
      // Different success messages based on admin status
      if (isAdmin) {
        alert(' Media added successfully!');
      } else {
        alert('Media request submitted! An admin will review it shortly.');
      }
      
      // Reset form
      setForm({
        title: '',
        release_date: '',
        media: '',
        genre: '',
        director: '',
        description: '',
        poster: '',
      });
    } catch (err) {
      alert('Error: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <NavBar />
      <div className="add-media-page">
        <div className="container py-4">
          <div className="add-media-container">
            
            {/* Header Section */}
            <div className="add-media-header">
              <div className="header-icon">🎬</div>
              <h1 className="header-title">
                {isAdmin ? 'Add New Media' : 'Request New Media'}
              </h1>
              <p className="header-subtitle">
                {isAdmin 
                  ? 'Add content directly to the database' 
                  : 'Submit a request for admin approval'}
              </p>
              {!isAdmin && (
                <div className="info-banner">
                  <span className="info-icon">ℹ️</span>
                  Your request will be reviewed by an admin before being added to the site.
                </div>
              )}
            </div>

            {/* Form Section */}
            <form onSubmit={handleSubmit} className="add-media-form">
              <div className="form-grid">
                
                {/* Title Input */}
                <div className="form-group">
                  <label className="form-label">
                    <span className="label-icon">📝</span>
                    Title *
                  </label>
                  <input 
                    name="title" 
                    placeholder="Enter media title" 
                    value={form.title} 
                    onChange={handleChange} 
                    required 
                    className="form-input"
                    disabled={loading}
                  />
                </div>

                {/* Release Date Input */}
                <div className="form-group">
                  <label className="form-label">
                    <span className="label-icon">📅</span>
                    Release Date *
                  </label>
                  <input 
                    name="release_date" 
                    type="date" 
                    value={form.release_date} 
                    onChange={handleChange} 
                    required 
                    className="form-input"
                    disabled={loading}
                  />
                </div>

                {/* Media Type Select */}
                <div className="form-group">
                  <label className="form-label">
                    <span className="label-icon">🎭</span>
                    Media Type *
                  </label>
                  <select 
                    name="media" 
                    value={form.media} 
                    onChange={handleChange} 
                    required 
                    className="form-input"
                    disabled={loading}
                  >
                    <option value="">Select media type</option>
                    <option value="Anime"> Anime</option>
                    <option value="Movies"> Movies</option>
                    <option value="TV_series"> TV Series</option>
                  </select>
                </div>

                {/* Genre Select */}
                <div className="form-group">
                  <label className="form-label">
                    <span className="label-icon">🎪</span>
                    Genre *
                  </label>
                  <select 
                    name="genre" 
                    value={form.genre} 
                    onChange={handleChange} 
                    required 
                    className="form-input"
                    disabled={loading}
                  >
                    <option value="">Select genre</option>
                    <option value="Action"> Action</option>
                    <option value="Psychological"> Psychological</option>
                    <option value="Comedy"> Comedy</option>
                    <option value="Romance"> Romance</option>
                    <option value="Sci-Fi"> Sci-Fi</option>
                    <option value="Cyberpunk"> Cyberpunk</option>
                    <option value="Drama"> Drama</option>
                    <option value="Fantasy"> Fantasy</option>
                    <option value="Adventure"> Adventure</option>
                    <option value="Mystery"> Mystery</option>
                    <option value="Horror"> Horror</option>
                    <option value="Thriller"> Thriller</option>
                    <option value="Slice of Life"> Slice of Life</option>
                    <option value="Supernatural"> Supernatural</option>
                  </select>
                </div>

                {/* Director Input */}
                <div className="form-group">
                  <label className="form-label">
                    <span className="label-icon">🎬</span>
                    Director *
                  </label>
                  <input 
                    name="director" 
                    placeholder="Enter director name" 
                    value={form.director} 
                    onChange={handleChange} 
                    required
                    className="form-input"
                    disabled={loading}
                  />
                </div>

                {/* Poster URL Input */}
                <div className="form-group">
                  <label className="form-label">
                    <span className="label-icon">🖼️</span>
                    Poster URL
                  </label>
                  <input 
                    name="poster" 
                    placeholder="Enter poster image URL" 
                    value={form.poster} 
                    onChange={handleChange} 
                    className="form-input"
                    disabled={loading}
                  />
                </div>

              </div>

              {/* Description Textarea */}
              <div className="form-group-full">
                <label className="form-label">
                  <span className="label-icon">📄</span>
                  Description
                </label>
                <textarea 
                  name="description" 
                  placeholder="Enter a brief description..." 
                  value={form.description} 
                  onChange={handleChange} 
                  className="form-textarea"
                  rows="3"
                  disabled={loading}
                />
              </div>

              {/* Submit Button */}
              <div className="form-submit">
                <button 
                  type="submit" 
                  className="submit-btn"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <span className="spinner"></span>
                      {isAdmin ? 'Adding...' : 'Submitting...'}
                    </>
                  ) : (
                    <>
                      <span className="btn-icon"></span>
                      {isAdmin ? 'Add Media' : 'Submit Request'}
                    </>
                  )}
                </button>
              </div>

            </form>
          </div>
        </div>
      </div>
    </>
  );
}

export default AddMediaForm;