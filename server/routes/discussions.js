const express = require('express');
const router = express.Router();
const prisma = require('../utils/prisma');
const { verifyToken } = require('../middleware/auth');

// GET /api/discussions/:courseId
router.get('/:courseId', verifyToken, async (req, res) => {
  try {
    const courseId = parseInt(req.params.courseId);
    
    const discussions = await prisma.discussion.findMany({
      where: { courseId },
      include: {
        user: { select: { name: true, designation: true } },
        comments: {
          include: {
            user: { select: { name: true, role: true } }
          },
          orderBy: { createdAt: 'asc' }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
    
    res.json(discussions);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/discussions/:courseId
router.post('/:courseId', verifyToken, async (req, res) => {
  try {
    const courseId = parseInt(req.params.courseId);
    const { title, content } = req.body;
    const userId = req.user.id;

    if (!title || !content) {
      return res.status(400).json({ error: 'Title and content are required' });
    }

    const discussion = await prisma.discussion.create({
      data: {
        title,
        content,
        courseId,
        userId
      },
      include: {
        user: { select: { name: true, designation: true } },
        comments: true
      }
    });

    res.status(201).json(discussion);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/discussions/:discussionId/comments
router.post('/:discussionId/comments', verifyToken, async (req, res) => {
  try {
    const discussionId = parseInt(req.params.discussionId);
    const { content } = req.body;
    const userId = req.user.id;

    if (!content) {
      return res.status(400).json({ error: 'Content is required' });
    }

    const comment = await prisma.comment.create({
      data: {
        content,
        discussionId,
        userId
      },
      include: {
        user: { select: { name: true, role: true } }
      }
    });

    // Fetch discussion to know the author
    const discussion = await prisma.discussion.findUnique({
      where: { id: discussionId }
    });

    // If the commenter is not the author, send a notification
    if (discussion && discussion.userId !== userId) {
      const notification = await prisma.notification.create({
        data: {
          userId: discussion.userId,
          content: `${req.user.name || 'Someone'} replied to your discussion "${discussion.title}".`,
          type: 'REPLY'
        }
      });

      // Emit to the author if they are online
      if (req.io && req.userSockets) {
        const socketId = req.userSockets.get(discussion.userId);
        if (socketId) {
          req.io.to(socketId).emit('new_notification', notification);
        }
      }
    }

    res.status(201).json(comment);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
