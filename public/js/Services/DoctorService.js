var baseURL = "https://kindahclinic.com/KindahService/";
//var baseURL = "http://localhost:1042/KindahService/";
var useLoginId = $(".user-name").attr("UserInfo");

var options = {
  year: "numeric",
  month: "numeric",
  day: "numeric",
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
};
var currentDt = new Date().toLocaleDateString("en-US", options);

//==login==========
$(function () {
  GetDoctors(false)
    .then((data) => {
      SetDoctorsList(data);
    })
    .catch((error) => {
      console.log(error);
    });

  $(document).on("click", ".btnSencCallReq", function () {
    var doctorId = $(this).attr("docID");
    var fullName = $(this).attr("fullName");

    CheckIFcalledBefore(doctorId, useLoginId)
      .then((data) => {
        if (data > 0) {
          Swal.fire({
            type: "error",
            title: "Oops...",
            text: "Your's today call already pending",
            confirmButtonClass: "btn btn-primary",
            buttonsStyling: false,
            confirmButtonText: "Ok",
          });
        } else SendCallRequestToDoctor(doctorId, fullName);
      })
      .catch((error) => {
        console.log(error);
      });
  });

  $(document).on("click", ".btndoctorProfile", function () {
    var doctorId = $(this).attr("docID");
    GetDoctorsProfile(doctorId);
  });

  soc.emit("UpdatePatientOnlineStatus", { uID: useLoginId, status: "Online" });
}); //==end of jquery $function

function CheckIFcalledBefore(doctorId, patientId) {
  return new Promise((resolve, reject) => {
    var currentDt = new Date().toLocaleDateString("en-US");
    var url =
      baseURL +
      "CallQue/CheckIfCallQuesExist?doctorID=" +
      doctorId +
      "&patiendId=" +
      patientId +
      "&date=" +
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
      success: function (data, textStatus, xhr) {
        resolve(data);
        $.LoadingOverlay("hide");
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

function SetDoctorsList(data) {
  var Usertemplate = $("#user-template").html();
  $("#doctorList").html(Mustache.to_html(Usertemplate, data));
}
function GetDoctors(isSync) {
  return new Promise((resolve, reject) => {
    var url = baseURL + "Doctor/GetDoctors";

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
        if (!isSync) $.LoadingOverlay("show");
      },
      success: function (data, textStatus, xhr) {
        $.LoadingOverlay("hide");
        resolve(data);
        // var Usertemplate = $("#user-template").html();
        // $("#doctorList").html(Mustache.to_html(Usertemplate, data));
      },
      error: function (xhr, textStatus, err) {
        reject(err);
        // if (xhr.status == "500" && xhr.statusText == "InternalServerError")
        //   console.log(xhr.statusText);
        // else console.log(xhr.statusText);
      },
      complete: function (data) {
        // Hide Loading
        $.LoadingOverlay("hide");
      },
    });
  });
}

function SendCallRequestToDoctor(doctorId, fullName) {
  var currentDt = new Date().toLocaleDateString("en-US", options);
  var url =
    baseURL +
    "PatientCallRequest/SendRequestCallToDoctor?PatientID=" +
    useLoginId +
    "&DoctorID=" +
    doctorId +
    "&RequestStatus=Pending" +
    "&date=" +
    currentDt;

  //=======  set post model=========
  var model = {
    PatientID: useLoginId, //==get from session
    DoctorID: doctorId,
    RequestStatus: "Pending",
  };

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
      $("#reqcall").modal("show");
      setTimeout(function () {
        $("#reqcall").modal("hide");
      }, 3000);

      //======== send notification to doctor for callRequest
      soc.emit("NotifyDoctor", {
        username: fullName, // get doctorUsername from session
        docId: doctorId,
      });
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

function GetDoctorsProfile(doctorId) {
  var url = baseURL + "Doctor/GetDoctorProfile?doctorId=" + doctorId;
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
      var profileTemplate = $("#docProfile-template").html();
      $("#primary").html(Mustache.to_html(profileTemplate, data));
      $("#primary").modal("show");
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

function updateDoctorOnlineStatus(UserID, status) {
  return new Promise((resolve, reject) => {
    var useStatus = status == "Online" ? true : false;
    var url =
      baseURL +
      "User/UpdateUserOnlineStatus?userId=" +
      UserID +
      "&Onlinestatus=" +
      useStatus +
      "&userType=Doctor";

    $.ajax({
      url: url,
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      type: "GET",
      datatype: "application/json",
      contentType: "application/json; charset=utf-8",
      data: "",
      beforeSend: function () {},
      success: function (data, textStatus, xhr) {
        resolve(data);
      },
      error: function (xhr, textStatus, err) {
        reject(err);
      },
      complete: function (data) {
        // Hide Loading
      },
    });
  })
    .then((date) => {
      GetDoctors(true);
    })
    .catch((error) => {
      console.log(error);
    });
}

Mustache.Formatters = {
  date: function (str) {
    var options = {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    };
    return new Date(str).toLocaleDateString("en-US", options);
  },
  Upper: function (str) {
    return str.toUpperCase();
  },
};
