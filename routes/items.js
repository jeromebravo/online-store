const express       = require("express"),
      auth          = require("../middleware/auth"),
      item          = require("../middleware/items"),
      orderLimit    = require("../middleware/orders"),
      method        = require("../middleware/method"),
      Items         = require("../models/items"),
      Orders        = require("../models/orders"),
      Customer      = require("../models/customer"),
      router        = express.Router();

// GLOBAL VARIABLE
let newOrder;

// INDEX ROUTE
router.get("/", async (req, res) => {
    let items;
    const categories = await Items.find({}).distinct("category");

    if(req.query.search === undefined) {
        // GET ALL ITEMS
        items = await Items.find({});
    } else {
        // SEARCH ITEM
        items = await Items.find({keywords: req.query.search.toLowerCase()});
    }
    
    // NO ITEM FOUND
    if(items.length === 0) {
        req.flash("error", "No item found");
        return res.redirect("/items");
    }

    res.render("items/index", {items, categories});
});

// ADD TO CART
router.get("/:id/cart", auth.isLoggedIn, item.invalidQuantity, item.maxOrder, item.notEnoughStocks, async (req, res) => {
    try {
        // FIND CUSTOMER
        const customer = await Customer.findById(req.user._id);
        // FIND ITEM
        const item = await Items.findById(req.params.id);
        // GET QUANTITY AND PRICE
        const quantity = parseInt(req.query.quantity);
        const price = item.price;

        // CHECK IF ITEM IS NOT IN THE CART YET
        const cart = await Customer.find({_id: customer._id, "cart.orders.item": req.params.id});

        if(cart.length === 0) {
            // ADD ITEM TO CART
            customer.cart.orders.push({
                item,
                quantity,
                price
            });
        } else {
            // MAX ORDER QUANTITY
            const max = (item.stocks > 10) ? 10 : item.stocks;
            
            // LOOP THROUGH ORDERS AND FIND THE ITEM
            let index = 0, found = false;
            while(index < customer.cart.orders.length && !found) {
                let order = customer.cart.orders[index];

                // CHECK IF WE FOUND THE ITEM AND ORDER QUANTITY IS NOT YET MAX
                if(order.item.equals(req.params.id) && order.quantity + quantity <= max) {
                    found = true;
                    break;
                }

                index++;
            }

            if(found) {
                // ADD QUANTITY
                customer.cart.orders[index].quantity += quantity;
            } else {
                req.flash("error", `Sorry, up to ${max} orders only`);
                return res.redirect(`/items/${req.params.id}`);
            }
        }

        // CALCULATE SUBTOTAL AND TOTAL THEN SAVE
        const subtotal = method.calculateSubtotal(customer.cart);
        customer.cart.subtotal = subtotal;
        customer.cart.total = subtotal + 100;
        customer.save();

        req.flash("success", "Added to cart");
        res.redirect(`/items/${req.params.id}`);
    } catch {
        req.flash("error", "Something went wrong");
        res.redirect("/items");
    }
});

// SHOW ROUTE
router.get("/:id", item.outOfStock, async (req, res) => {
    try {
        const item = await Items.findById(req.params.id);
        res.render("items/show", {item});
    } catch {
        req.flash("error", "Something went wrong");
        res.redirect("/items");
    }
});

// BUY NOW
// CONFIRM BILLING ADDRESS AND ORDER INFORMATION
router.get("/:id/checkout", auth.isLoggedIn, item.invalidQuantity, item.maxOrder, item.notEnoughStocks, async (req, res) => {
    try {
        const item = await Items.findById(req.params.id);
        const quantity = parseInt(req.query.quantity);
        const price = item.price
        const subtotal = price * quantity;
        const estimated = method.estimatedDelivery();

        newOrder = {
            customer: req.user,
            orders: [
                {
                    item,
                    quantity,
                    price
                }
            ],
            orderDate: method.currentDate(),
            deliveredDate: null,
            estimatedDelivery: estimated,
            subtotal,
            total: subtotal + 100,
        }

        res.render("items/checkout", {customer: req.user, orders: newOrder, estimated});
    } catch {
        req.flash("error", "Something went wrong");
        res.redirect("/items");
    }
});

// PLACE ORDER
// CREATE
router.post("/:id/checkout", auth.isLoggedIn, orderLimit.limit, async (req, res) => {
    try {
        if(newOrder !== undefined) {
            await Orders.create(newOrder);
            method.updateStocks(newOrder);

            newOrder = null;

            req.flash("success", "Success");
            res.redirect("/items");
        } else {
            req.flash("error", "No order");
            res.redirect("/items");
        }
    } catch {
        req.flash("error", "Something went wrong");
        res.redirect("/items");
    }
});

module.exports = router;