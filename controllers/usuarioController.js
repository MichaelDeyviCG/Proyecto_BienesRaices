import Usuarios from "../models/Usuario.js";

const formularioLogin =  (req, res) => {
    res.render("auth/login",{
        pagina:'Inicia sesión'
    })
}

const formularioRegistro =  (req, res) => {
    res.render("auth/registro",{
        pagina:'Crear cuenta'
    })
}

const registrar =  async(req, res) => {
    const usuario = await Usuarios.create(req.body)
    res.json(usuario)
}

const formularioOlvidePassword =  (req, res) => {
    res.render("auth/olvide-password",{
        pagina:"Recupera tu acceso a Bienes Raices"
    })
}

export {
    formularioLogin,
    formularioRegistro,
    registrar,
    formularioOlvidePassword
}