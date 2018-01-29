var express = require('express');
var app = express();

// setup our datastore
var datastore = require("./datastore").sync;
datastore.initializeApp(app);
var dsConnected=false;

function initializeDatastoreOnProjectCreation() {
  if(!dsConnected){
    dsConnected = datastore.connect();
  }
}

// root, show welcome page / docs
app.get("/", function (request, response) {
  try{
    initializeDatastoreOnProjectCreation();
  } catch (err) {
    console.log("Error: " + err);
  }
  response.sendFile(__dirname + '/views/index.html');
});

// Build the only API route
app.get("/new/:url", function (request, response) {

  try{
    initializeDatastoreOnProjectCreation();
  } catch (err) {
    console.log("Error: " + err);
  }  
  
 
  

  response.json({
    original_url: request.params.url,
    short_url: request.params.url,
  });
});

// Build the only API route
app.get("/:short", function (request, response) {  
  try{
    initializeDatastoreOnProjectCreation();
    
    var url = datastore.get(request.params.short);
    if (url) {
      response.redirect(url.original);
    } else {
      throw "Not found";
    }
  } catch (err) {
    console.log("Error caught: " + err);
    response.status(404).send("Sorry can't find that!")
  }
  
});

// listen for requests
var listener = app.listen(process.env.PORT, function () {
  console.log('Your app is listening on port ' + listener.address().port);
});
