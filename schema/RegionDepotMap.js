const mongo = require("mongoose");

const RegionDepotMap = new mongo.Schema({
  REGION: String,
  REGIO_DESC: String,
  DEPOT: String,
  DEPOT_NAME: String,
});

module.exports = mongo.model("RegionDepotMap", RegionDepotMap);
