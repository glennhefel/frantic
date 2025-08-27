import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import './MediaDetail.css';
import { jwtDecode } from "jwt-decode";
import NavBar from './navbar';

function MediaDetail() {
  const { id } = useParams();
  const [media, setMedia] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const userId = localStorage.getItem('userId');
  const userReviewed = reviews.find(r => r.user && (r.user._id === userId || r.user.id === userId));
  
  useEffect(() => {
    const token = localStorage.getItem('token');
    const headers = token ? { 'Authorization': `Bearer ${token}` } : {};
    
    fetch(`http://localhost:5000/media/${id}`, { headers })
      .then(res => {
        if (!res.ok) throw new Error('Not found');
        return res.json();
      })
      .then(data => {
        setMedia(data);
        setReviews(data.reviews || []);
      })
      .catch(() => setMedia(null));
  }, [id]);

  // Admin check   
  const token = localStorage.getItem('token');
  let isAdmin = false;
  if (token) {
    try {
      const decoded = jwtDecode(token);
      isAdmin = decoded.isAdmin;
    } catch (e) {
      isAdmin = false;
    }
  }

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this media?')) {
      try {
        const res = await fetch(`http://localhost:5000/media/${id}`, {
          method: 'DELETE',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}` 
          }
        });
        const result = await res.json();
        if (!res.ok) throw new Error(result.error || 'Network response was not ok');
        alert('Media deleted!');
        window.location.href = '/home';
      } catch (err) {
        console.error('Error deleting media:', err);
        alert('Failed to delete media: ' + err.message);
      }
    }
  };

  const sendReviewVote = async (reviewId, value) => {
    const token = localStorage.getItem('token');
    if (!token) {
      alert('Please log in to vote.');
      return;
    }

    try {
      const res = await fetch(`http://localhost:5000/ratings/reviews/${reviewId}/vote`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ value }),
      });

      if (!res.ok) {
        alert('Vote failed.');
        return;
      }

      // Refresh media 
      const mediaRes = await fetch(`http://localhost:5000/media/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (mediaRes.ok) {
        const data = await mediaRes.json();
        setMedia(data);
        setReviews(data.reviews || []);
      }
    } catch (err) {
      alert('Vote failed.');
    }
  };

  const handleUpvote = (reviewId) => sendReviewVote(reviewId, 1);
  const handleDownvote = (reviewId) => sendReviewVote(reviewId, -1);

  if (media === null) return <div>Media not found.</div>;

  return (
    <>
      <NavBar />
      <div className="media-detail-container">
        <div className="movie-container">
          <div className="movie-poster">
            <img src={media.poster} alt={`${media.title} Poster`} className="poster-image" />
          </div>

          <div className="movie-details">
            <h1 className="movie-title">{media.title}</h1>
            <div className="movie-meta">
              <span className="release-year btn-sm mb-7 px-7 py-8 rounded">{new Date(media.release_date).getFullYear()}</span>
              <span className="rating">★ {media.average_rating?.toFixed(1) || 'N/A'}/10 - reviews: {media.total_votes}</span>
            </div>
            <div className="movie-info mt-3">
              <p style={{ fontSize: '0.95rem' }}><strong>Director:</strong> {media.director}</p>
              <p style={{ fontSize: '0.95rem' }}><strong>Genre:</strong> {media.genre}</p>
            </div>
            
            {isAdmin && (
              <button onClick={handleDelete} className="btn btn-danger btn-sm mb-3 px-3 py-2 rounded">
                Delete
              </button>
            )}

            {userReviewed ? (
              <button onClick={() => setShowModal(true)}
                    className="btn btn-secondary btn-sm mb-3 px-3 py-2 rounded">Already Reviewed</button>
            ) : (
              <button
                onClick={() => setShowModal(true)}
                className="btn btn-outline-primary btn-sm mb-3 px-3 py-2 rounded"
              >
                Add a review...
              </button>
            )}
            
            <div className="movie-description">
              <h4>Synopsis</h4>
              <br />
              <p style={{ fontSize: '0.95rem' }}>{media.description}</p>
            </div>
          </div>
        </div>

        {/* Reviews Section */}
        <div className="reviews-section">
          <div className="reviews-header">
            <h4 className="reviews-title">
              <span className="reviews-icon">💬</span>
              Reviews ({reviews.length})
            </h4>
            
            {/* Quick Add Review Button */}
            <div className="quick-review-container">
              <div className="user-avatar-small">
                <span>👤</span>
              </div>
              <button 
                className="quick-review-btn"
                onClick={() => setShowModal(true)}
              >
                {userReviewed ? "Update your review..." : "Write a review..."}
              </button>
            </div>
          </div>

          {/* Reviews List */}
          <div className="reviews-list">
            {reviews.length === 0 ? (
              <div className="no-reviews">
                <div className="no-reviews-icon"></div>
                <p>No reviews yet.</p>
              </div>
            ) : (
              reviews.map((review) => (
                <div key={review.id} className="review-card">
                  {/* Review Header */}
                  <div className="review-header">
                    <div className="review-user-info">
                      <div className="user-avatar">
                        <span>{review.user.username.charAt(0).toUpperCase()}</span>
                      </div>
                      <div className="user-details">
                        <div className="username">{review.user.username}</div>
                        <div className="review-meta">
                          <span className="rating-badge">
                            ⭐ {review.rating}/10
                          </span>
                          <span className="review-time">• Just now</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Review Content */}
                  <div className="review-content">
                    {review.comment === '(This guy wrote nothing)' ? (
                      <div className="empty-comment">
                        <em>No written review</em>
                      </div>
                    ) : (
                      <p className="review-text">{review.comment}</p>
                    )}
                  </div>

                  {/* Review Actions */}
                  <div className="review-actions">
                    <div className="vote-section">
                      <button 
                        onClick={() => handleUpvote(review._id)} 
                        className={`vote-btn upvote ${review.userVote === 1 ? 'active' : ''}`}
                      >
                        <span className="vote-icon">👍</span>
                        <span className="vote-count">{review.upvotes || 0}</span>
                      </button>
                      
                      <button 
                        onClick={() => handleDownvote(review._id)} 
                        className={`vote-btn downvote ${review.userVote === -1 ? 'active' : ''}`}
                      >
                        <span className="vote-icon">👎</span>
                        <span className="vote-count">{review.downvotes || 0}</span>
                      </button>
                    </div>
                    
                    <div className="review-stats">
                      {(review.upvotes || 0) + (review.downvotes || 0) > 0 && (
                        <span className="total-votes">
                          {(review.upvotes || 0) + (review.downvotes || 0)} votes
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Improved Modal */}
        {showModal && (
          <div className="review-modal">
            <div className="modal-content-box">
              {/* Modal Header */}
              <div className="modal-header">
                <h3 className="modal-title">
                  <span className="modal-icon"></span>
                  {userReviewed ? 'Edit Your Review' : 'Write a Review'}
                </h3>
                <button 
                  className="modal-close-btn"
                  onClick={() => setShowModal(false)}
                  type="button"
                >
                  ✕
                </button>
              </div>

              {/* Modal Form */}
              <form onSubmit={async (e) => {
                e.preventDefault();
                const rating = e.target.rating.value;
                const comment = e.target.comment.value;

                try {
                  const res = await fetch(`http://localhost:5000/ratings/${id}`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ rating, comment, userId }),
                  });

                  if (!res.ok) {
                    throw new Error('Failed to submit review');
                  }

                  setShowModal(false);

                  // Refetch media details 
                  const token = localStorage.getItem('token');
                  const headers = token ? { 'Authorization': `Bearer ${token}` } : {};
                  fetch(`http://localhost:5000/media/${id}`, { headers })
                    .then(res => res.json())
                    .then(data => {
                      setMedia(data);
                      setReviews(data.reviews || []);
                    });
                } catch (err) {
                  alert('Failed to submit review: ' + err.message);
                }
              }}>
                
                {/* Rating Section */}
                <div className="form-group">
                  <label className="form-label">
                    <span className="label-icon">⭐</span>
                    Rating (1-10)
                  </label>
                  <select
                    name="rating"
                    required
                    className="form-control rating-select"
                  >
                    <option value="">Select rating</option>
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(num => (
                      <option key={num} value={num}>
                        ⭐ {num}/10 {num <= 3 ? '- Poor' : num <= 5 ? '- Fair' : num <= 7 ? '- Good' : num <= 8 ? '- Great' : '- Excellent'}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Comment Section */}
                <div className="form-group">
                  <label className="form-label">
                    <span className="label-icon">💭</span>
                    Comment (optional)
                  </label>
                  <textarea
                    name="comment"
                    rows="4"
                    className="form-control comment-textarea"
                    placeholder="Share your thoughts about this..."
                  ></textarea>
                </div>

                {/* Modal Actions */}
                <div className="modal-actions">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="btn-cancel"
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn-submit">
                    <span className="btn-icon"></span>
                    {userReviewed ? 'Update Review' : 'Post Review'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

export default MediaDetail;