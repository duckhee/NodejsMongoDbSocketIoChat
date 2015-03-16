var db;
var MongoClient = require('mongodb').MongoClient;
var ObjectID = require('mongodb').ObjectID;

exports.initDB = function initDB() {
	var dbconurl = null;
	dbconurl = 'mongodb://localhost:27017/nodejs_mongodb_socketio_chat';

	MongoClient.connect(dbconurl, function(err, database) {
		if (err) {
			throw err;
		} else {
			db = database;
			exports.database.connection = database;
			console.log("Successfully connected to database");
		}
	});
};

exports.database = {};



