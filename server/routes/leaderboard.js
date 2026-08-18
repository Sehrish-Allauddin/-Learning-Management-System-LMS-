const express = require('express');
const router = express.Router();
const prisma = require('../utils/prisma');
const { verifyToken } = require('../middleware/auth');

router.get('/', verifyToken, async (req, res) => {
  try {
    // We need to calculate points:
    // 1 point per 1% on assessment (score in Progress)
    // 50 points per BADGE
    // 100 points per CERTIFICATE

    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        progress: {
          where: { score: { not: null } },
          select: { score: true }
        },
        rewards: {
          select: { rewardType: true }
        }
      }
    });

    const leaderboard = users.map(user => {
      let totalPoints = 0;
      
      // Calculate points from progress
      user.progress.forEach(p => {
        if (p.score) totalPoints += p.score;
      });

      // Calculate points from rewards
      let badges = 0;
      let certificates = 0;
      user.rewards.forEach(r => {
        if (r.rewardType === 'BADGE') {
            totalPoints += 50;
            badges += 1;
        } else if (r.rewardType === 'CERTIFICATE') {
            totalPoints += 100;
            certificates += 1;
        }
      });

      return {
        id: user.id,
        name: user.name,
        points: totalPoints,
        badges,
        certificates
      };
    });

    // Sort by points descending and take top 20
    leaderboard.sort((a, b) => b.points - a.points);
    const top20 = leaderboard.slice(0, 20);

    // Assign ranks
    top20.forEach((user, index) => {
        user.rank = index + 1;
    });

    res.json(top20);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error calculating leaderboard' });
  }
});

module.exports = router;
