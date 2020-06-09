const mongoose              = require("mongoose"),
      passportLocalMongoose = require("passport-local-mongoose");

const customerSchema = new mongoose.Schema({
    name: String,
    email: String,
    contact: String,
    address: String,
    username: String,
    password: String,
    cart: {
        orders: [
            {
                item: {type: mongoose.Schema.Types.ObjectId, ref: "Item"},
                quantity: Number,
                price: Number,
            }
        ],
        subtotal: {type: Number, default: 0},
        total: {type: Number, default: 0}
    }
});

customerSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model("Customer", customerSchema);