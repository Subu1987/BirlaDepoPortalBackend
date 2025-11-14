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
const ImageModel = require("./schema/ImageSchema");
const dbConnection = require("./connections/dbConnection");

// certificates
const fs = require("fs");
const https = require("https");

console.log("connected");
console.log(process.env.MYSQL_HOST);

const debug = require("debug")("node-angular");
const http = require("http");

var app = express();

app.use(bodyParser.json({ limit: "50mb" }));
app.use(bodyParser.urlencoded({ limit: "50mb", extended: true }));
app.use(morgan("dev"));

/* ❌ REMOVE STATIC PUBLIC FOLDER LOADING */
// app.use(
//   express.static(path.join(__dirname, "public"), {
//     setHeaders: function (res, path, stat) {
//       res.set("x-timestamp", Date.now());
//     },
//   })
// );

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

app.use("/", deliveryRfcRoutes);
app.use("/", invoiceRfcRoutes);
app.use("/", goodReceiptRoutes);
app.use("/", ReportRoutes);
app.use("/", So);
app.use("/", physicalInventoryRoutes);
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

/* ❌ REMOVE FRONTEND CATCH-ALL ROUTE */
// app.get("*", (req, res) => {
//   res.sendFile(path.join(__dirname + "/public/birla.html"));
// });

const normalizePort = (val) => {
  var port = parseInt(val, 10);
  if (isNaN(port)) return val;
  if (port >= 0) return port;
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
    case "EADDRINUSE":
      console.error(bind + " is already in use");
      process.exit(1);
    default:
      throw error;
  }
};

const onListening = () => {
  const addr = server.address();
  const bind = typeof addr === "string" ? "pipe " + addr : "port " + port;
  debug("Listening on " + bind);
};

const privateKey = fs.readFileSync(
  "/home/bcladmin/certs/2025/birlaprivate.key",
  "utf8"
);
const certificate = fs.readFileSync(
  "/home/bcladmin/certs/2025/birlacert.pem",
  "utf8"
);
const ca = fs.readFileSync("/home/bcladmin/certs/2025/birlakey.pem", "utf8");

const credentials = {
  key: privateKey,
  cert: certificate,
  ca: ca,
};

const port = normalizePort(process.env.PORT || "3000");
const httpsServer = https.createServer(credentials, app);

process
  .on("unhandledRejection", (reason, p) => {
    console.error(reason, "Unhandled Rejection at Promise", p);
  })
  .on("uncaughtException", (err) => {
    console.error(err, "Uncaught Exception thrown");
  });

app.on("error", onError);
app.on("listening", onListening);

httpsServer.listen(443, () => {
  console.log("HTTPS Server running on port 443");
});
