var http = require("http");
var fs = require("fs");
var formidable = require("formidable");
var port = process.argv[2] || 8000;

http.createServer(function(request,response) {
  var url = decodeURI(request.url.split("?")[0]).split("/").slice(1);
  if ( url[0] == "add_album" && request.method == "POST" ) {
    var body = "";
    request.on("data",function(chunk) {
      body += chunk;
      if ( body.length > 1e6 ) {
        request.connection.destroy();
      }
    });
    request.on("end",function() {
      fs.mkdir("./photos/" + body,function(err) {
        if ( err && err.code != "EEXIST" ) throw err;
        response.writeHead(200);
        response.write("ok");
        response.end();
      });
    });
  } else if ( url[url.length - 1] == "upload_image" && request.method == "POST" ) {
    var form = new formidable.IncomingForm();
    form.parse(request,function(err,fields,files) {
      var oldpath = files.photo.path;
      var newpath = "./photos/" + url.slice(0,-1).join("/") + "/pic_" + Math.floor(Math.random() * 1000000) + ".jpg";
      fs.rename(oldpath,newpath,function(err) {
        if ( err ) throw err;
        response.writeHead(200);
        response.write("ok");
        response.end();
        fs.appendFile("./photos/updated.txt",url[url.length - 2] + ",",function(err) {
          if ( err ) throw err;
        });
      });
    });
  } else if ( url[url.length - 1] == "list" ) {
    fs.readdir("./photos/" + url.slice(0,-1).join("/"),function(err,files) {
      if ( err ) {
        if ( err.code == "ENOENT" ) {
          response.writeHead(404);
          response.write("File not found");
          response.end();
        } else {
          response.writeHead(500);
          response.write("Server error");
          response.end();
          console.log(err);
        }
        return;
      }
      response.writeHead(200);
      response.write(files.filter(function(item) {
        return item.toLowerCase().endsWith(".jpg") || item.indexOf(".") < 0;
      }).join(","));
      response.end();
    });
  } else {
    fs.readFile("./photos/" + url.join("/"),function(err,data) {
      if ( err ) {
        if ( err.code == "ENOENT" || err.code == "EISDIR" ) {
          response.writeHead(404);
          response.write("File not found");
          response.end();
        } else {
          response.writeHead(500);
          response.write("Server error");
          response.end();
          console.log(err);
        }
        return;
      }
      response.writeHead(200);
      response.write(data);
      response.end();
    });
  }
}).listen(port);

setInterval(function() {
  fs.writeFile("./photos/updated.txt","",Function.prototype);
},86400000);

console.log("Listening on port " + port);
