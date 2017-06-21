var express = require('express');
var router = express.Router();


router.get('/tsdatalist', function(req, res) {
    var db = req.db;
    var collection = db.get('tsdatalist'); 
    collection.find({},{},function(e,docs){
        res.json(docs);
    });
});


router.delete('/deleteinfo/:id', function(req, res) {
    var db = req.db;
    var collection = db.get('tsdatalist'); 
    var infoToDelete = req.params.id;
    collection.remove({ '_id' : infoToDelete }, function(err) {
        res.send((err === null) ? { msg: '' } : { msg:'error: ' + err });
    });
});

module.exports = router;