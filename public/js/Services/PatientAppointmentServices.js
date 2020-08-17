var baseURL = "https://kindahclinic.com/KindahService/";
var userLoginId = $(".user-name").attr("UserInfo");
var appointmentId = 0;
var doctorId = 0;
var PageName = window.location.pathname;
var PageUrl = window.location.href;

var options = {
  year: "numeric",
  month: "numeric",
  day: "numeric",
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
};
var currentDt = new Date().toLocaleDateString("en-US", options);

$(function () {
  GetPatientAppointment(userLoginId);
  $(document).on("click", ".btnMain", function () {
    appointmentId = $(this).attr("appId");
    doctorId = $(this).attr("doctorId");
    $("#primary").modal("show");
  });

  $(".btnConfirm").click(function () {
    CancelAppointment(appointmentId, userLoginId, doctorId, PageName, PageUrl)
      .then((date) => {
        GetPatientAppointment(userLoginId);
      })
      .catch((error) => {
        console.log(error);
      });
  });
});

//== get Patient appointments
function GetPatientAppointment(patientId) {
  var url =
    baseURL + "Appointments/GetPatientAppointment?patientId=" + patientId; ///==============start post request to book appointment
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
      var slotTemplate = $("#appointment-template").html();
      $("#appointments").html(Mustache.to_html(slotTemplate, data));
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

//== get Patient appointments
function CancelAppointment(
  appointmentDetailsId,
  patientId,
  doctorId,
  pageName,
  pageUrl
) {
  $("#primary").modal("hide");
  return new Promise((resolve, reject) => {
    var url =
      baseURL +
      "Appointments/CancelAppointment?status=Vacant" +
      "&appointmentId=" +
      appointmentDetailsId +
      "&patientId=" +
      patientId +
      "&doctorId=" +
      doctorId +
      "&pageName=" +
      pageName +
      "&pageUrl=" +
      pageUrl;

    ///==============start post request to book appointment
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
        resolve(data);
      },
      error: function (xhr, textStatus, err) {
        reject(err);
      },
      complete: function (data) {
        // Hide Loading
        // $.LoadingOverlay("hide");
      },
    });
  }); //end of promises
}

//====date formater by using mustache=====
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
};
