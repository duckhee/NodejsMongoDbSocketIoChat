var MongoDbDAO = require('./MongoDbDAO');

exports.getUserList = function(callback) {
	var connection = MongoDbDAO.database.connection;
	var userList = [];
	connection.collection('users').find().toArray(function(err, items) {
		if (err) {
			console.log(err);
			callback(err, null);
		}
		for (var i = 0; i < items.length; i++) {
			var user = {
				id : items[i]._id,
				userName : items[i].userName,
				emailId : items[i].emailId,
				socketId : '',
				status : 'Sign out'
			};
			userList.push(user);
		}
		callback(null, userList);
	});
};
