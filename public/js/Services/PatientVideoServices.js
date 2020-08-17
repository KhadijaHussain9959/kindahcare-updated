var baseURL = "https://kindahclinic.com/KindahService/";
var urlParams = new URLSearchParams(window.location.search);
var queId = urlParams.get("queId");
var patientId = urlParams.get("patientId");
var docId = urlParams.get("DocId");

$(function () {
  $("#callBtn").click(function () {
    UpdateQueAddSaveCallLog(queId, "Called", docId, patientId);
  });
});

function UpdateQueAddSaveCallLog(CallQueId, status, doctorID, PatientId) {
  var url =
    baseURL +
    "CallQue/UpdateCallQueStatus?CallQueId=" +
    CallQueId +
    "&status=" +
    status;

  var model = {
    DoctorID: doctorID,
    PatientID: PatientId,
    CallQueID: CallQueId,
    AddedBy: doctorID,
    AddedDate: new Date().toLocaleDateString("en-us"),
  };
  $.ajax({
    url: url,
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    type: "GET",
    datatype: "application/json",
    contentType: "application/json; charset=utf-8",
    data: model,
    beforeSend: function () {
      $.LoadingOverlay("show");
    },
    success: function (data, textStatus, xhr) {
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
