'use strict';
/** IMPORT MODULES **/
const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const path = require("path");
const http = require('http').Server(app);
const mysql = require('mysql');
const crypto = require('crypto');
const uuid = require('uuid/v4');
const session = require('express-session');
const MySQLStore = require('mysql-express-session')(session);
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;

/** SETUP PUBLICLY ACCESSIBLE FILES **/
app.use(bodyParser.urlencoded({extended: false}));
app.use(express.static(path.join(__dirname,"public")));
app.use(bodyParser.json());
app.use((req, res, next) => {
	res.header('Access-Control-Allow-Credentials', true);
	res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
	res.header("Access-Control-Allow-Origin", "http://localhost");
	res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
	next();
});

/** DATABASE SETUP **/
const con = mysql.createConnection({
	host: "localhost",
	user: "root",
	password: "1234",
	database: "meet_manager"
});

con.connect((err) => {
  if (err) throw err;
  console.log("Connected!");
});

/** SEESSION SETUP **/
const sessionStore = new MySQLStore({},con);
app.use(session({
	genid: (req) => {
		console.log('Inside the session middleware');
		console.log(req.sessionID);
		return uuid();
	  },
	store: sessionStore,
	secret: '9KD6/+7a+le6Yt45XxLmi7bGZUXgmPj+xenTR46IqcNogNBXEOWO/HsEG16+9xW8hz0pkNT/gMrK1f+GBG/z+l1gXXvbIAaq71lm2UQfcuAfWQSnVN9FrfxwSNCpTE',
	resave: false,
	saveUninitialized: true,
	cookie: {
		secure: false
	}
}));
app.use(passport.initialize());
app.use(passport.session());

/** Configure Passport.js to authenticate username and password **/
passport.use(new LocalStrategy( (username, password, done) => {
    	const sql = "SELECT * FROM user WHERE username='" + username + "';";
		con.query(sql, (err,result) => {
			if(err){
				done(err); 
				throw err; 
			} 
			if(result[0]){ //Make sure that this user exists.
				const expected_hash = result[0].encrypted_password;
				const salt = result[0].salt;
				const hash = crypto.createHash('sha512').update(salt + password).digest('base64');
				//NOT AUTHENTICATED
				if(expected_hash != hash){
					return done(null, false, {message: 'Invalid Credentials.\n'});
				}
				//AUTHENTICATED
				else{
					return done(null, {id: result[0].id, username: result[0].username, team_name: result[0].team_name});
				}
			}
			else{
				return done(null, false, {message: 'Invalid Credentials.\n'});
			}
		});
	}
));

// Tell passport how to serialize the user
passport.serializeUser((user, done) => {
  done(null, user.id);
});

// Tell passport how to deserialize the user
passport.deserializeUser((id, done) => {
	const sql = "SELECT username, team_name FROM user WHERE id='" + id + "';"
	con.query(sql, (err,result) =>{
		if(err){
			done(err, false);
			throw err;
		}
		done(null, result[0]);
	});
});

/** ROUTING FUNCTIONS **/
app.get("/", function(req,res){
	console.log(req.sessionID)
	res.sendFile(__dirname + "/html/index.html");
});

app.get("/display-meets", function(req,res){
	res.sendFile(__dirname + "/public/html/display-meets.html");
});

app.get("/login", function(req,res){
	res.sendFile(__dirname + "/public/html/login.html");
});

app.get('/main-menu', (req,res) =>{
	if(req.isAuthenticated()){
		res.sendFile(__dirname + "/public/html/main-menu.html");
	}else{
		res.redirect('/');
	}
});

app.get('/signed-in-user', (req,res) =>{
	if(req.isAuthenticated()){
		res.writeHead(200, {"content-type":"application/json"});
		res.end(JSON.stringify({success: true, user: req.user}));
	}else{
		res.sendStatus(401);
	}
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

app.post('/login', (req, res, next) => {
	console.log(req.sessionID);
	passport.authenticate('local', (err, user, info) => {
		if(info){
			res.writeHead(401, {"content-type":"application/json"});
    		res.end(JSON.stringify({success: false}));
		}
		else if(err){
			res.writeHead(500, {"content-type":"application/json"});
    		res.end(JSON.stringify({success: false}));
		}
		else if(!user){
			res.writeHead(401, {"content-type":"application/json"});
    		res.end(JSON.stringify({success: false}));
		}
		else{
			req.login(user, (err) => {
				if(err){
					res.writeHead(400, {"content-type":"application/json"});
					res.end(JSON.stringify({success: false}));
				}
				res.writeHead(200, {"content-type":"application/json"});
				res.end(JSON.stringify({success: true}));
			});
		}
	})(req,res,next);
});

app.post('/logout', (req,res) => {
	req.logout();
	req.session.destroy();
	res.sendStatus(200);
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

		for(let i = 0 ; i < events.length ; i++){
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

/** HELPER FUNCTIONS **/
function getSortedResults(meetId){
	var heatSheet = {};
	var sql = "SELECT event_id, event_name, event_gender FROM events WHERE meet_id='" + meetId + "';";
	con.query(sql, (err,events) => {
		if(err) throw err;
		console.log(events);
		for(let i = 0 ; i < events.length ; i++){
			let eventId = events[i].event_id;
			let eventName = events[i].event_name;
			let eventGender = events[i].event_gender;
			sql = "SELECT * FROM results JOIN runners ON runners.runner_id = results.runner_id WHERE "
			+ "event_id='" + eventId + "' ORDER BY seed_mins ASC, seed_secs ASC, seed_millis ASC;";
			con.query(sql, (err,results) =>{
				if(err) throw err;
				
			});
		}
	});
}

function saltHashPassword ({password}){
	const salt = crypto.randomBytes(127).toString('base64').substring(0, 127);
	const hash = crypto.createHash('sha512').update(salt + password).digest('base64');
	return {
		salt,
		hash
	}
}

//Listen on port 8080
http.listen(process.env.PORT || 8080, function(){
	console.log('listening on ' + (process.env.PORT || 8080));
});