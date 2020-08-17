var baseURL = "https://kindahclinic.com/KindahService/";
var useLoginId = $(".user-name").attr("UserInfo");

$(function () {
  GetAllDoctorCallLog(useLoginId);
});

function GetAllDoctorCallLog(userId) {
  var url =
    baseURL +
    `CallLogs/GetDoctorRecentCallLog?doctorId=${userId}&status=Completed`;

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
      var CallLogTemplate = $("#callLog-template").html();
      $("#callLogId").html(Mustache.to_html(CallLogTemplate, data));
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
