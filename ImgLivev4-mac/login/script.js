var fs = require("fs");

function login() {
  var address = document.getElementById("address").value;
  if ( address.startsWith("http:") ) {
    address = address.slice(5);
  }
  address = address.split(":");
  address[1] = parseInt(address[1]) || 8000;
  if ( ! address[0].startsWith("http:") ) {
    address[0] = "http:" + address[0];
  }
  fs.writeFile(__dirname + "/../address.txt",address.join("\n"),function(err) {
    if ( err ) throw err;
    location.href = __dirname + "/../list/index.html";
  });
}
