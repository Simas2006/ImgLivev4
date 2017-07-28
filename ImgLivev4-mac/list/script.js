var loadData = require("../loadData");
var fs = require("fs");

function buildList() {
  loadData("/list",data => {
    loadData("/updated.txt",updated => {
      data = data.split(",");
      updated = updated.split(",");
      var box = document.getElementById("box");
      for ( var i = 0; i < data.length; i++ ) {
        var button = document.createElement("button");
        button.innerText = data[i];
        button.id = "album_link:" + i;
        button.className = updated.indexOf(data[i]) > -1 ? "greenText" : ""
        button.onclick = function() {
          location.href = __dirname + "/../grid/index.html?" + data[this.id.split(":")[1]];
        }
        box.appendChild(button);
        box.appendChild(document.createElement("hr"));
      }
    });
  });
}

function logout() {
  fs.writeFile(__dirname + "/../address.txt","notset",err => {
    if ( err ) throw err;
    location.href = __dirname + "/../login/index.html";
  })
}

window.onload = buildList;
