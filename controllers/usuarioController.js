import { check, validationResult } from "express-validator";
import bcrypt from "bcrypt";

import Usuarios from "../models/Usuario.js";
import { generarId, generarJWT } from "../helpers/token.js";
import {emailRegistro, emailOlvidePassword} from "../helpers/email.js";


const formularioLogin = (req, res) => {
    res.render("auth/login", {
        pagina: 'Inicia sesión',
        csrfToken: req.csrfToken()
    })
}

//verificar si los campos son vacios
const autenticar = async(req, res) => {
    await check('email').isEmail().withMessage('El email es obligatorio').run(req)
    await check('email').isEmail().withMessage('El password es obligatorio').run(req)

    const resultado = validationResult(req)
    
    if(!resultado.isEmpty()){
        res.render("auth/login", {
            pagina: 'Inicia sesión',
            csrfToken: req.csrfToken(),
            errores: resultado.array()
        })
    }

    //verificamos si el email existe
    const {email,password} = req.body
    const usuario = await Usuarios.findOne({where: {email}})
    
    if(!usuario){
        res.render("auth/login", {
            pagina: 'Inicia sesión',
            csrfToken: req.csrfToken(),
            errores: [{msg: "Este email no pertenece a un usuario"}]
        })
    }
    //verificamos si el usuario ha confirmado su cuenta
    if(!usuario.confirmado){
        res.render("auth/login", {
            pagina: 'Inicia sesión',
            csrfToken: req.csrfToken(),
            errores: [{msg: "La cuenta no ha sido confirmada"}]
        })
    }

    //verificamos si el password ingresado es el correcto
    if(!usuario.verificarPassword(password)){
        res.render("auth/login", {
            pagina: 'Inicia sesión',
            csrfToken: req.csrfToken(),
            errores: [{msg: "Contraseña incorrecta"}]
        })
    }

    //autenticar usuario 
    const token = generarJWT({id:usuario.id, nombre:usuario.nombre})
    console.log(token)


    //almacenar en un cookie
    return res.cookie('_token', token,{
        httpOnly:true
    }).redirect('/mis-propiedades')

}


const formularioRegistro = (req, res) => {
    res.render("auth/registro", {
        pagina: 'Crear cuenta',
        csrfToken: req.csrfToken()
    })
}

const registrar = async (req, res) => {

    await check('nombre').notEmpty().withMessage("El nombre es obligatorio").run(req)
    await check('email').isEmail().withMessage("No parece ser un correo valido").run(req)
    await check('password').isLength({ min: 3 }).withMessage("El password debe de tener minimo 6 caracteres").run(req)
    await check('repetir_password').custom((value, { req }) => value === req.body.password).withMessage("Los passwords no son iguales").run(req)


    const resultado = validationResult(req)

    if (!resultado.isEmpty()) {
        return res.render("auth/registro", {
            pagina: 'Crear cuenta',
            csrfToken: req.csrfToken(),
            errores: resultado.array(),
            usuario: {
                nombre: req.body.nombre,
                email: req.body.email
            }
        })
    }

    const { nombre, email, password } = req.body
    const existeUsuario = await Usuarios.findOne({ where: { email } })

    if (existeUsuario) {
        return res.render("auth/registro", {
            pagina: 'Crear cuenta',
            csrfToken: req.csrfToken(),
            errores: [{ msg: "Este Email ya esta en uso" }],
            usuario: {
                nombre: req.body.nombre,
                email: req.body.email
            }
        })
    }

    const usuario = await Usuarios.create({
        nombre,
        email,
        password,
        token: generarId()
    })

    emailRegistro({
        nombre: usuario.nombre,
        email: usuario.email,
        token: usuario.token
    })

    return res.render("template/mensaje", {
        pagina: "Cuenta creada correctamente",
        mensaje: "Hemos enviado un Email de confirmacion, presiona en el enlace"

    })


}

const confirmar = async(req, res) => {

    const {token} = req.params

    const usuario = await Usuarios.findOne({where : {token}})

    if(!usuario){
        return res.render("auth/confirmar-cuenta", {
            pagina: "Cuenta creada correctamente",
            mensaje: "Hemos enviado un Email de confirmacion, presiona en el enlace",
            error: true
    
        })
    }

    usuario.token=""
    usuario.confirmado= true,
    usuario.save()

    return res.render("auth/confirmar-cuenta", {
        pagina: "Cuenta creada correctamente",
        mensaje: "Hemos enviado un Email de confirmacion, presiona en el enlace",
    })


}

const formularioOlvidePassword = (req, res) => {
    res.render("auth/olvide-password", {
        pagina: "Recupera tu acceso a Bienes Raices",
        csrfToken: req.csrfToken(),
    })
}

const resetPassword= async(req, res)=> {

    await check('email').isEmail().withMessage("No parece ser un correo valido").run(req)

    const resultado = validationResult(req)
    
    if(!resultado.isEmpty()){
        return res.render("auth/olvide-password", {
            pagina: "Recupera tu acceso a Bienes Raices",
            csrfToken: req.csrfToken(),
            errores: resultado.array()
        })
    }

    const {email} = req.body
    const usuario = await Usuarios.findOne({where: {email}})

    if(!usuario){
        return res.render("auth/olvide-password", {
            pagina: "Recupera tu acceso a Bienes Raices",
            csrfToken: req.csrfToken(),
            errores: [{msg:"Este correo no le pertenece a un usuario"}]
        })
    }

    usuario.token = generarId()
    await usuario.save()

    emailOlvidePassword({
        email: usuario.email,
        nombre:usuario.nombre,
        token:usuario.token
    })

    res.render("template/mensaje", {
        pagina: "Recupera tu acceso a Bienes Raices",
        csrfToken: req.csrfToken(),
        mensaje: "Enviamos un enlace a su correo electronico para restaurar su contraseña"
    })
}

const comprobarToken = async(req, res) =>{
    const {token} = req.params
    const usuario = await Usuarios.findOne({where: {token}})
    
    if(!usuario){
        return res.render("auth/confirmar-cuenta", {
            pagina: "Restablece tu password",
            mensaje: "Hubo un problema al confirmar su cuenta, intente de nuevo",
            error: true
        })
    }
    
    return res.render("auth/reset-password", {
        pagina: "Restablece tu password",
        csrfToken: req.csrfToken(),
    })

}
const nuevoPassword = async(req, res) => {

    await check('password').isLength({min: 3}).withMessage("El password debe tener al menos 6 caracteres").run(req)
    const resultado = validationResult(req)
    
    if(!resultado.isEmpty()){
        return res.render("auth/reset-password", {
            pagina: "Recupera tu acceso a Bienes Raices",
            csrfToken: req.csrfToken(),
            errores: resultado.array()
        })
    }
    
    const{password} = req.body
    const {token} =req.params
    const usuario = await Usuarios.findOne({where: {token}})
    
    const salt = await bcrypt.genSalt(10)
    usuario.password = await bcrypt.hash(password, salt)

    usuario.token = null
    await usuario.save()


    return res.render("auth/confirmar-cuenta", {
        pagina: "Recupera tu acceso a Bienes Raices",
        csrfToken: req.csrfToken(),
        mensaje: "Hemos realizado correctamente el cambio de tu contraseña entra al enlace"

    })
}



export {
    formularioLogin,
    formularioRegistro,
    registrar,
    confirmar,
    formularioOlvidePassword,
    resetPassword,
    comprobarToken,
    nuevoPassword,
    autenticar
}