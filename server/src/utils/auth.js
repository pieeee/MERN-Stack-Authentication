import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import { token } from 'morgan'
import { userModel } from '../resources/users/user.model'
import dotenv from 'dotenv'
import sendEmail from './emails'

/**
 * @type helpers
 */

/**
 * @desc hash password
 * @param {string} password
 * @return {string, boolean} hash password and compare
 */

export const hashPassword = (password) => {
  const salt = bcrypt.genSaltSync(10)
  return bcrypt.hashSync(password, salt)
}

export const comparePassword = (password, hash) => {
  return bcrypt.compare(password, hash)
}

/**
 * @desc create token and verify token
 * @param {object} payload
 * @param {String} expiry
 * @param {string} token
 * @returns token, and payload
 */

export const createToken = (payload, expiry = 'none') => {
  dotenv.config()
  const secret = process.env.JWT_SECRET
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

export const verifyToken = (token) => {
  dotenv.config()
  const secret = process.env.JWT_SECRET
  return jwt.verify(token, secret)
}

/**
 * Send verification link to user email
 *
 * @param {String} id user email
 * @param {String} email user email
 * @param {String} name user name
 *
 * @function sendEmail send email template
 *
 */

export const sendTransEmail = async (id, email, name, route, type) => {
  const token = await createToken({ _id: id }, '.5h')
  const verificationURL = `http://localhost:4000/api/auth/user/${route}/${token}`
  const sendEmailParams = {
    type: type,
    to: email,
    context: {
      name,
      verificationURL,
    },
    //   send: true, (uncomment to send email)
  }
  /**@function */
  await sendEmail(sendEmailParams)
}

/**
 * @type middlewares
 */

/**
 * @desc check if user email registered or not
 * @param {token} req.body
 * @return {message} res
 * @param {*} next
 */

/**
 * @desc check email before register a user,
 * if user already registered or not
 * @param {verifyJWT} extract payload
 * @return {next()} else error
 */

export const checkRegistered = async (req, res, next) => {
  try {
    //  extract payload from jwt token
    // const {email} = verifyJWT(req.body.registerPayloadToken) == == ==> to do
    const { email } = req.body
    const registered = await userModel.findOne({ email })
    if (!registered) {
      next()
    } else {
      res.status(201).json({ data: {}, name: 'alreadyRegistered' })
    }
  } catch (error) {
    res.status(400).json({ error })
    console.error(`${error}`.red)
  }
}

/**
 * This middleware checks if the user's email registered or not
 *
 * @param {*} req req.params.token token from client side
 * @function verifyToken token to user email/password
 * @function findOner by _id || email
 *
 *
 * @param {*} next if users email is registered
 * @param {*} res user not found
 *
 *
 * @throw error || res.redirect('/token-expired')
 *
 */

export const checkUser = async (req, res, next) => {
  try {
    // decoding token
    let params = null
    if (req.params.token) {
      params = verifyToken(req.params.token)
    } else {
      params = verifyToken(req.body.token)
    }

    console.log(params)
    // desc find user by email or id
    let user = null

    if (params._id !== undefined) {
      user = await userModel.findOne({ _id: params._id })
    } else if (params.email !== undefined) {
      user = await userModel.findOne({ email: params.email })
    }

    if (user) {
      req.checkUser = user
      next()
    } else {
      console.log(user)
      res.status(201).json({ payload: {}, name: 'userNotFound' })
    }

    // users email is registered or not
  } catch (error) {
    console.error(`${JSON.stringify(error.message)}`.red)

    if (error.name === 'TokenExpiredError') {
      res.status(202).cookie('tokenExpired', 'true', {
        sameSite: 'strict',
        path: '/',
        expires: new Date(new Date().getTime() + 1000 * 1000),
      })
      res.redirect('http://localhost:3000/token-expired')
    } else {
      res.status(400).send(error.name)
    }
  }
}

/**
 * @desc verifying use is verified or not
 *
 *
 * @param {*} req.checkUser {verified, firstname}
 * @param {*} res verified? next() || response: 'notVerified'
 * @param {*} next
 *
 *
 * @throws {json} error
 */

export const checkVerified = async (req, res, next) => {
  try {
    const { verified, firstName, email } = req.checkUser
    if (!verified) {
      res
        .status(201)
        .json({ payload: { verified, firstName, email }, name: 'notVerified' })
    } else {
      next()
    }
  } catch (error) {
    console.error(JSON.stringify(error))
    res.status(400).json({ error })
  }
}

/**
 * Check the signed in token.
 * if cookie.signintoken?
 * @returns {object} user.profile --> next()
 *
 * if !cookie.signintoken
 * set cookie signedin = false
 *
 */

export const isSignedIn = async (req, res, next) => {
  const signInToken = req.cookies.signInToken
  if (signInToken) {
    const { _id } = verifyToken(signInToken)
    const user = await userModel.findOne({ _id })
    req.isSignedIn = user
    next()
  } else {
    res
      .status(202)
      .cookie('signedIn', 'false', {
        sameSite: 'strict',
        path: '/',
        expires: new Date(new Date().getTime() + 30 * 86400 * 1000),
      })
      .json({ payload: {}, name: 'signedOut' })
  }
  try {
  } catch (error) {}
}
