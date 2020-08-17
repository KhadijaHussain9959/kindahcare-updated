var height = 369.1845;
var height2 = 195.688;
$(".rightcardContainer").css("display", "none");
$(document).ready(function () {
  $(".slide-left").click(function () {
    $(".slide-left").css("display", "none");
    $(".slide-right").css("display", "unset");
    if ($(window).width() <= 992) {
      $(".doc-pres-card").css("display", "none");
      $(".rightcardContainer").css("display", "none");
      $(".leftcardContainer").removeClass("col-lg-5");
      $(".slide-left").prop("disabled", true);
      $(".slide-right").prop("disabled", false);
    } else {
      // web design
      $(".doc-pres-card").css("display", "none");
      $(".rightcardContainer").css("display", "none");
      $(".leftcardContainer").css("width", "50%");
      $(".self-video").css("height", height);
      $(".leftcardContainer").removeClass("col-lg-7");
      $(".leftcardContainer").animate({ width: "100%" }, 400, "linear");
      $(".self-video").css("height", height);
      $(".caller-video").css("width", height2);

      $(".slide-left").prop("disabled", true);
      $(".slide-right").prop("disabled", false);
    }
  });

  $(".slide-right").click(function () {
    $(".slide-left").css("display", "unset");
    $(".slide-right").css("display", "none");
    if ($(window).width() <= 992) {
      $(".doc-pres-card").css("display", "block");
      $(".rightcardContainer").css("display", "");
      $(".leftcardContainer").addClass("col-lg-7");
      $(".self-video").css("height", height);
      $(".caller-video").css("width", height2);
      $(".slide-right").prop("disabled", true);
      $(".slide-left").prop("disabled", false);
    } else {
      // web design
      $(".leftcardContainer").animate(
        { width: "50%" },
        400,
        "linear",
        function () {
          $(".leftcardContainer").addClass("col-lg-7");
          $(".doc-pres-card").css("display", "block");
          $(".rightcardContainer").css("display", "");
          $(".leftcardContainer").css("width", "100%");
          $(".self-video").css("height", height);
          $(".caller-video").css("width", height2);
          $(".caller-video").css("right", "0%");
          $(".slide-right").prop("disabled", true);
          $(".slide-left").prop("disabled", false);
        }
      );
    }
  });
  $(document).on("click", ".btnViewHistory", function () {
    var CallLogID = $(this).attr("callLogId");
    ViewPatientHistory(CallLogID);
  });

  $(document).on("click", ".btnViewDoctorProfile", function () {
    var doctorID = $(this).attr("doctorID");
    ViewDoctorProfile(doctorID);
  });
}); //===end of document.ready function====

function viewHistory() {
  if (
    document.getElementsByClassName("sideMenuId")[0].style.marginRight == "-50%"
  ) {
    setTimeout(() => {
      document.getElementsByClassName("sideMenuId")[0].style.marginRight = "0%";
    }, 100);
    document.getElementsByClassName("sideMenuId")[0].style.display = "unset";
  } else {
    setTimeout(() => {
      document.getElementsByClassName("sideMenuId")[0].style.display = "none";
    }, 300);
    document.getElementsByClassName("sideMenuId")[0].style.marginRight = "-50%";
  }
}

function viewDocProfile() {
  if (
    document.getElementsByClassName("sideMenuId")[0].style.marginRight == "-60%"
  ) {
    setTimeout(() => {
      document.getElementsByClassName("sideMenuId")[0].style.marginRight = "0%";
    }, 100);
    document.getElementsByClassName("sideMenuId")[0].style.display = "unset";
  } else {
    setTimeout(() => {
      document.getElementsByClassName("sideMenuId")[0].style.display = "none";
    }, 300);
    document.getElementsByClassName("sideMenuId")[0].style.marginRight = "-60%";
  }
}

// Call log jQuery code
var baseURL = "https://kindahclinic.com/KindahService/";
function ViewPatientHistory(CallLogID) {
  var url = baseURL + `CallLogs/GetPatientHistory?callLogId=${CallLogID}`;
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
      var ViewHistoryTemplate = $("#viewPatHistory").html();
      $("#slidePatientHistory").html(
        Mustache.to_html(ViewHistoryTemplate, data)
      );
      viewHistory();
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

// Call log jQuery code

function ViewDoctorProfile(doctorID) {
  var url = baseURL + `Doctor/GetDoctorProfile?doctorId=${doctorID}`;
  $.ajax({
    url: url,
    type: "GET",
    datatype: "application/json",
    contentType: "application/json; charset=utf-8",
    data: "",
    beforeSend: function () {
      // $.LoadingOverlay("show");
    },
    success: function (data, textStatus, xhr) {
      var ViewDoctorProfileTemplate = $("#doctorProfile-template").html();
      $("#slideDocProfile").html(
        Mustache.to_html(ViewDoctorProfileTemplate, data)
      );
      viewHistory();
    },
    error: function (xhr, textStatus, err) {
      console.log("error");
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
