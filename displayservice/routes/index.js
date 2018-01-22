var express = require('express');
var router = express.Router();
var MongoClient = require('mongodb').MongoClient;
var url = "mongodb://localhost:27017/";

router.get('/', function(req, res, next) {
var orderList = [];
  MongoClient.connect(url, function(err, db) {
   
    var dbo = db.db("displaydb");
    var sortById = { productId : -1 };
    dbo.collection("displaydata").find().sort(sortById).toArray(function(err, result) {
      req.result = result;
      res.render('index', { title: 'My fancy Overwiew' , 'orderList' : req.result });
      db.close();
    });
  }); 

  

});

module.exports = router;
