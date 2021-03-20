import React, { useRef, useState, useEffect } from 'react'
import { Button, Col, Container, Form, ProgressBar } from 'react-bootstrap'
import { useForm } from 'react-hook-form'
import { formErrors } from '../Utils'
import axios from 'axios'
import { useHistory, withRouter, Link } from 'react-router-dom'
import { authAPI } from '../Config'
import { Error } from '../Components/Errors'
import cookie from 'cookie'

const Register = ({ handleProgress }) => {
  axios.defaults.withCredentials = true
  const history = useHistory()
  const cookies = cookie.parse(document.cookie)
  const resetProgressBar = () =>
    setTimeout(function () {
      handleProgress(0)
    }, 1000)
  // check signed in or not #page blocking
  useEffect(() => {
    if (cookies.signedIn === 'true') {
      history.push('/')
      resetProgressBar()
    }
  }, [cookies.signedIn])

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
   * @desc server side errors
   * email already Registered error --> EAR_error
   */
  const [EAR_error, setEAR_error] = useState(false)

  /** @desc user create request */
  /** @desc Create user --> onsubmit form request */
  const onSubmit = async ({ firstName, lastName, email, password }) => {
    setEAR_error(false)
    const requestBody = {
      firstName,
      lastName,
      email,
      plainPassword: password,
    }
    const response = await axios.post(`${authAPI}/register`, requestBody, {
      withCredentials: true,
      onUploadProgress: (progressEvent) => {
        let percentCompleted = Math.floor(
          (progressEvent.loaded / progressEvent.total) * 100
        )
        handleProgress(percentCompleted)
      },
    })

    switch (response.data.name) {
      case 'emailSent':
        handleProgress(0)
        history.push('/verifiaction-link-sent')
        break
      case 'alreadyRegistered':
        setTimeout(function () {
          handleProgress(0)
        }, 1000)
        setEAR_error(true)
        break
      default:
        break
    }
  }

  return (
    <div>
      <Container>
        <Form className="signin-form mx-auto" onSubmit={handleSubmit(onSubmit)}>
          {EAR_error ? (
            <Error>Email already in use try a different one</Error>
          ) : null}
          <h1>REGISTER</h1>

          <Form.Row>
            {/* Name */}
            <Form.Group as={Col} sm={12} md={6}>
              <Form.Label>First Name</Form.Label>
              <Form.Control
                type="text"
                name="firstName"
                ref={register({ required: true })}
              />
              {errors.firstName?.type === 'required' &&
                renderErrors(formErrors.name.required)}
            </Form.Group>

            <Form.Group as={Col} sm={12} md={6}>
              <Form.Label>Last Name</Form.Label>
              <Form.Control
                type="text"
                name="lastName"
                ref={register({ required: true })}
              />
              {errors.lastName?.type === 'required' &&
                renderErrors(formErrors.name.required)}
            </Form.Group>
          </Form.Row>

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
          <Form.Row>
            <Form.Group as={Col} sm={12} md={6}>
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

            <Form.Group as={Col} sm={12} md={6}>
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
          </Form.Row>
          <Form.Group>
            <Link to="/signin">Already have an account? Signin please.</Link>
          </Form.Group>

          <Button type="submit">Register</Button>
        </Form>
      </Container>
    </div>
  )
}

export default withRouter(Register)
