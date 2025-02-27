// Load Mongoose, Review
const mongoose = require('mongoose');
const Review = require('./review');
const Schema = mongoose.Schema;

// Image Schema
const imageSchema = new Schema({
    url: String,
    filename: String
})

// Image Virtual Property 
imageSchema.virtual('thumbnail').get(function() {
    return this.url.replace('/upload', '/upload/w_200');
})

const opts = { toJSON: { virtuals: true }}

// Campground Schema
const campgroundSchema = new Schema({
    title: String, 
    image: [imageSchema],
    geometry: {
        type: {
            type: String,
            enum: ['Point'],
            required: true
        },
        coordinates: {
            type: [Number],
            required: true
        }
    },
    price: Number,
    description: String,
    location: String,
    author: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    reviews: [
        {
            type: Schema.Types.ObjectId,
            ref: 'Review'
        }
    ]
}, opts);

// Campground Virtual Property
campgroundSchema.virtual('properties.popUpMarkup').get(function () {
    return `
    <strong><a href='/campgrounds/${this.id}'>${this.title}</a><strong>
    <p>${this.description.substring(0, 20)}...</p>`
});

// Campground Post Middlewares 
// Executes After Deleting Campground
campgroundSchema.post('findOneAndDelete', async function (doc) {
    if (doc) {
        await Review.deleteMany({
            _id: {
                $in: doc.reviews
            }
        })
    }
});

// Campground Model
const Campground = mongoose.model('Campground', campgroundSchema);

// Export Model
module.exports = Campground;