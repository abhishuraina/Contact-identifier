module.exports = {
  development: {
    username: 'doctor',
    password: '12345678',
    database: 'contact_identifier',
    host: "127.0.0.1",
    dialect: "postgres"
  },
  production: {
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    host: "127.0.0.1",
    dialect: "postgres"
  }
}
