var express = require('express');
const bodyParser = require('body-parser');
var axios = require('axios')
const rateLimit = require("express-rate-limit");
var app = express();



app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use((err, req, res, next) =>{  
  if (err instanceof SyntaxError) {
    res.status(400).json({status: "INVALID JSON FORMAT"})
  } else {
    next();
  }
})


app.get('/', function (req, res) {
  res.send('Hello World!');
});

const apiLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour window
  max: 500, // 500 requests per window
  message:
    "Too many requests from this IP, please try again after an hour"
});

const validation = () => {
  return (req, res, next) => {

    if (!req.body.destination) {
      console.log("destination key required to send a message")
      res.status(400).json({status: "Destination key required to send a message"})
      return;
    }
    else if (!req.body.body) {
      console.log("body key required to send a message")
      res.status(400).json({status: "body key required to send a message"})
      return;
    }

    let {destination, body} = req.body;

    if (typeof req.body !== "object"){
      res.status(500). json({status: "OBJECT EXPECTED BY SERVICE"})
      return;
    }
    else if(destination === undefined) {
      console.log("Message can't be sent to undefined")
      res.status(400).json({status: "Message can't be sent to undefined"})
      return
    }
    else if(body === undefined) {
      console.log("Message body can't be undefined")
      res.status(400).json({status: "Message body can't be undefined"})
      return
    }
    else if(!destination || !body) {
      console.log("body or destination not provided")
      res.status(400).json({status: "body or destination not provided"})
      return;
    }
    else if (typeof destination !== "string" || typeof body !== "string"){
      console.log("incorrect type of parameters")
      res.status(400).json({status: "body and destination must be strings"})
      return;
    }
    else if (destination.length == 0 || body.length == 0) {
      console.log("fields must be filled")
      res.status(400).json({status: "all fields must be filled"})
      return;
    }
    else if (destination.length > 100) {
      console.log("Destination field exceeded max length")
      res.status(400).json({status: "destination length excedeed"})
      return;
    }
    else if (body.length > 200) {
      console.log("Body field exceeded max length")
      res.status(400).json({status: "body length exceeded"})
      return;
    }

    next()

  }
}


app.post('/message', apiLimiter, validation(), (req, res, next) => {

  
  let {destination, body} = req.body
  /*
  if(!destination || !body) {
    console.log("body or destination not provided")
    res.status(400).json({status: "body or destination not provided"})
    return;
  }
  if (typeof destination !== "string" || typeof body !== "string"){
      console.log("incorrect type of parameters")
    res.status(400).json({status: "body and destination must be strings"})
    return;
  }
  if (destination.length == 0 || body.length == 0) {
    console.log("fields must be filled")
    res.status(400).json({status: "all fields must be filled"})
    return;
  } */

  axios.post('http://messageapp:3000/message', {destination, body})
  .then(response => {
    console.log("POST succeeded", response.data);
    res.status(200).json({
      status: "200",
      data: response.data
    });
  })
  .catch(err => {
    console.log(err)
    res.status(500).json({status: "500 SERVER ERROR: EXTERNAL SERVICE DIDN'T RESPONSE"})
  })

})

app.listen(9001, function () {
  console.log('Example app listening on port 9001!');
});