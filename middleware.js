const Campground = require('./models/campground');
const Review = require('./models/review');
const { campgroundSchema, reviewSchema } = require('./schemas');
const ExpressError = require('./utils/ExpressError');

// JOI Validation Middleware - Campground
module.exports.validateCampground = (req, res, next) => {
    const { error } = campgroundSchema.validate(req.body);
    if (error) {
        const msg = error.details.map(el => el.message).join(',');
        throw new ExpressError(400, msg);
    } else {
        next();
    }
}

// JOI Validation Middleware - Review
module.exports.validateReview = (req, res, next) => {
    const { error } = reviewSchema.validate(req.body);
    if (error) {
        const msg = error.details.map(el => el.message).join(',');
        throw new ExpressError(400, msg);
    } else {
        next();
    }
}

// Authentication Middleware;
module.exports.isLoggedIn = (req, res, next) => {
    if(!req.isAuthenticated()) {
        req.flash('error', 'YOU MUST BE SIGNED IN');
        return res.redirect('/login');
    }
    next();
}

// Authorization Middleware - Campground
module.exports.isAuthor = async (req, res, next) => {
    const { id } = req.params;
    const campground = await Campground.findById(id);
    if(!campground.author.equals(req.user._id)) {
        req.flash('error', 'YOU DO NOT HAVE PERMISSION TO DO THAT!');
        return res.redirect(`/campgrounds/${id}`);
    }
    next();
}

// Authorization Middleware - Review
module.exports.isReviewAuthor = async (req, res, next) => {
    const { id, reviewId } = req.params;
    const review = await Review.findById(reviewId);
    if(!review.author.equals(req.user._id)) {
        req.flash('error', 'YOU DO NOT HAVE PERMISSION TO DO THAT!');
        return res.redirect(`/campgrounds/${id}`);
    }
    next();
}