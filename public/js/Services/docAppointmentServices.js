var baseURL = "https://kindahclinic.com/KindahService/";
//var baseURL = "http://localhost:1042/KindahService/";
var useLoginId = $(".user-name").attr("UserInfo");
var UserName = $(".user-name").text();

$(function () {
  var currentDt = kendo.toString(new Date(), "d");
  GetDoctorAllSlots(useLoginId, currentDt);

  $("#btnSave").click(function () {
    $("#dtFrom").css("border", "none");
    $("#toDT").css("border", "none");
    if (Validation()) {
      if (!ConfilictValidation()) return false;
      else {
        //===generate slots for selected weekDays===
        var slots = GenerateDoctorSlots();
        //======send generated slots to service to create scheduled=====
        createDoctorScheduled(slots);
      }
    }
  }); //====end of btnsave click====================
  //======start calender funtions =====================
  $("#scheduler").kendoCalendar({
    value: new Date(),
    change: function () {
      var selectedDate = kendo.toString(this.value(), "d");
      GetDoctorAllSlots(useLoginId, selectedDate);
      //==============change Edit popup date on calender change========
      var options = {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      };
      $(".sch-app-head").html(
        "<span>" + new Date().toLocaleDateString("en-US", options + "</span>")
      );
    },
  });

  $(document).on("click", ".btnDelete", function () {
    var appointmentId = $(this).attr("appDetailId");
    var PatientID = $(this).attr("PatientID");
    var DoctorId = $(this).attr("DoctorId");
    var PageName = window.location.pathname;
    var PageUrl = window.location.href;
    var calendar = $("#scheduler").data("kendoCalendar");

    CancelAppointment(appointmentId, PatientID, DoctorId, PageName, PageUrl)
      .then((date) => {
        calendar.trigger("change");
      })
      .catch((error) => {
        console.log(error);
      });
  });

  $(document).on("click", ".btnViewDetail", function () {
    var patientId = $(this).attr("PatientId");
    ViewBookingDetails(patientId);
  });
}); //=====end of $(function)=====

//=====validate any day of shift 1 confilict with any day of shift 2================
function ConfilictValidation() {
  var result = true;
  var allCheckedShift1 = $("#Shift1").find("input[type='checkbox']:checked");
  var allCheckedShift2 = $("#Shift2").find("input[type='checkbox']:checked");
  $("#Shift1, #Shift2").find("input[type='text']").css("border", "none");

  $.each(allCheckedShift1, function (ind, val) {
    var shift1Parent = $(this).parents("div.sch-app");
    var shift2Txtbox = shift1Parent.find(".txtEnd");
    var shift1Element = shift1Parent.find(".txtEnd").val().split(":");
    var shift1Hours = shift1Element[0];
    var shift1Min = shift1Element[1];
    var Shift1dayName = $(this).attr("cls");

    var Shift1Checkbox = $("#Shift1").find(
      "input[cls='" + Shift1dayName + "']"
    );
    var Shift2Checkbox = $("#Shift2").find(
      "input[cls='" + Shift1dayName + "']"
    );

    if (allCheckedShift2.length > 0 && Shift2Checkbox.prop("checked")) {
      var shift2Parent = Shift2Checkbox.parents("div.sch-app");
      var shift1Txtbox = shift2Parent.find(".txtStart");
      var shift2Element = shift2Parent.find(".txtStart").val().split(":");
      var shift2Hours = shift2Element[0];
      var shift2Min = shift2Element[1];
      if (parseInt(shift1Hours) > parseInt(shift2Hours)) {
        alert(Shift1dayName + " schduleded is conflicted");
        //========highLight conflicted day========
        shift2Txtbox.css("border", "1px solid red");
        shift1Txtbox.css("border", "1px solid red");
        result = false;
      } else result = true;
    }
  });
  return result;
}

function Validation() {
  var chkShift1 = $("#Shift1").find("input[type='checkbox']:checked").length;
  var chkShift2 = $("#Shift2").find("input[type='checkbox']:checked").length;

  if ($("#dtFrom").val() == "") {
    $("#dtFrom").css("border", "1px solid red");
    return false;
  } else if ($("#toDT").val() == "") {
    $("#toDT").css("border", "1px solid red");
    return false;
  } else if ($("#toDT").val() == "") {
    $("#toDT").css("border", "1px solid red");
    return false;
  } else if (chkShift1 == 0 && chkShift2 == 0) {
    alert("Please create at least one shift");
    return false;
  } else return true;
}
// ======calculate a appointment time of slot as per selected interval
function getIntervals(startString, endString, intervalString) {
  var start = startString.split(":");
  var end = endString.split(":");
  var interval = intervalString;
  startInMinutes = start[0] * 60 + start[1] * 1;
  endInMinutes = end[0] * 60 + end[1] * 1;
  intervalInMinutes = interval * 1;
  var times = [];
  var intervalsOfTime = [];

  for (var i = startInMinutes; i <= endInMinutes; i += intervalInMinutes) {
    var hour = Math.floor(i / 60) + "";
    var minute = (i % 60) + "";
    minute = minute.length < 2 ? "0" + minute : minute;
    hour = hour.length < 2 ? "0" + hour : hour;
    times.push(hour + ":" + minute);
  }

  for (var i = 0; i < times.length - 1; i++)
    intervalsOfTime.push(times[i] + " - " + times[i + 1]);

  return intervalsOfTime;
}
//===create scheduled for doctor-========
function GenerateDoctorSlots() {
  var Appointments = new Array();

  // =======get date range=====
  var fromDt = new Date($("#dtFrom").val());
  var toDt = new Date($("#toDT").val());

  var newend = toDt.setDate(toDt.getDate() + 1);
  var end = new Date(newend);

  //=====loop through each day=======
  while (fromDt < toDt) {
    //====ge day name for each date==========
    var dayName = moment(fromDt).format("dddd");

    //=====match day with each shift1 and shift2 checkBox's checked day=======
    var shift1Day = $("#Shift1").find("input." + dayName);
    var shift2Day = $("#Shift2").find("input." + dayName);
    var AppointmentsDetails = new Array();

    //======if checkboxes is checked from shift 1======
    if (shift1Day.prop("checked")) {
      var shift1parnt = shift1Day.parents("div.sch-app");

      //=====get slots as per selected interval/slot time from shift 1
      var slotShift1 = getIntervals(
        shift1parnt.find("input.txtStart").val(),
        shift1parnt.find("input.txtEnd").val(),
        $("#Slot-time option:selected").val()
      );

      for (var i in slotShift1)
        if (slotShift1.hasOwnProperty(i)) {
          var slots = slotShift1[i].split("-");
          AppointmentsDetails.push({
            AppointmentStatus: "Vacant",
            AppointmentStartTime: slots[0],
            AppointmentEndTime: slots[1],
            AddedDate: new Date().toLocaleDateString("en-us"),
            AddedBy: useLoginId,
            isActive: true,
          });
        }
    } //end of shift1Day====

    //======if checkboxes is checked from shift 2======
    if (shift2Day.prop("checked")) {
      var shift2parnt = shift2Day.parents("div.sch-app");

      //=====get slots as per selected interval/slot time from shift 2
      var slotShift2 = getIntervals(
        shift2parnt.find("input.txtStart").val(),
        shift2parnt.find("input.txtEnd").val(),
        $("#Slot-time option:selected").val()
      );

      for (var i in slotShift2)
        if (slotShift2.hasOwnProperty(i)) {
          var slots = slotShift2[i].split("-");
          AppointmentsDetails.push({
            AppointmentStatus: "Vacant",
            AppointmentStartTime: slots[0],
            AppointmentEndTime: slots[1],
            AddedDate: new Date().toLocaleDateString("en-us"),
            AddedBy: useLoginId,
            isActive: true,
          });
        }
    } //end of shift2Day====

    //=============create list for appointments with sots====
    Appointments.push({
      DoctorId: parseInt(useLoginId),
      AppointmentDate: fromDt.toLocaleDateString("en-us"),
      Shifts: "1",
      AddedBy: useLoginId,
      AddedDate: new Date().toLocaleDateString("en-us"),
      ModifiedDate: "1",
      ModifiedBy: "1",
      isActive: true,
      AppointmentsDetails: AppointmentsDetails,
    });

    var newDate = fromDt.setDate(fromDt.getDate() + 1);
    fromDt = new Date(newDate);
  } //===end of while loop
  return Appointments;
}

function ConcatinateArray(jsonArray) {
  var conflictDt = "";
  for (var i = 0; i < jsonArray.length; i++) {
    conflictDt +=
      "[" +
      jsonArray[i].selecteDt +
      ":" +
      jsonArray[i].slotStartTime +
      "-" +
      jsonArray[i].slotEndTime +
      "]" +
      ",";
  }
  return conflictDt;
}

function createDoctorScheduled(Appointments) {
  var app = {
    Appointments: Appointments,
  };
  var url = baseURL + "Appointments/CreateDoctorSchedule";
  $.ajax({
    url: url,
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    type: "POST",
    datatype: "application/json",
    contentType: "application/json; charset=utf-8",
    data: app,
    beforeSend: function () {
      $.LoadingOverlay("show");
    },
    success: function (data, textStatus, xhr) {
      $.LoadingOverlay("hide");
      console.log(data);

      Swal.fire({
        title: "Confirmation!",
        text: "Scheduled created ",
        type: "success",
        confirmButtonClass: "btn btn-primary",
        buttonsStyling: false,
        confirmButtonText: "Ok",
      }).then((result) => {
        window.location.reload();
      });
    },
    error: function (xhr, textStatus, err) {
      console.log();

      if (xhr.status == "409" && xhr.statusText == "Conflict") {
        var conflictDt = ConcatinateArray(xhr.responseJSON);
        Swal.fire({
          type: "error",
          title: "Oops...",
          html:
            "<div class='ConflictedDtError'>Your these date are conflicted <br> <b>" +
            conflictDt +
            "</b><br> " +
            "Please select another date </div>",
        });
      } else {
        Swal.fire({
          title: "Opps...!",
          text: xhr.statusText,
          type: "error",
          confirmButtonClass: "btn btn-primary",
          buttonsStyling: false,
          confirmButtonText: "Ok",
        });
      }
      $.LoadingOverlay("hide");
    },
    complete: function (data) {
      // Hide Loading
      $.LoadingOverlay("hide");
    },
  });
}

function GetDoctorAllSlots(DoctorId, date) {
  var url =
    baseURL +
    "Appointments/GetDoctorAllSlots?DoctorId=" +
    DoctorId +
    "&date=" +
    date;

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
      //=====set values for slots templates======
      var slotTemplate = $("#slots-template").html();
      $("#doctorSlots").html(Mustache.to_html(slotTemplate, data));
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
  return new Promise((resolve, reject) => {
    var url =
      baseURL +
      "Appointments/CancelAppointment?status=Cancelled" +
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
        $.LoadingOverlay("show");
      },
      success: function (data, textStatus, xhr) {
        $.LoadingOverlay("hide");

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
  }); //end of promises
}

function ViewBookingDetails(PatientId) {
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
      //=====set values for slots templates======
      var bookDetails = $("#BookingDetail-Template").html();
      $("#bookDetails").html(Mustache.to_html(bookDetails, data));
      $("#ModelDetails").modal("show");
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
