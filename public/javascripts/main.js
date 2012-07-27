
$(function () {

var zconsole = new ZeroConsole('#console');
socket = io.connect('http://localhost');
socket.on('message', function (data) {
	zconsole.onNewMsg(data);
});

$('#submit-subscribe').click(function(ev) {
	socket.emit('subscribe', $('#input-subscribe').val());
});

$('#submit-unsubscribe').click(function(ev) {
	socket.emit('unsubscribe', $('#input-unsubscribe').val());
});


});

var ZeroConsole = function(id) {
	this.id = id;
};

ZeroConsole.prototype = {
	onNewMsg: function(msg) {
		var id_from = msg[0];
		var id_to = msg[1];
		var msg = JSON.parse(msg[2]);
		var message = new Message(id_from, id_to, msg);
		var scrolHeight = $(this.id)[0].scrollHeight;
		var scrollTop = $(this.id).scrollTop()+$(this.id).height();
		var doScroll = (scrolHeight==scrollTop);
		$(this.id).append(message.toHtml());
		var newHeight = $(this.id)[0].scrollHeight;
		if (doScroll)
			$(this.id).scrollTop(newHeight);
		message.makeBindings();
		t = message;
	},

};


var Message = function(id_from , id_to, msg) {
	this.id_from = id_from;
	this.id_to = id_to;
	this.msg = msg;
}

Message.prototype = {

	domId: function() {
		var s = 'msg-';
		if (this.msg['fct']!=undefined) s += 'call-';
		else if (this.msg['data']!=undefined) s += 'resp-';
		s += this.msg['uid'];
		return s;
	},

	dom: function() {
		return $('#'+this.htmlId());
	},

	rawId: function() {
		return 'raw-'+this.domId();
	},

	raw: function() {
		return $('#'+this.rawId());
	},

	buttonShowRawId: function() {
		return 'showraw-'+this.domId();
	},
	
	buttonShowRaw: function() {
		return $('#'+this.buttonShowRawId());
	},

	buttonHideRawId: function() {
		return 'hideraw-'+this.domId();
	},
	
	buttonHideRaw: function() {
		return $('#'+this.buttonHideRawId());
	},

	inlineId: function() {
		return 'inline-'+this.domId();
	},

	inline: function() {
		return $('#'+this.inlineId());
	},
	
	toHtml: function() {
		var html = '<li id="'+this.domId()+'">';
		html += '<a id="'+this.inlineId()+'" href="#">'+this.id_from+' -> '+this.id_to+' : '+this._formatMsg(this.msg)+'</a>';
		html += '<i id="'+this.buttonShowRawId()+'" class="icon-chevron-down"></i>';
		html += '<i id="'+this.buttonHideRawId()+'" class="icon-chevron-up" style="display: none;"></i>';
		html += '<div id="'+this.rawId()+'" class="raw" style="display: none;"><pre>'+JSON.stringify(this.msg, null, 4)+'</pre></div>';
		html += '</li>';
		return html;
	},

	makeBindings: function() {
		var self = this;
		var raw = this.raw();
		var buttonShowRaw = this.buttonShowRaw();
		var buttonHideRaw = this.buttonHideRaw();
		this.inline().click(function(e) {
			e.preventDefault();
			if (buttonShowRaw.is(':hidden')) {
				raw.hide();
				buttonShowRaw.show();
				buttonHideRaw.hide();
			}
			else {
				raw.show();
				buttonShowRaw.hide();
				buttonHideRaw.show();
			}
		});
	},

	_formatMsg: function(msg) {
		if (msg['fct'] != undefined) {
			return this._formatMsgCall(msg);
		}
		else if (msg['data'] != undefined) {
			return this._formatMsgRep(msg);
		}
	},

	_formatMsgCall: function(msg) {
		var s = msg['fct']+'('+msg['args'].join(',');
		for( var k in msg['kwargs'] )
			s += ','+k+'='+msg['kwargs'];
		s += ') #'+msg['uid'];
		return s;
	},

	_formatMsgRep: function(msg) {
		var s = 'reponse ';
		if (msg.error) 
			s += 'ERROR :'+JSON.stringify(msg.error);
		else
			s += JSON.stringify(msg['data']);
		s += ' #'+msg['uid'];
		return s;
	}
}

