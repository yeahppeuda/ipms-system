const mongoose = require("mongoose");

const ResearchSchema = new mongoose.Schema({
  category:          { type: String, default: "" },
  researchTitle:     { type: String, default: "" },
  referenceId:       { type: String, default: "" },
  department:        { type: String, default: "" },
  authors:           { type: [String], default: [] },
  status:            { type: String, default: "Submitted to IPO" },
  date:              { type: String, default: "" },  // keep as String — frontend sends "YYYY-MM-DD"

  // Formality Defect tracking
  defectNoticeDate:  { type: String, default: "" },  // "YYYY-MM-DD" string
  defectNoticeDate2: { type: String, default: "" },  // "YYYY-MM-DD" string
  defectConfirmed1:  { type: Boolean, default: false },
  defectConfirmed2:  { type: Boolean, default: false },

}, { timestamps: true });

module.exports = mongoose.model("Research", ResearchSchema);