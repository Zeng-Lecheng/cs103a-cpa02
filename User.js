const mongoose = require('mongoose')
const Schema = mongoose.Schema

let userSchema = Schema({
    uid: String,
    inventory: Object,
    last_update: Number
})

module.exports = mongoose.model('User', userSchema)
