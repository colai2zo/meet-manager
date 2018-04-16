'use strict';
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
	res.sendFile(__dirname + "/public/html/display-meets.html");
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
    		res.writeHead(400, {"content-type":"application/json"});
    		res.end(JSON.stringify({success: false}));
    		throw err;
    	}else{
    		res.writeHead(200, {"content-type":"application/json"});
    		res.end(JSON.stringify({success: true, token: token}));
    	}
    	console.log("1 record inserted, ID: " + result.insertId);
    });
});

app.post('/login', (req, res) => {
	const sql = "SELECT salt, encrypted_password FROM user WHERE username='" + req.body.username + "';";
	console.log(sql);
    con.query(sql, (err,result) => {
    	console.log(result);
    	if(err){
    		res.send(JSON.stringify({success: false}));
    		throw err;
		}
    	const expected_hash = result[0].encrypted_password;
    	console.log("EXPECTED: " + expected_hash);
    	const salt = result[0].salt;
    	const hash = crypto.createHash('sha512').update(salt + req.body.password).digest('base64');
    	console.log("ACTUAL: " + hash);
    	if(expected_hash != hash){
    		res.send(JSON.stringify({success: false}));
    	}else{
    		const token = crypto.randomBytes(127).toString('base64').substring(0, 127);
    		const sql = "UPDATE user SET token='" + token + "' WHERE username='" + req.body.username + "'";
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

app.post('/register-runners', (req,res) =>{
	const entries = req.body.entries;
	console.log(entries);
	for(let i = 0 ; i < entries.length ; i++){
		let runner_name = entries[i].name;
		let runner_grade = entries[i].grade;
		let event_id = entries[i].event_id;
		let seed_mins = entries[i].seed_mins;
		let seed_secs = entries[i].seed_secs;
		let seed_millis = entries[i].seed_millis;
		let runner_id = "";
		var sql = "INSERT INTO runners (runner_name, runner_grade, team_name) VALUES ('" + runner_name + "','" + runner_grade + "',' ');";
		con.query(sql, (err,result) => {
			if(err) {
				res.sendStatus(500);
				throw err;
			}
			runner_id = result.insertId;
			console.log("1 runner record inserted with runner ID: " + result.insertId);
			sql = "INSERT INTO results (event_id, runner_id, seed_mins, seed_secs, seed_millis, result_mins, result_secs, result_millis) VALUES ('" + event_id + "','" + runner_id + "','" + seed_mins + "','" + seed_secs + "','" + seed_millis + "','0','0','0');";
			con.query(sql, (err,result) => {
				if(err) {
					res.sendStatus(500);
					throw err;
				}
				console.log("1 result record inserted with submission ID: " + result.insertId);
			});
		});
	}
	res.sendStatus(200);	
});

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

// app.get('/signed-in-user', (req,res) => {
// 	authenticateToken(username, token, (auth) =>  {
// 		if (auth) {
// 			res.writeHead(200, {"content-type":"application/json"});
//     		res.end(JSON.stringify({username : username}));
//     	}
// 	});
// });

function authenticateToken(username, token, callback){
	const sql = "SELECT token from user WHERE username='" + username + "';";
	console.log(sql);
	con.query(sql, (err,result) => {
		if(err){
			callback(null);
		}
		else if(result[0].token === token){
			callback(true);
		}
		else{
			callback(false);
		}
	});
}

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