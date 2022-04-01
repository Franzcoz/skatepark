const express = require('express');
const fetch = require('fetch');
const bcrypt = require('bcrypt');
const { get_user, get_users, set_state, update_usr, del_usr } = require('../db.js');

const router = express.Router()

// Rutas internas
function protected_routes (req, res, next) {
  if (!req.session.user) {
    req.flash('errors', 'Debe ingresar al sistema primero')
    return res.redirect('/login')
  }
  next()
}

router.get('/admin', protected_routes, async (req, res) => {
  // me traigo a lista de todos los usuarios
  const users = await get_users()
  res.render('admin.html', { users })
});

router.get('/datos', protected_routes, async (req, res) => {
  const user = req.session.user
  res.render('Datos.html', { user })
});

router.get('/', protected_routes, async (req, res) => {
  const user = req.session.user
  const users = await get_users()
  res.render('index.html', { users })
});

router.put('/state/:id', async (req, res) => {

  await set_state(req.params.id, req.body.new_state)

  res.json({todo: 'ok'})
})

router.post('/update/:id', async (req, res) => {
  const ide = req.params.id
  const name = req.body.nombre
  const password = req.body.password
  const pass2 = req.body.password2
  const xp = req.body.xp
  const spec = req.body.spec
  const email = req.body.email
  const path = req.body.path
  const estado = req.body.state 
  const button = req.body.btn

  // validar que contraseñas sean iguales
  if (password != pass2) {
    req.flash('errors', 'Las contraseñas no coinciden')
    return res.redirect('/datos')
  }

  if (password == null) {
    req.flash('errors', 'La contraseña es requerida, ya sea la contraseña anterior o la nueva')
    return res.redirect('/datos')
  }

  if (button == 'update') {
    // Actualizo el usuario
    const password_encrypt = await bcrypt.hash(password, 10)
    await update_usr(ide, name, password_encrypt, xp, spec)
    // 4. Guardo el nuevo usuario en sesión
    const user = await get_user(email)
    req.session.user = user
    // Iniciamos sesion nuevamente
    res.redirect('/datos')
  }
  if (button == 'delet') {
    await del_usr(ide)
    req.session.user = undefined
    res.redirect('/login')
  }
})


module.exports = router