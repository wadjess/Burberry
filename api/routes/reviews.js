const express = require('express');
const checkAuth = require('../middlewares/auth');
const ReviewsController = require('../controllers/review');

const router = express.Router();

router.get('/', checkAuth, ReviewsController.get_all_reviews);
router.get('/:reviewId', checkAuth, ReviewsController.get_review_by_id);
router.post('/', checkAuth, ReviewsController.post_review);
router.patch('/:reviewId', checkAuth, ReviewsController.patch_review);
router.delete('/:reviewId', checkAuth, ReviewsController.delete_review);

module.exports = router;