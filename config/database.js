var mongoose = require("mongoose");
var mongodbUri = require('mongodb-uri');

module.exports = {
	connect: function() {
		mongoose.connect(mongodbUri.formatMongoose('mongodb://erfanelahi:aaa111@ds157258.mlab.com:57258/mydb'));
	}
};