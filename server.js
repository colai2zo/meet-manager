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
    var sql = "INSERT INTO user (username, encrypted_password, salt) VALUES ('" + username + "','" + hash + "','" + salt + "')";
    con.query(sql, function(err,result){
    	if(err) throw err;
    	console.log("1 record inserted, ID: " + result.insertId);
    });
});

app.post('/login', (req, res) => {
	authenticate({
      username: req.body.username,
      password: req.body.password
    })
    .then(({ success }) => {
      if (success) res.sendStatus(200); 
      else res.sendStatus(401)
    })
});

app.post('/create-meet', (req, res) => {
	const id = createMeetId();
	const name  = req.body.name;
	const date = req.body.date;
	const location = req.body.location;
	const type = req.body.type;
	const events = req.body.events;
	const sql = "INSERT INTO meets (meet_id, meet_name, meet_date, meet_location, meet_type) VALUES ('" + id + "','" + 
	name + "','" + date + "','" + location + "','" + type + "');";
	con.query(sql, (err,result) => {
		if(err) throw err;
		console.log("1 record inserted, ID: " + result.insertId);
	});
});


function authenticate ({ username, password }) {
    console.log(`Authenticating user ${username}`)
    return knex('user').where({ username })
      .then(([user]) => {
        if (!user) return { success: false }
        const { hash } = saltHashPassword({
          password,
          salt: user.salt
        })
        return { success: hash === user.encrypted_password }
      })
  }

function createMeetId(){
	var sql = "SELECT meet_id FROM meets;"
	var existingMeets = [];
	con.query(sql, (err,result) =>{
		if(err) throw err;
		existingMeets = result;
	});
	var isTaken = false;
	var meetId = "";
	do{
		meetId = randomString();
		for(i = 0 ; i < existingMeets.length ; i++){
			if(existingMeets[i].meet_id === meetId){
				isTaken = true;
			}
		}
	}while(isTaken);
	return meetId;
}

function saltHashPassword ({
  password,
  salt = randomString()
}) {
  const hash = crypto
    .createHmac('sha512', salt)
    .update(password)
  return {
    salt,
    hash: hash.digest('hex')
  }
}
function randomString () {
  return crypto.randomBytes(4).toString('hex')
}