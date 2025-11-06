const mongoose = require("mongoose");

// Define the schema with PLANT being unique
const PlantSchema = new mongoose.Schema(
  {
    PLANT: {
      type: String,
      unique: true,
      required: true,
    },
    PLANT_NAME: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

// Create the model
module.exports = mongoose.model("Plant", PlantSchema);
