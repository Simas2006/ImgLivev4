const {app,BrowserWindow,globalShortcut} = require("electron");
var fs = require("fs");
let win

function createWindow() {
  var size = require("electron").screen.getPrimaryDisplay().size;
  win = new BrowserWindow({width:size.width,height:size.height,title:"ImgLivev4"});
  fs.readFile(__dirname + "/address.txt",function(err,data) {
    data = data.toString();
    win.loadURL("file://" + __dirname + (data == "notset" ? "/login" : "/list") + "/index.html");
    //win.webContents.openDevTools();
    win.on("closed",function() {
      win = null;
    });
  });
}

app.on("ready",createWindow);

app.on("window-all-closed",function() {
  if ( process.platform == "darwin" ) {
    app.quit();
  }
});

app.on("activate",function() {
  if ( ! win ) {
    createWindow();
  }
});
