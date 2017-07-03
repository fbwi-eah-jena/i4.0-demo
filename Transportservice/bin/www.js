var conf = require('../config.json');
var debug = require('debug')('Transportservice');
var app = require('../app');


app.set('port', process.env.PORT || conf.port);

var server = app.listen(app.get('port'), function() {
  debug('Express server listening on port ' + server.address().port);
});