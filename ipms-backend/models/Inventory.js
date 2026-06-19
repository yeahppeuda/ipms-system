const mongoose = require('mongoose');

const ResearcherSchema = new mongoose.Schema({
  name:    { type: String, required: true, trim: true },
  contact: { type: String, trim: true, default: '' },
  email:   { 
    type: String, 
    trim: true, 
    lowercase: true,
    default: '',
    match: [/^\s*($|.+@.+\..+)\s*$/, 'Mangyaring magbigay ng valid na email address.']
  }
}, { _id: false });

const IPRecordSchema = new mongoose.Schema({
  type:      { type: String, enum: ['Patent/Invention','Utility Model','Industrial Design','Trademark','Copyright','Trade Secret',''], default: '' },
  regNum:    { type: String, trim: true, default: '' },
  regStatus: { type: String, enum: ['Registered','Ongoing Registration','Expired Protection',''], default: '' }
}, { _id: false });

const InventoryOfTechnologySchema = new mongoose.Schema({
  name:           { type: String, required: true, trim: true },
  sector:         { type: String, required: true, enum: [
    'Agriculture and Horticulture','Biotechnology','Chemicals',
    'Electrical and Electronic Device/Service','Food and Beverage Products',
    'Food Processing','Furniture and GHD','Clean Technology and Energy',
    'ICT and Software','Medical Devices and Digital Healthcare',
    'Metals and Engineering','Pharmaceuticals'
  ]},
  mode:           { type: String, required: true, enum: ['Commercialization','Extension','Pre-Commercialization','Public Good'] },
  description:    { type: String, required: true, trim: true },
  deployStatus:   { type: String, enum: ['Partially Deployed – Limited Use','Pilot Deployment/Testing Stage',''], default: '' },
  currentDev:     { type: String, trim: true, default: '' },
  googleDriveLink:{ type: String, trim: true, default: '' },

  // Adopters (Synced using middleware below)
  adopters:       [{ type: String, trim: true }],
  adopterSpecify: { type: String, trim: true, default: '' },

  funding:        { type: String, enum: ['SUC Funded','DOST-PCIEERD','DOST-PCAARRD','DOST-PCHRD','DOST Central','DOST Regional Office','Other GFA',''], default: '' },
  fundingSpecify: { type: String, trim: true, default: '' },

  researchers:    { type: [ResearcherSchema], default: [] },
  trl:            { type: String, enum: ['TRL 1','TRL 2','TRL 3','TRL 4','TRL 5','TRL 6','TRL 7','TRL 8','TRL 9',''], default: '' },
  irl:            { type: String, enum: ['IRL 1','IRL 2','IRL 3','IRL 4','IRL 5','IRL 6','IRL 7','IRL 8','IRL 9',''], default: '' },
  ipRecords:      { type: [IPRecordSchema], default: [] },

  evalReport:     { type: String, enum: ['Available – Drafted by the SUC','Available – Drafted by IP Firm','Not Yet Available',''], default: '' },
  ftoReport:      { type: String, enum: ['Available – Drafted by the SUC','Available – Drafted by IP Firm','Not Yet Available',''], default: '' },
  commPlan:       { type: String, enum: ['Available – Drafted by the SUC','Available – Drafted by IP Firm','Not Yet Available',''], default: '' },

  createdBy:      { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  updatedBy:      { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

// Text index for search
InventoryOfTechnologySchema.index({
  name: 'text', description: 'text', currentDev: 'text'
});

// Middleware: Auto-convert comma-separated string to Array before saving
function parseAdopters(next) {
  const doc = this._update || this;
  if (doc.adopterSpecify !== undefined) {
    if (doc.adopterSpecify.trim() === '') {
      doc.adopters = [];
    } else {
      doc.adopters = doc.adopterSpecify.split(',').map(s => s.trim()).filter(Boolean);
    }
  }
  next();
}
InventoryOfTechnologySchema.pre('save', parseAdopters);
InventoryOfTechnologySchema.pre('findOneAndUpdate', parseAdopters);

// Note: Exporting as 'Inventory' since your routes file imports it as requiring('../models/Inventory')
module.exports = mongoose.model('Inventory', InventoryOfTechnologySchema);