var mongoose = require("mongoose");
var mongodbUri = require('mongodb-uri');

module.exports = {
	connect: function() {
		mongoose.connect(mongodbUri.formatMongoose('mongodb://erfanelahi:aaa111@ds143559.mlab.com:43559/mydb'));
	}
};