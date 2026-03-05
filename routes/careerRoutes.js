const express = require("express");
const router = express.Router();

const auth = require("../middleware/auth");

const {
  createCareer,
  getCareers,
  getCareerById,
  updateCareer,
  deleteCareer,
  getAllAdminCareers,
} = require("../controllers/careerController");


// PUBLIC
router.get("/", getCareers);
router.get("/:id", getCareerById);


// ADMIN
router.get("/admin/all", auth, getAllAdminCareers);
router.post("/", auth, createCareer);
router.put("/:id", auth, updateCareer);
router.delete("/:id", auth, deleteCareer);

module.exports = router;