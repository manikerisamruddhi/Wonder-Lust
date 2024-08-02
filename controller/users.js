const User = require("../models/user.js");
const passport = require("passport"); // Add this line

module.exports.renderSignup=(req, res) => {
    res.render("users/signup");
}

module.exports.signup=async (req, res, next) => {
    try {
        let { username, email, password } = req.body;
        let newUser = new User({ username, email });
        const registerUser = await User.register(newUser, password);
        req.login(registerUser, (err) => {
            if (err) {
                return next(err);
            }
            req.flash("success", "Welcome to WonderLust");
            const redirectUrl = res.locals.redirectUrl || '/listings'; // Use fallback path if no redirect URL is set
            res.redirect(redirectUrl);
        });
    } catch (err) {
        req.flash("error", err.message);
        res.redirect("/signup");
    }
}

module.exports.logout= (req, res, next) => {
    req.logout((err) => {
        if (err) {
            return next(err);
        }
        req.flash("success", "You are logged out!!");
        res.redirect("/listings");
    });
}

module.exports.login= (req, res, next) => {
    passport.authenticate("local", (err, user, info) => {
        if (err) {
            return next(err);
        }
        if (!user) {
            req.flash("error", "Invalid username or password");
            return res.redirect("/login");
        }
        req.logIn(user, (err) => {
            if (err) {
                return next(err);
            }
            req.flash("success", "Welcome to WonderLust!! You are logged in");
            const redirectUrl = res.locals.redirectUrl || '/listings'; // Fallback to a default path if redirectUrl is not set
            return res.redirect(redirectUrl);
        });
    })(req, res, next);
}