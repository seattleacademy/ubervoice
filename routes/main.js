var path = require('path');
var echo = require('../echo');

var request = require('request');

exports.index = function(req,res){
  if(res)
    console.log('response object defined');

  
  if(!req.user){
    console.log('User is not authenticated. Rendering welcome page.');
    res.sendfile(path.resolve(__dirname + '/../build/views/index.html'));
  }
  else{
    console.log('User is logged in!');
    res.sendfile(path.resolve(__dirname + '/../build/views/main.html'));
  }
  
}

exports.handleEchoRequest = function(req,res){
	console.log(echo.handleEchoRequest);
	echo.handleEchoRequest(req,res);
}

exports.logout = function(req,res){
  req.logout();
  res.redirect('/');
}
