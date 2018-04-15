const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const path = require("path");
const http = require('http').Server(app);
const mysql = require('mysql');
const crypto = require('crypto');
const knex = require('knex')(require('./knexfile'));

// Set up publicly accesible files
app.use(bodyParser.urlencoded({extended: false}));
app.use(express.static(path.join(__dirname,"public")));
app.use(bodyParser.json());

app.get("/", function(req,res){
	res.sendFile(__dirname + "/html/index.html");
});

app.get("/display-meets", function(req,res){
	res.sendFile(__dirname + "/html/display-meets.html");
});

//Connect to db
var con = mysql.createConnection({
	host: "localhost",
	user: "root",
	password: "1234",
	database: "meet_manager"
});

con.connect((err) => {
  if (err) throw err;
  console.log("Connected!");
});

//Listen on port 8080
http.listen(process.env.PORT || 8080, function(){
	console.log('listening on ' + (process.env.PORT || 8080));
});

app.post('/createUser', (req,res) =>{
	const username = req.body.username;
	const password = req.body.password;
	console.log('Add user ' +  username + ' with password ' + password);
	const { salt, hash } = saltHashPassword({ password });
	const token = crypto.randomBytes(127).toString('base64').substring(0, 127);
    var sql = "INSERT INTO user (username, encrypted_password, salt, token) VALUES ('" + username + "','" + hash + "','" + salt + "','" + token + "')";
    con.query(sql, function(err,result){
    	if(err) {
    		res.send(JSON.stringify({success: false}));
    		throw err;
    	}else{
    		res.send(JSON.stringify({success: true, token: token}));
    	}
    	console.log("1 record inserted, ID: " + result.insertId);
    });
});

app.post('/login', (req, res) => {
	const sql = "SELECT salt, encrypted_password FROM user WHERE username='" + req.body.username + "';";
    con.query(sql, (err,result) => {
    	console.log(result);
    	if(err){
    		res.send(JSON.stringify({success: false}));
    		throw err;
		}
    	const expected_hash = result[0].encrypted_password;
    	const salt = result[0].salt;
    	const hash = crypto.createHash('sha512').update(salt + req.bodypassword).digest('base64');
    	if(expected_hash != hash){
    		res.send(JSON.stringify({success: false}));
    	}else{
    		const token = crypto.randomBytes(127).toString('base64').substring(0, 127);
    		const sql = "UPDATE users SET token='" + token + "' WHERE username='" + req.body.username + "'";
    		con.query(sql, (err,result) =>{
    			if(err) {
    				res.send(JSON.stringify({success: false}));
    				throw err;
    			}else{
    				res.send(JSON.stringify({success: true, token: token}));
    			}
    		});
    	}

    });
});

app.post('/create-meet', (req, res) => {
	const name  = req.body.name;
	const date = req.body.date;
	const location = req.body.location;
	const type = req.body.type;
	const events = req.body.events;
	var sql = "INSERT INTO meets (meet_name, meet_date, meet_location, meet_type) VALUES ('" + 
	name + "','" + date + "','" + location + "','" + type + "');";
	con.query(sql, (err,result) => {
		if(err) {
			res.sendStatus(500);	
			throw err;
		}
		const meetId = result.insertId;
		console.log("1 meet record inserted with meet ID: " + result.insertId);

		for(i = 0 ; i < events.length ; i++){
			console.log(events[i] + "  :  " + i);
			const eventName = events[i].event;
			const gender = events[i].gender;
			sql = "INSERT INTO events (meet_id, event_name, event_gender) VALUES ('" + meetId + "','" + eventName + "','" + gender + "');";
			con.query(sql, (err,result) => {
				if(err) {
					res.sendStatus(500);	
					throw err;
				}
				console.log("1 event record inserted with event ID: " + result.insertId);
			});
		}
		res.sendStatus(200);
	});
	
});

// app.get('/register-runners', (req,res) =>{
// 	const runners = req.body.runners;
// 	for(i = 0 ; i < runners.length ; i++){

// 	}
// });

app.get('/get-all-meets', (req,res) =>{
	const sql = "SELECT * FROM meets;";
	con.query(sql, (err,result) => {
		if(err) throw err;
		res.send(JSON.stringify(result));
	});
});

app.get('/get-all-events-for-meet', (req,res) =>{
	const meetId = req.query.meetId;
	console.log(meetId);
	const sql = "SELECT event_id, event_name, event_gender FROM events WHERE meet_id='" + meetId + "';";
	con.query(sql, (err,result) => {
		if(err) throw err;
		console.log(result);
		res.send(JSON.stringify(result));
	});
});


function saltHashPassword ({
  password,
}) {
	const salt = crypto.randomBytes(127).toString('base64').substring(0, 127);
  	const hash = crypto.createHash('sha512').update(salt + password).digest('base64');
  return {
    salt,
    hash
  }
}
function randomString () {
  return crypto.randomBytes(4).toString('hex')
}