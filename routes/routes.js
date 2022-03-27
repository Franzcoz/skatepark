const express = require('express');
const bcrypt = require('bcrypt');
const { get_users, set_state, update_usr, del_usr } = require('../db.js');

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
  const user = req.session.user
  // me traigo a lista de todos los usuarios
  const users = await get_users()


  res.render('admin.html', { users })
});

router.get('/datos', protected_routes, (req, res) => {
  const user = req.session.user
  res.render('Datos.html', { user })
});

router.get('/', protected_routes, (req, res) => {
  const user = req.session.user

  res.render('index.html', { user })
});

router.put('/state/:id', async (req, res) => {

  await set_state(req.params.id, req.body.new_state)

  res.json({todo: 'ok'})
})

router.put('/update/:id', async (req, res) => {
  const ide = req.params.id
  const name = req.body.nombre
  const password = req.body.password
  const pass2 = req.body.password2
  const xp = req.body.xp
  const spec = req.body.spec
  const path = req.body.path

  console.log(xp)

  // validar que contraseñas sean iguales
  if (password != pass2) {
    req.flash('errors', 'La contraseñas no coinciden')
    return res.redirect('/datos')
  }

  // Creo el usuario
  const password_encrypt = await bcrypt.hash(password, 10)
  console.log(password_encrypt)
  await update_usr(ide, name, password_encrypt, xp, spec)
  // 4. Guardo el nuevo usuario en sesión
  req.session.user = { name, email, password, xp, spec, path }
  res.redirect('/')

  
  res.json({todo: 'ok'})
})

router.delete('/delete/:id', async (req, res) => {

  await del_usr(req.params.id)

  res.json({todo: 'ok'})
})

module.exports = router