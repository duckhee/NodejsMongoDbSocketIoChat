var express = require('express');
var routerUser = express.Router();
var repositoryUser = require('../repository/repositoryUser');

routerUser.post('/', function(request, response) {

});

routerUser.get('/', function(request, response) {

});

routerUser.post('/getUserList', function(request, response) {
	getUserList(request, response, request.query);
});


function getUserList(request, response, parameters) {
	repositoryUser.getUserList(function(err, docs) {
		if (err) {
			response.send('error');
		} else if (docs != null) {
			response.send(JSON.stringify(docs));
		} else {
			response.send('No data found');
		}
	});
}

module.exports = routerUser;
