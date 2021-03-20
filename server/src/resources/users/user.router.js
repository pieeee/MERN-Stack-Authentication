import { json, Router } from 'express'
import { userModel } from './user.model'
import sendEmail from '../../utils/emails'
import {
  hashPassword,
  createToken,
  verifyToken,
  comparePassword,
  checkRegistered,
  checkUser,
  checkVerified,
  sendTransEmail,
  isSignedIn,
} from '../../utils/auth'

const router = Router()

/**
 * @desc POST register /api/auth/user/register
 * @param {checkRegistered}
 * @param {hashPassword}
 * @param {createToken}
 * @public
 */

router.post('/register', checkRegistered, async (req, res) => {
  try {
    const { firstName, lastName, email, plainPassword } = req.body
    const password = await hashPassword(plainPassword)
    const user = await userModel.create({
      firstName,
      lastName,
      email,
      password,
    })

    // send email
    // create token & verificationURL
    const verificationToken = await createToken({ _id: user._id }, '.5h')
    const verificationURL = `http://localhost:4000/api/auth/user/verify/${verificationToken}`

    const sendEmailParams = {
      type: 'verifyAccount',
      to: user.email,
      context: {
        name: user.firstName,
        verificationURL,
      },
      //   send: true, (uncomment to send email)
    }
    await sendEmail(sendEmailParams)

    //   send cookie {email sent}
    const emailSentToken = await createToken({
      firstName: user.firstName,
      email: user.email,
    })

    res
      .status(202)
      .cookie('emailSent', `${emailSentToken}`, {
        sameSite: 'strict',
        path: '/',
        expires: new Date(new Date().getTime() + 10 * 1000),
      })
      .json({ payload: {}, name: 'emailSent' })
  } catch (error) {
    console.log(error)
    res.status(400).json(error)
  }
})

/**
 * @desc resend verification email
 */

router.post('/resend-verification-link', checkUser, async (req, res) => {
  try {
    const { _id, email, firstName } = req.checkUser
    await sendTransEmail(_id, email, firstName, 'verify', 'verifyAccount')
    const emailSentToken = await createToken({
      firstName,
      email,
    })
    res
      .status(202)
      .cookie('emailSent', `${emailSentToken}`, {
        sameSite: 'strict',
        path: '/',
        expires: new Date(new Date().getTime() + 10 * 1000),
      })
      .json({ payload: {}, name: 'emailSent' })
  } catch (error) {
    res.status(400).json(error)
  }
})

/**
 * @desc  GET /api/auth/user/verify/:token
 * verify user email & update data base
 * @param {jwttoken} string
 * @param {tokenVeridy} function
 * @return redirecting to sign in page or throw error
 */

router.get('/verify/:token', checkUser, async (req, res) => {
  try {
    const { _id, firstName, verified } = req.checkUser
    // update db
    await userModel.updateOne({ _id }, { verified: true }, { new: true })
    // set confirmation at cookie and redirecting
    let verifiedConfirmToken = ''
    if (!verified) {
      verifiedConfirmToken = createToken({ firstName, verified: true })
    } else {
      verifiedConfirmToken = createToken({ firstName, verified: 'once' })
    }

    await res
      .status(202)
      .cookie('verifiedConfirmToken', `${verifiedConfirmToken}`, {
        sameSite: 'strict',
        path: '/',
        expires: new Date(new Date().getTime() + 10 * 1000),
      })
    res.redirect('http://localhost:3000/signin') //
  } catch (error) {
    console.log(`${JSON.stringify(error)}`.red)
    res.status(400), json({ error })
    console.error(error)
  }
})

// signin user
router.post('/signin', [checkUser, checkVerified], async (req, res) => {
  try {
    const { token } = req.body
    const payload = verifyToken(token)
    const { _id, password } = req.checkUser
    const passwordMatched = await comparePassword(payload.password, password)
    if (passwordMatched) {
      const signInToken = await createToken({ _id })
      res.status(202).cookie('signInToken', `${signInToken}`, {
        sameSite: 'strict',
        path: '/',
        expires: new Date(new Date().getTime() + 30 * 86400 * 1000),
        httpOnly: true,
      })
      res
        .status(202)
        .cookie('signedIn', 'true', {
          sameSite: 'strict',
          path: '/',
          expires: new Date(new Date().getTime() + 30 * 86400 * 1000),
        })
        .send({ data: { signedIn: true }, name: 'signedIn' })
    } else {
      res.status(202).send({ data: {}, name: 'passError' })
    }
  } catch (error) {
    console.log(`${JSON.stringify(error)}`.red)
    res.status(400), json({ error })
  }
})

// send user profile.
router.get('/profile', isSignedIn, (req, res) => {
  try {
    const { firstName, lastName, email } = req.isSignedIn
    res.status(200).json({
      payload: {
        firstName,
        lastName,
        email,
      },
      name: 'userProfile',
    })
  } catch (error) {
    res.status(400).json(error.message)
  }
})

// forget password
// reset link
router.post('/password-reset', checkUser, async (req, res) => {
  try {
    const { _id, email, firstName } = req.checkUser
    await sendTransEmail(
      _id,
      email,
      firstName,
      'password-reset',
      'passwordReset'
    )
    res.status(200).json({ payload: { email }, name: 'emailSent' })
  } catch (error) {
    res.status(400).json(error.name)
  }
})

router.get('/password-reset/:token', checkUser, async (req, res) => {
  const { _id } = req.checkUser
  const token = await createToken({ _id })
  await res.status(200).cookie('resetPassword', `${token}`, {
    sameSite: 'strict',
    path: '/',
    httpOnly: true,
    expires: new Date(new Date().getTime() + 60 * 60 * 1000),
  })
  await res.status(200).cookie('updatePassword', 'true', {
    sameSite: 'strict',
    path: '/',
    expires: new Date(new Date().getTime() + 1000 * 1000),
  })

  res.redirect('http://localhost:3000/forgot-password')
})

router.post('/update-password', async (req, res) => {
  try {
    const token = req.cookies.resetPassword
    console.log(token)
    if (token) {
      const { passwordToken } = req.body

      const { _id } = await verifyToken(token)
      const { plainPassword } = await verifyToken(passwordToken)

      const password = await hashPassword(plainPassword)
      await userModel.updateOne({ _id }, { password }, { new: true })

      res.status(202).clearCookie('resetPassword')
      res
        .status(202)
        .clearCookie('updatePassword')
        .json({ payload: {}, name: 'passUpdated' })
    } else {
      res.redirect('http://localhost:3000/token-expired')
    }
  } catch (error) {}
})

// signout
router.get('/signout', (req, res) => {
  res.status(202).clearCookie('signInToken')
  res.status(202).clearCookie('signedIn').send('signedOut')
})

export default router
