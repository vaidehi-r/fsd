const Student = require("../models/Student");
exports.createStudent = async (req, res) => {
  try {
    const data = await Student.create(req.body);
    res.json(data);
  } catch (error) {
    res.status(500).json(error);
  }
};
exports.getStudents = async (req, res) => {
  try {
    const data = await Student.find();
    res.json(data);
  } catch (error) {
    res.status(500).json(error);
  }
};
exports.updateStudent = async (req, res) => {
  try {
    const data = await Student.findOneAndUpdate(
      { rollNo: req.params.rollNo },
      req.body,
      { new: true }
    );
    res.json(data);
  } catch (error) {
    res.status(500).json(error);
  }
};
exports.deleteStudent = async (req, res) => {
  try {
    await Student.findOneAndDelete({ rollNo: req.params.rollNo });
    res.json({ message: "Student Deleted Successfully" });
  } catch (error) {
    res.status(500).json(error);
  }
};