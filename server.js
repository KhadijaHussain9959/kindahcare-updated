const express = require("express");
const app = express();
var http = require("http");
var socketIo = require("socket.io");
var path = require("path");
var session = require("express-session");
var bodyParser = require("body-parser");
var cookieParser = require("cookie-parser");
let https = require("https");

// var easyrtc = require("easyrtc");
process.title = "KindahCare";

app.set("view engine", "ejs");
app.set("views", "views");
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

var webServer = http.createServer(app);
// Start Socket.io so it attaches itself to Express server

var socketServer = socketIo.listen(webServer, { "log level": 1 });

socketServer.set("transports", ["websocket"]);

const KindahRoutes = require("./Routes/routes");
const AuthRoutes = require("./Routes/AuthRoutes.js");
const { JSONCookies } = require("cookie-parser");
const { json } = require("express");
app.use(
  session({ secret: "kindahcare", resave: false, saveUninitialized: false })
);

//=============start push notification using socket.io==================
var clients = {};
socketServer.sockets.on("connection", function (socket) {
  //=================save all Login user Info to array=======
  socket.on("add-user", function (data) {
    clients[data.username] = {
      socket: socket.id,
      userId: data.userId,
      userType: data.userType,
    };
  });

  socket.on("SendCallRequestToPatient", function (data) {
    if (clients[data.pName]) {
      socketServer.sockets.connected[clients[data.pName].socket].emit(
        "CallRequest",
        data
      );
    } else {
      console.log("User does not exist: " + data.pName);
    }
  });
  socket.on("showStream", function (data) {
    console.log(JSON.stringify(data));
    if (clients[data.username]) {
      socketServer.sockets.connected[clients[data.username].socket].emit(
        "callAccpetedandShowStream",
        data
      );
    } else {
      console.log("User does not exist: " + data.pName);
    }
  });
  socket.on("RejectedAudioVideoCall", function (data) {
    if (clients[data.username]) {
      console.log(
        "this is docort Name " + JSON.stringify(clients[data.username])
      );
      socketServer.sockets.connected[clients[data.username].socket].emit(
        "GetRejectedConfirmation",
        data
      );
    } else {
      console.log("User does not exist: " + data.pName);
    }
  });
  //==========close patient calling screen on disconnect or end call============
  socket.on("ClosePatientScreen", function (data) {
    console.log(JSON.stringify(clients[data.username]));
    if (clients[data.username]) {
      socketServer.sockets.connected[clients[data.username].socket].emit(
        "ClosePatientScreen",
        data.pName
      );
    } else {
      console.log("User does not exist: " + data.pName);
    }
  });
  // ===========sent Notification to doctor  from client=====
  socket.on("NotifyDoctor", function (data) {
    if (clients[data.username]) {
      socketServer.sockets.connected[clients[data.username].socket].emit(
        "SendNotificationToDoctor",
        data
      );
    } else {
      console.log("User does not exist: " + data.username);
    }
  });
  //=========send accept or reject alert to patient by doctor========
  socket.on("AcceptRejectCall", function (data) {
    //====doctor send notification to client for accept/reject call to selected Client======
    if (clients[data.username]) {
      socketServer.sockets.connected[clients[data.username].socket].emit(
        "CallAccepted",
        data
      );
    } else {
      console.log("User does not exist");
    }
  });
  socket.on("UpdateOnlineStatus", function (data) {
    if (data.uID != "") {
      socket.broadcast.emit("UpdateDoctorOnlineStatus", data); // for all client except sender
    }
  });

  socket.on("UpdatePatientOnlineStatus", function (data) {
    if (data.uID != "") {
      socket.broadcast.emit("UpdatePatientOnlineStatus", data); // for all client except sender
    }
  });

  //Removing the socket on disconnect
  socket.on("disconnect", function () {
    for (var name in clients) {
      if (clients[name].socket === socket.id) {
        if (clients[name].userType == "Doctor")
          //============send information for doctor offline to all online patients
          socket.broadcast.emit("UpdateDoctorOnlineStatus", {
            uID: clients[name].userId,
            status: "Offline",
          });
        else if (clients[name].userType == "Patient")
          //============send information for Patient offline to all online patients
          socket.broadcast.emit("UpdatePatientOnlineStatus", {
            uID: clients[name].userId,
            status: "Offline",
          });

        delete clients[name];
        break;
      }
    }
  });
});

//linking css AND JS FILES
app.use(express.static(path.join(__dirname, "public")));
app.use(cookieParser());
//routes
app.use(KindahRoutes);
app.use(AuthRoutes);

//in case of page not existing put error 404
app.use((req, res, next) => {
  res.status(404).sendFile(path.join(__dirname, "public", "404.html"));
});

//=============end push notification using socket.io=====================
webServer.listen(process.env.PORT || 8080, () => console.log("Alll is ok"));
