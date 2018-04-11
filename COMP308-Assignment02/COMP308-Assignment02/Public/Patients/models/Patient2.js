//patient schema for assignment 1
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var patientSchema = new Schema( {
    first_name: String,
    last_name: String,
    phone: String,
    last_visited: Date,
    status: String
});
var Patient = mongoose.model('Patient', patientSchema);
module.exports = Patient;