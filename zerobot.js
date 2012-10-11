//http://notes.jetienne.com/2011/03/22/microeventjs.html
var uuid = require('node-uuid');
var zmq = require('zmq');

var RemoteClient = function(identity, bind_addr, remote_id) {
	var self = this;
	this.identity = identity;
	this.remote_id = remote_id;
	var socket = zmq.socket('dealer');
	socket.setsockopt('identity', new Buffer(identity));
	socket.on("message", function() {
		console.log("Received");
		for (var i=0; i<arguments.length; i++) {
			console.log(''+i+' : '+arguments[i].toString());
		}
	});
	socket.connect(conn_addr);
	this.socket = socket;
	this.cb = {};
}

RemoteClient.prototype.uid = function() {
	return uuid.v1();
}

RemoteClient.prototype.remote_call = function(fct, args, kwargs, cb_fct, uid) {
	if (uid == undefined) uid = this.uid();
	if (cb_fct == undefined) throw new Error("You must use a callback function");
	this.cb[uid] = cb_fct;
	this.socket.send([this.remote_id, JSON.stringify({uid: uid, fct: fct, args: args, kwargs: kwargs})])
}

exports.RemoteClient = function(identity, bind_addr, remote_id) {
	return new RemoteClient(identity, bind_addr, remote_id);
}

