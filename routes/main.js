var path = require('path');
var echo = require('../echo');
var User = require('../models').User;
var request = require('request');

exports.index = function(req,res){

  if(!req.user){
    console.log('User is not authenticated. Rendering welcome page.');
    res.sendfile(path.resolve(__dirname + '/../build/noauth.html'));
  }
  else{
    console.log('User is logged in!');

    //Generate small number
    var setupCode = randomIntInc(0,10);
    console.log('Setup pairing code is: '+setupCode);

    User.findOneAndUpdate({ 'email': req.user.email }, {setupCode:setupCode}, {new:true}, function (err, user) {
      res.render('main.ejs',{
        code: setupCode,
        street_address:user.street_address,
        city_address:user.city_address,
        state_address:user.state_address,
        zipcode_address:user.zipcode_address
      });
    });

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

exports.updateUserInfo = function(req,res){
  console.log(req.body);

  User.findOneAndUpdate({'email': req.user.email}, {
    street_address:req.body.address,
    city_address:req.body.city,
    state_address:req.body.state,
    zipcode_address:req.body.zipcode
    },{new:true},function(err,user){
      res.json({});
    });


}

function randomIntInc (low, high) {
    return Math.floor(Math.random() * (high - low + 1) + low);
}

