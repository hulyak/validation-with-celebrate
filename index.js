const express = require("express");
const bodyParser = require("body-parser");
const { celebrate, Joi, errors, Segments } = require("celebrate");

const app = express();
app.use(bodyParser.json());

const { PORT = 3000 } = process.env;

// app.post(
//   "/signup",
//   celebrate({
//     [Segments.BODY]: Joi.object().keys({
//       name: Joi.string().required(),
//       age: Joi.number().integer(),
//       role: Joi.string().default("admin"),
//     }),
//     [Segments.QUERY]: {
//       token: Joi.string().token().required(),
//     },
//   }),
//   (req, res) => {
//     console.log(req.body);
//     console.log(req.query.token);

//     // res.send(req.body);
//     // res.setHeader("Content-Type", "text/plain");
//     res.status(200).send(req.body);
//   }
// );

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

app.use(errors());

// Implement a error handler that will be called for us if the celebrate validation fails

// app.use((error, req, res, next) => {
//   if (error.joi) {
//     return res.status(400).json({ error: error.joi.message });
//   }

//   return res.status(500).send(error);
// });

app.listen(PORT, () => {
  console.log(`Server is listening on port ${PORT}`);
});
