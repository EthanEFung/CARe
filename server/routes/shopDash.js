const router = require("express").Router();
const controller = require("../controllers/shopDashCtrl");

<<<<<<< HEAD
<<<<<<< HEAD
<<<<<<< HEAD
<<<<<<< HEAD
=======
>>>>>>> 81ea3afcd55040922411f692878bb29ab7fcddf4
router.get("/getShopId", controller.getShopId);
router.get("/getCalendar", controller.getCalendar);
router.post("/createCalendar", controller.createCalendar);
router.delete("/deleteCalendar", controller.deleteCalendar);
<<<<<<< HEAD
<<<<<<< HEAD

module.exports = router;
=======
router.get("/getCalendar", controller.getCalendar);
router.post("createCalendar", controller.createCalendar);
router.put("/updateCalendar", controller.updateCalendar);
router.delete("/deleteCalendar", controller.deleteCalendar);
>>>>>>> create axios routes and controller
=======
=======
router.get("/getShopId", controller.getShopId);
>>>>>>> ShopDashboard receives shopId from database
router.get("/getCalendar/:id", controller.getCalendar);
router.post("/createCalendar/:id", controller.createCalendar);
router.put("/storeCalendar/:id", controller.storeCalendar);
router.delete("/deleteCalendar/:id", controller.deleteCalendar);
=======
>>>>>>> getCalendar now renders proper calendar from timekit

module.exports = router;
>>>>>>> Render timekit logic on server side
=======

module.exports = router;
>>>>>>> 81ea3afcd55040922411f692878bb29ab7fcddf4
