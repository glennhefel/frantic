import express from 'express';
import mongoose from 'mongoose';
import Media from '../models/media.model.js';
import Rating from '../models/review.model.js';
import ReviewVote from '../models/reviewVote.model.js'; // Add this import
import { authenticateToken } from '../middleware/authi.js';
import { optionalAuthenticateToken } from '../middleware/optionalAuth.js';
import { voteOnReview } from '../controllers/reviewVoteController.js';
import { isAdmin } from '../middleware/isAdmin.js';

const router = express.Router();



// Get all media
router.get('/', async (req, res) => {
  try {
    const mediaList = await Media.find();
    
    const mediaWithRatings = await Promise.all(
      mediaList.map(async (media) => {
        const ratings = await Rating.find({ media: media._id });
        const total_votes = ratings.length;
        const average_rating = total_votes === 0
          ? 0
          : ratings.reduce((sum, r) => sum + r.rating, 0) / total_votes;
        return {
          ...media.toObject(),
          average_rating,
          total_votes,
        };
      })
    );
    res.json(mediaWithRatings);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// search 
router.get('/search', async (req, res) => {
  try {
    const q = (req.query.q || '').trim();
    
    if (!q) {
      return res.json([]); 
    }
    
    const results = await Media.find({
      $or: [
        { title: { $regex: q, $options: 'i' } },
        { description: { $regex: q, $options: 'i' } },
        { genre: { $regex: q, $options: 'i' } },
        { director: { $regex: q, $options: 'i' } }
      ]
    }).limit(100);
    
    res.json(results);
  } catch (err) {
    console.error('Search error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get a single media by ID 
router.get('/:id', optionalAuthenticateToken, async (req, res) => {

  
  try {
    const media = await Media.findById(req.params.id);
    if (!media) return res.status(404).json({ error: 'Not found' });

    const reviews = await Rating.find({ media: media._id }).populate('user');
    const total_votes = reviews.length;
    const average_rating = total_votes === 0
      ? 0
      : reviews.reduce((sum, r) => sum + r.rating, 0) / total_votes;

    // If user is authenticated, get their votes on these reviews
    let reviewsWithUserVotes = reviews;
    if (req.user) {
      const userVotes = await ReviewVote.find({
        user: req.user.id,
        review: { $in: reviews.map(r => r._id) }
      });

      reviewsWithUserVotes = reviews.map(review => {
        const userVote = userVotes.find(v => v.review.toString() === review._id.toString());
        return {
          ...review.toObject(),
          userVote: userVote ? userVote.value : 0
        };
      });
    }

    res.json({
      ...media.toObject(),
      reviews: reviewsWithUserVotes,
      average_rating,
      total_votes,
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Add new media
router.post('/add', async (req, res) => {
  try {
    const newMedia = new Media(req.body);
    await newMedia.save();
    res.json({ message: 'Media added!', media: newMedia });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.delete('/:id', authenticateToken, isAdmin, async (req, res) => {
  console.log('DELETE request for:', req.params.id);
  try {
    const deleted = await Media.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ error: 'Not found' });
    res.json({ message: 'Media deleted' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.post('/:mediaId/vote', authenticateToken, voteOnReview);

export default router;