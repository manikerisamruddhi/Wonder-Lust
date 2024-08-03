if (process.env.NODE_ENV !== "production") {
    require('dotenv').config();
}

const express = require("express");
const app = express();
const path = require("path");
const mongoose = require("mongoose");
//const url = 'mongodb://127.0.0.1:27017/wonderlust';


const url = "mongodb+srv://manikerisamruddhi:wamiUpM0G6d7GDys@cluster0.khucy7c.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0"

const Listing = require("./models/listing.js");
const methodOverride = require('method-override');
const ejsMate = require("ejs-mate");
const wrapAsync = require("./utils/wrapAsync.js");
const ExpressError = require("./utils/ExpressError.js");
const { listingSchema, reviewSchema } = require('./Schema.js');
const Review = require("./models/reviews.js");
const session = require("express-session");
const flash = require("connect-flash");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./models/user.js");
const { isLoggedIn, saveRedirectUrl, isOwner, validateListing, validateReview, isReviewAuthor } = require("./middleware.js");
const listingController = require("./controller/listing.js");
const reviewController = require("./controller/reviews.js");
const userController = require("./controller/users.js");

const multer = require('multer');
const { storage } = require("./cloudConfig.js");
const upload = multer({ storage });

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));
app.use(express.static(path.join(__dirname, "/public")));
app.engine("ejs", ejsMate);

const sessionOptions = {
    secret: 'keyboardCat',
    resave: false,
    saveUninitialized: true,
    cookie: {
        expires: Date.now() + 7 * 24 * 60 * 60 * 1000,
        maxAge: 7 * 24 * 60 * 60 * 1000,
        httpOnly: true
    }
};

app.use(session(sessionOptions));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req, res, next) => {
    res.locals.success = req.flash("success");
    res.locals.error = req.flash("error");
    res.locals.currUser = req.user;
    next();
});

async function main() {
    await mongoose.connect(url, {
        useNewUrlParser: true,
        useUnifiedTopology: true
    });
    console.log("Connected to DB");
}

main().catch((err) => {
    console.log(`Error occurred in main function: ${err}`);
});

app.get("/signup", userController.renderSignup);
app.post("/signup", userController.signup);
app.get("/logout", userController.logout);
app.get("/login", (req, res) => {
    res.render("users/login");
});
app.post("/login", saveRedirectUrl, userController.login);
app.get("/", (req, res) => {
    res.redirect("/listings");
});

app.get("/listings", wrapAsync(listingController.index));
app.get("/listings/new", isLoggedIn, listingController.showNewForm);
app.post("/listings", isLoggedIn, isOwner, upload.single('image'), wrapAsync(listingController.saveNewList));
app.get("/listings/:id/edit", isLoggedIn, isOwner, wrapAsync(listingController.showEditForm));
app.put("/listings/:id", isLoggedIn, isOwner, upload.single('listings[image]'), wrapAsync(listingController.saveEditForm));
app.get("/listings/:id", wrapAsync(async (req, res) => {
    const { id } = req.params;
    const listing = await Listing.findById(id)
        .populate({ path: 'reviews', populate: { path: "author" } })
        .populate("owner");
    if (!listing) {
        req.flash("error", "Listing not found");
        return res.redirect("/listings");
    }
    res.render("listings/show", { listing });
}));

app.get('/search', async (req, res) => {
    const { query } = req.query;
    if (!query) {
        req.flash('error', 'Please enter a search term');
        return res.redirect('/listings');
    }
    req.flash('success',"List")

    const listings = await Listing.find({ title: { $regex: query, $options: 'i' } });
    res.render('listings/searchResults', { listings, query });
});


app.delete("/listings/:id", isLoggedIn, isOwner, wrapAsync(listingController.deleteListing));
app.post("/listings/:id/review", isLoggedIn, validateReview, wrapAsync(reviewController.createReview));
app.delete("/listings/:id/reviews/:reviewId", isLoggedIn, isReviewAuthor, wrapAsync(reviewController.deleteReview));

app.use((err, req, res, next) => {
    const { statusCode = 500, message = "Something went wrong" } = err;
    if (!err.message) err.message = 'Something went wrong';
    res.status(statusCode).send(message);
});

app.listen(3001, () => {
    console.log(`Listening on port 3001`);
});
