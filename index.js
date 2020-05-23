const express = require("express");
const app = express();
var morgan = require("morgan");
var cors = require("cors");
const PORT = process.env.PORT || 3001;
var bodyParser = require("body-parser");
const session = require("express-session");

// add comment from github
// testing organization git

require("./utills/db");
require("./utills/events");

app.use(morgan("dev"));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(session({ secret: "ssshhhhh", saveUninitialized: true, resave: true }));
app.use(cors()); // cros is for cross orgin resouce for issue with front end backend ports

// Master Admin Signup API Route // This is new structure
const MSignUp = require("./MasterAdmin-Portal/Routes/MSignup-route");
app.use("/Master", MSignUp);
// Post - /Master/MasterSignup

// Developed by Talha
// Master Admin Meal Package Plan //
const MMealPlan = require("./MasterAdmin-Portal/Routes/MMealPackage.Route");
app.use("/Master", MMealPlan);
// Post  - /Master/MealPackage
// Get   - /Master/GetListMealPackages

// Kitchen Signup Api Route // This is new structure
const KSignUp = require("./Kitchen-Portal/Routes/KSignup-Login-routes");
app.use("/Kitchen", KSignUp);
// Post - /kitchen/KitchenSignup
// Post - /kitchen/KitchenLogin
// Get - /kitchen/verifyEmail

const KList = require("./Kitchen-Portal/Routes/Kitchen-list-edit-delete");
app.use("/Kitchen", KList);
// get - /Kitchen/AllKitchen_fromCache     // This API will fetch Kitchen list

// HI varun this the route for story 4 from azure devops
// Kitchen  Item Serving days [ Not yet completed need to work on it]
const ItemServingDays = require("./Kitchen-Portal/Routes/Kitchen_ItemDays.Route");
app.use("/Servingdays", ItemServingDays);
// Post  - /Servingdays/ItemServingDays

// Add product - Api Route
const Addproduct = require("./MasterAdmin-Portal/Routes/MProduct.Route");
app.use("/products", Addproduct);
// Post - /products/Addproduct
// Get  - /products/preSetData
// Get  -/products/Allproducts

// VARUN VARUN HANDLING ORDER API
// ADD Customer Order  - API Route // This is API with QR CODE - varun handling
const CustomerOrder = require("./Customer-Portal/Routes/CustomerOrder.Route");
app.use("/orders", CustomerOrder);
// post - /orders/CustomerOrder

// Error Route API Route // This new structure
const Errors = require("./Common-Model-Routes/Routes/Error.routes");
app.use("/CaptureErr", Errors);
// Post - /CaptureErr/ErrorCapture

// State and City Api Route
const StateCity = require("./Common-Model-Routes/Routes/StateCity.routes");
app.use("/StateCities", StateCity);
// Get - /StateCities/readJsonFile
// Get - /StateCities/AllStateCity

// Zipcode & Kicthens API route [this will tell which kicthens are serving which zipcodes]
const ZipcodeKitchen = require("./MasterAdmin-Portal/Routes/MZipcode-Kitchen.Route");
app.use("/ZipcodesKitchens", ZipcodeKitchen);
// Post  - /ZipcodesKitchens/ZipcodeKitchens

/// -------------------------------------------------------///

// Asif bhai  = Pls add logic to below code as mentioned in WORKITEM
// we capture all errors and save it to datbase collection ,[Date ,error type, IP address ]
//if datbase is down then when its up it should save that to database collection .

//This below code is to display error if anyone typed wrongURL extenstion

app.use((req, res, next) => {
  const error = new Error("We think you are lost,you may typed wrong URL!");
  error.status = 404;
  return next(error);
});

app.use((error, req, res, next) => {
  res.status(error.status || 500);
  res.json({
    error: {
      message: error.message,
      Msg: "Something is wrong at our end ,we are sorry try again later",
    },
  });
});

app.listen(PORT, () => console.log(`Example app listening on port ${PORT}!`));

module.exports = app;
