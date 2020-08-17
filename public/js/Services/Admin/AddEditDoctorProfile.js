var baseURL = "https://kindahclinic.com/KindahService/";

var urlParams = new URLSearchParams(window.location.search);
var doctorId = 0;
var doctorId = urlParams.get("id");
if (urlParams.has("id")) doctorId = urlParams.get("id");

$(function () {
  $("#txtbioGraphy").kendoEditor({
    resizable: {
      content: false,
      toolbar: true,
    },
  });

  GetDoctorsProfile(doctorId);
  $("#frmDoctorProfile").submit(function (e) {
    e.preventDefault();
    AddEditDoctorProfile(doctorId);
  });
});

function SetDoctorProfile(d) {
  //====check if profile picture is exist then display dummy image
  var div = document.createElement("div");
  if (d.ProfilePicture != null) {
    div.innerHTML =
      "<img class='thumbnail' src='" +
      d.ProfilePicture +
      "'" +
      "title='ProfilePicture'/>";
  } else {
    div.innerHTML = "<img class='thumbnail' src='/assets/images/maledoc.png'/>";
  }
  //=========set image control============
  $("#result").html(div);

  $("#txtUname").val(d.Email);
  $("#hdnpassword").val(d.password);
  $("#txtFname").val(d.FirstName);
  $("#txtLname").val(d.LastName);
  $("#txtbioGraphy").data("kendoEditor").value(d.Biography);
  $("#txtPno").val(d.PhoneNumber);
  $("#dbogender option:contains(" + d.Gender + ")").attr(
    "selected",
    "selected"
  );
  $("#txtClinicName").val(d.ClinicName);
  $("#clinicAddress").val(d.ClinicAddress);
  $("#txtAddress1").val(d.Address);
  $("#txtAddress2").val(d.AddressLine1);
  $("#dboCountry option:contains(" + d.Country + ")").attr(
    "selected",
    "selected"
  );
  $("#txtState option:contains(" + d.State + ")").attr("selected", "selected");
  $("#dboCity").val(d.City).change();
  $("#txtServices").val(d.Services);
  $("#txtspe option:contains(" + d.Specialization + ")").attr(
    "selected",
    "selected"
  );
  $("#CallLimt option:contains(" + d.DoctorCall_Limit + ")").attr(
    "selected",
    "selected"
  );

  $("#txtAward").val(d.Award);
  $("#CallLimt option:contains(" + d.DoctorCall_Limit + ")").attr(
    "selected",
    "selected"
  );
  $("#txtAwarYear option:contains(" + d.AwardYear + ")").attr(
    "selected",
    "selected"
  );

  //====set hospital information=====
  setDoctorExperiance(d.DoctorExperianceModel);

  //===========set doctor education
  setDoctorEducation(d.DoctorEducationsModel);
}

function setDoctorExperiance(data) {
  $.each(data, function (ind, val) {
    $("#txtHospital").val(val.HospitalName);
    //$("#txtTo").val(formatDt);
    // $("#txtFrom").val(val.From);
    $("#txtDesignation").val(val.Designation);
  });
}

function setDoctorEducation(data) {
  $.each(data, function (ind, val) {
    $("#txtDegree").val(val.Degree);
    $("#dboYear option:contains(" + val.YearsOfCompletion + ")").attr(
      "selected",
      "selected"
    );
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
      SetDoctorProfile(data);
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

function AddEditDoctorProfile(doctorId) {
  var url = baseURL + "Doctor/AddUpdateDoctorProfile";

  var modelDetails = new Object();
  var DoctorEducationsModel = new Array();
  DoctorEducationsModel.push({
    Degree: $("#txtDegree").val(),
    YearsOfCompletion: jQuery("#dboYear option:selected").text(),
  });

  console.log(JSON.stringify(DoctorEducationsModel));
  var DoctorExperianceModel = new Array();
  DoctorExperianceModel.push({
    HospitalName: $("#txtHospital").val(),
    From: $("#txtTo").val(),
    To: $("#txtTo").val(),
    Designation: $("#txtDesignation").val(),
  });

  //modelDetails.push({
  modelDetails.DoctorId = doctorId;
  modelDetails.FirstName = $("#txtFname").val();
  modelDetails.LastName = $("#txtLname").val();
  modelDetails.FullName = $("#txtFname").val() + " " + $("#txtLname").val();
  modelDetails.Specialization = jQuery("#txtspe option:selected").text();
  modelDetails.Services = $("#txtServices").val();
  modelDetails.Gender = jQuery("#dbogender option:selected").text();
  modelDetails.MemberShipID = 1;
  modelDetails.Biography = $("#txtbioGraphy").data("kendoEditor").value();
  modelDetails.ClinicName = $("#txtClinicName").val();
  modelDetails.ClinicAddress = $("#clinicAddress").val();
  modelDetails.ClinicPhotoPath = "";
  modelDetails.Address = $("#txtAddress1").val();
  modelDetails.AddressLine1 = $("#txtAddress2").val();
  modelDetails.City = jQuery("#dboCity option:selected").text();
  modelDetails.Country = jQuery("#dboCountry option:selected").text();
  modelDetails.Title = "";
  modelDetails.ProfilePicture = $(".thumbnail").attr("src");
  modelDetails.Cansee = "Adult";
  modelDetails.DoctorSignature = "";
  modelDetails.DoctorCall_Limit = jQuery("#CallLimt option:selected").text(); // $("#CallLimt").val();
  modelDetails.Award = $("#txtAward").val();
  modelDetails.AwardYear = jQuery("#txtAwarYear option:selected").text();
  modelDetails.DoctorEducations = DoctorEducationsModel;
  modelDetails.DoctorExperiance = DoctorExperianceModel;
  //});

  $.ajax({
    url: url,
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    type: "POST",
    datatype: "application/json",
    contentType: "application/json; charset=utf-8",
    data: modelDetails,
    beforeSend: function () {
      $.LoadingOverlay("show");
    },
    success: function (data, textStatus, xhr) {
      $.LoadingOverlay("hide");
      Swal.fire({
        title: "Confirmation!",
        text: "Doctor Profile Created ",
        type: "success",
        confirmButtonClass: "btn btn-primary",
        buttonsStyling: false,
        confirmButtonText: "Ok",
      }).then((result) => {
        window.location.reload();
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
