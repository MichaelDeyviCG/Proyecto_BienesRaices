import nodemailer from "nodemailer";

const emailRegistro = async(datos) => {

    const transport = nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT,
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS
        }
      });

      const {nombre, email, token} = datos
      await transport.sendMail({
        from: 'BienesRaices.com',
        to: email,
        subject: 'Confirma tu cuenta en BienesRaices.com',
        text: 'Confirma tu cuenta en BienesRaices.com',
        html: `
        <p>Hola ${nombre}, confirma tu cuenta en BienesRaices.com</p>

        <p>Tu cuenta ya esta lista, solo debes confirmarla en el siguente enlace: 
        <a href="${process.env.BACKEND_URL}:${process.env.PORT ?? 3000}/auth/confirmar/${token}">Confirma tu cuenta</a>
        <p>Gracias amigos</p>
                
        <p>Si tu no creaste esta cuenta, puedes ignorar el mensaje</p>
        `
      })
}


const emailOlvidePassword= async(datos) => {
  const transport = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });
  // console.log(datos)

  const {nombre ,email, token} = datos

  //enviar email
  await transport.sendMail({
    from: 'BienesRaices.com',
    to: email,
    subject: 'Restablece tu password en BienesRaices.com',
    text: 'Restablece tu password en BienesRaices.com',
    html: `
    <p>Hola ${nombre}, has solicitado restablecer tu password en BienesRaices.com</p>

    <p>Sigue el siguiente enlace para generar un nuevo password: 
    <a href="${process.env.BACKEND_URL}:${process.env.PORT ?? 3000}/auth/olvide-password/${token}">Restablecer password</a>
    
    <p>Si tu no solicitaste el password, puedes ignorar el mensaje</p>
    `
  })

}


export{
    emailRegistro,
    emailOlvidePassword
}