import express from "express";
import usuarioRoutes from "./routes/usuarioRoutes.js";
import db from "./config/db.js";

const app= express()

//habilitar lectura de formularios
app.use(express.urlencoded({extended: true}))

//conexion a la base de datos
try {
    await db.authenticate();
    console.log("Conxion realizado con exitó")
} catch (error) {
    console.log(error)
}

//habilitar pug
app.set('view engine', 'pug')
app.set('views', './views')

//habilitar tailwind
app.use( express.static('public') )

app.use('/auth', usuarioRoutes)

const PORT = 3000

app.listen(PORT, () => {
    console.log(`corriendo en el puerto ${PORT}`)
})