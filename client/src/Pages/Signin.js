/**
 * TODO:
 * Add Error Handling
 * Signin User
 * Form Validation ✔
 * alerts ✔
 */

import React, { useRef, useState, useEffect } from 'react'
import { Button, Col, Container, Form } from 'react-bootstrap'
import { useForm } from 'react-hook-form'
import { formErrors } from '../Utils'
import { withRouter, useHistory, Link } from 'react-router-dom'
import cookie from 'cookie'
import { createToken } from '../Helpers'
import axios from 'axios'
import { authAPI } from '../Config/index'
import { Error, VerifiedAlert } from '../Components/Errors'

const Signin = ({ handleProgress }) => {
  // global
  const history = useHistory()
  const cookies = cookie.parse(document.cookie)

  // check signed in or not #page blocking
  useEffect(() => {
    if (cookies.signedIn === 'true') {
      history.push('/')
      resetProgressBar()
    }
  }, [cookies.signedIn])

  // reset progress bar
  const resetProgressBar = () =>
    setTimeout(function () {
      handleProgress(0)
    }, 1000)

  /** @desc serverside errors */

  // user not found error
  const [userNotFound, setUserNotFound] = useState(false)

  // user not verified
  const init_notVerified = {
    state: false,
  }
  const [notVerified, setNotVerified] = useState(init_notVerified)

  // password Error
  const [passError, setPassError] = useState(false)

  /** @desc Form validaion */

  const { register, errors, handleSubmit } = useForm()
  const renderErrors = (message) => {
    return (
      <p>
        <i className="fas fa-exclamation-triangle mr-1 mt-3"></i>
        {message}
      </p>
    )
  }

  /** @desc signin request */

  const onSubmit = async (data) => {
    //   clearing errors state
    setUserNotFound(false)
    setPassError(false)
    setNotVerified(init_notVerified)

    const signinRequestToken = await createToken(data)
    const response = await axios.post(
      `${authAPI}/signin`,
      { token: signinRequestToken },
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

    switch (response.data.name) {
      case 'userNotFound':
        setUserNotFound(true)
        resetProgressBar()
        break
      case 'notVerified':
        setNotVerified({
          ...notVerified,
          state: true,
          payload: response.data.payload,
        })
        resetProgressBar()
        break
      case 'passError': {
        setPassError(true)
        resetProgressBar()
      }
      case 'signedIn':
        break
      default:
        break
    }
  }

  // Resend verification link

  const resendVerificationLink = async (email, name) => {
    const token = await createToken({ email, name })
    const response = await axios.post(
      `${authAPI}/resend-verification-link`,
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
    switch (response.data.name) {
      case 'userNotFound':
        setUserNotFound(true)
        resetProgressBar()
        break
      case 'emailSent': {
        handleProgress(0)
        history.push('/verifiaction-link-sent')
      }
      default:
        break
    }
  }

  return (
    <Container>
      <Form className="signin-form mx-auto" onSubmit={handleSubmit(onSubmit)}>
        {/* Errors */}
        {/* Password error */}
        {passError ? (
          <Error>
            You have entered wrong password.{' '}
            <span className="link-e">Reset Password</span>
          </Error>
        ) : null}

        {/* If user Not found */}
        {userNotFound ? (
          <Error>
            Email is not registered. Please{' '}
            <a href="/register">create an account</a> to continue.
          </Error>
        ) : null}

        {/* If user Not verified */}
        {notVerified.state ? (
          <Error>
            Hi, {notVerified.payload.firstName}, Please activate your account to
            signin.{' '}
            <span
              className="link-e"
              onClick={() =>
                resendVerificationLink(
                  notVerified.payload.email,
                  notVerified.payload.firstName
                )
              }
            >
              Activate Now
            </span>
          </Error>
        ) : null}

        {/* User Verified Notification */}
        {cookies.verifiedConfirmToken && <VerifiedAlert />}

        <h1>SIGNIN</h1>
        {/* Form */}
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
        <Form.Group>
          <Form.Label>Password</Form.Label>
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
          <Link to="/forgot-password">Forgot Password</Link>
        </Form.Group>
        <Form.Group>
          <Link to="/register">Don&apos;t have an account? Create one.</Link>
        </Form.Group>

        <Button type="submit">Signin</Button>
      </Form>
    </Container>
  )
}

export default withRouter(Signin)
