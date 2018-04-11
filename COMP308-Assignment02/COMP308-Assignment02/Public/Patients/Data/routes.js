var Patient = require('./patient.js');
module.exports = function(app, mongoose, stormpath) {
    app.get('/api/patient/', function (req, res) {
        console.log('Get patients in routes');
        Patient.find(function (err, patients) {
            console.log(patients);
            if (err) {
                res.send(err);
                console.log('error');
            }
            res.json(patients);
        });
    });
};