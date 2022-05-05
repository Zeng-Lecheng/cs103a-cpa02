const express = require("express")
const layouts = require("express-ejs-layouts")
const cookieParser = require("cookie-parser")
const session = require("express-session")
const createError = require("http-errors")
const path = require("path")

const mongoose = require('mongoose')
const mongodb_URI = ''

const app = express()
app.set("view engine", "ejs")
app.set("views", path.join(__dirname, "views"))
app.use(layouts)
app.use(express.urlencoded({ extended: false }))

module.exports = app
