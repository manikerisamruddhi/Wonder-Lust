const mongoose = require('mongoose');
const Listing = require('../models/listing.js');
const initdata = require('./data.js');

// const url = 'mongodb://127.0.0.1:27017/wonderlust';
const url = "mongodb+srv://manikerisamruddhi:wamiUpM0G6d7GDys@cluster0.khucy7c.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0"


mongoose.connect(url, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => {
        console.log("Connected to DB");
        initDB();
    })
    .catch((err) => {
        console.log(`Error occurred in main function: ${err}`);
    });

const initDB = async () => {
    try {
        await Listing.deleteMany({});
        
        // Corrected this part
        initdata.data = initdata.data.map((obj) => ({
            ...obj,
            owner: '66acfa106909b93f8a7172c7'
        }));
        
        await Listing.insertMany(initdata.data);
        console.log("Data initialized");
    } catch (error) {
        console.log(`Error initializing data: ${error}`);
    }
};
