const mongoose = require("mongoose");

const studentSchema = new mongoose.Schema({
  firstName: String,
  lastName: String,
  rollNo: String,
  password: String,
  contact: String
});

module.exports = mongoose.model("Student", studentSchema);