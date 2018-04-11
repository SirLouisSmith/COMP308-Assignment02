var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var doctorSchema = new Schema({
    first_name : String,
    last_name : String,
    username : String,
    email : String,
    password: String
})
var Doctor = mongoose.model('Doctor', doctorSchema);
module.exports = Doctor;