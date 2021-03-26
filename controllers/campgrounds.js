const Campground = require('../models/campground');
const mapBoxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
const mapBoxToken = process.env.MAPBOX_TOKEN;
const geoCoder = mapBoxGeocoding({ accessToken: mapBoxToken });
const { cloudinary } = require('../cloudinary/index');


module.exports.index = async (req, res) => {
    const campgrounds = await Campground.find({});
    res.render('campgrounds/index', { campgrounds });
};

module.exports.renderNewForm = (req, res) => {
    res.render('campgrounds/new');
};

module.exports.createNew = async (req, res, next) => {
    const geoData = await geoCoder.forwardGeocode({
        query: req.body.campground.location,
        limit: 1
    }).send();
    const newCampground = new Campground(req.body.campground);
    newCampground.geometry = geoData.body.features[0].geometry;
    newCampground.images = req.files.map(f => ({url: f.path, filename: f.filename}));
    newCampground.author = req.user.id;
    await newCampground.save();
    req.flash('success', 'Successfully made a new Campground!');
    res.redirect(`campgrounds/${newCampground.id}`);
};

module.exports.showCampground = async (req, res) => {
    const id = req.params.id;
    const campground = await Campground.findById(id)
        .populate({path: 'reviews', populate: { path: 'author'}})
        .populate('author');
    if (!campground) {
        req.flash('error', 'Cannot find that campground!');
        return res.redirect('/campgrounds');
    }
    res.render('campgrounds/show', {campground});
};

module.exports.renderEditForm = async (req, res) => {
    const campground = await Campground.findById(req.params.id);
    if (!campground) {
        req.flash('error', 'Cannot find that campground!');
        return res.redirect('/campgrounds');
    }
    res.render('campgrounds/edit', {campground});
};

module.exports.updateCampground = async (req, res) => {
    const id = req.params.id;
    const updatedCampground = await Campground.findByIdAndUpdate(
        id,
        {
            ...req.body.campground
        },
        {runValidators: true, useFindAndModify: false});
    const imgs = req.files.map(f => ({url: f.path, filename: f.filename}));
    updatedCampground.images.push(...imgs);
    await updatedCampground.save();
    if (req.body.deleteImages) {
        for (let image of req.body.deleteImages) {
            await cloudinary.uploader.destroy(image);
        }
        await updatedCampground.updateOne({$pull: { images: {filename: { $in: req.body.deleteImages }}}});
    }
    req.flash('success', 'Successfully updated campground!');
    res.redirect(`/campgrounds/${updatedCampground.id}`);
};

module.exports.deleteCampground = async (req, res) => {
    const id = req.params.id;
    await Campground.findByIdAndDelete(id);
    req.flash('success', 'Deleted campground!');
    res.redirect('/campgrounds');
};