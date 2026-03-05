const Career = require("../models/Career");


// CREATE
exports.createCareer = async (req, res) => {
  try {
    const career = new Career(req.body);
    await career.save();

    res.status(201).json({
      success: true,
      message: "Career created successfully",
      data: career,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


// GET ALL (PUBLIC)
exports.getCareers = async (req, res) => {
  try {
    const careers = await Career.find({ status: "open" }).sort({ createdAt: -1 });

    res.json({
      success: true,
      count: careers.length,
      data: careers,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


// GET ALL ADMIN
exports.getAllAdminCareers = async (req, res) => {
  try {
    const careers = await Career.find().sort({ createdAt: -1 });

    res.json({
      success: true,
      data: careers,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


// GET BY ID
exports.getCareerById = async (req, res) => {
  try {
    const career = await Career.findById(req.params.id);

    if (!career) {
      return res.status(404).json({ error: "Career not found" });
    }

    res.json({
      success: true,
      data: career,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


// UPDATE
exports.updateCareer = async (req, res) => {
  try {
    const career = await Career.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    res.json({
      success: true,
      message: "Career updated",
      data: career,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


// DELETE
exports.deleteCareer = async (req, res) => {
  try {
    await Career.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: "Career deleted",
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};