const mongoose = require("mongoose");

const itemsSchema = new mongoose.Schema({
    brand: String,
    name: String,
    category: String,
    price: Number,
    stocks: Number,
    image: String,
    dateCreated: String,
    addStocks: [
        {
            dateCreated: String,
            quantity: Number
        }
    ],
    keywords: []
});

module.exports = mongoose.model("Item", itemsSchema);