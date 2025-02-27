const Campground = require('../models/campground');
const { cloudinary } = require('../cloudinary');
const maptilerClient = require("@maptiler/client");
maptilerClient.config.apiKey = process.env.MAPTILER_API_KEY;

module.exports.index = async (req, res) => {
    const campgrounds = await Campground.find({});
    res.render('campgrounds/index', {campgrounds});
}

module.exports.newCampForm = (req, res) => {
    res.render('campgrounds/new');
}

module.exports.newCamp = async(req, res, next) => {
    const geoData = await maptilerClient.geocoding.forward(req.body.campground.location, { limit: 1 });
    const newCamp = new Campground(req.body.campground);
    newCamp.geometry = geoData.features[0].geometry;
    newCamp.image = req.files.map(f => ({url: f.path, filename: f.filename}))
    newCamp.author = req.user._id;
    await newCamp.save();
    console.log(newCamp);
    req.flash('success', 'Successfully Created New Campground!');
    res.redirect(`/campgrounds/${newCamp.id}`); 
}

module.exports.showCamp = async (req, res) => {
    const { id } = req.params;
    const campground = await Campground.findById(id)
        .populate({
            path: 'reviews',
            populate: {
                path: 'author'
            }
        })
        .populate('author');
    if (!campground) {
        req.flash('error', 'Campground Not Found :(');
        return res.redirect('/campgrounds');
    }
    res.render('campgrounds/details', {campground});
}

module.exports.updateCampForm = async (req, res) => {
    const { id } = req.params;
    const campground = await Campground.findById(id);
    if (!campground) {
        req.flash('error', 'Campground Not Found :(');
        return res.redirect('/campgrounds');
    }
    res.render('campgrounds/edit', {campground});
}

module.exports.updateCamp = async(req, res) => {
    const { id } = req.params;
    const campground = await Campground.findByIdAndUpdate(id, {...req.body.campground});
    const geoData = await maptilerClient.geocoding.forward(req.body.campground.location, { limit: 1 });
    campground.geometry = geoData.features[0].geometry;
    const imgs = req.files.map(f => ({url: f.path, filename: f.filename}))
    campground.image.push(...imgs);
    await campground.save();
    if (req.body.deleteImages) {
        for(let filename of req.body.deleteImages) {
            await cloudinary.uploader.destroy(filename);
        }
        await campground.updateOne({$pull: {image: {filename: {$in: req.body.deleteImages}}}});
    }
    req.flash('success', 'Successfully Updated Campground!');
    res.redirect(`/campgrounds/${campground.id}`);
}

module.exports.deleteCamp = async (req, res, next) => {
    const { id } = req.params;
    await Campground.findByIdAndDelete(id);
    req.flash('success', 'Campground Deleted!');
    res.redirect('/campgrounds');
}