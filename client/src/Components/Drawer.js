import React, { useState, useEffect } from 'react'
import PropTypes from 'prop-types'
import cookie from 'cookie'
import { useHistory, withRouter } from 'react-router-dom'
import { signOut } from '../Helpers'

const Drawer = ({ drawerState, location }) => {
  const cookies = cookie.parse(document.cookie)
  const history = useHistory()
  // Drawer close-open state
  const [drawerClass, setDrawerClass] = useState('drawer')
  const [drawerBG, setDrawerBG] = useState('')

  const toggleDrawer = (state) => {
    if (state) {
      setDrawerBG('drawer-bg')
      setDrawerClass('drawer drawer-open')
    } else {
      setDrawerBG('')
      setDrawerClass('drawer')
    }
  }
  // capturing esc key events
  useEffect(() => {
    const close = (e) => {
      if (e.keyCode === 27) {
        toggleDrawer(false)
      }
    }
    window.addEventListener('keydown', close)
    return () => window.removeEventListener('keydown', close)
  }, [])

  // cb from parent menu button
  useEffect(() => {
    const open = () => {
      if (drawerState) {
        toggleDrawer(true)
      }
    }
    open()
  }, [drawerState])

  // drawer Content

  const drawerList = [
    {
      type: 'Register',
      path: '/register',
      icon: 'fas fa-user-plus',
    },
    {
      type: 'Signin',
      path: '/signin',
      icon: 'fas fa-sign-in-alt',
    },
  ]

  const followRoute = (path) => {
    history.push(path)
  }

  ;('drawer-item drawer-item-selected')

  const renderDrawers = drawerList.map(({ type, path, icon }, key) => {
    return (
      <button
        className={
          location.pathname === path
            ? 'drawer-item drawer-item-selected'
            : 'drawer-item'
        }
        key={key}
        onClick={() => followRoute(path)}
      >
        <div className="indicator"></div>
        <div className="i-container">
          <i className={icon}></i>
        </div>
        <span>{type}</span>
      </button>
    )
  })

  if (cookies.signedIn === 'true') {
    return (
      <div>
        <div className={drawerBG} onClick={() => toggleDrawer(false)}></div>
        <div className={drawerClass} onClick={() => toggleDrawer(false)}>
          <button
            className="drawer-item drawer-item-selected"
            onClick={() => {
              signOut()
              history.push('/signin')
            }}
          >
            <div className="indicator"></div>
            <div className="i-container">
              <i className="fas fa-sign-out-alt"></i>
            </div>
            <span>Signout</span>
          </button>
        </div>
      </div>
    )
  } else {
    return (
      <div>
        <div className={drawerBG} onClick={() => toggleDrawer(false)}></div>
        <div className={drawerClass} onClick={() => toggleDrawer(false)}>
          {renderDrawers}
        </div>
      </div>
    )
  }
}

export default withRouter(Drawer)

Drawer.propTypes = {
  drawerState: PropTypes.bool,
  location: PropTypes.object,
}
