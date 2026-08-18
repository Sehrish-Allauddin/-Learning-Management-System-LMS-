const express = require('express');
const router = express.Router();
const prisma = require('../utils/prisma');
const { verifyToken } = require('../middleware/auth');

// Get all notifications for current user
router.get('/', verifyToken, async (req, res) => {
  try {
    const notifications = await prisma.notification.findMany({
      where: { userId: req.user.id },
      orderBy: { createdAt: 'desc' },
      take: 50 // Limit to latest 50
    });
    res.json(notifications);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error fetching notifications' });
  }
});

// Mark notification as read
router.put('/:id/read', verifyToken, async (req, res) => {
  try {
    const notificationId = parseInt(req.params.id);
    const notification = await prisma.notification.updateMany({
      where: { 
        id: notificationId,
        userId: req.user.id
      },
      data: { read: true }
    });
    res.json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error updating notification' });
  }
});

// Mark all as read
router.put('/read-all', verifyToken, async (req, res) => {
    try {
      await prisma.notification.updateMany({
        where: { userId: req.user.id, read: false },
        data: { read: true }
      });
      res.json({ success: true });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Server error updating notifications' });
    }
  });

module.exports = router;
