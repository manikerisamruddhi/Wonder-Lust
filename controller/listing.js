const Listing = require("../models/listing.js");

// Display all listings
module.exports.index = async (req, res) => {
    const allListings = await Listing.find({});
    res.render("listings/index", { allListings });
};

// Render form to create a new listing
module.exports.showNewForm = (req, res) => {
    res.render("listings/new");
};

// Save new listing
module.exports.saveNewList = async (req, res, next) => {
    console.log('Form Data:', req.body);
    try {
        const newListing = new Listing(req.body.listings);
        newListing.owner = req.user._id;

        // Handle optional image upload
        if (req.file) {
            newListing.image = {
                url: req.file.path,
                filename: req.file.filename
            };
        }

        await newListing.save();
        req.flash("success", "New listing created!!");
        res.redirect("/listings");
    } catch (err) {
        req.flash("error", err.message);
        res.redirect("/listings/new");
    }
};

// Render form to edit a listing
module.exports.showEditForm = async (req, res) => {
    const { id } = req.params;
    const listing = await Listing.findById(id);
    let imageUrl=listing.image.url;
    console.log("listin",listing);
    if (!listing) {
        req.flash("error", "Listing not found");
        return res.redirect("/listings");
    }
    res.render("listings/edit", { listing,imageUrl });
};

// Save edited listing
module.exports.saveEditForm = async (req, res) => {
    console.log("this is lsiting : ", req.body)
    const { id } = req.params;
    console.log('Form Data:', req.body);

    if (!req.body.listings) {
        req.flash("error", "Invalid form data");
        return res.redirect(`/listings/${id}/edit`);
    }

    const updatedData = { ...req.body.listings };
   console.log("updated data",updatedData);
    // Handle optional image upload
    if (req.file) {
        updatedData.image = {
            url: req.file.path,
            filename: req.file.filename
        };
    }


    const updatedListing = await Listing.findByIdAndUpdate(id, updatedData, { new: true });

    if (!updatedListing) {
        req.flash("error", "Requested listing not found");
        return res.redirect("/listings");
    }

    req.flash("success", "Listing Updated!!");
    res.redirect(`/listings/${id}`);
};

// Delete a listing
module.exports.deleteListing = async (req, res) => {
    const { id } = req.params;
    console.log(`Deleting listing with ID: ${id}`);
    const deletedList = await Listing.findByIdAndDelete(id);
    if (!deletedList) {
        req.flash("error", "Listing not found");
        return res.redirect("/listings");
    }
    req.flash("success", "Listing Deleted!!");
    console.log(`Deleted listing: ${deletedList}`);
    res.redirect("/listings");
};
