const axios = require("axios");
const timekit = require("timekit-sdk");
const {
  timekitApp,
  timekitEmail,
  timekitPassword
} = require("../../env/config");
const { Shop, User, Appointment } = require("../../db/index.js");

//TODO: RENDER AUTHENTICATION FOR SHOP USER(RESOURCE)
timekit.configure({
  app: timekitApp,
  inputTimestampFormat: "U",
  outputTimestampFormat: "U"
}); // Timestamps coming and going to timekit sdk must be unicode

module.exports = {
  getShopId: (req, res) => {
    console.log("received request to get shop id. USER ID: ", req.query);
    User.find({ where: { id: req.query.userId } })
      .then(user => {
        console.log("getShopId --> found user", user.dataValues);
        res.status(200).send({ shopId: user.dataValues.shopId });
      })
      .catch(err => res.status(400).send(`could not find user ${err}`));
  },

  getCalId: (req, res) => {
    console.log("request has been received for calId", req.query);
    Shop.findOne({ where: { id: req.query.shopId } })
      .then(shop => {
        res.status(200).send({ calId: shop.dataValues.calendar_id });
      })
      .catch(err => console.log("could not find shop", err));
  },

  getCalendar: (req, res) => {
    console.log("received request from shop-user to get calendar", req.query);
    timekit
      .auth({ email: timekitEmail, password: timekitPassword })
      .then(() => console.log("ShopDashCtrl: authorized tk credentials"))
      .then(() => {
        timekit
          .include("attributes", "calendar")
          .getBookings()
          .then(books => {
            let bookings = [];
            bookings.action = "bookings request for ShopDashboard";
            books.data.forEach(booking => {
              //check for scheduled but unfinished bookings on the specified calendar
              if (
                !booking.completed &&
                !!booking.calendar &&
                booking.calendar.id === req.query.id &&
                booking.state === "confirmed"
              ) {
                let { start, end, what } = booking.attributes.event;
                let title = what;
                let { id } = booking;
                bookings.push({ start, end, title, id });
              }
            });
            res.status(200).send(bookings);
          })
          .catch(err => res.status(400).send("could not get calendar" + err));
      });
  },

  createCalendar: (req, res) => {
    console.log("received request from shop-user to create calendar", req.body);
    let {
      firstName,
      lastName,
      shopName,
      shopDescription,
      shopEmail,
      id,
      calId
    } = req.body;
    let tk_api_token; // receive the token from timekit

    const cal = {};

    if (!calId) {
      console.log("no calendar id, creating new timekit user");
      timekit
        .createUser({
          name: `${firstName} ${lastName}`,
          first_name: firstName,
          last_name: lastName,
          timezone: "America/Los_Angeles",
          email: shopEmail
        })
        .then(tk => {
          console.log("created user. saving api_token", tk.data.api_token);
          tk_api_token = tk.data.api_token;
          Shop.update({ tk_api_token: tk.data.api_token }, { where: { id } });
        })
        .then(() => {
          console.log("updated shop with tk api token, setting user");
          timekit.setUser(shopEmail, tk_api_token);
        })
        .then(tk => console.log("set the user, confirming"))
        .then(timekit.getUser)
        .then(tk =>
          console.log("user confirmed, creating calendar for user", tk)
        )
        .then(tk =>
          timekit.createCalendar({
            name: shopName,
            description: shopDescription
          })
        )
        .then(tk => {
          console.log(
            `created tk calendar updating db with cal_id. RESPONSE: `,
            tk.data
          );
          cal.calId = tk.data.id;
          Shop.update({ calendar_id: tk.data.id }, { where: { id } });
        })
        .then(() => {
          cal.action = "created calId for new tk user and stored in db";
          res.status(201).send(cal);
        })
        .then(() => console.log("sent shop calendar_id to front end"))
        .catch(err => {
          console.log("error creating calendar", err.data.errors);
          res.status(400).send("could not create calendar" + err.data);
        });
    } else {
      console.log("there is a cal ID, updating users existing calendar");
      // timekit.updateCalendar({id: calId}) //Update calendar is not possible for timekit waiting on tk development
      timekit
        .deleteCalendar({ id: calId })
        .then(() =>
          timekit.createCalendar({
            name: shopName,
            description: shopDescription
          })
        )
        .then(tk => {
          console.log("created new calendar for shop ");
          cal.calId = tk.data.id;
          Shop.update({ calendar_id: tk.data.id }, { where: { id } });
        })
        .then(() => {
          cal.action =
            "create new calendar for existing tk user and stored in db";
          res.status(201).send(cal);
        })
        .then(() => console.log("sent shop calendar_id to front end"))
        .catch(err => {
          console.log("error creating calendar for existing tk user", err);
          res.status(400).send(err);
        });
    }
  },

  deleteCalendar: () => {},

  getCar: (req, res) => {
    Appointment.findAll({
      where: {
        bookingId: req.params.id
      }
    })
      .then(appointment => res.status(200).send(appointment))
      .catch(err => res.status(404).send(err));
  },

  setServices: (req, res) => {
    Shop.update(
      { services: req.params.services },
      { where: { id: req.params.id } }
    )
      .then(item => res.status(201).send("Success"))
      .catch(err =>
        res.status(500).send(`Error updating shop services! ${err}`)
      );
  },
  updateHours: (req, res) => {
    Shop.update(
      { days_of_service: req.body.daysOfService },
      { where: { id: req.body.id } }
    )
      .then(item => res.status(201).send("Success"))
      .catch(err => res.status(500).send(`Error updating shop times!` + err));
  },

  removeAppointment: (req, res) => {
    console.log(req.body, "here");
    Appointment.destroy({
      where: { bookingId: req.body.bookingId }
    })
      .then(num => res.status(200).send(`Appointment deleted!`))
      .catch(err => res.status(500).send(`Error deleting friend! ${err}`));
  }
};
