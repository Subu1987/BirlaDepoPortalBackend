const mongo = require("mongoose");

const imageSchema = new mongo.Schema(
  {
    depot_code: String,
    material_code: String,
    cfa_code: String,
    image: {
      base64: String,
      imageFormat: String,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongo.model("StockImages", imageSchema);
