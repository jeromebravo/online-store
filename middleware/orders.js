const Orders = require("../models/orders");

let order = {};

// CHECK IF CUSTOMER HAS PENDING ORDER
order.limit = async (req, res, next) => {
    try {
        const order = await Orders.findOne({customer: req.user._id, status: {"$ne": "Delivered"}});

        if(order === null) {
            next();
        } else {
            req.flash("error", "Order is limited to 1");
            res.redirect("/items");
        }
    } catch {
        req.flash("error", "Something went wrong");
        res.redirect("/items");
    }
}

module.exports = order;