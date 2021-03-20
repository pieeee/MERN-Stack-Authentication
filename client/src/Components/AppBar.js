import React, { useState, useEffect } from 'react'
import { Navbar, Nav, Container } from 'react-bootstrap'
import { useHistory, withRouter } from 'react-router-dom'
import Drawer from './Drawer'
import cookie from 'cookie'
import { signOut } from '../Helpers'

const AppBar = () => {
  const history = useHistory({ location })

  const cookies = cookie.parse(document.cookie)
  const init_state = 'parsing-cookie'
  const [renderState, setRenderState] = useState(init_state)
  // check signed in or not #page blocking
  useEffect(() => {
    if (cookies.signedIn === 'true') {
      setRenderState('signedIn')
    } else {
      setRenderState('signedOut')
    }
  }, [cookies.signedIn])

  const [drawerState, setDrawerState] = useState(false)
  const opendrawer = async () => {
    await setDrawerState(true)
    setDrawerState(false)
  }

  const renderNavLinks = () => {
    if (renderState === init_state) {
      return null
    } else if (renderState === 'signedIn') {
      return (
        <Nav className="navLinks">
          <Nav.Link
            onClick={() => {
              signOut()
              history.push('/signin')
            }}
          >
            Signout
          </Nav.Link>
        </Nav>
      )
    } else if (renderState === 'signedOut') {
      return (
        <Nav className="navLinks">
          <Nav.Link
            onClick={() => history.push('/register')}
            className={`${
              location.pathname === '/register' ? 'nav-link-selected' : null
            }`}
          >
            Register
          </Nav.Link>
          <Nav.Link
            onClick={() => history.push('/signin')}
            className={`${
              location.pathname === '/signin' ? 'nav-link-selected' : null
            }`}
          >
            Signin
          </Nav.Link>
        </Nav>
      )
    }
  }

  return (
    <div>
      <Navbar bg="primary" variant="dark" className="navbar shadow ">
        <Container>
          <div className="brand">
            <i className="fas fa-bars menu" onClick={() => opendrawer()}></i>
            <Navbar.Brand onClick={() => history.push('/')}>
              PIEDEVS
            </Navbar.Brand>
          </div>
          {renderNavLinks()}
        </Container>
      </Navbar>
      {/* Drawer */}
      <Drawer drawerState={drawerState} />
    </div>
  )
}

export default withRouter(AppBar)
