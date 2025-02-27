// Load Express, Wrap Async Function, ExpressError
const express = require('express');
const wrapAsync = require('../utils/wrapAsync');
const { validateCampground, isLoggedIn, isAuthor } = require('../middleware');
const campgrounds = require('../controllers/campgrounds');
const multer = require('multer');
const { storage } = require('../cloudinary');
const upload = multer({ storage });

// Express Router
const router = express.Router();

// Campground Routes
// All Campgrounds
router.get('/', wrapAsync(campgrounds.index));

// New Campground
router.get('/new', isLoggedIn, campgrounds.newCampForm);

router.post('/', upload.array('image'), validateCampground ,wrapAsync(campgrounds.newCamp));

// Show Campground
router.get('/:id', wrapAsync(campgrounds.showCamp))

// Update Campground 
router.get('/:id/edit', isLoggedIn, isAuthor, wrapAsync(campgrounds.updateCampForm));

router.put('/:id', upload.array('image'), validateCampground, isAuthor, wrapAsync(campgrounds.updateCamp));

// Delete Campground
router.delete('/:id', isLoggedIn, isAuthor, wrapAsync(campgrounds.deleteCamp));

// Export Router
module.exports = router;