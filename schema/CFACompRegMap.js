const mongoose = require("mongoose");

// Define the main schema
const CompanyCFAReg = new mongoose.Schema(
  {
    BUKRS: {
      type: String,
      required: true,
    },
    COMP_NAME: {
      type: String,
      required: true,
    },
    REGION: {
      type: String,
      required: true,
    },
    REGIO_DESC: {
      type: String,
      required: true,
    },
    CFA_CODE: {
      type: String,
      unique: true,
      required: true,
    },
  },
  { timestamps: true }
);

// Create the model
module.exports = mongoose.model("Company CFA Reg", CompanyCFAReg);
