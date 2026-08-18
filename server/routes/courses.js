const express = require('express');
const router = express.Router();
const prisma = require('../utils/prisma');
const { verifyToken, isModeratorOrAdmin } = require('../middleware/auth');

// GET /api/courses/my-courses
// Learner view of their enrolled courses
router.get('/my-courses', verifyToken, async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Find all courses where the user has at least one progress record
    const enrolledCourses = await prisma.course.findMany({
      where: {
        modules: {
          some: {
            progress: {
              some: {
                userId: userId
              }
            }
          }
        }
      },
      include: {
        _count: {
          select: { modules: true }
        },
        feedback: {
          select: { rating: true }
        }
      }
    });

    // Calculate average rating
    const formattedCourses = enrolledCourses.map(course => {
      const ratings = course.feedback.filter(f => f.rating);
      const avgRating = ratings.length 
        ? (ratings.reduce((acc, f) => acc + f.rating, 0) / ratings.length).toFixed(1) 
        : 0;
      return { ...course, avgRating };
    });

    res.json(formattedCourses);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/courses/:id/enroll
// Learner enrolls in a course (unlocks first module)
router.post('/:id/enroll', verifyToken, async (req, res) => {
  try {
    const courseId = parseInt(req.params.id);
    const userId = req.user.id;

    const course = await prisma.course.findUnique({
      where: { id: courseId },
      include: {
        modules: {
          orderBy: { sequenceOrder: 'asc' },
          take: 1
        }
      }
    });

    if (!course) return res.status(404).json({ error: 'Course not found' });
    if (course.modules.length === 0) return res.status(400).json({ error: 'Course has no modules' });

    const firstModule = course.modules[0];

    // Create progress for first module
    const progress = await prisma.progress.upsert({
      where: { userId_moduleId: { userId, moduleId: firstModule.id } },
      update: {},
      create: {
        userId,
        moduleId: firstModule.id,
        status: 'IN_PROGRESS'
      }
    });

    res.json({ message: 'Enrolled successfully', progress });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/courses
// Public or Learner view of courses
router.get('/', verifyToken, async (req, res) => {
  try {
    const courses = await prisma.course.findMany({
      include: {
        _count: {
          select: { modules: true }
        },
        feedback: {
          select: { rating: true }
        }
      }
    });

    const formattedCourses = courses.map(course => {
      const ratings = course.feedback.filter(f => f.rating);
      const avgRating = ratings.length 
        ? (ratings.reduce((acc, f) => acc + f.rating, 0) / ratings.length).toFixed(1) 
        : 0;
      return { ...course, avgRating };
    });

    res.json(formattedCourses);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/courses
// Create a course (starts blank)
router.post('/', verifyToken, isModeratorOrAdmin, async (req, res) => {
  try {
    const { title, description, timeLimitMins, stage } = req.body;

    const course = await prisma.course.create({
      data: {
        title,
        description,
        timeLimitMins: timeLimitMins ? parseInt(timeLimitMins) : null,
        stage: stage || 'PLANNING',
        createdById: req.user.id
      }
    });

    res.status(201).json({ message: 'Course created successfully', course });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/courses/:id
router.get('/:id', verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    
    const course = await prisma.course.findUnique({
      where: { id: parseInt(id) },
      include: {
        modules: {
          orderBy: { sequenceOrder: 'asc' },
          include: {
            questions: true,
            progress: {
              where: { userId: req.user.id }
            }
          }
        },
        feedback: {
          select: {
            id: true,
            rating: true,
            feedbackText: true,
            createdAt: true,
            user: { select: { name: true } }
          },
          orderBy: { createdAt: 'desc' }
        }
      }
    });

    if (!course) {
      return res.status(404).json({ error: 'Course not found' });
    }

    const ratings = course.feedback.filter(f => f.rating);
    course.avgRating = ratings.length 
      ? (ratings.reduce((acc, f) => acc + f.rating, 0) / ratings.length).toFixed(1) 
      : 0;

    res.json(course);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/courses/:id/feedback
// Submit a rating and review for a course
router.post('/:id/feedback', verifyToken, async (req, res) => {
  try {
    const courseId = parseInt(req.params.id);
    const { rating, feedbackText } = req.body;
    const userId = req.user.id;

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ error: 'Valid rating (1-5) is required' });
    }

    const feedback = await prisma.feedback.create({ data: { userId, courseId, rating, feedbackText: feedbackText || "" } }); res.status(201).json({ message: 'Feedback submitted successfully', feedback });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
