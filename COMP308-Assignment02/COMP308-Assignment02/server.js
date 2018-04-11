var express = require('express');
var server = require('http').Server(app);
var io = require('socket.io').listen(server);
var mongoose = require('mongoose');
var bodyParser = require('body-parser');
var Doctor = require('./Public/Patients/models/Doctor');
var Patient = require('./Public/Patients/models/Patient');
var Patient2 = require('./Public/Patients/models/Patient2');
var Patient3 = require('./Public/Patients/models/Patient3');
var database = require('./Public/Patients/Data/database.js');
mongoose.connect('mongodb://localhost:27017/test')

//Creates a database
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error'));
db.once('open', function (callback) {
    console.log('mongodb connection successful');
});

var app = express();

var path = require('path');
var http = require("http").createServer(app);

var port = process.env.port || 1337;

app.use(express.static(path.join(__dirname, '/Public')));

//Gets the folders and uses them
app.use('/Public/Patients/Scripts/', express.static(__dirname + '/Public/Patients/Scripts/'));
app.use('/Public/Patients/Views/', express.static(__dirname + '/Public/Patients/Views/'));
app.use('/Public/Patients/Data/', express.static(__dirname + '/Public/Patients/Data/'));
app.use('/Public/Patients/models/', express.static(__dirname + '/Public/Patients/models/'));
app.use(bodyParser.json());
//Makes the database accessible to the router
app.use(function (req, res, next) {
    req.db = db;
    next();
});

app.get('/', function (req, res) {
    res.sendFile(__dirname + '/Public/Patients/Views/index.html');
});
//Assignment 1========================================================================
//This saves the data for Assignment 1 Patients
app.post('/save', function (req, res) {
    console.log("Adding patient");
    
    var patient = new Patient2({
        first_name : req.body.first_name,
        last_name : req.body.last_name,
        phone : req.body.phone,
        last_visited : req.body.last_visited,
        status: req.body.status
    });
    console.log(req.body.first_name + " " + req.body.last_name);
    patient.save(function (err) {
        if (err)
            console.log(err)
        else
            console.log("Patient record created")
        res.sendStatus(200);
    });
});
app.get('/get', function (req, res) {
    Patient2.find({}, function (err, data) {
        if (err) {
            console.log(err);
        }
        else {
            res.json(data);
            console.log("Patients retrieved");
        }
    });
});

app.post('/update', function (req, res) {
    console.log('Updating Patient...');
    Patient2.findOne({ _id: req.body._id }, function (err, data) {
        if (err)
            console.log(err);
        else {
            data.first_name = req.body.first_name,
            data.last_name = req.body.last_name;
            data.phone = req.body.phone;
            data.last_visited = req.body.last_visited;
            data.status = req.body.status;
            data.save();
            console.log("Patient Updated");
        }
    });
});

//Assignment 3========================================================================
//Retrieves a list of all the doctors
app.get('/getdoctors', function (req, res) {
    Doctor.find({}, function (err, data) {

        if (err) {
            console.log(err);
        }
        else {
            res.json(data);
            console.log("Doctors retrieved");
        }
    });
});
//Login Doctor (Not working)
app.post('/logindoctor', function (req, res) {
    var username = req.query.username;
    var password = req.query.password;

    Doctor.findOne({username:username, password:password}, function (err, data) {
        if (err) {
            console.log("Login Failed" + err);
        }
        else {
            res.json(data);
            console.log("Login successful");
        }
    });
});
//Doctor registration
app.post('/doctor', function (req, res) {
    console.log("Adding doctor");
    var doctor = new Doctor({
        first_name : req.body.first_name,
        last_name : req.body.last_name,
        username : req.body.username,
        email : req.body.email,
        password : req.body.password
    });
    console.log(req.body.first_name + " " + req.body.last_name);
    doctor.save(function (err) {
        if (err)
            console.log(err)
        else
            console.log("Doctor record created")
        res.sendStatus(200);
    });
});
//Gets a list of all the patients
app.get('/getpatients', function (req, res) {
    Patient.find({}, function (err, data) {
        if (err) {
            console.log(err);
        }
        else {
            res.json(data);
            console.log("Patients retrieved");
        }
    });
});
//Search patient by certain criteria
app.get('/patient/:last_name', function (req, res) {
    var query = new RegExp(req.params.last_name, 'i');
    if (req.params.lastname) {
        Patient.find({ last_name: query }, function (err, data) {
            res.send(data);
        });
    }
});
//Removes the selected patient
app.post('/removepatient', function (req, res) {
    console.log(req.body._id);
    Patient.find({ _id: req.body._id }).remove().exec();
    console.log("Patient Removed");
});
//Updates a patients data
app.post('/updatepatient', function (req, res) {
    console.log('Updating Patient...');
    Patient.findOne({_id:req.body._id}, function (err, data) {
        if (err)
            console.log(err);
        else {
            data.first_name = req.body.first_name;
            data.last_name = req.body.last_name;
            data.age = req.body.age;
            data.family_doctor = req.body.family_doctor;
            data.last_modified = Date.now();
            data.save();
            console.log("Patient Updated");
        }
    });
});
//Gets the total number of patients
app.get('/count', function (req, res) {
    Patient.count({}, function (err, data) {
        res.json(data);
    });
});
//Registers a patient
app.post('/patientregister', function (req, res) {
    console.log("Adding patient");
    var doc = req.body.family_doctor;
    console.log(doc);
    
    var patient = new Patient( {
        first_name : req.body.first_name,
        last_name : req.body.last_name,
        email : req.body.email,
        age : req.body.age,
        family_doctor: doc
    });
    console.log(req.body.first_name + " " + req.body.last_name);
    patient.save(function (err) {
        if (err)
            console.log(err)
        else
            console.log("Patient record created")
        res.sendStatus(200);
    });
});

//Assignment 2========================================================================
//Sends data to the server and returns it back to the server
io.on('connection', function (socket) {
    console.log("client connected");
    socket.on('msg', function (data) {
        io.emit('msg', data);
        console.log(data.time + ': ' + data.msg);
    });
    socket.on('disconnect', function (data) {
        io.emit('disconnect', data)
        console.log("client disconnected")
    });
});

http.listen(1337, "127.0.0.1");
server.listen(1338, function () {
    console.log("Listening on port 1338");
});