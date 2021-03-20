import React, { useEffect, useState } from 'react'
import './Custom.scss'
import AppBar from './Components/AppBar'
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom'
import { ProgressBar } from 'react-bootstrap'
import Home from './Pages/Home'
import Register from './Pages/Register'
import Signin from './Pages/Signin'
import {
  EmailSent as VerificationNotify,
  TokenExpired,
} from './Components/Errors'
import ForgotPass from './Pages/ForgotPass'

function App() {
  // progress bar props
  const [progress, setProgress] = useState(0)
  useEffect(() => {
    setProgress(0)
  }, [])

  const handleProgress = (data) => setProgress(data)

  // renderRoutes

  return (
    <div>
      <Router>
        <ProgressBar now={progress} variant="info" animated />
        <AppBar />
        <Switch>
          <Route path="/" exact>
            <Home handleProgress={handleProgress} />
          </Route>
          <Route path="/signin" exact>
            <Signin handleProgress={handleProgress} />
          </Route>
          <Route path="/register" exact>
            <Register handleProgress={handleProgress} />
          </Route>
          {/* Errors and Alerts */}
          <Route
            path="/verifiaction-link-sent"
            handleProgress={handleProgress}
            exact
          >
            <VerificationNotify handleProgress={handleProgress} />
          </Route>
          <Route path="/token-expired" exact>
            <TokenExpired />
          </Route>
          <Route path="/forgot-password" exact>
            <ForgotPass handleProgress={handleProgress} />
          </Route>
        </Switch>
      </Router>
    </div>
  )
}

export default App
