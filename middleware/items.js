const Items = require("../models/items");

let item = {};

// CHECK IF ITEM IS OUT OF STOCK
item.outOfStock = async (req, res, next) => {
    try {
        const item = await Items.findById(req.params.id);

        if(item.stocks <= 0) {
            req.flash("error", "Out of stock");
            res.redirect("/items");
        } else {
            next();
        }
    } catch {
        req.flash("error", "Something went wrong");
        res.redirect("/items");
    }
}

// CHECK IF QUANTITY IS GREATER THAN STOCK
item.notEnoughStocks = async (req, res, next) => {
    try {
        const item = await Items.findById(req.params.id);
        const quantity = parseInt(req.query.quantity);

        if(item.stocks >= quantity) {
            next();
        } else {
            req.flash("error", "Not enough stocks");
            res.redirect(`/items/${req.params.id}`);
        }
    } catch {
        req.flash("error", "Something went wrong");
        res.redirect("/items");
    }
}

// CHECK IF QUANTITY IS ZERO OR NEGATIVE NUMBER
item.invalidQuantity = async (req, res, next) => {
    const quantity = parseInt(req.query.quantity);

    if(quantity > 0) {
        next();
    } else {
        req.flash("error", "Invalid quantity");
        res.redirect(`/items/${req.params.id}`);
    }
}

// CHECK IF QUANTITY IS GREATER THAN MAX ORDER
item.maxOrder = async (req, res, next) => {
    try {
        const item = await Items.findById(req.params.id);
        const quantity = parseInt(req.query.quantity);

        if(item.stocks > 10 && quantity > 10) {
            req.flash("error", "Sorry, up to 10 orders only");
            return res.redirect(`/items/${req.params.id}`);
        } else {
            next();
        }

    } catch {
        req.flash("error", "Something went wrong");
        res.redirect("/items");
    }
}

module.exports = item;