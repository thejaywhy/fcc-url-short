var express = require('express');
var app = express();
var murmurHash3 = require('murmur-hash').v3;
var bodyParser = require('body-parser');
var validUrl = require('valid-url');

// Load the model
var mongoose = require('mongoose');
var UrlShort = require('./models/urlshort');


// create Parsers
// FIXME: only run these on the POST
//        need to figure out why the datastore's sync.defer doesn't
//        play well with these middlewares
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }));

db = mongoose.connect(process.env.DB_URI);
mongoose.connection.on('connected', function () {
  console.log('Mongoose default connection open to ' + process.env.DB);
});

// root, show welcome page / docs
app.get("/", function (request, response) {
  response.sendFile(__dirname + '/views/index.html');
});

// Build the Create Route
app.post("/api/shorten", function (request, response) {
  if (!request.body) return response.status(400).json({error: "missing body"});
  if (!validUrl.isWebUri(request.body.url)) return response.status(400).json({error: "Invalid URL"});

  var newUrl = new UrlShort({
    short: murmurHash3.x86.hash32(request.body.url).toString(),
    original: request.body.url
  });

  newUrl.save(function(err, url){
    if (err) return response.status(500).json({"error": err});

    response.json({short: newUrl.short, original: newUrl.original});
  });

});

// Build the Get Object API
app.get("/api/:short", function (request, response) {
  UrlShort.find({ short: request.params.short }, function (err, url) {
    if (err) return response.status(404).json({error: err});

    response.status(200).json({
      short: url.short,
      original: url.original
    });

  });

});

// Build the Get Route Redirect
app.get("/:short", function (request, response) {
  UrlShort.find({ short: request.params.short }, function (err, url) {
    if (err) return response.status(404).json({error: err});

    response.redirect(url.original);
  });

});

// listen for requests
var listener = app.listen(process.env.PORT, function () {
  console.log('Your app is listening on port ' + listener.address().port);
});

module.exports = app; // for testing
