const express   = require('express');
const router = express.Router();
//const login = require("./login")
const program = require("./program")
//const management = require("./management")
const programResult = require("./programResult")
const updateDelete = require("./updateDelete")
const insertForm = require("./insertForm")
const yearMonthResult = require("./yearMonthResult")
const searchProgramResult = require("./searchProgramResult")
const insertOperation = require("./insertOperation")
const programMng = require("./programMng")
const teacherMng = require("./teacherMng")
const userTemp = require("./userTemp")
const programTable = require("./programTable")
const excelData = require("./excelData")
const test = require("./test")


//router.use(login);
router.use("/program", program);
router.use("/test", test);

// Comment out the management route
//router.use("/management", management);

router.use("/programResult", programResult);
router.use("/updateDelete", updateDelete);
router.use("/insertForm", insertForm);
router.use("/yearMonthResult", yearMonthResult);
router.use("/searchProgramResult", searchProgramResult);
router.use("/insertOperation", insertOperation);
router.use("/programMng", programMng);
router.use("/teacherMng", teacherMng);
router.use("/userTemp", userTemp);
router.use("/programTable", programTable);
router.use("/excelData", excelData);



//router.use("/test", test);


module.exports = router;