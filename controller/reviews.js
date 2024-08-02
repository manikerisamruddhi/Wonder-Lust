const Listing = require("../models/listing.js");
const Review = require("../models/reviews.js");

module.exports.createReview=async (req, res) => {
    const listing = await Listing.findById(req.params.id);
    if (!listing) {
        req.flash("error", "Listing not found");
        return res.redirect("/listings");
    }

    const { rating, comment } = req.body.review;
    if (rating < 1 || rating > 5) {
        throw new ExpressError(400, "Rating must be between 1 and 5");
    }

    const newReview = new Review({ rating, comment });
    newReview.author=req.user._id;
    await newReview.save();

    listing.reviews.push(newReview);
    await listing.save();

    req.flash("success", "New review saved!!");
    console.log("New review saved");
    res.redirect(`/listings/${listing._id}`);
}

module.exports.deleteReview=async (req, res) => {
    const { id, reviewId } = req.params;
    await Listing.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
    await Review.findByIdAndDelete(reviewId);
    req.flash("success", "Review deleted!!");
    res.redirect(`/listings/${id}`);
}