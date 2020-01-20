const mongoose = require('mongoose');

mongoose.connect('mongodb://localhost/miau');
mongoose.Promise = global.Promise;

module.exports = mongoose;