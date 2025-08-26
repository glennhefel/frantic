import express from 'express';
import Rating from '../models/review.model.js';
//import Media from '../models/media.model.js';
//import User from '../models/user.model.js'; 
import { voteOnReview } from '../controllers/reviewVoteController.js';
import { authenticateToken } from '../middleware/authi.js';

const router = express.Router();


router.get('/media/:mediaId', async (req, res) => {
  try {
    const ratings = await Rating.find({ media: req.params.mediaId })
      .populate('user', 'username')  
      .sort({ createdAt: 1 });

    res.json(ratings);
  } catch (err) {
    res.status(500).json({ error: 'Failed to get ratings' });
  }
});


router.post('/:mediaId', async (req, res) => {
  try {
    const { rating, comment, userId } = req.body;

    const existing = await Rating.findOne({
      media: req.params.mediaId,
      user: userId
    });

    if (existing) {
      existing.rating = rating;
      existing.comment = comment || existing.comment;
      await existing.save();
      return res.json({ updated: true, rating: existing });
    }

    const newRating = new Rating({
      media: req.params.mediaId,
      user: userId,
      rating,
      comment
    });

    await newRating.save();
    res.status(201).json({ created: true, rating: newRating });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to post rating' });
  }
});

// POST /api/ratings/reviews/:reviewId/vote
router.post('/reviews/:reviewId/vote', authenticateToken, voteOnReview);

router.get('/reviews/:reviewId/user-vote', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const reviewId = req.params.reviewId;
    
    const userVote = await ReviewVote.findOne({
      user: userId,
      review: reviewId
    });
    
    res.json({ value: userVote ? userVote.value : 0 });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
export default router;