var http = require('http');
var express = require('express');
var ShareDB = require('sharedb');
var WebSocket = require('ws');
var WebSocketJSONStream = require('@teamwork/websocket-json-stream');

/**
 主要的属性有三个
 - version
 - type register可以注册
 - data json

 使用文档必须先 create
 */


var backend = new ShareDB();
createDoc();
// Create initial document then fire callback
function createDoc(callback) {
  // 服务端可以 直接这样做
  var connection = backend.connect();

  // 客户端需要 connection = new ShareDB.Connection(new ws("xx"));
  // global.connect = connection
  // connection 的 名字 , document 的 id
  var doc = connection.get('examples', 'counter');

  // 初始获取当前文档的 快照
  // doc.fetch(function(err, snapshot) {
  //   console.log("初始化",snapshot);
  //   if (err) throw err;
  //   console.log('before');
  //   if (doc.type === null) {
  //     doc.create({numClicks: 0}, callback);
  //     return;
  //   }
  //   console.log('after');
  //   // callback();
  // });
  doc.create({numClicks: 0}, ()=>{
    var app = express();
    app.use(express.static('static'));
    var server = http.createServer(app);
  
    // Connect any incoming WebSocket connection to ShareDB
    var wss = new WebSocket.Server({server: server});
    wss.on('connection', function(ws) {
      var stream = new WebSocketJSONStream(ws);
      // 用来把发的json 变成 text
      // 收到的 text 变成json
      backend.listen(stream);
    });
  
    server.listen(8080);
    console.log('Listening on http://localhost:8080');
  });
}

