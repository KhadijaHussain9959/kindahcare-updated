var baseURL = "https://kindahclinic.com/KindahService/";
//var baseURL = "http://localhost:1042/KindahService/";
var modelDetails;
var hdnUserType = $("#hdnUserType").val();

//==login==========
$(function () {
  $("#frmforgotpwd").submit(function (e) {
    e.preventDefault();

    var url =
      baseURL +
      "User/ForGotPassword?criteria=" +
      encodeURIComponent($("#txtEmailPhone").val()) +
      "&pageName=forgotPassword" +
      "&pageUrl=" +
      window.location.href;
    var endcodeUri = encodeURI(url);
    $.ajax({
      url: endcodeUri,
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      type: "GET",
      datatype: "application/json",
      contentType: "application/json; charset=utf-8",
      data: "",
      beforeSend: function () {
        //Show Loading if validate pass
        $.LoadingOverlay("show");
      },
      success: function (data, textStatus, xhr) {
        Swal.fire({
          title: "Password sent...!",
          text: "Password sent to your email and registerd phoneNumber",
          type: "success",
          confirmButtonClass: "btn btn-primary",
          buttonsStyling: false,
          confirmButtonText: "Ok",
        });
      },

      error: function (xhr, textStatus, err) {
        if (xhr.status == "500" && xhr.statusText == "InternalServerError")
          $(".error").show().text("Server not respose. Please agan later");
        else if (xhr.status == "404" && xhr.statusText == "Not Found") {
          Swal.fire({
            type: "error",
            title: "Oops...",
            html:
              "User doest not exist <br> <b >" +
              $("#txtEmailPhone").val() +
              "</b><br> ",
          });
        }
      },
      complete: function (data) {
        // Hide Loading
        $.LoadingOverlay("hide");
        if (data.statusText == "error")
          $(".error").show().text("No response from server");
      },
    });
  }); //==end of Loginform submit

  //========SignUp=============
  $("#frmSignUp").submit(function (e) {
    e.preventDefault();

    //  Validate requried fileds
    validtion();
    var model = {
      FirstName: $("#txtFirstName").val(),
      LastName: $("#txtLastName").val(),
      FullName: $("#txtFirstName").val() + " " + $("#txtLastName").val(),
      Email: $("#txtEmail").val(),
      Password: $("#txtPassword").val(),
      PhoneNo: $("input:disabled").val() + "" + $("#txtPhoneNo").val(),
      UserType: hdnUserType == "patient" ? "Patient" : $("#dboUserType").val(),
      pageName: "Signup",
      pageUrl: window.location.href,
    };

    var url = baseURL + "User/SignUp";

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
        //Show Loading if validate pass
        $.LoadingOverlay("show");
      },
      success: function (d, textStatus, xhr) {
        $(".error").hide();
        //=====intiliaze details to add patient when OTP verified
        if (hdnUserType == "patient") {
          modelDetails = {
            PatientId: d.UserRefId,
            FirstName: d.FirstName,
            LastName: d.LastName,
            PhoneNo: d.PhoneNo,
            FullName: d.FullName,
            Gender: "F",
          };
        } else {
          modelDetails = {
            DoctorId: d.UserRefId,
            FirstName: d.FirstName,
            LastName: d.LastName,
            FullName: d.FullName,
            PhoneNumber: d.PhoneNo,
          };
        }
        $("#primary").modal("show");
      },
      error: function (xhr, textStatus, err) {
        console.log(JSON.stringify(xhr));
      },
      complete: function (data) {
        // Hide Loading
        $.LoadingOverlay("hide");
        if (data.statusText == "error")
          $(".error").show().text("No response from server");
      },
    });
  });
  //========end of SignUp=============

  //====start of one time password varification=====
  $("#btnOTPVerify").on("click", function () {
    var url =
      hdnUserType == "patient"
        ? baseURL + "Patient/AddPatient"
        : baseURL + "Doctor/AddDoctor";

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
        //Show Loading if validate pass
        $.LoadingOverlay("show");
      },
      success: function (d, textStatus, xhr) {
        if (xhr.status == 200) {
          Swal.fire({
            title: "Congratulations",
            text: "Click on button Login to Access your Account",
            type: "success",
            confirmButtonClass: "btn btn-primary",
            buttonsStyling: false,
            confirmButtonText: "<a style='color:#fff'>OK</a>",
          }).then(function () {
            if (hdnUserType == "patient") window.location.href = "/Login";
            else window.location.reload();
          });
        }
        //=====intiliaze patientModel to add patient
      },
      error: function (xhr, textStatus, err) {
        if (xhr.status == "404" && xhr.statusText == "NotFound") {
          Swal.fire({
            title: "Error!",
            text: "Check your Email and Enter the Code Again ",
            type: "error",
            confirmButtonClass: "btn btn-primary",
            buttonsStyling: false,
            confirmButtonText: "<a style='color:#fff'>OK</a>",
          });
        }
      },
      complete: function (data) {
        // Hide Loading
        $.LoadingOverlay("hide");
      },
    });
  }); //====end of one time password verification=======
}); //==end of jquery $function
