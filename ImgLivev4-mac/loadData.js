var http = require("http");
var fs = require("fs");

function loadOptions(path,callback) {
  fs.readFile(__dirname + "/address.txt",(err,data) => {
    if ( err ) throw err;
    data = data.toString().split("\n");
    callback({
      host: data[0].split("http://").join("\n").trim(),
      port: parseInt(data[1]) || 8000,
      method: "GET",
      path: path
    });
  });
}

function readData(path,callback) {
  loadOptions(path,options => {
    http.request(options,response => {
      var body = "";
      response.on("data",chunk => {
        body += chunk;
      });
      response.on("end",_ => {
        callback(body.toString());
      });
    }).end();
  });
}

module.exports = readData;
