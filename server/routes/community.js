const express = require('express');
const { body, validationResult } = require('express-validator');
const router = express.Router();

const CommunityPost = require('../models/CommunityPost');
const User = require('../models/User');
const { auth } = require('../middleware/auth');

// @route   GET /api/community/posts
// @desc    Get community posts
// @access  Private
router.get('/posts', auth, async (req, res) => {
  try {
    const { category, type, limit = 20, skip = 0 } = req.query;

    const query = { status: 'Published', visibility: 'Public' };
    if (category) query.category = category;
    if (type) query.type = type;

    const posts = await CommunityPost.find(query)
      .populate('author', 'name avatar level')
      .sort({ featured: -1, createdAt: -1 })
      .limit(parseInt(limit))
      .skip(parseInt(skip));

    res.json({
      success: true,
      data: { posts }
    });

  } catch (error) {
    console.error('Get posts error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching posts'
    });
  }
});

// @route   POST /api/community/posts
// @desc    Create a new post
// @access  Private
router.post('/posts', auth, [
  body('title').trim().isLength({ min: 5, max: 100 }).withMessage('Title must be 5-100 characters'),
  body('content').trim().isLength({ min: 10, max: 2000 }).withMessage('Content must be 10-2000 characters'),
  body('type').isIn(['Share', 'Question', 'Achievement', 'Tip', 'Challenge', 'Discussion', 'News']),
  body('category').isIn(['Transportation', 'Energy', 'Food', 'Shopping', 'Waste', 'Water', 'Community', 'Education', 'General'])
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const post = new CommunityPost({
      author: req.user._id,
      title: req.body.title,
      content: req.body.content,
      type: req.body.type,
      category: req.body.category,
      tags: req.body.tags || []
    });

    await post.save();
    await post.populate('author', 'name avatar level');

    res.status(201).json({
      success: true,
      message: 'Post created successfully',
      data: { post }
    });

  } catch (error) {
    console.error('Create post error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while creating post'
    });
  }
});

module.exports = router;