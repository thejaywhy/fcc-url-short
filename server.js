var express = require('express');
var app = express();

// root, show welcome page / docs
app.get("/", function (request, response) {
  response.sendFile(__dirname + '/views/index.html');
});

// Build the only API route
app.get("/new/:url", function (request, response) {

  console.log(request.params.url);

  response.json({
    original_url: request.params.url,
    short_url: request.params.url,
  });
});

// listen for requests
var listener = app.listen(process.env.PORT, function () {
  console.log('Your app is listening on port ' + listener.address().port);
});
