var UTF8 = require("utf-8");
var http = require("http");
var ReadWriteNetStream = require("ReadWriteNetStream");

module.exports = function (self) {
	var server = http.createServer(function (req, res) {
		res.on("close", function() { console.log("ServerResponse evt close"); });
		res.on("finish", function() { console.log("ServerResponse evt finish"); self.postMessage({done: true}); });
		for (var evt of ['response', 'socket', 'connect', 'upgrade', 'continue']) req.on(evt, function(evt) { return function() { console.log("ClientRequest evt " + evt); }; }(evt) );
		console.log(req);
		res.writeHead(200, {'Content-Type': 'text/plain'});
		res.write("hello client! here's the url:");
		res.end(req.url);
	});

	for (var evt of ['request', 'connection', 'close', 'checkContinue', 'connect', 'upgrade', 'clientError'])
		server.on(evt, function(evt){ return function() { console.log("Server evt " + evt); }; }(evt) );

	server.on("request", function(incomingMessage) {
		incomingMessage.on("close", function() {
			console.log("IncomingMessage evt close");
		}.bind(this));
	});

	var i=0;

	self.addEventListener('message',function (ev) {
		var dummySocket = new ReadWriteNetStream();
		for (var evt of ['lookup', 'connect', 'end', 'timeout', 'drain', 'error', 'close'])
			dummySocket.on(evt, function(evt) {
				return function() { console.log("Socket evt " + evt); };
			}(evt));
		dummySocket.on("data", function(data) {
			self.postMessage({done: false, data: data.toString()});
		});
		server.emit("connection", dummySocket);
		//dummySocket.write("GET /loldongs HTTP/1.0\r\n\r\n");
		//dummySocket.emit("data","GET /loldongs HTTP/1.0\r\n\r\n");
		//dummySocket.ondata("GET /loldongs HTTP/1.0\r\n\r\n");
		dummySocket.ondata(new Uint8Array(ev.data.buffer), i, i+ev.data.byteLength);
		i += ev.data.byteLength;
	}.bind(this));
}
