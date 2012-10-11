
/**
 * Module dependencies.
 */

var express = require('express')
  , routes = require('./routes')
  , http = require('http')
  , path = require('path');

var app = express();
var server = http.createServer(app);
var io = require('socket.io').listen(server);
var zmq = require('zmq');


/**
 *  					Application
 */
app.configure(function(){
  app.set('port', process.env.PORT || 3000);
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(express.favicon());
  app.use(express.logger('dev'));
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(app.router);
  app.use(express.static(path.join(__dirname, 'public')));
});

app.configure('development', function(){
  app.use(express.errorHandler());
});

app.get('/', routes.index);




/**
 *  					Websocket
 */
//io.set('log level', 2);
io.sockets.on('connection', function (socket) {
	socket.emit('msg', { hello: 'world' });
	
	var subscriber = zmq.socket('sub');
	subscriber.on('message', function() {
		var message = []
		for (var i=0; i<arguments.length; i++) {
			message[i] = arguments[i].toString();
		}
		socket.emit('message', message);
	});
		
	socket.on('subscribe', function(id) {
		console.log("subscribe "+id);
		subscriber.subscribe(id);
	});
	socket.on('unsubscribe', function(id) {
		console.log("unsubscribe "+id);
		subscriber.unsubscribe(id);
	});
	socket.on('disconnect', function() {
		subscriber.close();
	});

	subscriber.connect("tcp://localhost:5002");
	subscriber.subscribe("");
});



/**
 *  					ZMQ
 */
/*
console.log("Collecting updates from weather server…")

// Socket to talk to server
var subscriber = zmq.socket('sub')

subscriber.subscribe('')

subscriber.on('message', function() {
	console.log('---');
	for (var i=0; i<arguments.length; i++) {
		console.log(''+i+' : '+arguments[i].toString());
	}
})
*/

//subscriber.connect("tcp://localhost:8082");
/*
// socket to talk to server
console.log("Connecting to hello world server...")
var requester = zmq.socket('req')

var x = 0
requester.on("message", function(reply) {
  console.log("Received reply", x, ": [", reply.toString(), ']')
  x += 1
})

requester.connect("tcp://localhost:5555")

for(var i = 0; i < 10; i++) {
  console.log("Sending request", i, '...')
  requester.send("Hello")
}

process.on('SIGINT', function() {
  requester.close()
})*/
//var remote = require('./zerobot').RemoteClient("remote_cool_nodejs", "tcp://localhost:8080", "cool");
//remote.remote_call('ping', [56,], {}, function(response) {console.log('Response :', response);});


/**
 *  					Launch
 */
server.listen(app.get('port'), function(){
  console.log("Express server listening on port " + app.get('port'));
});
