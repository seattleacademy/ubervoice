var path = require('path');
var echo = require('../echo');
var User = require('../models').User;
var request = require('request-json');
var uber = request.createClient('https://api.uber.com');
var google = request.createClient('https://maps.googleapis.com');

exports.index = function(req,res){

  if(!req.user){
    console.log('User is not authenticated.');
    res.sendfile(path.resolve(__dirname + '/../build/noauth.html'));
  }
  else{
    console.log('User is logged in!');

    var address = req.user.street_address+", "+req.user.city_address+", "+req.user.state_address+" "+req.user.zipcode_address;

    console.log("Reverse lookup on user address: "+address);
    google.get('/maps/api/geocode/json?address='+address, function(err, googleResponse, body) {

      uber.headers['Authorization'] = 'Bearer '+req.user.accessToken;

      uber.get('/v1/products?latitude='+body.results[0].geometry.location.lat+'&longitude='+body.results[0].geometry.location.lng, function(err, uberResponse, body) {
        var products = body.products;
        console.log('Products: '+products);

        var pairedStatus = false;
        if(req.user.amazon_id && req.user.uber_id){

          pairedStatus = true;
          res.render('main.ejs',{
              pairedStatus:pairedStatus,
              street_address:req.user.street_address,
              city_address:req.user.city_address,
              state_address:req.user.state_address,
              zipcode_address:req.user.zipcode_address,
              products:products,
              product_id_preference:req.user.product_id_preference
          });
        }
        else{

          //Generate small number
          var setupCode = randomIntInc(0,10);
          console.log('Setup pairing code is: '+setupCode);

          User.findOneAndUpdate({ 'email': req.user.email }, {setupCode:setupCode}, {new:true}, function (err, user) {
            res.render('main.ejs',{
              pairedStatus:pairedStatus,
              setupCode: setupCode,
              street_address:user.street_address,
              city_address:user.city_address,
              state_address:user.state_address,
              zipcode_address:user.zipcode_address,
              products:products,
              product_id_preference:req.user.product_id_preference
            });
          });

        }

      });

    });

  }
}

exports.unlinkAccount = function(req,res){
  console.log('Unlinking account for user: '+req.user.email);
  User.findOneAndUpdate({'uber_id':req.user.uber_id},{amazon_id:undefined},function(err,user){
    res.json({});
  });

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
    zipcode_address:req.body.zipcode,
    product_id_preference:req.body.product
    },{new:true},function(err,user){
      res.json({});
    });
}

function randomIntInc (low, high) {
    return Math.floor(Math.random() * (high - low + 1) + low);
}

