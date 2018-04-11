//patient schema for assignment 3
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var patientSchema = new Schema({
    ID : Number,
    first_name: String,
    last_name: String,
    age: Number,
    family_doctor: String,
    family_doctor_id: String,
    created_at: { type: Date, default: Date.now },
    last_modified: { type: Date, default: Date.now }
});
var Patient = mongoose.model('Patient2', patientSchema);
module.exports = Patient;