const mongoose = require("mongoose");
const initData = require("./data.js");
const Listing = require("../models/listing.js"); // .. since we move from init.js to init and again from init to Major_Project

main()
    .then(() => {
        console.log("connected to DB");
    })
    .catch((err) => {
        console.log(err);
    });

async function main() {
    await mongoose.connect("mongodb://127.0.0.1:27017/wanderlust");
};

const initDB = async () => {
    await Listing.deleteMany({});
    initData.data = initData.data.map((el) => ({...el, owner: '65b5ce48150374534ac47f1c'})); // initialising all listings with an owner
    await Listing.insertMany(initData.data);
    console.log("data initialized");
}

initDB();