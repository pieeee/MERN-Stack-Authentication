import React, { useRef, useState, useEffect } from 'react'
import {
  Alert,
  Button,
  Col,
  Container,
  Form,
  ProgressBar,
} from 'react-bootstrap'
import { useForm } from 'react-hook-form'
import { formErrors } from '../Utils'
import axios from 'axios'
import { useHistory, withRouter, Link } from 'react-router-dom'
import { authAPI } from '../Config'
import { Error } from '../Components/Errors'
import cookie from 'cookie'
import { createToken, verifyToken } from '../Helpers'

const ForgotPass = ({ handleProgress }) => {
  axios.defaults.withCredentials = true
  const history = useHistory()
  const cookies = cookie.parse(document.cookie)
  const resetProgressBar = () =>
    setTimeout(function () {
      handleProgress(0)
    }, 1000)

  /** @desc form validation */
  const { register, errors, handleSubmit, watch } = useForm()
  const password = useRef({})
  password.current = watch('password')

  const renderErrors = (message) => {
    return (
      <p>
        <i className="fas fa-exclamation-triangle mr-1 mt-3"></i>
        {message}
      </p>
    )
  }

  /**
   * @desc render state
   */
  const init_RenderState = 'reset-link'
  const [renderState, setRenderState] = useState(init_RenderState)

  /**
   * @desc user email
   */
  const [userPayload, setUserPayload] = useState({
    id: undefined,
    email: undefined,
  })

  /**
   * @desc server side errors
   * email already Registered error --> EAR_error
   */
  const [alert, setAlert] = useState({
    userNotFound: {
      state: false,
      message: 'Email is not registered to PIEDEV',
    },
    emailSent: {
      state: false,
      message: '',
    },
  })

  /**@desc set reset password render and */
  useEffect(() => {
    if (cookies.resetToken) {
      const { _id } = verifyToken(cookies.resetToken)
      setUserPayload({ ...userPayload, id: _id })
      setRenderState('update-password')
      resetProgressBar()
    }
  }, [cookies.signedIn])

  const [rPassUpdated, setRPassUpdated] = useState(false)

  /** @desc send reset link and update password */

  const onSubmit = async (d) => {
    if (cookies.updatePassword !== 'true') {
      const token = await createToken({ email: d.email })

      const response = await axios.post(
        `${authAPI}/password-reset`,
        { token },
        {
          withCredentials: true,
          onUploadProgress: (progressEvent) => {
            let percentCompleted = Math.floor(
              (progressEvent.loaded / progressEvent.total) * 100
            )
            handleProgress(percentCompleted)
          },
        }
      )

      const { name, payload } = response.data

      switch (name) {
        case 'emailSent':
          setAlert({
            emailSent: {
              state: true,
              message: `A password reset link has been sent to ${payload.email}`,
            },
            userNotFound: { ...alert.userNotFound, state: false },
          })
          resetProgressBar()
          break
        case 'userNotFound':
          setAlert({
            ...alert,
            userNotFound: { ...alert.userNotFound, state: true },
          })
          resetProgressBar()
        default:
          break
      }

      resetProgressBar()
    } else {
      const passwordToken = await createToken({ plainPassword: d.password })
      const response = await axios.post(
        `${authAPI}/update-password`,
        {
          passwordToken,
        },
        {
          withCredentials: true,
          onUploadProgress: (progressEvent) => {
            let percentCompleted = Math.floor(
              (progressEvent.loaded / progressEvent.total) * 100
            )
            handleProgress(percentCompleted)
          },
        }
      )

      if (response.data.name === 'passUpdated') {
        setRPassUpdated(true)
        resetProgressBar()
      }
    }
  }

  const renderUpdatePassword = (
    <div>
      <h1>RESET PASSWORD</h1>
      <Form.Group>
        <Form.Label>New Password</Form.Label>
        <Form.Control
          type="password"
          name="password"
          ref={register({
            required: true,
            minLength: 8,
          })}
        />
        {errors.password?.type === 'required' &&
          renderErrors(formErrors.password.required)}
        {errors.password?.type === 'minLength' &&
          renderErrors(formErrors.password.minLength)}
      </Form.Group>

      <Form.Group>
        <Form.Label>Confirm Password</Form.Label>
        <Form.Control
          type="password"
          name="confirmPassword"
          ref={register({
            validate: (value) => value === password.current,
          })}
        />
        {errors.confirmPassword?.type === 'validate' &&
          renderErrors(formErrors.confirmPassword.validate)}
      </Form.Group>
    </div>
  )

  const renderLinkSend = (
    <div>
      <h1>SEND RESET LINK</h1>
      {/* Email */}
      <Form.Group>
        <Form.Label>Email</Form.Label>
        <Form.Control
          type="email"
          name="email"
          ref={register({
            required: true,
            pattern: /^\S+@\S+$/i,
          })}
        />
        {errors.email?.type === 'required' &&
          renderErrors(formErrors.email.required)}

        {/* Passwords */}
      </Form.Group>
    </div>
  )

  if (rPassUpdated) {
    return (
      <Container>
        <Alert className="d-flex flex-column mt-5">
          <h5>Password has been updated successfully.</h5>
          <Link to="/signin">Go back to Signin page</Link>
        </Alert>
      </Container>
    )
  } else {
    return (
      <div>
        <Container>
          <Form
            className="signin-form mx-auto"
            onSubmit={handleSubmit(onSubmit)}
          >
            {alert.userNotFound.state ? (
              <Error>{alert.userNotFound.message}</Error>
            ) : null}
            {alert.emailSent.state ? (
              <Alert>{alert.emailSent.message}</Alert>
            ) : null}
            {/* {renderState === init_RenderState && renderLinkSend} */}
            {cookies.updatePassword === 'true'
              ? renderUpdatePassword
              : renderLinkSend}
            <Button type="submit">Submit</Button>
          </Form>
        </Container>
      </div>
    )
  }
}

export default withRouter(ForgotPass)
