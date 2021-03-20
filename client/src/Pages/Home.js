import React, { useEffect, useState } from 'react'
import axios from 'axios'
import {  useHistory } from 'react-router-dom'
import { authAPI } from '../Config'
import cookie from 'cookie'
import { Alert } from 'react-bootstrap'
import logo from '../Assets/logo.svg'
axios.defaults.withCredentials = true

const Home = ({ handleProgress }) => {
  const history = useHistory()
  const resetProgressBar = () =>
    setTimeout(function () {
      handleProgress(0)
    }, 500)

  const initRenderComp = 'getting-profile'
  const [renderComp, setRenderComp] = useState(initRenderComp)
  const [profile, setProfile] = useState({})

  const getProfile = async () => {
    const response = await axios.get(`${authAPI}/profile`, {
      withCredentials: true,
    })

    switch (response.data.name) {
      case 'signedOut':
        history.push('/signin')
        break
      case 'userProfile':
        setProfile(response.data.payload)
        setRenderComp('profile')
      default:
        break
    }
  }

  const cookies = cookie.parse(document.cookie)
  useEffect(() => {
    if (cookies.signedIn === 'true') {
      getProfile()
      resetProgressBar()
    } else {
      resetProgressBar()
      history.push('/signin')
    }
  }, [])

  if (renderComp === initRenderComp) {
    return <div>{handleProgress(100)}</div>
  } else if (renderComp === 'profile') {
    return (
      <div className="container home">
        <div className="heading">
          <img src={logo} alt="logo.svg" className="" logo />

          <span>PIEDEV</span>
        </div>
        <h5>A Fully Functional MERN Stack Authentication System</h5>
        <span>Visit Repo:</span>{' '}
        <a href="https://github.com/pieeee/mern-auth">
          https://github.com/pieeee/mern-auth
        </a>
        <Alert>
          Hello {profile.firstName} {profile.lastName}. Welcome to PIEDEV. This
          is your email {profile.email}
        </Alert>
      </div>
    )
  }
}

export default Home
