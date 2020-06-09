const express  = require("express"),
      passport = require("passport"),
      User     = require("../models/customer"),
      router   = express.Router();

// HOMEPAGE
router.get("/", (req, res) => {
    res.redirect("/items");
});

// SIGN UP FORM
router.get("/register", (req, res) => {
    res.render("auth/register");
});

// USER SIGN UP
router.post("/register", (req, res) => {
    User.register(new User({username: req.body.username}), req.body.password, (err, user) => {
        if(err) {
            console.log(err);
            req.flash("error", "Error");
            res.redirect("/register");
        } else {
            user.name = req.body.name;
            user.email = req.body.email;
            user.contact = req.body.contact;
            user.address = req.body.address;
            user.save();

            passport.authenticate("local")(req, res, () => {
                req.flash("success", `Welcome to Battery Shop ${user.name}`);
                res.redirect("/");
            });
        }
    });
});

// LOGIN FORM
router.get("/login", (req, res) => {
    res.render("auth/login");
});

// USER LOGIN
router.post("/login", passport.authenticate("local", {
    successRedirect: "/",
    failureRedirect: "/login"
}), (req, res) => {});

// LOGOUT
router.get("/logout", (req, res) => {
    req.logOut();
    req.flash("success", "Logged out");
    res.redirect("/items");
});

module.exports = router;