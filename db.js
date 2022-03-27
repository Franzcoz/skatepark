const { Pool } = require('pg')

// creamos nuestro pool de conexiones
const pool = new Pool({
  user: 'postgres',
  host: '127.0.0.1',
  database: 'skatepark',
  password: '1005',
  max: 12,
  min: 2,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000
})

/* Obtengo un usuario por su email, o undefined si este no existe en la tabla "users" */
async function get_user(email) {
  const client = await pool.connect()

  const { rows } = await client.query({
    text: 'select * from skaters where email=$1',
    values: [email]
  })

  client.release()

  if (rows.length > 0) {
    return rows[0]
  }
  return undefined
}

async function create_user(email, name, password, xp, spec, foto) {
  const client = await pool.connect()

  await client.query({
    text: 'insert into skaters (email, nombre, password, anos_experiencia, especialidad, foto, estado) values ($1, $2, $3, $4, $5, $6, false)',
    values: [email, name, password, xp, spec, foto]
  })

  client.release()
}

async function get_users() {
  const client = await pool.connect()

  const { rows } = await client.query('select * from skaters order by id')

  client.release()

  return rows
}

async function set_state(user_id, new_state) {
  const client = await pool.connect()

  await client.query({
    text: 'update skaters set estado=$2 where id=$1',
    values: [parseInt(user_id), new_state]
  })

  client.release()
}

async function update_usr(id, name, password, xp, spec) {
  const client = await pool.connect()

  await client.query({
    text: 'update skaters set nombre=$2, password=$3, anos_experiencia=$4, especialidad=$5 where id=$1',
    values: [parseInt(id), name, password, xp, spec]
  })

  client.release()
}

async function del_usr(id) {
  const client = await pool.connect()

  await client.query({
    text: 'delete skaters where id=$1',
    values: [parseInt(id)]
  })

  client.release()
}



module.exports = {
  get_user,
  create_user,
  get_users,
  set_state,
  update_usr,
  del_usr
}
