// Define the URL shortener schema

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

const UrlSchema = new Schema({
  short: { type: String, required: true},
  original: { type: String, required: true }
});

var UrlModel = mongoose.model('UrlShort', UrlSchema);

module.exports = UrlModel;
