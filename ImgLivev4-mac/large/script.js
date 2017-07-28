var loadData = require("../loadData");
var fs = require("fs");
var index = -1;
var list = [];

function movePic(move) {
  if ( index + move < 0 || index + move >= list.length ) {
    alert("End of album");
  } else {
    index += move;
  }
  fs.readFile(__dirname + "/../address.txt",(err,address) => {
    if ( err ) throw err;
    address = address.toString().split("\n");
    var vimage = new Image();
    vimage.src = address[0] + ":" + address[1] + "/" + list[index];
    vimage.onload = _ => {
      var ratio = calculateRatio(vimage.width,vimage.height);
      var image = document.getElementById("image");
      image.width = vimage.width * ratio;
      image.height = vimage.height * ratio;
      image.src = vimage.src;
      back.innerText = vimage.src.split("/")[vimage.src.split("/").length - 1];
    }
  });
}

function calculateRatio(width,height) {
  for ( var r = 1; r > 0; r -= 0.05 ) {
    if ( width * r < window.innerWidth - 50 && height * r < window.innerHeight - 50 ) {
      return r;
    }
  }
  throw new Error("Ratio could not be calculated");
}

window.onload = _ => {
  loadData("/" + location.search.split("?")[1] + "/list",data => {
    list = data.split(",");
    index = list.indexOf(decodeURI(location.search.split("?")[2]));
    list = list.map(item => "/" + location.search.split("?")[1] + "/" + item);
    back.onclick = function() {
      location.href = __dirname + "/../grid/index.html?" + location.search.split("?")[1];
    }
    movePic(0);
  });
}

window.onkeydown = event => {
  if ( event.keyCode == 37 ) {
    movePic(-1);
  } else if ( event.keyCode == 39 ) {
    movePic(1);
  }
}
