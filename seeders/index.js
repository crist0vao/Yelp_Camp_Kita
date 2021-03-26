const mongoose = require('mongoose');
const Campground = require('../models/campground');
const cities = require('./cities');
const {descriptors, places} = require('./seedHelpers');

mongoose.connect('mongodb://localhost:27017/yelp-camp', {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true
});

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
    console.log("Database connected");
});

const sample = array => array[Math.floor(Math.random() * array.length)];

const seedDB = async () => {
    await Campground.deleteMany({});
    for (let i = 0; i < 300; i++) {
        const random1000 = Math.floor(Math.random() * 1000);
        const price = Math.floor(Math.random() * 20) + 10;
        const newCamp = new Campground({
            author: '60563f34295b99460c3f332c',
            geometry : {
                "type" : "Point",
                "coordinates" : [
                    `${ cities[random1000].longitude }`,
                    `${ cities[random1000].latitude }`
                ] },
            location: `${cities[random1000].city}, ${cities[random1000].state}`,
            title: `${sample(descriptors)} ${sample(places)}`,
            images: [
                {
                    url: 'https://res.cloudinary.com/dv4qpabsg/image/upload/v1616512601/YelpCamp/ykttj4jvmngxpbdz8lp1.jpg',
                    filename: 'YelpCamp/ykttj4jvmngxpbdz8lp1'
                }
            ],
            description: 'Wild camping',
            price: price
        });
        await newCamp.save();
    }
};

seedDB().then(value => mongoose.connection.close());