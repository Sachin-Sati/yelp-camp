if(process.env.NODE_ENV !== 'production') {
    require('dotenv').config();
}

const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const methodOverride = require('method-override');
const ejsMate = require('ejs-mate');
const session = require('express-session');
const flash = require('connect-flash');
const passport = require('passport');
const localStrategy = require('passport-local');
const User = require('./models/user');
const mongoSanitize = require('express-mongo-sanitize');
const MongoStore = require('connect-mongo');

// Load Routes
const campgroundRoutes = require('./routes/campground');
const reviewRoutes = require('./routes/review');
const userRoutes = require('./routes/users');

const dbURL = process.env.MONGODB_URL || 'mongodb://127.0.0.1:27017/yelpCampDB';
// Establish Connection with MongoDB 
mongoose.connect(dbURL)
    .then(() => {
        console.log('CONNECTED SUCCESSFULLY TO YELP DB!');
    })
    .catch(err => {
        console.log('FAILED TO CONNECT TO YELP DB!');
        console.log(err);
    })

// Initialize Express App
const app = express();

// Set Express to use EJS
app.set('view engine', 'ejs');

// Set Absolute Path for views
app.set('views', path.join(__dirname, 'views'));

// Set Express to Use URL Encoded Form Data
app.use(express.urlencoded({extended: true}));

// Set Express to use Method Override
app.use(methodOverride('_method'));

// Set Express to use EJS Engine
app.engine('ejs', ejsMate);

// Set Express to use Static Directory
app.use(express.static(path.join(__dirname, 'public')));

// Set Express Mongo Sanitize
app.use(mongoSanitize({
    replaceWith: '_'
}))

const secret = process.env.SECRET || 'secret-key';
// Set Express to use Session
app.use(session({
    name: 'session',
    secret: secret,
    store: MongoStore.create({
        mongoUrl: dbURL,
        touchAfter: 24 * 60 * 60
    }),
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true,
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
        maxAge: 1000 * 60 * 60 * 24 * 7
    }
}))

// Set Express to use Flash
app.use(flash());

// Set Express to use passport
app.use(passport.initialize());
app.use(passport.session());
passport.use(new localStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// Flash Middleware
app.use((req, res, next) => {
    res.locals.currentUser = req.user;
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    next();
})

// Test Passport Authentication
app.get('/fakeUser', async (req, res) => {
    const user = new User({email: 'sati@example.com', username: 'sachin'});
    const newUser = await User.register(user, '123');
    res.send(newUser);
})

const port = process.env.PORT || 3000;
// Listen for Incoming Requests
app.listen(port, () => {
    console.log(`LISTENING ON PORT ${port}!`);
})

// Home Route
app.get('/', (req, res) => {
    res.render('home');
})

// Campground Routes
app.use('/campgrounds', campgroundRoutes);

// Review Routes
app.use('/campgrounds/:id/reviews', reviewRoutes);

// User Routes
app.use('/', userRoutes);

// Catch All Route
app.all('*', (req, res, next) => {
    next(new ExpressError(404, 'PAGE NOT FOUND!'));
})

// Error Handler
app.use((err, req, res, next) => {
    const status = err.status || 500;
    const message = err.message || 'SOMETHING WENT WRONG!';
    res.status(status).render('error', {err});
})