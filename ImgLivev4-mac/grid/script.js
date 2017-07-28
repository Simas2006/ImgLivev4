var loadData = require("../loadData");
var http = require("http");
var fs = require("fs");
var {dialog} = require("electron").remote;

function buildGrid() {
  loadData("/" + location.search.split("?")[1] + "/list",data => {
    data = data.split(",");
    var box = document.getElementById("box");
    fs.readFile(__dirname + "/../address.txt",(err,address) => {
      if ( err ) throw err;
      address = address.toString().split("\n");
      for ( var i = 0; i < data.length; i++ ) {
        var div = document.createElement("div");
        div.className = "padding";
        div.id = "image:" + i;
        div.onclick = function() {
          location.href = __dirname + "/../large/index.html?" + location.search.split("?")[1] + "?" + data[this.id.split(":")[1]];
        }
        var image = document.createElement("img");
        image.width = "120";
        image.height = "120";
        image.src = address[0] + ":" + address[1] + "/" + location.search.split("?")[1] + "/" + data[i];
        div.appendChild(image);
        box.appendChild(div);
      }
    });
  });
}

window.onload = _ => {
  buildGrid();
  document.getElementById("back").innerText = location.search.split("?")[1];
  document.getElementById("back").onclick = _ => {
    location.href = __dirname + "/../list/index.html";
  }
  fs.readFile(__dirname + "/../address.txt",(err,address) => {
    if ( err ) throw err;
    address = address.toString().split("\n");
    document.getElementById("uploader").action = address[0] + ":" + address[1] + "/" + location.search.split("?")[1] + "/upload_image?" + location.href;
  });
}
