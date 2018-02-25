var express = require("express");
var app = express();
var bodyParser = require("body-parser");
var path = require("path");
var http = require('http').Server(app);

// Set up publicly accesible files
app.use(bodyParser.urlencoded({extended: false}));
app.use(express.static(path.join(__dirname,"public")));

app.get("/", function(req,res){
	res.sendFile(__dirname + "/html/index.html");
});

//Listen on port 8080
http.listen(process.env.PORT || 8080, function(){
	console.log('listening on ' + (process.env.PORT || 8080));
})