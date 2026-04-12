const express = require("express");
const router = express.Router();

const controller = require("../controllers/studentController");

// CREATE
router.post("/add", controller.createStudent);

// READ
router.get("/all", controller.getStudents);

// UPDATE
router.put("/update/:rollNo", controller.updateStudent);

// DELETE
router.delete("/delete/:rollNo", controller.deleteStudent);

module.exports = router;