const express = require('express')
const bcrypt = require('bcrypt')
const { get_user, create_user } = require('../db.js')

const router = express.Router()


// Rutas de Auth (externas)
router.get('/login', (req, res) => {
  const errors = req.flash('errors')
  res.render('login.html', { errors })
});

router.post('/login', async (req, res) => {
  // 1. Recuperar los valores del formulario
  const email = req.body.email
  const password = req.body.password

  // 2. Validar que usuario sí existe
  const user = await get_user(email)
  if (!user) {
    req.flash('errors', 'Usuario no existe o contraseña incorrecta')
    return res.redirect('/login')
  }

  // 3. Validar que contraseña coincida con lo de la base de datos
  const son_iguales = await bcrypt.compare(password, user.password)
  if ( !son_iguales ) {
    req.flash('errors', 'Usuario no existe o contraseña incorrecta')
    return res.redirect('/login')
  }

  // 4. Guardamos el usuario en sesión
  req.session.user = user
  res.redirect('/')
});

router.get('/register', (req, res) => {
  const errors = req.flash('errors')
  res.render('register.html', { errors })
});

router.post('/register', async (req, res) => {
  // 1. Recuperamos los valores del formulario
  const foto = req.files.foto
  const email = req.body.email
  const name = req.body.nombre
  const password = req.body.password
  const password_confirm = req.body.password2
  const xp = req.body.anos
  const spec = req.body.especialidad

  // 2. validar que contraseñas sean iguales
  if (password != password_confirm) {
    req.flash('errors', 'La contraseñas no coinciden')
    return res.redirect('/register')
  }

  // 3. validar que email no exista previamente
  const user = await get_user(email)
  if (user) {
    req.flash('errors', 'Usuario ya existe o contraseña incorrecta')
    return res.redirect('/register')
  }

  // Guardar imagen
  const path = `fotos/${name}.jpg`
  foto.mv(`static/${path}`)

  // Creo el usuario
  const password_encrypt = await bcrypt.hash(password, 10)
  console.log(password_encrypt);
  await create_user(email, name, password_encrypt, xp, spec, path)

  // 4. Guardo el nuevo usuario en sesión
  req.session.user = { name, email, password, xp, spec, path }
  res.redirect('/')
});

router.get('/logout', (req, res) => {
  // 1. Eliminamos al usuario de la sesión
  req.session.user = undefined
  // 2. Lo mandamos al formulario de login
  res.redirect('/login')
})



module.exports = router