const mongoose = require("mongoose");

// Define the schema for the array of objects
const PlantObjectSchema = new mongoose.Schema(
  {
    WERKS: {
      type: String,
      required: true,
    },
    NAME1: {
      type: String,
      required: true,
    },
  },
  { _id: false }
);

// Define the main schema
const UserPlantSchema = new mongoose.Schema(
  {
    LV_USER: {
      type: String,
      unique: true,
      required: true,
    },
    IT_FINAL: [PlantObjectSchema],
  },
  { timestamps: true }
);

// Create the model
module.exports = mongoose.model("UserPlant", UserPlantSchema);
