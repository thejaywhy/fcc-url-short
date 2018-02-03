var express = require('express');
var app = express();
var murmurHash3 = require('murmur-hash').v3;
var bodyParser = require('body-parser');
var validUrl = require('valid-url');


// create Parsers
// FIXME: only run these on the POST
//        need to figure out why the datastore's sync.defer doesn't
//        play well with these middlewares
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }));

// setup our datastore
var datastore = require("./datastore").sync;
datastore.initializeApp(app);
var dsConnected=false;

// Get connected to the database
function initializeDatastoreOnProjectCreation() {
  if(dsConnected !== true){
    try {
      dsConnected = datastore.connect() ? true : false;
    } catch (err) {
      console.log("Init Error: " + err);
    }
  }
}



// root, show welcome page / docs
app.get("/", function (request, response) {
  initializeDatastoreOnProjectCreation();

  response.sendFile(__dirname + '/views/index.html');
});

// Build the Create Route
app.post("/api/shorten", function (request, response) {
  if (!request.body) return response.status(400).json({err: "missing body"});  
  if (!validUrl.isWebUri(request.body.url)) return response.status(400).json({error: "Invalid URL"});
    
  var hash = murmurHash3.x86.hash32(request.body.url).toString();
      
  var data = {
      original: request.body.url
  }
  
  try{
    
    datastore.set(hash, data);
    data.short = hash;
    response.json(data);
  } catch (err) {
    data = {
      error: err
    }
    response.status(500).json(data);
  }  

});

// Build the Get Object API
app.get("/api/:short", function (request, response) {  
   
  try{   
    var url = datastore.get(request.params.short);
    if (url) {
      url.short = request.params.short;
      return response.status(200).json(url);
    } else {
      throw "Not found";
    }
  } catch (err) {
    response.status(404).json({error: err});
  }
  
});

// Build the Get Route Redirect
app.get("/:short", function (request, response) {  
   
  try{   
    var url = datastore.get(request.params.short);
    if (url) {
      return response.redirect(url.original);
    } else {
      throw "Not found";
    }
  } catch (err) {
    response.status(404).json({error: err});
  }
  
});

// listen for requests
var listener = app.listen(process.env.PORT, function () {
  console.log('Your app is listening on port ' + listener.address().port);
});
