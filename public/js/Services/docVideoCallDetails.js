var baseURL = "https://kindahclinic.com/KindahService/";
//var baseURL = "http://localhost:1042/KindahService/";

var urlParams = new URLSearchParams(window.location.search);
var queId = urlParams.get("queId");
var docId = urlParams.get("DocId");
var docName = urlParams.get("docName");
var cLogId = urlParams.get("CallLogId");
var patientId = urlParams.get("patientId");
var PatientName = urlParams.get("patientName");
var area = urlParams.get("area");
var isShowVideo = false;
var isAudioEnable = false;
var session;
var publisher;
var subscriber;

var timer;
var onCallduration;
var callPerformed = false;
var insertedCallLogID;
var options = {
  year: "numeric",
  month: "numeric",
  day: "numeric",
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
};

function refreshParent() {
  if (window.opener != null && !window.opener.closed) {
    // && area == "Patient") {
    window.opener.location.reload();
  }
}
//call the refresh page on closing the window
window.onunload = refreshParent;

$(window).bind("beforeunload", function () {
  //==========if user has on called then called disconnect=====
  if (callPerformed) disconnect();
  soc.emit("ClosePatientScreen", {
    username: PatientName,
  });
});

$(function () {
  $(".btnSave").click(function () {
    updateDoctorNotes(cLogId, "");
  });

  $("#txtMedication").kendoEditor({
    resizable: {
      content: false,
      toolbar: true,
    },
  });

  $(".btnSaveNSend").click(function () {
    updatePrescription(
      cLogId,
      $("#patientAge").val(),
      $("#txtName").val(),
      patientId
    );
  });
  //========get patient history===============
  if (area != "Patient") {
    PatientHistory(patientId);
    $("#divCallNow").show();
    $("#call-heading")
      .text("Calling with " + PatientName)
      .css("width", "100%");
  } else {
    initializeSession();
    $("#call-heading").text("Calling with DR." + docName);
    $(".videocol").find("div.icons").remove();
    $(".rightcardContainer").remove();

    $("#divCallNow").hide();
    $(".leftcardContainer").removeClass("col-lg-7");
    $(".videocol").addClass("patientCallingWindow");
  }
  //==========ge doctor not==========
  if (cLogId != 0 && area != "Patient") {
    GetDoctorNotes(cLogId);
  } else if (queId != 0 && area != "Patient") {
    getPatientInfo(patientId);
  }

  $(document).on("click", ".btnViewPres", function () {
    var CallLogId = $(this).attr("CallID");
    if (cLogId != 0 && area != "Patient") {
      ViewPrescription(CallLogId);
    }
  });

  $(document).on("click", ".btnviewhistory", function () {
    var CallLogId = $(this).attr("CallID");
    ViewHistory(CallLogId);
  });

  //===========start functionality calling=================
  $("#btnCallNow").click(function () {
    checkOnlineStatusandCall(patientId, "Patient")
      .then((data) => {
        if (data) {
          if (queId != "0") {
            UpdateQueAddSaveCallLog(queId, "Called", docId, patientId);
          }
          //=============Play calling sound =====================
          PlayCallingSound(true);
          initializeSession();
          //=========send call request to paatient============
          soc.emit("SendCallRequestToPatient", {
            pName: PatientName,
            username: docName,
          });
        } else {
          Swal.fire({
            type: "error",
            title: "Oops...",
            text: "Patient is not available ",
            confirmButtonClass: "btn btn-primary",
            buttonsStyling: false,
            confirmButtonText: "Ok",
          });
        }
      })
      .catch((error) => {
        console.log(error);
      });
  });

  //===========end functionality calling======================
}); //=====================end of $function==========================

//======================= start managing Audio/Video communication=======================
function handleError(error) {
  if (error) {
    console.log(error.message);
  }
}

function initializeSession() {
  session = OT.initSession(apiKey, sessionId);

  session.on({
    sessionReconnecting: function (event) {
      $("#log")
        .css("display", "block")
        .text("Disconnected. Attempting to reconnect...");
    },
    sessionReconnected: function (event) {
      $("#log").css("display", "block").text("Connected.");
      $("#log").delay(3000).fadeOut("slow");
    },
    sessionDisconnected: function (event) {
      if (event.reason == "networkDisconnected") {
        $("#log")
          .css("display", "block")
          .text(
            "No internet connection.Please check and try connecting again."
          );
        $("#log").delay(3000).fadeOut("slow");
      } else {
        $("#log").css("display", "block").text("Disconnected");
        $("#log").delay(3000).fadeOut("slow");
      }
    },

    streamCreated: function (event) {
      var subscriberOptions = {
        insertMode: "append",
        width: "100%",
        height: "100%",
        style: { buttonDisplayMode: "off" },
      };
      subscriber = session.subscribe(
        event.stream,
        "subscribers",
        subscriberOptions,
        handleError
      );

      // var subscriberDisconnectedNotification = document.createElement("div");
      // subscriberDisconnectedNotification.className =
      //   "subscriberDisconnectedNotification";
      // subscriberDisconnectedNotification.innerText =
      //   "Disconnected unexpectedly. Attempting to automatically reconnect...";
      // subscriber.element.appendChild(subscriberDisconnectedNotification);

      // subscriber.on({
      //   disconnected: function (event) {
      //     subscriberDisconnectedNotification.style.visibility = "visible";
      //     $(".subscriberDisconnectedNotification").css({
      //       "z-index": "9999",
      //       "font-color": "#fff",
      //     });
      //   },
      //   connected: function (event) {
      //     subscriberDisconnectedNotification.style.visibility = "hidden";
      //  },
      // });
    },
    // signal: function (event) {
    //   if (event.from == session.connection) {
    //     var fromStr = "from you";
    //   } else {
    //     fromStr = "from another client";
    //   }
    //   var timeStamp = new Date().toLocaleString();
    //   timeStamp = timeStamp.substring(timeStamp.indexOf(",") + 2);
    //   document.getElementById("signals").innerHTML =
    //     timeStamp +
    //     " - Signal received " +
    //     fromStr +
    //     ".<br>" +
    //     document.getElementById("signals").innerHTML;
    // },
  });

  // initialize the publisher
  var publisherOptions = {
    insertMode: "append",
    width: "100%",
    height: "100%",
    style: { buttonDisplayMode: "off" },
  };
  publisher = OT.initPublisher("publisher", publisherOptions, handleError);

  // Connect to the session
  session.connect(token, function callback(error) {
    if (error) {
      handleError(error);
    } else {
      // If the connection is successful, publish the publisher to the session
      session
        .publish(publisher, handleError)
        .on("streamDestroyed", function (event) {
          event.preventDefault();
        });
    }
  });
}

function enabldDisableCamera() {
  if (isShowVideo) {
    session.publish(publisher);
    publisher.publishVideo(true);
    isShowVideo = false;
    $("#btncam i").addClass("bx-video").removeClass("bxs-video-off"); //replace icon
  } else {
    session.unpublish(publisher);
    publisher.publishVideo(false);
    isShowVideo = true;
    $("#btncam i").addClass("bxs-video-off").removeClass("bx-video"); //replace icon
  }
}
function enabldDisableMic() {
  if (isAudioEnable) {
    publisher.publishAudio(true);
    isAudioEnable = false;
    $("#btnMic i").addClass("bx-microphone").removeClass("bxs-microphone-off"); //replace icon
  } else {
    publisher.publishAudio(false);
    isAudioEnable = true;
    $("#btnMic i").addClass("bxs-microphone-off").removeClass("bx-microphone"); //replace icon
  }
}

//======================= end managing Audio/Video communication=======================

function performCall() {
  callPerformed = true;
  PlayCallingSound(false);
  timer = setInterval(countTimer, 1000);
  $("#divCallNow").hide();
  $(".three-icons").show();
}

//============calculate calling time==============
//var timerVar = setInterval(countTimer, 1000);
var totalSeconds = 0;
function countTimer() {
  ++totalSeconds;
  var hour = Math.floor(totalSeconds / 3600);
  var minute = Math.floor((totalSeconds - hour * 3600) / 60);
  var seconds = totalSeconds - (hour * 3600 + minute * 60);
  if (hour < 10) hour = "0" + hour;
  if (minute < 10) minute = "0" + minute;
  if (seconds < 10) seconds = "0" + seconds;
  document.getElementById("timer").innerHTML =
    "Time Duration: " + hour + ":" + minute + ":" + seconds;
  onCallduration = hour + ":" + minute + ":" + seconds;
}

//============calculate calling time==============

function disconnect() {
  //session.disconnect();
  session.off();
  session.disconnect();
  session.unpublish(publisher, handleError);
  publisher.destroy();
  session.unsubscribe(subscriber);

  clearInterval(timer);
  var newCallLoginId;
  if (cLogId == 0 && queId != 0) newCallLoginId = insertedCallLogID;
  else newCallLoginId = cLogId;

  if (callPerformed) UpdateCallLogEndtime(newCallLoginId, onCallduration);
  $(".three-icons").css("display", "none");
  $("#divCallNow").css("display", "block");
  PlayCallingSound(false);
  soc.emit("ClosePatientScreen", {
    username: PatientName,
  });
}

function PlayCallingSound(play) {
  $(
    ' <audio id="chatAudio" loop="loop"><source src="/js/Services/calling.ogg" type="audio/ogg"> <source src="/js/Services/calling.mp3" type="audio/mpeg"><source src="/js/Services/calling.wav" type="audio/wav"></audio>'
  ).appendTo("body");

  var audio = $("#chatAudio");
  if (play == true) audio.get(0).play();
  else $("#chatAudio").remove();
}

// ========prescription modal pop up==========
function ViewPrescription(CallLogId) {
  var url = baseURL + `CallLogs/GetPatientHistory?callLogId=${CallLogId}`;
  $.ajax({
    url: url,
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    type: "GET",
    datatype: "application/json",
    contentType: "application/json; charset=utf-8",
    data: "",
    beforeSend: function () {
      // $.LoadingOverlay("show");
    },
    success: function (data, textStatus, xhr) {
      var PrescTemplate = $("#viewPres-template").html();
      $("#viewprescription").html(Mustache.to_html(PrescTemplate, data));
      $("#viewprescription").modal("show");
    },
    error: function (xhr, textStatus, err) {
      console.log("error");
      if (xhr.status == "500" && xhr.statusText == "InternalServerError")
        console.log(xhr.statusText);
      else console.log(xhr.statusText);
    },
    complete: function (data) {
      // Hide Loading
      // $.LoadingOverlay("hide");
    },
  });
}

//history pop up
function ViewHistory(CallLogId) {
  var url = baseURL + `CallLogs/GetPatientHistory?callLogId=${CallLogId}`;
  $.ajax({
    url: url,
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    type: "GET",
    datatype: "application/json",
    contentType: "application/json; charset=utf-8",
    data: "",
    beforeSend: function () {
      // $.LoadingOverlay("show");
    },
    success: function (data, textStatus, xhr) {
      console.log("success ");
      console.log(data);
      var ViewHistoryTemplate = $("#viewHistory-template").html();
      $("#viewhistory").html(Mustache.to_html(ViewHistoryTemplate, data));
      $("#viewhistory").modal("show");
    },
    error: function (xhr, textStatus, err) {
      console.log("error");
      if (xhr.status == "500" && xhr.statusText == "InternalServerError")
        console.log(xhr.statusText);
      else console.log(xhr.statusText);
    },
    complete: function (data) {
      // Hide Loading
      // $.LoadingOverlay("hide");
    },
  });
}
function PatientHistory(patientId) {
  var url = baseURL + `CallLogs/GetPatientCalllogs?PatientId=${patientId}`;

  // view visit history table
  $.ajax({
    url: url,
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    type: "GET",
    datatype: "application/json",
    contentType: "application/json; charset=utf-8",
    data: "",
    beforeSend: function () {
      $.LoadingOverlay("show");
    },
    success: function (data, textStatus, xhr) {
      var CallLogTableTemplate = $("#call-history-docVideo").html();
      $("#callLogTable").html(Mustache.to_html(CallLogTableTemplate, data));
    },
    error: function (xhr, textStatus, err) {
      if (xhr.status == "500" && xhr.statusText == "InternalServerError")
        console.log(xhr.statusText);
      else console.log(xhr.statusText);
    },
    complete: function (data) {
      // Hide Loading
      $.LoadingOverlay("hide");
    },
  });
}

function checkOnlineStatusandCall(patientId, userType) {
  return new Promise((resolve, reject) => {
    var url =
      baseURL +
      "User/getUserInfo?patientId=" +
      patientId +
      "&userType=" +
      userType;

    $.ajax({
      url: url,
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      type: "GET",
      datatype: "application/json",
      contentType: "application/json; charset=utf-8",
      data: "",
      beforeSend: function () {
        $.LoadingOverlay("show");
      },
      success: function (data, textStatus, xhr) {
        resolve(data);
      },
      error: function (xhr, textStatus, err) {
        reject(err);
      },
      complete: function (data) {
        // Hide Loading
        $.LoadingOverlay("hide");
      },
    });
  });
}

function UpdateQueAddSaveCallLog(CallQueId, status, doctorID, PatientId) {
  var url =
    baseURL +
    "CallQue/UpdateCallQueStatus?CallQueId=" +
    CallQueId +
    "&status=" +
    status;
  var currentDt = new Date().toLocaleDateString("en-US", options);

  var model = {
    DoctorID: doctorID,
    PatientID: PatientId,
    CallQueID: CallQueId,
    AddedBy: doctorID,
    AddedDate: new Date().toLocaleDateString("en-us"),
    CallLogStartDateTime: currentDt,
  };
  $.ajax({
    url: url,
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    type: "POST",
    datatype: "application/json",
    contentType: "application/json; charset=utf-8",
    data: model,
    beforeSend: function () {
      $.LoadingOverlay("show");
    },
    success: function (data, textStatus, xhr) {
      insertedCallLogID = data;
      $.LoadingOverlay("hide");

      // var queTemplate = $("#que-template").html();
      // $("#QueTemplate").html(Mustache.to_html(queTemplate, data));
    },
    error: function (xhr, textStatus, err) {
      if (xhr.status == "500" && xhr.statusText == "InternalServerError")
        console.log(xhr.statusText);
      else console.log(xhr.statusText);
    },
    complete: function (data) {
      // Hide Loading
      $.LoadingOverlay("hide");
    },
  });
}

function GetDoctorNotes(callLogId) {
  var url = baseURL + "CallLogs/GetPatientHistory?callLogId=" + callLogId;

  $.ajax({
    url: url,
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    type: "GET",
    datatype: "application/json",
    contentType: "application/json; charset=utf-8",
    data: "",
    beforeSend: function () {
      $.LoadingOverlay("show");
    },
    success: function (data, textStatus, xhr) {
      $.LoadingOverlay("hide");

      //=========open dialog for update==========
      $("#txtExam").val(data.HistoryAndExam);
      $("#txtAllergies").val(data.Allergies);
      $("#txtDiagnosis").val(data.Diagnosis);
      $("#txtRx").val(data.PatientRX);
      $("#txtName").val(data.PatientName);
      $("#txtMedication").data("kendoEditor").value(d.Medication);
      $("#patientAge").val(data.Age);
    },
    error: function (xhr, textStatus, err) {
      if (xhr.status == "500" && xhr.statusText == "InternalServerError")
        console.log(xhr.statusText);
      else console.log(xhr.statusText);
    },
    complete: function (data) {
      // Hide Loading
      $.LoadingOverlay("hide");
    },
  });
}

function getPatientInfo(PatientId) {
  var url = baseURL + "Patient/GetPatientDetails?PatientId=" + PatientId;

  $.ajax({
    url: url,
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    type: "GET",
    datatype: "application/json",
    contentType: "application/json; charset=utf-8",
    data: "",
    beforeSend: function () {
      $.LoadingOverlay("show");
    },
    success: function (data, textStatus, xhr) {
      $.LoadingOverlay("hide");

      //=========open dialog for update==========
      $("#txtName").val(data.FullName);
      $("#patientAge").val(data.Age);
    },
    error: function (xhr, textStatus, err) {
      if (xhr.status == "500" && xhr.statusText == "InternalServerError")
        console.log(xhr.statusText);
      else console.log(xhr.statusText);
    },
    complete: function (data) {
      // Hide Loading
      $.LoadingOverlay("hide");
    },
  });
}

function updateDoctorNotes(callLogId, status) {
  $(".doctorNotesLoading").show();
  $(".btnSave").prop("disabled", true);
  var url = baseURL + "CallLogs/UpdateCallLog";
  var model = {
    CallLogID: callLogId,
    HistoryAndExam: $("#txtExam").val(),
    Allergies: $("#txtAllergies").val(),
    Diagnosis: $("#txtDiagnosis").val(),
    PatientRX: $("#txtRx").val(),
    callStatus: status,
  };

  $.ajax({
    url: url,
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    type: "Post",
    datatype: "application/json",
    contentType: "application/json; charset=utf-8",
    data: model,
    beforeSend: function () {},
    success: function (data, textStatus, xhr) {
      $(".msg")
        .text("Doctor note addedd successfully")
        .css({ color: "green", "font-weight": "bold" });
    },
    error: function (xhr, textStatus, err) {
      if (xhr.status == "500" && xhr.statusText == "InternalServerError")
        console.log(xhr.statusText);
      else console.log(xhr.statusText);
    },
    complete: function (data) {
      $(".doctorNotesLoading").hide();
      $(".btnSave").prop("disabled", false);

      $(".msg").delay(1000).fadeOut("slow");
    },
  });
}

function updatePrescription(callLogId, age, name, patientId) {
  $(".PrescripeLoading").show();
  $(".btnSaveNSend").prop("disabled", true);
  var url =
    baseURL +
    "CallLogs/UpatePrescription?Age=" +
    age +
    "&PatientId=" +
    patientId;
  var model = {
    CallLogID: callLogId,
    Medication: $("#txtMedication").data("kendoEditor").value(),
    Diagnosis: $("#txtPresDiagnosis").val(),
    prescribeDt: $("#prescribeDT").val(),
    PatientName: name,
    DoctorName: docName,
  };

  $.ajax({
    url: url,
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    type: "POST",
    datatype: "application/json",
    contentType: "application/json; charset=utf-8",
    data: model,
    beforeSend: function () {},
    success: function (data, textStatus, xhr) {
      $(".msgPrescription")
        .text("Prescription addedd successfully")
        .css({ color: "green", "font-weight": "bold" });
    },
    error: function (xhr, textStatus, err) {
      if (xhr.status == "500" && xhr.statusText == "InternalServerError")
        console.log(xhr.statusText);
      else console.log(xhr.statusText);
    },
    complete: function (data) {
      $(".btnSaveNSend").prop("disabled", false);
      $(".PrescripeLoading").hide();
      $(".msgPrescription").delay(1000).fadeOut("slow");
    },
  });
}

function UpdateCallLogEndtime(CallLogId, duration) {
  var currentDt = new Date().toLocaleDateString("en-US", options);

  var url =
    baseURL +
    "CallLogs/UpdateCallLogEndtime?CallLogId=" +
    CallLogId +
    "&Duration=" +
    duration +
    "&CallLogEndDateTime=" +
    currentDt;

  $.ajax({
    url: url,
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    type: "GET",
    datatype: "application/json",
    contentType: "application/json; charset=utf-8",
    data: "",
    beforeSend: function () {
      $.LoadingOverlay("show");
    },
    success: function (data, textStatus, xhr) {},
    error: function (xhr, textStatus, err) {
      if (xhr.status == "500" && xhr.statusText == "InternalServerError")
        console.log(xhr.statusText);
      else console.log(xhr.statusText);
    },
    complete: function (data) {
      $.LoadingOverlay("hide");
    },
  });
}
