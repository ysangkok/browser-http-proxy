
var UTF8 = require("utf8-encoding");
var encoder = new UTF8.TextEncoder();
var decoder = new UTF8.TextDecoder();
var http = require("http");
var ReadWriteNetStream = require("ReadWriteNetStream");

var self = this;
var server = http.createServer(function (req, res) {
	res.on("close", function() { console.log("ServerResponse evt close"); });
	res.on("finish", function() { console.log("ServerResponse evt finish"); self.callback({Done: true, Data: ""}); });
	for (var evt of ['response', 'socket', 'connect', 'upgrade', 'continue']) req.on(evt, function(evt) { return function() { console.log("ClientRequest evt " + evt); }; }(evt) );

	var xhr = new XMLHttpRequest();
	xhr.open(req.method, req.url, true);
	if (typeof Uint8Array != 'undefined') xhr.responseType = "arraybuffer";
	xhr.onreadystatechange = function() {
		if (this.readyState === XMLHttpRequest.DONE) {
			if (!(xhr.status >= 200 && xhr.status < 300 || xhr.status === 304)) throw new Error("Couldn't load " + url + ". Status: " + xhr.status);
			if (xhr.response === undefined) throw new Error("Response undefined");
			res.writeHead(xhr.status, {"Content-Type": xhr.getResponseHeader("Content-Type")});
			res.end(decoder.decode(new Uint8Array(xhr.response || [])));
		}
	}

	try {
		xhr.send(null);
	} catch (e) {
		res.writeHead(403, {"Content-Type": "text/plain"});
		res.end(e.message);
	}
});

for (var evt of ['request', 'connection', 'close', 'checkContinue', 'connect', 'upgrade', 'clientError'])
	server.on(evt, function(evt){ return function() { console.log("Server evt " + evt); }; }(evt) );

server.on("request", function(incomingMessage) {
	incomingMessage.on("close", function() {
		console.log("IncomingMessage evt close");
	});
});

module.exports = {
	setCallback: function(cb) { self.callback = cb; },
	postMessage: function (ev) {
		if (typeof(ev.New) === "undefined") throw new Error("invalid message posted to http-server!");
		if (ev.New) {
			self.i=0;
			self.dummySocket = new ReadWriteNetStream();
			for (var evt of ['lookup', 'connect', 'end', 'timeout', 'drain', 'error', 'close'])
				self.dummySocket.on(evt, function(evt) {
					return function() { console.log("Socket evt " + evt); };
				}(evt));
			self.dummySocket.on("data", function(data) {
				self.callback({Done: false, Data: data});
			});
			server.emit("connection", self.dummySocket);
			//dummySocket.write("GET /loldongs HTTP/1.0\r\n\r\n");
			//dummySocket.emit("data","GET /loldongs HTTP/1.0\r\n\r\n");
			//dummySocket.ondata("GET /loldongs HTTP/1.0\r\n\r\n");
		}
		var arr = new Uint8Array(encoder.encode(atob(ev.Data)));
		self.dummySocket.ondata(arr, self.i, self.i+arr.byteLength);
		self.i += arr.byteLength;
	}
};
