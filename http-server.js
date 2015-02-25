
var UTF8 = require("utf8-encoding");
var encoder = new UTF8.TextEncoder();
var http = require("http");
var ReadWriteNetStream = require("ReadWriteNetStream");

module.exports = function (self) {
	var server = http.createServer(function (req, res) {
		res.on("close", function() { console.log("ServerResponse evt close"); });
		res.on("finish", function() { console.log("ServerResponse evt finish"); self.postMessage({Done: true, Data: ""}); });
		for (var evt of ['response', 'socket', 'connect', 'upgrade', 'continue']) req.on(evt, function(evt) { return function() { console.log("ClientRequest evt " + evt); }; }(evt) );
		res.writeHead(200, {'Content-Type': 'text/plain'});
		res.write("hello client! here's the url:");
		res.end(req.url);
	});

	for (var evt of ['request', 'connection', 'close', 'checkContinue', 'connect', 'upgrade', 'clientError'])
		server.on(evt, function(evt){ return function() { console.log("Server evt " + evt); }; }(evt) );

	server.on("request", function(incomingMessage) {
		incomingMessage.on("close", function() {
			console.log("IncomingMessage evt close");
		});
	});

	self.addEventListener('message',function (ev) {
		if (ev.data.New) {
			self.i=0;
			self.dummySocket = new ReadWriteNetStream();
			for (var evt of ['lookup', 'connect', 'end', 'timeout', 'drain', 'error', 'close'])
				self.dummySocket.on(evt, function(evt) {
					return function() { console.log("Socket evt " + evt); };
				}(evt));
			self.dummySocket.on("data", function(data) {
				self.postMessage({Done: false, Data: data});
			});
			server.emit("connection", self.dummySocket);
			//dummySocket.write("GET /loldongs HTTP/1.0\r\n\r\n");
			//dummySocket.emit("data","GET /loldongs HTTP/1.0\r\n\r\n");
			//dummySocket.ondata("GET /loldongs HTTP/1.0\r\n\r\n");
		}
		var arr = new Uint8Array(encoder.encode(atob(ev.data.Data)));
		self.dummySocket.ondata(arr, i, i+arr.byteLength);
		i += arr.byteLength;
	});
}
