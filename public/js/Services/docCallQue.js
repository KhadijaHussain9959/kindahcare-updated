var baseURL = "https://kindahclinic.com/KindahService/";
var useLoginId = $(".user-name").attr("UserInfo");
var d = new Date();

$(function () {
  GetDoctorTodayCallQue(useLoginId);
});

function GetDoctorTodayCallQue(doctorId) {
  var url =
    baseURL +
    `CallQue/GetCallQue?doctorId=${doctorId}&date=${
      d.getMonth() + 1
    }/${d.getDate()}/${d.getFullYear()}`;

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
      var CallQueueTemplate = $("#callQueue-template").html();
      $("#callQueueId").html(Mustache.to_html(CallQueueTemplate, data));
    },
    error: function (xhr, textStatus, err) {
      if (xhr.status == "500" && xhr.statusText == "InternalServerError")
        console.log(xhr.statusText);
      else console.log(xhr.statusText);
    },
    complete: function (data) {
      updateClock();
      // Hide Loading
      $.LoadingOverlay("hide");
    },
  });
}

var timer;
function updateClock() {
  $(".spnWaitingTime").each(function () {
    var dtCalllQue = $(this).siblings(".hdnCallQueDate").val();

    var startDateTime = new Date(dtCalllQue); // YYYY (M-1) D H m s ms (start time and date from DB)
    var startStamp = startDateTime.getTime();

    var newDate = new Date();
    var newStamp = newDate.getTime();

    newDate = new Date();
    newStamp = newDate.getTime();
    var diff = Math.round((newStamp - startStamp) / 1000);

    var d = Math.floor(
      diff / (24 * 60 * 60)
    ); /* though I hope she won't be working for consecutive days :) */
    diff = diff - d * 24 * 60 * 60;
    var h = Math.floor(diff / (60 * 60));
    diff = diff - h * 60 * 60;
    var m = Math.floor(diff / 60);
    diff = diff - m * 60;
    var s = diff;

    $(this).text(m + " min " + s + " sec");
  });
}
timer = setInterval(updateClock, 1000);
