import jwt from 'jsonwebtoken'
import axios from 'axios'
import { authAPI } from '../Config'
axios.defaults.withCredentials = true

/**
 * @desc create token and verify token
 * @param {object} payload
 * @param {String} expiry
 * @param {string} token
 * @returns token, and payload
 */
const secret = 'your_jwt_secret'

export const createToken = (payload, expiry = 'none') => {
  try {
    if (expiry === 'none') {
      return jwt.sign(payload, secret)
    } else {
      return jwt.sign(payload, secret, { expiresIn: expiry })
    }
  } catch (error) {
    console.error(error)
  }
}

export const verifyToken = (token) => jwt.verify(token, secret)

export const signOut = () => {
  axios.get(`${authAPI}/signout`, { withCredentials: true })
}
