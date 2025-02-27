// Load Mongoose, Model, cities, descriptors & places
const mongoose = require('mongoose');
const axios = require('axios');
const Campground = require('../models/campground');
const cities = require('./cities');
const { descriptors, places } = require('./seedHelpers');

// Establish Connection with MongoDB 
mongoose.connect('mongodb://127.0.0.1:27017/yelpCampDB')
    .then(() => {
        console.log('CONNECTED SUCCESSFULLY TO YELP DB!');
    })
    .catch(err => {
        console.log('FAILED TO CONNECT TO YELP DB!');
        console.log(err);
    })

// Function to Get Randome Places and Descriptors
const sample = array => array[Math.floor(Math.random() * array.length)]

// Function to get a random camping image from Unsplash
const getRandomCampImage = async () => {
    try {
        const response = await axios.get('https://api.unsplash.com/photos/random', {
            params: {
                query: 'camping',
                client_id: '_mMBAZzMjs6bvGDrBwOS2CfUYt6bz16p1_5BeslTHUo' // Replace with your Unsplash API key
            }
        });
        return response.data.urls.regular; 
    } catch (error) {
        console.error('Error fetching image from Unsplash:', error);
        return 'https://via.placeholder.com/400'; // Fallback image
    }
};

//  Seed the database: Remove Existing Camps & Add Random Camps
const seedDB = async () => {
    await Campground.deleteMany({});
    for (let i = 0; i < 50; i++) {
        const random1000 = Math.floor(Math.random() * 1000);
        const price = Math.floor(Math.random() * 20) + 10;
        const imageUrl = await getRandomCampImage(); // Get a random camping image
        const camp = new Campground({
            author: '67bc485cf0f1c3188d7c4ecc',
            location: `${cities[random1000].city}, ${cities[random1000].state}`,
            title: `${sample(descriptors)} ${sample(places)}`,
            description: 'Lorem ipsum dolor sit amet consectetur adipisicing elit. Molestiae magni natus iure? Repudiandae error consequatur aliquam nobis nesciunt odio perferendis deserunt provident minus laudantium! Hic doloremque accusantium alias doloribus earum.',
            price,
            geometry: {
                type: 'Point',
                coordinates: [
                    cities[random1000].longitude,
                    cities[random1000].latitude,
                ]
            },
            image: [
                {
                  url: 'https://res.cloudinary.com/dgyhlle0f/image/upload/v1740556147/YelpCamp/v193h76gwwr84i6jpxt7.jpg',
                  file: 'YelpCamp/v193h76gwwr84i6jpxt7'
                }
              ]
        })
        try {
            await camp.save();
            console.log(`Saved: ${camp.title}`);
        } catch (e) {
            console.error('Error saving camp:', e);
        }
    }
}

// Call seedDB() & Close Connection
seedDB()
    .then(() => {
        mongoose.connection.close();
    })