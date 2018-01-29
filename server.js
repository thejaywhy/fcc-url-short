var express = require('express');
var app = express();
var MongoClient = require('mongodb').MongoClient;

// setup our datastore
//var datastore = require("./datastore").sync;
//datastore.initializeApp(app);

function connect() {
  //var MONGODB_URI = process.env.SCHEME+'://'+process.env.USER+':'+process.env.PASS+'@'+process.env.HOST+'/'+process.env.DB+'?authSource=admin';
  var MONGODB_URI = process.env.URI;
  MongoClient.connect(MONGODB_URI, function(err, client) {
    if(err) return console.log("ERR: "+err);
    //const collection = client.db(process.env.DB).collection(process.env.COLLECTION);
    const db = client.db(process.env.DB);
    const collection = db.collection(process.env.COLLECTION);
    // Find some documents
    collection.find({}).toArray(function(err, docs) {
      if(err) return console.log("ERR: "+err);
      console.log("Found the following records");
      console.log(docs)
      
    });
    
    // perform actions on the collection object
    client.close();
});
};

// root, show welcome page / docs
app.get("/", function (request, response) {
  response.sendFile(__dirname + '/views/index.html');
});

// Build the only API route
app.get("/new/:url", function (request, response) {

  console.log(request.params.url);
  
  connect();

  response.json({
    original_url: request.params.url,
    short_url: request.params.url,
  });
});

// Build the only API route
app.get("/:short", function (request, response) {

  console.log(request.params.url);
  
  connect();

  response.redirect('https://randomjy.com');
});

// listen for requests
var listener = app.listen(process.env.PORT, function () {
  console.log('Your app is listening on port ' + listener.address().port);
});
