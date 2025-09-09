import { Router } from 'express';
import Discussion from '../models/discussion.model.js';
import { authenticateToken } from '../middleware/authi.js';

const router = Router();

// GET discussions for a specific media
router.get('/:mediaId/discussions', async (req, res) => {
  try {
    const { mediaId } = req.params;
    const discussions = await Discussion.find({ media: mediaId })
      .populate('user', 'username')
      .sort({ createdAt: 1 }); // Oldest first for chat-like experience
    
    res.json(discussions);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST a new discussion message
router.post('/:mediaId/discussions', authenticateToken, async (req, res) => {
  try {
    const { mediaId } = req.params;
    const { message } = req.body;
    
    if (!message || message.trim().length === 0) {
      return res.status(400).json({ error: 'Message cannot be empty' });
    }

    if (message.length > 500) {
      return res.status(400).json({ error: 'Message too long (max 500 characters)' });
    }

    const discussion = new Discussion({
      media: mediaId,
      user: req.user.id,
      message: message.trim()
    });

    await discussion.save();
    
    // Populate user info before sending back
    await discussion.populate('user', 'username');
    
    res.status(201).json(discussion);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT edit a discussion message (only by the author)
router.put('/discussions/:discussionId', authenticateToken, async (req, res) => {
  try {
    const { discussionId } = req.params;
    const { message } = req.body;
    
    if (!message || message.trim().length === 0) {
      return res.status(400).json({ error: 'Message cannot be empty' });
    }

    if (message.length > 500) {
      return res.status(400).json({ error: 'Message too long (max 500 characters)' });
    }

    const discussion = await Discussion.findById(discussionId);
    
    if (!discussion) {
      return res.status(404).json({ error: 'Discussion not found' });
    }

    // Check if user owns this discussion
    if (String(discussion.user) !== String(req.user.id)) {
      return res.status(403).json({ error: 'Not authorized to edit this message' });
    }

    discussion.message = message.trim();
    discussion.editedAt = new Date();
    discussion.isEdited = true;
    
    await discussion.save();
    await discussion.populate('user', 'username');
    
    res.json(discussion);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE a discussion message (only by the author or admin)
router.delete('/discussions/:discussionId', authenticateToken, async (req, res) => {
  try {
    const { discussionId } = req.params;
    
    const discussion = await Discussion.findById(discussionId);
    
    if (!discussion) {
      return res.status(404).json({ error: 'Discussion not found' });
    }

    // Check if user owns this discussion or is admin
    const isOwner = String(discussion.user) === String(req.user.id);
    const isAdmin = req.user.isAdmin;
    
    if (!isOwner && !isAdmin) {
      return res.status(403).json({ error: 'Not authorized to delete this message' });
    }

    await Discussion.findByIdAndDelete(discussionId);
    
    res.json({ message: 'Discussion deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
