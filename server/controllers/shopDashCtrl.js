const axios = require("axios");
const timekit = require("timekit-sdk");
const {
  timekitApp,
  timekitEmail,
  timekitPassword
} = require("../../env/config");
const { Shop, User } = require("../../db/index.js");

timekit.configure({
  app: timekitApp,
  inputTimestampFormat: "U",
  outputTimestampFormat: "U"
}); // Timestamps coming and going to timekit sdk must be unicode

timekit
  .auth({ email: timekitEmail, password: timekitPassword })
  .then(() => console.log("authorized tk credentials"))
  .catch(err => console.log("unauthorized tk credentials"));

//TODO: redefine shop and user relationship to include shooopkeeeeepers

module.exports = {
  getShopId: (req, res) => {
    console.log("received request to get shop id. USER ID: ", req.query);
    User.findOne({ where: { id: req.query.userId } })
      .then(user => {
        console.log("found userId: ", user.dataValues.id);
        res.status(200).send({ shopId: user.dataValues.shopId });
      })
      .catch(err => res.status(400).send(`could not find user ${err}`));
  },

  getCalId: (req, res) => {
    console.log("request has been received for calId", req.query);
    Shop.findOne({ where: { id: req.query.shopId } })
      .then(shop => {
        console.log("found shopId:", shop.dataValues);
        res.status(200).send({ calId: shop.dataValues.calendar_id });
      })
      .catch(err => console.log("could not find shop", err));
  },

  getCalendar: (req, res) => {
    console.log("received request to get calendar", req.query);
    timekit
      .include("attributes", "calendar")
      .getBookings()
      .then(books => {
        let bookings = [];
        bookings.action = "bookings request for ShopDashboard";
        books.data.forEach(booking => {
          if (
            !booking.completed &&
            !!booking.calendar &&
            booking.calendar.id === req.query.id &&
            booking.state === "confirmed"
          ) {
            let { start, end, what } = booking.attributes.event;
            let title = what;
            bookings.push({ start, end, title });
          }
        });
        res.status(200).send(bookings);
      })
      .catch(err => res.status(400).send("could not get calendar" + err));
  },

  createCalendar: (req, res) => {
    console.log(
      `received request to create calendar creating calendar with...`,
      req.body
    );

    let { shopName, shopDescription } = req.body;

    const cal = {};
    timekit
      .createCalendar({
        name: shopName,
        description: shopDescription
      })
      .then(x => {
        console.log(`created tk calendar`, x.data, `updating db with cal_id`);
        cal.calId = x.data.id;
        Shop.update({ calendar_id: x.data.id }, { where: req.body });
      })
      .then(() => {
        cal.action = "updated db with calendar id";
        res.status(201).send({ cal });
      })
      .then(() => console.log("sent shop calendar_id to front end"))
      .catch(err => {
        console.log("error creating calendar", err);
        res.status(400).send("could not create calendar" + err);
      });
  },

  deleteCalendar: () => {}
};
