var ReconnectingWebSocket = require("reconnecting-websocket");
var sharedb = require("sharedb/lib/client");
// var json1 = require('ot-json1');
// console.log("json1",json1)
// Open WebSocket connection to ShareDB server
var socket = new ReconnectingWebSocket("ws://" + window.location.host, [], {
	// ShareDB handles dropped messages, and buffering them while the socket
	// is closed has undefined behavior
	maxEnqueuedMessages: 0,
});

let myType = {
	type: {
		name: "http:json11",
		uri: "http:json11",

		// 初始化 OT 编码器
		create: function (e) {
			console.log("create",e);
			return e
		},
		// 将客户端提交的操作应用到服务器端数据
		apply: function (snapshot, op) {
			console.log("apply",op,snapshot);
			return op; // 直接返回操作，表示简单地应用操作
		},
		// 将服务器端数据转换为客户端可用的格式
		transform: function (ops, otherOps, side) {
			console.log("transform", {otherOps, side});
			return ops; // 简单地返回操作，不进行转换
		},
	},
};

sharedb.types.register(myType.type);
var connection = new sharedb.Connection(socket);

// Create local Doc instance mapped to 'examples' collection document with id 'counter'
var doc = connection.get("examples", "counter");

// Get initial value of document and subscribe to changes
doc.subscribe(showNumbers);
// When document changes (by this client or any other, or the server),
// update the number on the page
doc.on("op", showNumbers);

function showNumbers() {
	console.log("收到消息", {  doc });
	document.querySelector('#num-clicks').textContent = doc.data.state;
}

// When clicking on the '+1' button, change the number in the local
// document and sync the change to the server and other connected
// clients
function increment() {
	// Increment `doc.data.numClicks`. See
	// https://github.com/ottypes/json1/blob/master/spec.md for list of valid operations.
	// doc.submitOp([{p:["test"],state:doc.data.state+1}]);
	doc.submitOp({state:doc.data.state+1});
}

// Expose to index.html
global.increment = increment;
