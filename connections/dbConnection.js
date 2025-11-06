const mongoConnection = require("mongoose");

// MongoDB URL for database connection
const dbHost = process.env.MONGODB_URL;

// const dbHost = `${process.argv[2]}/maya`;
console.log(dbHost);

// Connect to mongodb
mongoConnection
  .connect(dbHost, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("Connected to MongoDB");
  })
  .catch((err) => {
    console.log("Error connecting to MongoDB", err);
  });

module.exports = mongoConnection;
