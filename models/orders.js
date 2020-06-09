const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
    customer: {type: mongoose.Schema.Types.ObjectId, ref: "Customer"},
    orders: [
        {
            item: {type: mongoose.Schema.Types.ObjectId, ref: "Item"},
            quantity: Number,
            price: Number,
        }
    ],
    orderDate: String,
    deliveredDate: String,
    estimatedDelivery: String,
    subtotal: Number,
    shippingFee: {type: Number, default: 100},
    total: Number,
    status: {type: String, default: "Pending"}
});

module.exports = mongoose.model("Order", orderSchema);