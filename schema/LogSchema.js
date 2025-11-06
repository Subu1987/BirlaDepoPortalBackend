const mongoose = require("mongoose");
const moment = require("moment");

const logSchema = new mongoose.Schema({
  date: {
    type: String,
    required: true,
    default: () => moment().format("YYYY-MM-DD"),
  },
  portal: {
    type: String,
    required: true,
  },
  page: {
    type: String,
    required: true,
  },
  calls_count: {
    type: Number,
    required: true,
    default: 1,
  },
  end_point_name: {
    type: String,
    required: true,
  },
  external_or_rfc: {
    type: String,
    default: "",
  },
});

module.exports = mongoose.model("Log", logSchema);
