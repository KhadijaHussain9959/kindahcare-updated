const express = require("express");
const router = express.Router();

const KindahController = require("../Controller/controllers.js");
const isAuth = require("../middleware/is-Auth.js");

//index page
router.get("/", KindahController.getHomePage);

//admin routes

router.get("/KindahAdmin", KindahController.getkindahAdmin);

router.get("/KindahCreateDoctor", KindahController.getkindahCreateDoctor);

router.get("/KindahGetAllDoctors", KindahController.getkindahGetAllDoctors);

router.get("/KindahDocEditProfile", KindahController.getDoctorEditProfile);
// Patient Routes

router.get(
  "/patientAppointments",
  isAuth.isAuthorization,
  KindahController.getPatientAppointments
);

router.get(
  "/patientDashboard",
  isAuth.isAuthorization,
  KindahController.getPatientDashboard
);

router.get(
  "/patientVideo",
  isAuth.isAuthorization,
  KindahController.getPatientVideo
);

router.get(
  "/patientReqAppointment/:DoctorId?/:DocName?/:date?/:appId?",
  isAuth.isAuthorization,
  KindahController.getPatientReqAppointment
);

//Doctor Routes

router.get(
  "/docCallLog",
  isAuth.isAuthorization,
  KindahController.getDoctorCallLog
);

router.get(
  "/docCallQueue",
  isAuth.isAuthorization,
  KindahController.getDoctorCallQueue
);

router.get(
  "/docDashboard",
  isAuth.isAuthorization,
  KindahController.getDoctorDashboard
);

router.get(
  "/docAppointments",
  isAuth.isAuthorization,
  KindahController.getDoctorAppointments
);

router.get(
  "/kindahPatients",
  isAuth.isAuthorization,
  KindahController.getKindahPatients
);

//====test vidoe call page=======
router.get(
  "/videocall",
  isAuth.isAuthorization,
  KindahController.getDoctorvideocall
);

router.get(
  "/docVideoCall/:queId?/:patientId?/:patientName?/:DocId?/:docName?/:userLoginId?",
  isAuth.isAuthorization,
  KindahController.getDoctorVideoCall
);

router.get(
  "/docViewProfile",
  isAuth.isAuthorization,
  KindahController.getDoctorViewProfile
);
// video page
// router.get("/public/video", (req, res, next) => {
//   res.sendFile(path.join(__dirname, "../", "public", "video.html"));
// });

module.exports = router;
