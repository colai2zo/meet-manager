const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const path = require("path");
const http = require('http').Server(app);
const store = require('./store')

// Set up publicly accesible files
app.use(bodyParser.urlencoded({extended: false}));
app.use(express.static(path.join(__dirname,"public")));
app.use(bodyParser.json());

app.get("/", function(req,res){
	res.sendFile(__dirname + "/html/index.html");
});

//Listen on port 8080
http.listen(process.env.PORT || 8080, function(){
	console.log('listening on ' + (process.env.PORT || 8080));
});

app.post('/createUser', function(req,res){
	console.log('Add user' +  req.body.username + ' with password ' + req.body.password);
})

