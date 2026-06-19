const mongoose = require("mongoose");

const ResearchSchema = new mongoose.Schema({
  category:          { type: String, default: "" },
  researchTitle:     { type: String, default: "" },
  referenceId:       { type: String, default: "" },
  department:        { type: String, default: "" },
  college:           { type: String, default: "" }, // Idinagdag para sa view requirements ng modal mo
  authors:           { type: [String], default: [] },
  status:            { type: String, default: "Submitted to IPOPHL" },
  date:              { type: String, default: "" },  
  googleDriveLink:   { type: String, trim: true, default: "" },  
  
  // Archive Retention System Fields
  archived:          { type: Boolean, default: false },
  archiveDate:       { type: String, default: "" }, // "YYYY-MM-DD"

  // Formality Defect tracking (for patent)
  defectNoticeDate:  { type: String, default: "" },  
  defectNoticeDate2: { type: String, default: "" },  
  defectNoticeDate3: { type: String, default: "" },  
  defectNoticeDate4: { type: String, default: "" },  
  defectNoticeDate5: { type: String, default: "" },  
  defectConfirmed:   { type: Boolean, default: false },
  defectConfirmed2:  { type: Boolean, default: false },
  defectConfirmed3:  { type: Boolean, default: false },
  defectConfirmed4:  { type: Boolean, default: false },
  defectConfirmed5:  { type: Boolean, default: false },

}, { timestamps: true });

module.exports = mongoose.model("Research", ResearchSchema);