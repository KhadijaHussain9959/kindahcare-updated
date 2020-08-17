var baseURL = "https://kindahclinic.com/KindahService/";

function validtion() {
  $("form").validate({
    rules: {
      email: {
        required: true,
        email: true,
      },
      Password: {
        required: true,
        maxlength: 10,
      },
      FirstName: {
        required: true,
      },
      LastName: {
        required: true,
      },
      Phone: {
        required: true,
        number: true,
      },
    },
    messages: {
      email: {
        required: "this field is required",
        email: "The email should be in the format: abc@domain.tld",
      },
      Password: {
        required: "this field is required",
        maxlength: 10,
      },
      FirstName: {
        required: "this field is required",
      },
      FirstName: {
        required: "this field is required",
      },
      Phone: {
        required: "this field is required",
        number: "Allow only number",
      },
    },
  });
}
$(function () {
  GetAllRegisterDoctor();

  $("#frmDoctor").submit(function (e) {
    e.preventDefault();
    validtion();
    $(".error").css("display", "none");
    CreateDoctor();
  });
}); //====end of $function

//== creat doctor with login
function CreateDoctor() {
  var url = baseURL + "ManageAdmin/SignUp";
  var model = {
    FirstName: $("#txtFirstName").val(),
    LastName: $("#txtFirstName").val(),
    Email: $("#txtEmail").val(),
    Password: $("#txtPassword").val(),
    PhoneNo: $("#txtPhone").val(),
    UserType: "Doctor",
    Gender: $("#dbogender").val(),
  };

  ///==============start post request to add doctor
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
      $.LoadingOverlay("hide");
      if (xhr.status == "406") {
        Swal.fire({
          title: "Opps...!",
          text: "User already Exist ",
          type: "error",
          confirmButtonClass: "btn btn-primary",
          buttonsStyling: false,
          confirmButtonText: "<a style='color:#fff'>OK</a>",
        });
      } else {
        Swal.fire({
          title: "Confirmation!",
          text: "User Created ",
          type: "success",
          confirmButtonClass: "btn btn-primary",
          buttonsStyling: false,
          confirmButtonText: "<a style='color:#fff'>OK</a>",
        }).then((resuut) => {
          window.location.reload();
        });
      }
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
function GetAllRegisterDoctor() {
  var url = baseURL + "Doctor/GetDoctors";
  ///==============start post request to add doctor
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
      var doctorData = data.result;
      Filldatatable(doctorData);
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

function EditDoctorFile(id) {
  var doctorid = $(id).attr("doctorId");
  window.location.href = "KindahDocEditProfile?id=" + doctorid;
}

function Filldatatable(data) {
  $("#tblDoctors").DataTable({
    bAutoWidth: false,
    data: data,
    columns: [
      {
        visible: false,
        data: "DoctorId",
      },

      { data: "FullName" },
      { data: "Specialization" },
      { data: "PhoneNumber" },
      { data: "City" },
      { data: "Cansee:" },

      {
        mRender: function (data, type, row) {
          return (
            '<a href="#" doctorId="' +
            row.DoctorId +
            '" onclick="viewDocProfile(this);" data-toggle="tooltip" data-placement="bottom" title="view Doctor">' +
            '<i class="bx bxs-show call-log-eye-btn"></i>' +
            "</a>" +
            '<a href="#" onclick="EditDoctorFile(this)" doctorId="' +
            row.DoctorId +
            '" data-toggle="tooltip" data-placement="bottom" title="Edit Doctor">' +
            ' <i class="bx bxs-pencil call-log-eye-btn"></i></a>'
          );
        },
      },
    ],
    columnDefs: [
      {
        targets: "_all",
        defaultContent: "",
      },
    ],
    order: [[1, "asc"]],
  });
}
