var socket = new io.connect('http://localhost:1338'); //Instantiate SocketIO
var loginname = "";

var app = angular.module("myApp", ['ngRoute']);

app.config(['$routeProvider',
    function ($routeProvider) {
        $routeProvider.
        when('/patientList', {
            templateUrl: '../Public/Patients/Views/PatientList.html',
            controller: 'PatientList'
        }).
        when('/patientDetails', {
            templateUrl: '../Public/Patients/Views/PatientDetails.html',
            controller: 'PatientDetails'
        }).
        when('/patientUpdate', {
            templateUrl: '../Public/Patients/Views/PatientUpdate.html',
            controller: 'PatientUpdate'
        }).
        when('/assignmentChoice', {
            templateUrl: '../Public/Patients/Views/AssignmentChoice.html',
            controller: 'AssignmentChoice'
        }).
        when('/login', {
            templateUrl: '../Public/Patients/Views/Login.html',
            controller: 'Login'
        }).
        when('/chat', {
            templateUrl: '../Public/Patients/Views/Chat.html',
            controller: 'Chat'
        }).
        when('/drlogin', {
            templateUrl: '../Public/Patients/Views/DrLogin.html',
            controller: 'DrLogin'
        }).
        when('/register', {
            templateUrl: '../Public/Patients/Views/DrRegister.html',
            controller: 'DrRegister'
        }).
        when('/patientregister', {
            templateUrl: '../Public/Patients/Views/PatientRegister.html',
            controller: 'PatientRegister'
        }).
        when('/list', {
            templateUrl: '../Public/Patients/Views/PatientList2.html',
            controller: 'PatientList2'
        }).
        when('/details', {
            templateUrl: '../Public/Patients/Views/PatientDetails2.html',
            controller: 'PatientDetails2'
        }).
        when('/search', {
            templateUrl: '../Public/Patients/Views/PatientSearch.html',
            controller: 'PatientSearch'
        }).
        otherwise({
            redirectTo: '/assignmentChoice',
        });
    }]);
//CHOOSE ASSIGNMENT=============================================================
app.controller("AssignmentChoice", function ($scope, $location) {
    $scope.go = function (path) {
        $location.path(path);
    }
});

//ASSIGNMENT 1===================================================================
app.controller("PatientList", function ($scope, $location, Patient) {
    //Used to retrieve patient data
    Patient.getPatient().success(function (data) {
        $scope.patientModel = data;
    });
    //Go to patient details when you select a patient to change things
    $scope.selectedPatient = function (patient) {
        $location.path('/patientUpdate');
        Patient.setPatientDetails(patient);
    };

    $scope.resetForm = function () {
        Patient.setPatientDetails('');
    };
});

app.controller("PatientDetails", function ($scope, $location, Patient) {
    //Clears out all of the boxes when a new patient is created
    $scope.resetForm = function () {
        $scope.patient = {};
    };
    //Saves the patient to the mongodb database and clears the form
    $scope.submit = function (patient) {
        Patient.savePatientDetails(patient);
        this.resetForm();
    }
    //Goes back to the patient list view
    $scope.goBack = function () {
        $location.path('/patientList');
    }
});
//For updating a patient's details
app.controller("PatientUpdate", function ($scope, $location, Patient) {
    
    $scope.patient = {};
    
    $scope.patient._id = Patient.getPatientDetails()._id;
    $scope.patient.first_name = Patient.getPatientDetails().first_name;
    $scope.patient.last_name = Patient.getPatientDetails().last_name;
    $scope.patient.phone = Patient.getPatientDetails().phone;
    $scope.patient.last_visited = Patient.getPatientDetails().last_visited;
    $scope.patient.status = Patient.getPatientDetails().status;
    
    $scope.update = function (patient) {
        Patient.updatePatientDetails(patient);
        $location.path('/patientList');
    }

    $scope.goBack = function () {
        $location.path('/patientList');
    }
});


app.service("Patient", ['$http', function ($http) {
        var patientDetails = '';
        
        this.getPatient = function () {
            return $http.get('/get');
        }
        this.savePatientDetails = function (data) {
            return $http.post('/save', data);
        }
        this.getPatientDetails = function () {
            return patientDetails;
        }
        this.setPatientDetails = function (value) {
            patientDetails = value;
        }
        this.updatePatientDetails = function (data) {
            return $http.post('/update', data);
        }
    }]);

//ASSIGNMENT 2===================================================================
//This controller enables the to log in to the chat room
app.controller("Login", function ($scope, $location, ChatTime, Users) {
    $scope.chatlog = []; //Placed here to add the join message
    
    //This writes the written message to the server console
    socket.on('msg', function (data) { 
        $scope.chatlog.push(data);
        $scope.$apply();
    });
    
    //Sends the join message to the chatlog array
    $scope.addLoginName = function (loginname) { 
        socket.emit('msg', { 'msg': 'Server | ' + loginname + ' joined the Chat Room', 'time': ChatTime.time() });
    }
    
    //Sets the name of the person who logged in
    $scope.setLoginName = function (_loginname) { 
        loginname = _loginname;
        console.log('Login Name: ' + loginname);
        $scope.addLoginName(_loginname);
    }
    
    //This makes sure that the person entered a name to log in with
    $scope.loginSuccessful = function () { 
        var name = document.getElementById("loginname").value;
        if (name != null && name.length > 0) {
            $location.path('/chat');
            $scope.setLoginName($scope.members.loginname);
            console.log("Server | " + name + " has joined the chat room");
        }
    }
});

app.controller("Chat", function ($scope, $http, $parse, $location, ChatTime, Users) {
    $scope.chatlog = [];
    
    //This writes the written message to the server console
    socket.on('msg', function (data) { 
        $scope.chatlog.push(data);
        $scope.$apply();
    });
    
    //Sends a message to the chat room when someone leaves the chat room
    socket.on('disconnect', function (data) { 
        data = { 'msg': 'Server | A user has left the Chat Room', 'time': ChatTime.time() };
        $scope.chatlog.push(data);
        $scope.$apply();
    });
    
    //This function sends the written message to the Chat Box
    $scope.enterMessage = function (value) { 
        if (value != null && value.length > 0) {
            socket.emit('msg', { 'msg': loginname + ' - ' + value, 'time': ChatTime.time() });
            console.log('Login Name: ' + loginname);
        }
        //The following is used to clear the message box
        $scope.chatmsg = null;
        document.getElementById("chattxt").value = "";
    }
});

app.service('ChatTime', function () {
    
    this.time = function () {
        var time = new Date();
        return time.getDay() + "/" + time.getMonth() + "/" + time.getFullYear() + " | " + time.getHours() + ":" + time.getMinutes() + ":" + time.getSeconds();
    }
});

app.service("Users", ['$http', function ($http) {
    var url = '..Public/Patients/Data/Users.json';
    }]);

//ASSIGNMENT 3===================================================================

//Doctor Methods
//Doctor login controller
app.controller("DrLogin", function ($scope, $location, DrService) {
    $scope.loginDoctor = function (data) {
            DrService.loginDoctor(data);
    };
});
//
app.controller("DrRegister", function ($scope, $location, DrService) {
    
    $scope.registerDoctor = function (data) {
        DrService.save(data);
        $location.path('/drlogin');
    }
});
//doctor service
app.service("DrService", ['$http', function ($http) {
        var drDetails = '';
        
        this.save = function (data){
            $http.post('/doctor', data);
        }
        this.loginDoctor = function (data){
            return $http.post('/logindoctor', data);
        }
        this.getDrDetails = function (){
            return drDetails;
        }
    }]);

//Patient Methods
//patient list controller that shows all patients
app.controller("PatientList2", function ($scope, $location, PatientService) {
    //gets list of patients
    PatientService.getPatient().success(function (patient) {
        $scope.currentPage = 0;
        $scope.pageSize = 5;
        $scope.data = patient;
        $scope.numberOfPages = function () {
            return Math.ceil($scope.data.length / $scope.pageSize);
        }
        for (var i = 0; i < $scope.data.length; i++) {
            $scope.patientModel = $scope.data;
        }
        //$scope.patientModel = data;
    });
    //gets total number of patients in database
    PatientService.getCount().success(function (data) {
        $scope.patientCount = data;
    });
    //removes the selected patient
    $scope.removePatient = function (data){
        PatientService.remove(data);
        $location.path('/list');
    }
    //sends the patient info to the update view
    $scope.selectPatient = function (data){
        PatientService.setDetails(data);
        $location.path('/details');
    }
    //sends you to the add patient view
    $scope.addPatient = function (){
        $location.path('/patientregister');
    }
});
//Patient Update controller
app.controller("PatientDetails2", function ($scope, $location, PatientService) {
    $scope.patient = {};
    //keep the selected patient's details
    $scope.patient._id = PatientService.getDetails()._id;
    $scope.patient.first_name = PatientService.getDetails().first_name;
    $scope.patient.last_name = PatientService.getDetails().last_name;
    $scope.patient.age = PatientService.getDetails().age;
    $scope.patient.family_doctor = PatientService.getDetails().family_doctor;
    //gets a list of doctors
    PatientService.getDoctors().success(function (data) {
        $scope.doctorModel = data;
    });
    //updates the patient
    $scope.updatePatient = function (data){
        PatientService.update(data);
        $location.path('/list');
    }
});
//Patient Registration controller
app.controller("PatientRegister", function ($scope, $location, PatientService) {
    //get the list of doctors
    PatientService.getDoctors().success(function (data) {
        $scope.doctorModel = data;
    });
    //registers the patient
    $scope.registerPatient = function (data){        
        PatientService.save(data).success(function (data) {
            $location.path('/list');
        });
    }
});
//patient search controller
app.controller("PatientSearch", function ($scope, $location, PatientService) {
    //searchs through patient depending on filter criteria
    PatientService.getPatient().success(function (patient) {
        $scope.currentPage = 0;
        $scope.pageSize = 5;
        $scope.data = patient;
        $scope.sortReverse = false; // set the default sort order
        $scope.searchValue = '';
        $scope.numberOfPages = function () {
            return Math.ceil($scope.data.length / $scope.pageSize);
        }
        for (var i = 0; i < $scope.data.length; i++) {
            $scope.patientModel = $scope.data;
        }
    });
    //gets a list of doctors
    PatientService.getDoctors().success(function (data) {
        $scope.doctorModel = data;
    });

    $scope.searchLastName = function (patient) {
        PatientService.getPatientsByLastName(patient).success(function (patient) {
            $scope.search = patient
        }).error(function (data, status) {
        });
    };
});
//patient service
app.service("PatientService", ['$http', function ($http) {
        var details = '';

        this.save = function (data) {
            return $http.post('/patientregister', data);
        }
        this.remove = function (data){
            return $http.post('/removepatient', data);
        }
        this.update = function (data){
            return $http.post('updatepatient', data);
        }
        this.setDetails = function (data){
            details = data;
        }
        this.getDetails = function (){
            return details;
        }
        this.getPatient = function (){
            return $http.get('/getpatients')
        }
        this.getDoctors = function () {
            return $http.get('/getdoctors');
        }
        this.getCount = function (){
            return $http.get('/count');
        }
        this.searchPatient = function (data){
            return $http.get('/searchpatient', data)
        }
        this.getPatientsByLastName = function (patient) {
            return $http.get('/patient/' + patient);
        }
    }]);

app.filter('startFrom', function () {
    return function (input, start) {
        if (!input || !input.length) {
            return;
        }
        start = +start; //parse to int
        return input.slice(start);
    }
});