const mongoose = require("mongoose");

const ValuationTypeSchema = new mongoose.Schema(
  {
    DEPT_CODE: {
      type: String,
      required: true,
      trim: true,
    },
    VALUATION_TYPE: {
      type: String,
      required: true,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model(
  "ValuationType",
  ValuationTypeSchema,
  "valuation_type_mst"
);
