## How to use celebrate with Node.js

Imagine you have created a note-taking app with a login system where users can create an account and add their notes. Users need to type their email and name to sign in. Your job as a developer is to ensure the data you get from the user is the data you’re looking for, and it’s in the correct format before persisting them in a database. So, if a user tries to log in with an invalid email address, the app should show the user an error message and will not let the user sign in. 

Validating user input sent from user requests is highly important for a couple of reasons:

- Mitigates the attack surface
- Protects from attacks like DDOS,cross-site scripting, command injection and SQL injection.
- Ensures data consistency.

This type of validation is called server-side validation which shouldn't be left out while developing applications. 

There are a couple of different libraries to validate user input. One of the best libraries for this is joi and celebrate. Joi is an object schema description language and validator for JavaScript objects.

In this tutorial, we will learn how to reqest data in an Express.js application using a validation middleware function that wraps the [joi](https://joi.dev/api/?v=17.6.0) validation library. 

We'll demo some API routes for a note-taking app with a login system that requires user input and validates it. 

If you want to see the complete application developed throughout this article, take a look at this GitHub repository.

## What is Joi and celebrate?

Joi is a stand-alone validation module that can be used along side with celebrate. Joi describes the client request within a schema. A schema is a JavaScript object that describes how client requests like parameters, request body, headers, etc. must be. They are made of a type and a succession of rules, with or without parameters. 

celebrate uses this schema to implement a flexible validation middleware. It takes a schema and returns a function that takes the request and returns a value. If the value is valid, celebrate will call the next middleware in the chain. If the value is invalid, celebrate will call the error handler middleware.
 
You can validate `req.params`, `req.headers`, `req.body`, `req.query`, `req.cookies` and `req.signedCookies` before any handler function is called. We'll go into detail about how to validate these later in this article.

## Prerequisites

In order to follow this tutorial, you will need to have a basic understanding of the following:
 
- Node.js
- Express
- Using `npm` or `yarn` from the command line
- Postman.

## Requirements

To get started, you'll need to install: 

- Node.js
- A package manager compatible with `npm`. You can use `yarn` or `npm` to install packages.
- Postman - a tool for testing APIs

By the end of this tutorial, you’ll be able to learn how to:

- create schemas with Joi
- validate incoming user inputs coming from `req.body`
- validate `req.headers`, `req.params`, `req.query`, `req.cookies`, 
- handle errors and test the endpoints with Postman

## Getting Started

1. Open up your terminal and navigate to the directory where you want to place your project. Create a new directory and change your directory into the newly created directory.

```bash
mkdir notes && cd notes
```

2. Next, create a new Node.js project by running:

```bash
npm init -y 
```

This will generate `package.json` file in the root of your project. The `--yes` or short for `-y` flag will answer "yes" to all questions when setting up `package.json`.

3. Now, install the required dependencies by running:

```bash
npm install express body-parser cookie-parser
npm install nodemon -D
```

Installed packages:

- [Express]() is one of the most popular web framework for Node.js. It's used for creating web servers and APIs.
- [Body Parser](https://github.com/expressjs/body-parser) is a middleware that parses the body of incoming requests, and exposes the resulting object on `req.body`.
- [Cookie Parser](https://github.com/expressjs/cookie-parser) parses the cookies of incoming requests, and exposes the resulting object on `req.cookies`.
- [Nodemon](https://www.npmjs.com/package/nodemon) is used for automatically restarting the server when we make changes to our code. 

4. The `npm init` command assigns `index.js` as the entry point of our application. Go ahead, and create this file at the root of your project. 

```bash 
touch index.js
```

5. Open up your favorite code editor, and create the bolierplate code for instantiating Express.js and setting up the server.

```js
const express = require("express");
const bodyParser = require("body-parser");

const app = express();

// parse application/json
app.use(bodyParser.json());

const PORT = process.env.PORT || 4001;

app.listen(PORT, () => {
  console.log(`Server is listening on port ${PORT}`);
});
```
Here, we've imported Express and BodyParser and invoked the express function to create our server. The server will listen on port 3000.

## Running the App

Go to your package.json file and add a script to run our server with `nodemon`.

```json
 "scripts": {
    "start": "nodemon index.js"
  }
```

Now, we can run our server from terminal by running `npm start`. This will start nodemon and watch for changes in our code.


## Creating Routes

Now that our application is listening for requests, we can create some routes.

- POST `/signup` for creating a new user account.
- POST `/notes` for creating a new note.
- DELETE `/noteId` for deleting a note.

All these requests will inquire user input, so we'll look at how to validate the request data via Joi and celebrate.

## Installing Joi and Celebrate for Schema-Based Validation

We can install joi and celebrate via `npm`:

```bash
npm install joi celebrate
```

Joi allows you to describe data in an intuitive, readable way:

```js
{
  body: Joi.object().keys({
    name: Joi.string().alphanum().min(2).max(30).required(),
    email: Joi.string().required().email(),
    password: Joi.string().pattern(new RegExp('^[a-zA-Z0-9]{3,30}$')).required().min(8),
    repeat_password: Joi.ref('password'),
    age: Joi.number().integer().required().min(18),
    about: Joi.string().min(2).max(30),
  })
}
```

According to this schema, a valid body should have a name with at least 2 characters and up to 30 characters, an email, a password with at least 8 characters, an age of 18 or more, and an about section with at least 2 characters and up to 30 characters. Anything outside of these constraints will trigger an error.


According to this schema, a valid `body` must be an object with keys:
- `name` - a required string with at least 2 characters and up to 25 characters (alphanumeric characters only)
- `email` - a required string in an email format,
- `password`  - a required string with at least 8 characters, should match the custom regex pattern
- `repeat_password` - should match the password
- `age` - a required number with an integer value of 18 or more,
- `about` - a string with at least 2 characters and up to 50 characters.

## Validating Request Body

Now, import the `celebrate` package to enable Joi validation as middleware and connect it as a middleware to the route:  

```js
const { celebrate, Joi, Segments } = require('celebrate');

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
  }),
  (req, res) => {
    // ...
    console.log(req.body);
    res.status(201).send(req.body);
  }
);
```

Here, we're using celebrate to validate the request body. 

celebrate takes an object where key can be one of the values from `Segments` and the value is a Joi schema. Segments is a set of named constants, enum, that can be used to identify the different parts of a request.

```
{
  BODY: 'body',
  QUERY: 'query',
  HEADERS: 'headers',
  PARAMS: 'params',
  COOKIES: 'cookies',
  SIGNEDCOOKIES: 'signedCookies',
}
```

## Error Handling

If we try out our endpoint for `signup` with a body that doesn't match the schema, we'll get the following error.

```json
<!DOCTYPE html>
<html lang="en">

<head>
	<meta charset="utf-8">
	<title>Error</title>
</head>

<body>
	<pre>Error: Validation failed<br> &nbsp; &nbsp;at /Users/hulyakarakaya/Desktop/celebrate/node_modules/celebrate/lib/celebrate.js:95:19<br> &nbsp; &nbsp;at processTicksAndRejections (node:internal/process/task_queues:96:5)</pre>
</body>

</html>
```

celebrate has a special `errors()` middleware for sending errors to the client. By implementing this middleare, we can send more detailed error messages to the client. Import `errors` from celebrate and pass it to the `app.use` method: 

```js
const { errors } = require('celebrate');

// celebrate error handler
app.use(errors()); 
```

This middleware will only handle errors generated by celebrate. Let's see it in action!

## Testing the Endpoint

We'll use Postman for testing our endpoint. Make sure your server is running before you test the endpoint.

Make a POST request to `/signup` route. If we don't correctly repeat the password, we should get an error. 
The error status returned by celebrate is `400`, and the response body is:

```json
{
    "statusCode": 400,
    "error": "Bad Request",
    "message": "Validation failed",
    "validation": {
        "body": {
            "source": "body",
            "keys": [
                "repeat_password"
            ],
            "message": "\"repeat_password\" must be [ref:password]"
        }
    }
}
```

Or, if we input an age that is lower than 18, we'll get a Bad Request error:

```json
{
    "statusCode": 400,
    "error": "Bad Request",
    "message": "Validation failed",
    "validation": {
        "body": {
            "source": "body",
            "keys": [
                "age"
            ],
            "message": "\"age\" must be greater than or equal to 18"
        }
    }
}
```

The message field allows the client to understand what is wrong with their request. In these cases, celebrate reports that repeat password is not equal to password and age must be greater than or equal to 18 respectively in the request body.

## Validating Query Strings

A query string goes at the end of a URL and it starts with a question mark (`?`). After the question mark, you can pass the server a key value pair separated by an equal sign. 

```
http://localhost:3000/signup?token=2343546547
```

For example, in the example above, we can see that the query string has a key `token` with a value of `2343546547`.

In Express, we can get access to the query string information via `req.query`.

Validating the query strings will work similar to validating the request body. But, this time we will use `Segments.QUERY` as a key. Imagine, we want to send user token in the query string when signing up. 

```js
app.post(
  "/signup",
  celebrate({
    [Segments.BODY]: Joi.object().keys({
    // validation rules for the body
    }),
    [Segments.QUERY]: {
      token: Joi.string().token().required(),
    },
  }),
  (req, res) => {
    res.status(200).send(req.query.token);
  }
);
```

When we test the API endpoint, we need to add a `token` query string to the URL, and it shouldn't be empty.

If we don't pass the `token` query string, celebrate will show an error message: 

```json
{
    "statusCode": 400,
    "error": "Bad Request",
    "message": "Validation failed",
    "validation": {
        "query": {
            "source": "query",
            "keys": [
                "token"
            ],
            "message": "\"token\" is required"
        }
    }
}
```

## Validating Request Headers, and Parameters

Besides the request body, celebrate allows you to validate headers, parameters, or `req.query`:

```js
const { celebrate, Joi } = require('celebrate');

app.delete('/:noteId', celebrate({
  // validate parameters
  params: Joi.object().keys({
    postId: Joi.string().alphanum().length(24),
  }),
  headers: Joi.object().keys({
    // validate headers
  }),
  query: Joi.object().keys({
    // validate query
  }),
}), (req, res) => {
  // ...
  res.status(204).send();
});

```

By default, Joi doesn't allow fields that are not listed in the validation object. To change this behavior, after calling the `keys()` method, call the `unknown()` method with `true` as an argument:

```js
const { celebrate, Joi } = require('celebrate');

app.delete('/:noteId', celebrate({
  headers: Joi.object().keys({
    // validate headers
  }).unknown(true),
}),
 // ...
```

Sending a POST request to the server with the route from above using Postman results in a response like this:


Especially for request header validation it’s beneficial to allow unknown properties, because you can’t have a proper validation rule in place for all the different options out there. 


## Validating Cookies and Signed Cookies


The validator function which extends the library’s validator constructor accepts four arguments — data to be validated, the validation rule, custom error messages (if any), and a callback method.




The source code for this tutorial is available on GitHub as well. Feel free to clone it, fork it, or submit an issue.



Of course, as with any tool, there is a learning curve to be able to fully express yourself with it, but hopefully not too steep of one.

Now, is it a silver bullet? Obviously not, there’s no such thing.

It’s a constant work in progress to both ensure that the data that comes out of joi is the data you would expect, while still being as approachable and safe as possible for developers.



End-Point Input Validation/Filtering: NoSQL data stores collect data from various sources, such as end-point devices. An important challenge is to validate the input while collecting the data. Validating the source of input to identify and filter malicious data is a challenging task as data is collected from untrusted input sources, specially with BYOD (bring your own device) model. To validate and filter large data sets effectively, algorithms need to be created.