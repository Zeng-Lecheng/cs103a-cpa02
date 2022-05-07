const express = require('express')
const layouts = require('express-ejs-layouts')
const cookieParser = require('cookie-parser')
const session = require('express-session')
const debug = require("debug")("personalapp:server")
const createError = require('http-errors')
const path = require('path')
const http = require("http")
const bodyParser = require('body-parser');
const { v4: uuidv4 } = require('uuid')
var MongoDBStore = require('connect-mongodb-session')(session);

const mongoose = require('mongoose')
const mongodb_URI = 'mongodb+srv://admin:tiger%26zlc%2697@cluster0.k0m67.mongodb.net/test?authSource=admin&replicaSet=atlas-k94gtp-shard-0&readPreference=primary&ssl=true'

const User = require('./User')

const app = express()
app.set('view engine', 'ejs')
app.set('views', path.join(__dirname, 'views'))
app.use(layouts)
app.use(express.json())
app.use(cookieParser())
app.use(express.urlencoded({ extended: false }))
app.use(bodyParser.urlencoded({ extended: true }))
app.use(express.urlencoded({ extended: true }))

mongoose.connect(mongodb_URI, { useNewUrlParser: true, useUnifiedTopology: true })

const db = mongoose.connection
db.on('error', console.error.bind(console, 'connection error:'))
db.once('open', function () { console.log("we are connected!!!") })
var store = new MongoDBStore({
    uri: mongodb_URI,
    collection: 'mySessions'
});

// Catch errors
store.on('error', function (error) {
    console.log(error);
});


app.get('/', async (req, res) => {
    if (req.cookies != null && typeof(req.cookies.uid) !== 'undefined' && req.cookies.uid != 'j:null') {
        res.locals.data = await User.findOne({ uid: req.cookies.uid })
        if (res.locals.data === 'undefined') {
            res.redirect('/sync')
        } else {
            res.render('index', { uid: req.cookies.uid })
        }
    } else {
        res.cookie('uid', null)
        res.redirect('/sync')
    }
})

app.get('/about', (req, res) => {
    res.render('about')
})

app.get('/sync', (req, res) => {
    if (req.cookies !== null && req.cookies.uid != null) {
        res.render('sync', { uid: req.cookies.uid })
    } else {
        res.render('sync', { uid: null })
    }
})

app.get('/signup', (req, res) => {
    let uid = uuidv4()
    console.log(`${uid} inserted.`)
    User.insertMany({ uid: uid, inventory: {}, last_update: Date.now() })
    res.cookie('uid', uid)
    res.render('sync', { uid: uid })
})

app.post('/login', async (req, res) => {
    let data = await User.findOne({ uid: req.body.uid })
    if (data !== null) {
        res.cookie('uid', req.body.uid)
        res.locals.data = data;
        res.redirect('/')
    } else {
        res.cookie('uid', null)
        res.render('sync', { uid: null })
    }
})

app.get('/editor/:name/:content', (req, res) => {
    res.render('editor', { name: req.params.name, content: req.params.content })
})

app.post('/edit', async (req, res) => {
    let data = await User.findOne({ uid: req.cookies.uid })
    data.inventory[req.body.name] = req.body.content
    res.locals.data = await User.findOneAndUpdate({ uid: req.cookies.uid }, { inventory: data.inventory })
    res.redirect('/')
})

app.get('/delete/:name', async (req, res) => {
    let data = await User.findOne({ uid: req.cookies.uid })
    delete data.inventory[req.params.name]
    res.locals.data = await User.findOneAndUpdate({ uid: req.cookies.uid }, { inventory: data.inventory })
    res.redirect('/')
})

app.use(function (req, res, next) {
    next(createError(404));
})

app.use(function (err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message
    res.locals.error = req.app.get("env") === "development" ? err : {}
    // render the error page
    res.status(err.status || 500)
    res.render("error")
})

const port = "5000"
app.set("port", port)
const server = http.createServer(app)

server.listen(port)

function onListening() {
    var addr = server.address()
    var bind = typeof addr === "string" ? "pipe " + addr : "port " + addr.port
    debug("Listening on " + bind)
}

function onError(error) {
    if (error.syscall !== "listen") {
        throw error
    }

    var bind = typeof port === "string" ? "Pipe " + port : "Port " + port

    // handle specific listen errors with friendly messages
    switch (error.code) {
        case "EACCES":
            console.error(bind + " requires elevated privileges")
            process.exit(1)
            break
        case "EADDRINUSE":
            console.error(bind + " is already in use")
            process.exit(1)
            break
        default:
            throw error
    }
}

server.on("error", onError)
server.on("listening", onListening)

module.exports = app
