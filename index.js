const express = require("express");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");

const { celebrate, Joi, errors, Segments } = require("celebrate");

const app = express();

app.use(bodyParser.json());

app.use(cookieParser("SECRET"));

const { PORT = 3000 } = process.env;

app.post(
  "/signup",
  celebrate({
    [Segments.BODY]: Joi.object().keys({
      name: Joi.string().alphanum().min(2).max(30).required(),
      email: Joi.string().required().email(),
      password: Joi.string()
        .pattern(new RegExp("^[a-zA-Z0-9]{3,30}$"))
        .required()
        .min(8),
      repeat_password: Joi.ref("password"),
      age: Joi.number().integer().required().min(18),
      about: Joi.string().min(2).max(30),
    }),
    [Segments.QUERY]: {
      token: Joi.string().token().required(),
    },
  }),
  (req, res) => {
    // ...
    res.status(201).send(req.query.token);
  }
);

app.delete(
  "/notes/:noteId",
  celebrate({
    // validate parameters
    [Segments.PARAMS]: Joi.object().keys({
      noteId: Joi.string().alphanum().length(12),
    }),
    [Segments.HEADERS]: Joi.object()
      .keys({
        // validate headers
      })
      .unknown(true),
  }),
  (req, res) => {
    // ...
    res.status(204).send();
  }
);

app.get(
  "/notes",
  celebrate({
    // validate parameters
    [Segments.COOKIES]: Joi.object().keys({
      name: Joi.string().alphanum().min(2).max(30),
    }),
    [Segments.SIGNEDCOOKIES]: Joi.object().keys({
      jwt: Joi.string().alphanum().length(20),
    }),
  }),
  function (req, res) {
    res.cookie("name", "john", { httpOnly: true, maxAge: 3600000 });
    // signed cookie
    res.cookie("jwt", "snfsdfliuhewerewr4i3", { signed: true });

    console.log("Cookies: ", req.cookies);
    console.log("Signed Cookies: ", req.signedCookies);
    res.send({ cookie: req.cookies.name, signedCookie: req.signedCookies.jwt });
  }
);

app.use(errors());

// global error handling
app.use("*", (req, res) => {
  res.status(404).send({ message: "Requested resource not found" });
});

app.listen(PORT, () => {
  console.log(`Server is listening on port ${PORT}`);
});
