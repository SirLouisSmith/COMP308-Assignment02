//patient schema for assignment 4
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var patientSchema = new Schema({
    ID : Number,
    first_name: String,
    last_name: String,
    visits: [{id:Number,complaint:String,billing_amt:Number}],
    age: Number,
    family_doctor: String,
    family_doctor_id: String,
    created_at: { type: Date, default: Date.now },
    last_modified: { type: Date, default: Date.now }
});
var Patient = mongoose.model('Patient3', patientSchema);
module.exports = Patient;