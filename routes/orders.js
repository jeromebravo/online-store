const express = require("express"),
      auth    = require("../middleware/auth"),
      Orders  = require("../models/orders"),
      Items   = require("../models/items"),
      router  = express.Router();

// INDEX ROUTE
router.get("/", auth.isLoggedIn, async (req, res) => {
    const orders = await Orders.findOne({customer: req.user._id, status: {"$ne": "Delivered"}}).populate("orders.item").populate("customer");

    if(orders === null) {
        req.flash("error", "You have no order");
        return res.redirect("/items");
    }

    res.render("orders/index", {customer: orders.customer, orders});
});

// CANCEL ORDER
router.delete("/:id", auth.isLoggedIn, async (req, res) => {
    try {
        const orders = await Orders.findOne({_id: req.params.id, status: "Pending"});

        let i = 0;
        while(i < orders.orders.length) {
            let order = orders.orders[i];

            await Items.findByIdAndUpdate(order.item, {"$inc": {"stocks": order.quantity}});

            i++;
        }

        orders.remove();

        req.flash("success", "Order canceled");
        res.redirect("/items");
    } catch {
        req.flash("error", "Something went wrong");
        res.redirect("/items");
    }
});

// ORDER HISTORY
router.get("/history", auth.isLoggedIn, async (req, res) => {
    const orders = await Orders.find({customer: req.user._id, status: "Delivered"}).populate("customer").sort("-orderDate");
    res.render("orders/history", {orders});
});

// SHOW
router.get("/history/:id", auth.isLoggedIn, async (req, res) => {
    const orders = await Orders.findById(req.params.id).populate("customer").populate("orders.item");
    res.render("orders/index", {customer: orders.customer, orders});
});

module.exports = router;