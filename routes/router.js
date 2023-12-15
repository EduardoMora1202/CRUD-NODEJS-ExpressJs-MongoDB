//se realizaran todas las rutas de los archivos de esta aplicacion

const express = require("express");
const router = express.Router();
const User = require("../Models/users");
const multer = require("multer");
const fs = require('fs');
const { log } = require("console");


//subir imagen
var Storage = multer.diskStorage({
    destination: function(req, fire, cb){
        cb(null, "./uploads")
    },
    filename: function (req, file, cb) {
        cb(null, file.fieldname + "_" + Date.now() + "_" + file.originalname);
    }

})

var upload = multer({
    storage: Storage,
}).single("image");

// insertar un Usuario a la base de datos route
router.post("/add", upload, async (req, res) => {
    try {
        const user = new User({
            name: req.body.name,
            email: req.body.email,
            phone: req.body.phone,
            image: req.file.filename,
        });

        await user.save();

        req.session.message = {
            type: 'success',
            message: 'Usuario agregado!'
        }
        res.redirect('/');
    } catch (err) {
        res.json({ message: err.message, type: 'danger' });
    }
});

// obtener la ruta de los usuarios consultar

router.get("/", async (req, res) => {
    try {
        const users = await User.find().exec();
        res.render('index', {
            title: 'Home page',
            users: users,
        });
    } catch (err) {
        res.json({ message: err.message });
    }
});


router.get("/add",(req, res) =>{
    res.render("add_users",{ title: "add Users" });
});

//Editar un usuario
router.get("/edit/:id", async (req, res) => {
    try {
        let id = req.params.id;
        const user = await User.findById(id).exec();

        if (!user) {
            res.redirect('/');
        } else {
            res.render("edit_users", {
                title: "Edit User",
                user: user
            });
        }
    } catch (err) {
        res.redirect('/');
    }
});

// actualizar Usuarios router
// actualizar Usuarios router
router.post("/update/:id", upload, async (req, res) => {
    let id = req.params.id;
    let new_image = '';

    if (req.file) {
        new_image = req.file.filename;
        try {
            fs.unlinkSync('./uploads' + req.body.old_image);
        } catch (err) {
            console.log(err);
        }
    } else {
        new_image = req.body.old_image;
    }

    try {
        const updatedUser = await User.findByIdAndUpdate(
            id,
            {
                name: req.body.name,
                email: req.body.email,
                phone: req.body.phone,
                image: new_image,
            },
            { new: true } // Retorna el documento modificado
        ).exec();

        req.session.message = {
            type: "success",
            message: "Usuario Modificado correctamente!",
        };

        res.redirect('/');
    } catch (err) {
        res.json({ message: err.message, type: "danger" });
    }
});


// eliminar Usuario de la ruta
// eliminar Usuario de la ruta
router.get("/delete/:id", async (req, res) => {
    try {
        let id = req.params.id;
        const result = await User.findByIdAndDelete(id);

        if (result && result.image !== "") {
            try {
                fs.unlinkSync("./uploads/" + result.image);
            } catch (err) {
                console.log(err);
            }
        }

        req.session.message = {
            type: "info",
            message: "Eliminado Correctamente!"
        };
        res.redirect("/");
    } catch (err) {
        res.json({ message: err.message });
    }
});


module.exports = router;