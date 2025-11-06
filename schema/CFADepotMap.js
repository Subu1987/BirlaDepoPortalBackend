const mongoose = require("mongoose");

// Define the schema for EX_DEPO
const ExDepoSchema = new mongoose.Schema(
  {
    DEPOT: {
      type: String,
      required: true,
    },
    DEPOT_NAME: {
      type: String,
      required: true,
    },
  },
  { _id: false }
);

// Define the main schema
const CFAUserSchema = new mongoose.Schema(
  {
    EX_CFA_NAME: {
      type: String,
      required: true,
    },
    EX_DEPO: [ExDepoSchema],
    IM_CFA_CODE: {
      type: String,
      unique: true,
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("CFAUser", CFAUserSchema);
