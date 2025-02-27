// Load Express, Wrap Async Function, ExpressError
const express = require('express');
const wrapAsync = require('../utils/wrapAsync');
const Campground = require('../models/campground');
const Review = require('../models/review');
const { validateReview, isLoggedIn, isReviewAuthor } = require('../middleware');
const reviews = require('../controllers/reviews');

// Express Router
const router = express.Router({ mergeParams: true });

// Review Routes
// Post Review
router.post('/', isLoggedIn, validateReview, wrapAsync(reviews.postReview))

// Delete Review
router.delete('/:reviewId', isLoggedIn, isReviewAuthor, wrapAsync(reviews.deleteReview))

module.exports = router;