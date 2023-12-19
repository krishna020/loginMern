//const expressJwt = require('express-jwt');
require('dotenv').config()

const { expressjwt: jwt } = require("express-jwt");

function authJwt() {
  const secret = process.env.secret;
  return jwt({
    secret,
    algorithms: ["HS256"],
    isRevoked: isRevoked
  }).unless({
    path: [
      '/api/v1/users/login',
      '/api/v1/users/create_user'
    ]
  })
}

async function isRevoked(req, jwt) {

  const payload = jwt.payload
  if (!payload.isAdmin) {
    return true
  }
  return false
}

module.exports = authJwt;