const mongoose = require("mongoose");

// Define the schema for the array of objects
const PlantItemSchema = new mongoose.Schema(
  {
    MATNR: {
      type: String,
      required: true,
    },
    MAKTX: {
      type: String,
      required: true,
    },
    UOM: {
      type: String,
      required: true,
    },
  },
  { _id: false }
);

// Define the main schema
const PlantSchema = new mongoose.Schema(
  {
    LV_PLANT: {
      type: String,
      unique: true,
      required: true,
    },
    IT_FINAL: [PlantItemSchema],
  },
  { timestamps: true }
);

// Create the model
module.exports = mongoose.model("PlantMaterial", PlantSchema);
