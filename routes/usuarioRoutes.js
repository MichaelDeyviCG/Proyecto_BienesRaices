import express from "express";
import { formularioLogin, formularioOlvidePassword, registrar, confirmar, formularioRegistro,resetPassword,comprobarToken, nuevoPassword, autenticar} from "../controllers/usuarioController.js";

const router = express.Router()

router.get('/login',formularioLogin)
router.post('/login',autenticar)


router.get('/registro',formularioRegistro)
router.post('/registro',registrar)

router.get('/confirmar/:token', confirmar)

router.get('/olvide-password', formularioOlvidePassword)
router.post('/olvide-password', resetPassword)
// router.post('/olvide-password', resetPassword)

//almacena el nuevo password  SI ES VALIDO EL TOKEN NOS MOSTRARA EL FORMULARIO SI NO ES VALIDO NOS MOSTRARA UN ERROR
router.get('/olvide-password/:token', comprobarToken)
router.post('/olvide-password/:token',nuevoPassword)

// router.get("/olvide-password/:token", comprobarToken)
// router.post("/olvide-password/:token", nuevoPassword)
export default router