require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const mySqlConnection = require("./connections/connection");
var morgan = require("morgan");
const loginRoute = require("./routes/login");
const rfcRoutes = require("./rfc-routes/details");
const deliveryRfcRoutes = require("./rfc-routes/delivery");
const invoiceRfcRoutes = require("./rfc-routes/invoice");
const goodReceiptRoutes = require("./rfc-routes/goodReceipt");
const ReportRoutes = require("./rfc-routes/report");
const physicalInventoryRoutes = require("./rfc-routes/physicalInventory");
const rfcReducer = require("./rfc-routes/rfc-reducer");
const So = require("./rfc-routes/so");
var path = require("path");

console.log("connected");
console.log(process.env.MYSQL_HOST);

const debug = require("debug")("node-angular");
const http = require("http");

const mongo = require("mongoose");
mongoConnection = require("./connections/dbConnection");

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

const ImageModel = mongo.model("StockImages", imageSchema);

var app = express();

app.use(bodyParser.json({ limit: "50mb" }));
app.use(bodyParser.urlencoded({ limit: "50mb", extended: true }));
app.use(morgan("dev"));
app.use(
  express.static(path.join(__dirname, "public"), {
    setHeaders: function (res, path, stat) {
      res.set("x-timestamp", Date.now());
    },
  })
);

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization"
  );
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PATCH, PUT, DELETE, OPTIONS"
  );
  next();
});

app.use("/", physicalInventoryRoutes);
app.use("/", deliveryRfcRoutes);
app.use("/", invoiceRfcRoutes);
app.use("/", goodReceiptRoutes);
app.use("/", ReportRoutes);
app.use("/", So);
app.use("/rfc", rfcRoutes);
app.use("/rfc-reducer", rfcReducer);
app.use("/login", loginRoute);

// image upload post
app.post("/upload", (req, res) => {
  const image = req.body.image;
  const imageFormat = req.body.imageFormat;
  const material_code = req.body.material_code;
  const cfa_code = req.body.cfa_code;
  const depot_code = req.body.depot_code;
  const newImage = new ImageModel({
    image: {
      base64: image,
      imageFormat: imageFormat,
    },
    material_code: material_code,
    cfa_code: cfa_code,
    depot_code: depot_code,
  });
  newImage.save((err, result) => {
    if (err) {
      console.log(err);
      res.status(500).send("Error uploading image");
    } else {
      // send back the image id
      res.status(200).send({
        id: result._id,
        msg: "Image uploaded successfully",
      });
    }
  });
});

// get the image by id
app.get("/image/:id", (req, res) => {
  const id = req.params.id;
  ImageModel.findById(id, (err, result) => {
    if (err) {
      console.log(err);
      res.status(500).send("Error getting image");
    } else {
      res.status(200).send({
        image: result.image.base64,
        imageFormat: result.image.imageFormat,
      });
    }
  });
});

app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname + "/public/birla.html"));
});

const normalizePort = (val) => {
  var port = parseInt(val, 10);

  if (isNaN(port)) {
    // named pipe
    return val;
  }

  if (port >= 0) {
    // port number
    return port;
  }

  return false;
};

const onError = (error) => {
  if (error.syscall !== "listen") {
    throw error;
  }
  const bind = typeof addr === "string" ? "pipe " + addr : "port " + port;
  switch (error.code) {
    case "EACCES":
      console.error(bind + " requires elevated privileges");
      process.exit(1);
      break;
    case "EADDRINUSE":
      console.error(bind + " is already in use");
      process.exit(1);
      break;
    default:
      throw error;
  }
};

const onListening = () => {
  const addr = server.address();
  const bind = typeof addr === "string" ? "pipe " + addr : "port " + port;
  debug("Listening on " + bind);
};

const port = normalizePort(process.env.PORT || "3000");
app.set("port", port);
app.on("error", onError);
app.on("listening", onListening);
app.listen(port);
