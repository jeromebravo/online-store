const express       = require("express"),
      auth          = require("../middleware/auth"),
      orderLimit    = require("../middleware/orders"),
      method        = require("../middleware/method"),
      Items         = require("../models/items"),
      Orders        = require("../models/orders"),
      Customer      = require("../models/customer"),
      router        = express.Router();

// INDEX
router.get("/", auth.isLoggedIn, async (req, res) => {
    const customer = await Customer.findById(req.user._id).populate("cart.orders.item");
    res.render("cart/index", {customer});
});

// DELETE ITEM IN CART
router.delete("/:id", auth.isLoggedIn, async (req, res) => {
    try {
        await Customer.updateOne({_id: req.user._id}, {"$pull": {"cart.orders": {"_id": req.params.id}}}, {safe: true, multi: true});
        const customer = await Customer.findById(req.user._id);
        const subtotal = method.calculateSubtotal(customer.cart);

        customer.cart.subtotal = subtotal;
        customer.cart.total = subtotal + 100;
        customer.save();

        res.redirect("/cart");
    } catch {
        req.flash("error", "Something went wrong");
        res.redirect("/items");
    }
});

// CHECKOUT CART
// CONFIRM BILLING ADDRESS AND ORDER INFORMATION
router.get("/checkout", auth.isLoggedIn, async (req, res) => {
    const customer = await Customer.findById(req.user._id).populate("cart.orders.item");

    // CHECK IF NO ITEM IN CART
    if(customer.cart.orders.length === 0) {
        req.flash("error", "No item in cart");
        return res.redirect("/cart");
    }

    res.render("items/checkout", {customer, orders: customer.cart, estimated: method.estimatedDelivery()});
});

// PLACE ORDER
// ALL ITEMS IN CART
router.post("/checkout", auth.isLoggedIn, orderLimit.limit, async (req, res) => {
    const customer = await Customer.findById(req.user._id);

    // CHECK IF NO ITEM IN CART
    if(customer.cart.orders.length === 0) {
        req.flash("error", "No item in cart");
        return res.redirect("/items/cart");
    }

    const orders = {
        customer,
        orders: customer.cart.orders,
        orderDate: method.currentDate(),
        deliveredDate: null,
        estimatedDelivery: method.estimatedDelivery(),
        subtotal: customer.cart.subtotal,
        total: customer.cart.total
    };

    // INSERT ORDERS
    await Orders.create(orders);
    method.updateStocks(orders);

    // RESET CUSTOMER'S CART
    customer.cart.orders = [];
    customer.cart.subtotal = 0;
    customer.cart.total = 0;
    customer.save();

    req.flash("success", "Success");
    res.redirect("/items");
});

module.exports = router;