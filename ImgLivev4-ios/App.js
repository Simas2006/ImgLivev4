import React from "react";
import {Alert,AsyncStorage,Button,CameraRoll,Image,ScrollView,StyleSheet,Text,TextInput,TouchableHighlight,View} from "react-native";
import Dimensions from "Dimensions";
import GestureView from "react-native-gesture-view";
var GLOBALS = {
  server_ip: "http://10.0.1.97:8000",
  folder_path: null,
  picture_index: null,
  picture_list: null,
  current_controller: "BackupDialog"
}

console.ignoredYellowBox = ["Warning: checkPropTypes","Warning: Each child","Warning: PropTypes","Warning: Failed prop type"];

var styles = StyleSheet.create({
    imageGrid: {
        flex: 1,
        flexDirection: "row",
        flexWrap: "wrap",
        justifyContent: "center"
    },
    imageSmall: {
        width: 100,
        height: 100,
        margin: 10
    },
    imageBig: {
      flex: 1
    },
    backgroundView: {
      flex: 1,
      backgroundColor: "black",
      justifyContent: "center"
    },
    whiteText: {
      color: "white",
      fontSize: 30,
      textAlign: "center",
      margin: 0
    },
    bigText: {
      fontSize: 24,
      textAlign: "center",
      margin: 10
    },
    greenText: {
      color: "lime",
      fontSize: 24,
      textAlign: "center",
      margin: 10
    },
    inputBox: {
      fontSize: 24,
      textAlign: "center",
      margin: 10,
      height: 40
    },
    titleText: {
      fontSize: 36,
      textAlign: "center",
      margin: 10
    },
    hLine: {
      borderBottomWidth: 1,
      borderBottomColor: "black"
    }
});

class PictureManager extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      update_key: 0
    }
  }
  componentDidMount() {
    setInterval(_ => {
      this.setState({
        update_key: Math.random()
      });
    },500);
  }
  render() {
    if ( GLOBALS.current_controller == "PictureGrid.ota" ) {
      return (
        <PictureGrid readFromCamera={false} images={GLOBALS.picture_list.map(item => GLOBALS.server_ip + "/" + GLOBALS.folder_path + "/" + item)} onSelect={uri => {
          GLOBALS.picture_index = GLOBALS.picture_list.indexOf(uri.split("/")[uri.split("/").length - 1]);
          GLOBALS.current_controller = "PictureLarge";
        }} />
      );
    } else if ( GLOBALS.current_controller == "PictureGrid.lcl" ) {
      return (
        <PictureGrid readFromCamera={true} onSelect={uri => {
          var data = new FormData();
          data.append("photo",{
            uri: uri,
            type: "image/jpeg",
            name: "img"
          });
          fetch(GLOBALS.server_ip + "/" + GLOBALS.folder_path + "/upload_image",{
            method: "POST",
            body: data
          })
            .then(Function.prototype);
        }} />
      );
    } else if ( GLOBALS.current_controller == "PictureGrid.lcl.samp" ) {
      GLOBALS.current_controller = "PictureGrid.lcl";
      return (
        <View />
      );
    } else if ( GLOBALS.current_controller == "PictureLarge" ) {
      return (
        <PictureLarge />
      );
    } else if ( GLOBALS.current_controller == "PictureList" ) {
      return (
        <PictureList onSelect={path => {
          GLOBALS.folder_path = path;
          fetch(GLOBALS.server_ip + "/" + GLOBALS.folder_path + "/list")
            .then(response => {
              GLOBALS.picture_list = response["_bodyText"].split(",");
              GLOBALS.current_controller = "PictureGrid.ota";
            })
            .catch(error => console.warn(error));
        }} />
      );
    } else if ( GLOBALS.current_controller == "UploadAlbum" ) {
      return (
        <UploadAlbum />
      );
    } else if ( GLOBALS.current_controller == "LoginDialog" ) {
      return (
        <LoginDialog />
      );
    } else if ( GLOBALS.current_controller == "BackupDialog" ) {
      return (
        <BackupDialog />
      );
    }
  }
}

class PictureLarge extends React.Component {
  constructor(props) {
    super(props);
  }
  dynamicImageView() {
    var obj = styles.imageBig;
    obj.width = Dimensions.get("window").width;
    obj.height = Dimensions.get("window").height;
    return obj;
  }
  render() {
    return (
      <GestureView style={styles.backgroundView} onLayout={_ => this.setState({
        update_key: Math.random()
      })} onSwipeLeft={_ => {
        if ( GLOBALS.picture_index + 1 >= GLOBALS.picture_list.length ) {
          Alert.alert("End of album");
          return;
        }
        GLOBALS.picture_index++;
        this.setState({
          update_key: Math.random()
        });
      }} onSwipeRight={_ => {
        if ( GLOBALS.picture_index - 1 < 0 ) {
          Alert.alert("End of album");
          return;
        }
        GLOBALS.picture_index--;
        this.setState({
          update_key: Math.random()
        });
      }}>
        <Text style={styles.whiteText}>
          {GLOBALS.picture_list[GLOBALS.picture_index]}
        </Text>
        <Image style={this.dynamicImageView()} source={{uri: GLOBALS.server_ip + "/" + GLOBALS.folder_path + "/" + GLOBALS.picture_list[GLOBALS.picture_index]}} />
        <TouchableHighlight onPress={_ => GLOBALS.current_controller = "PictureGrid.ota"}>
          <Text style={styles.whiteText}>{"<<<"}</Text>
        </TouchableHighlight>
      </GestureView>
    );
  }
}

class PictureGrid extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      images: this.props.images || [],
      readFromCamera: this.props.readFromCamera || false,
      onSelect: this.props.onSelect || Function.prototype,
      selected: []
    }
  }
  componentDidMount() {
    if ( this.state.readFromCamera ) {
      CameraRoll.getPhotos({first: 100000}).then(
        data => {
          var images = data.edges.map(item => item.node.image.uri);
          this.setState({
            images: images
          });
        },
        error => console.warn(error)
      );
    }
  }
  render() {
    var button = (
      <TouchableHighlight onPress={_ => GLOBALS.current_controller = this.state.readFromCamera ? "PictureList" : "PictureGrid.lcl.samp"}>
        <Text style={styles.bigText}>{this.state.readFromCamera ? "Done" : "⊕"}</Text>
      </TouchableHighlight>
    );
    var back = this.state.readFromCamera ? null : (
      <TouchableHighlight onPress={_ => GLOBALS.current_controller = "PictureList"}>
        <Text style={styles.bigText}>{"<<<"}</Text>
      </TouchableHighlight>
    )
    return (
      <ScrollView>
        <Text style={styles.bigText}>{this.state.readFromCamera ? "Select photos to upload." : GLOBALS.folder_path}</Text>
        {button}
        {back}
        <View style={styles.imageGrid}>
          {this.state.images.map(image =>
            <TouchableHighlight onPress={_ => this.state.onSelect(image)}>
              <Image style={styles.imageSmall} source={{uri: image}} />
            </TouchableHighlight>
          )}
        </View>
      </ScrollView>
    );
  }
}

class PictureList extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      albumList: [],
      updated: [],
      onSelect: this.props.onSelect
    }
  }
  componentDidMount() {
    fetch(GLOBALS.server_ip + "/list")
      .then(response => {
        this.setState({
          albumList: response["_bodyText"].split(",")
        });
        fetch(GLOBALS.server_ip + "/updated.txt")
          .then(response => {
            this.setState({
              updated: response["_bodyText"].split(",")
            });
          })
          .catch(error => console.warn(error));
      })
      .catch(error => console.warn(error));
  }
  dynamicLineView() {
    var obj = styles.hLine;
    obj.width = Dimensions.get("window").width;
    return obj;
  }
  render() {
    return (
      <ScrollView>
        <Text style={styles.titleText}>ImgLivev4</Text>
        <View style={this.dynamicLineView()} />
        {this.state.albumList.map(item =>
          <View>
            <TouchableHighlight onPress={_ => this.state.onSelect(item)}>
              <Text style={this.state.updated.indexOf(item) > -1 ? styles.greenText : styles.bigText}>{item}</Text>
            </TouchableHighlight>
            <View style={this.dynamicLineView()} />
          </View>
        )}
        <TouchableHighlight onPress={_ => GLOBALS.current_controller = "UploadAlbum"}>
          <Text style={styles.bigText}>{"⊕"}</Text>
        </TouchableHighlight>
        <TouchableHighlight onPress={_ => GLOBALS.current_controller = "BackupDialog"}>
          <Text style={styles.bigText}>Do Backup</Text>
        </TouchableHighlight>
        <TouchableHighlight onPress={_ => {
          AsyncStorage.setItem("stored_ip","");
          GLOBALS.current_controller = "LoginDialog";
        }}>
          <Text style={styles.bigText}>Logout</Text>
        </TouchableHighlight>
      </ScrollView>
    );
  }
}

class UploadAlbum extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      title: ""
    };
  }
  render() {
    return (
      <View>
        <Text style={styles.titleText}>ImgLivev4</Text>
        <TextInput style={styles.inputBox} placeholder="Album name" onChangeText={title => this.setState({
            title: title
        })} />
        <TouchableHighlight onPress={_ => {
          fetch(GLOBALS.server_ip + "/add_album",{
            method: "POST",
            headers: {
              "Accept": "text/plain",
              "Content-Type": "text/plain"
            },
            body: this.state.title
          })
            .then(response => GLOBALS.current_controller = "PictureList")
            .catch(error => console.warn(error));
        }}>
          <Text style={styles.bigText}>Add</Text>
        </TouchableHighlight>
        <TouchableHighlight onPress={_ => {
          AsyncStorage.setItem("stored_ip","");
          GLOBALS.current_controller = "PictureList"
        }}>
          <Text style={styles.bigText}>Cancel</Text>
        </TouchableHighlight>
      </View>
    );
  }
}

class LoginDialog extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      address: ""
    }
  }
  componentDidMount() {
    AsyncStorage.getItem("stored_ip")
      .then(item => {
        if ( item ) {
          GLOBALS.server_ip = item;
          GLOBALS.current_controller = "PictureList";
        }
      })
      .catch(error => console.warn(error));
  }
  render() {
    return (
      <View>
        <Text style={styles.titleText}>ImgLivev4</Text>
        <TextInput style={styles.inputBox} placeholder="Address" onChangeText={address => this.setState({
            address: address
        })} />
        <TouchableHighlight onPress={_ => {
          AsyncStorage.setItem("stored_ip",this.state.address);
          GLOBALS.server_ip = this.state.address;
          GLOBALS.current_controller = "PictureList";
        }}>
          <Text style={styles.bigText}>Connect</Text>
        </TouchableHighlight>
      </View>
    );
  }
}

class BackupDialog extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      title: "",
      done: -1,
      images: []
    }
  }
  componentDidMount() {
    CameraRoll.getPhotos({first: 100000}).then(
      data => {
        var images = data.edges.map(item => item.node.image.uri);
        this.setState({
          images: images
        });
      },
      error => console.warn(error)
    );
  }
  render() {
    return (
      <View>
        <Text style={styles.titleText}>ImgLivev4</Text>
        <TextInput style={styles.inputBox} placeholder="Album name" onChangeText={title => this.setState({
            title: title
        })} />
        <TouchableHighlight onPress={_ => {

          fetch(GLOBALS.server_ip + "/add_album",{
            method: "POST",
            headers: {
              "Accept": "text/plain",
              "Content-Type": "text/plain"
            },
            body: this.state.title
          })
            .then(response => {
              var uploadFile = _ => {
                var data = new FormData();
                data.append("photo",{
                  uri: this.state.images[this.state.done],
                  type: "image/jpeg",
                  name: "img"
                });
                fetch(GLOBALS.server_ip + "/" + this.state.title + "/upload_image",{
                  method: "POST",
                  body: data
                })
                  .then(response => {
                    if ( this.state.done + 1 < this.state.images.length ) {
                      this.state.done++;
                      uploadFile();
                    } else {
                      Alert.alert("Completed backup");
                    }
                  })
                  .catch(error => console.warn(error))
            }
            this.state.done = 0;
            uploadFile();
          })
          .catch(error => console.warn(error));
        }}>
          <Text style={styles.bigText}>Backup</Text>
        </TouchableHighlight>
        <TouchableHighlight onPress={_ => {
          AsyncStorage.setItem("stored_ip","");
          GLOBALS.current_controller = "PictureList"
        }}>
          <Text style={styles.bigText}>Cancel</Text>
        </TouchableHighlight>
        <Text style={styles.bigText}>{this.state.done > -1 ? "Completed " + (this.state.done + 1) + "/" + this.state.images.length : ""}</Text>
      </View>
    );
  }
}

export default PictureManager;
