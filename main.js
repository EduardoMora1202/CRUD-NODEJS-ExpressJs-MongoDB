//import de las librerias
require("dotenv").config();
const express = require('express');
const mongoose = require('mongoose');
const Session = require('express-session')

//app va a ser nuestro servidor
const app = express();
const port = process.env.port || 4000;

//conexion a la base de datos
mongoose.connect(process.env.DB_URI, { useUnifiedTopology: true })
const db = mongoose.connection;
db.on('error', (error) => console.log(error));
db.once('open', () => console.log("Conectado a la base de datos!")); // Cambiado aquí

//Milddlewares
app.use(express.urlencoded({extended: false}))
app.use(express.json());

app.use(
    Session({
        secret: 'my secret key',
        saveUninitialized: true,
        resave: false
    })
);


app.use((req, res ,next) =>{
    res.locals.message = req.session.message;
    delete req.session.message
    next();
});

app.use(express.static("uploads"));


// motor de plantillas de conjunto
app.set("view engine","ejs");

//prefijo de ruta es el que se va a encargar de todas las rutas
app.use("",require("./routes/router"));



//Conexion al servidor
app.listen(port,() => {
    console.log(`servidor Iniciado en el http://localhost:${port}`)
})