const mongoose = require('mongoose')
const Schema = mongoose.Schema

let userSchema = Schema({
    uid: String,
    inventory: Object,
}, { minimize: false })

module.exports = mongoose.model('User', userSchema)
