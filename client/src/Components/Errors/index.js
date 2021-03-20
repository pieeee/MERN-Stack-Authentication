import React, { useEffect, useState } from 'react'
import cookie from 'cookie'
import { verifyToken, createToken } from '../../Helpers'
import { useHistory } from 'react-router-dom'
import expired from '../../Assets/expired.svg'
import axios from 'axios'
import { authAPI } from '../../Config'

/**@desc {alert} email sent */
export const EmailSent = ({ handleProgress }) => {
  const history = useHistory()
  const cookies = cookie.parse(document.cookie)

  // check signed in or not

  //

  const initialState = 'parsing-cookie'
  const [payLoad, setPayload] = useState(initialState)

  useEffect(() => {
    if (cookies.emailSent) {
      const decoded = verifyToken(cookies.emailSent)
      setPayload(decoded)
    } else {
      history.push('/')
    }
  }, [cookies.emailSent])

  // Resend Link
  const resendVerificationLink = async (email, name) => {
    const token = await createToken({ email, name })
    await axios.post(
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

    handleProgress(0)
    history.push('/verifiaction-link-sent')
  }

  if (payLoad !== initialState) {
    return (
      <div className="container">
        <div className="alert mt-5">
          Hi {payLoad.firstName}, We have sent a varification link to{' '}
          {payLoad.email}. Please follow this link to activate your account.
          <br />
          If you dont get the link,{' '}
          <span
            className="link-e"
            onClick={() =>
              resendVerificationLink(payLoad.firstName, payLoad.email)
            }
          >
            Resend Verification Link
          </span>{' '}
          .
        </div>
      </div>
    )
  } else {
    return <></>
  }
}

/**@desc verified Confirmation Alert */
export const VerifiedAlert = () => {
  const history = useHistory()
  const cookies = cookie.parse(document.cookie)

  const initialState = 'parsing-cookie'
  const [payLoad, setPayload] = useState(initialState)

  useEffect(() => {
    if (cookies.verifiedConfirmToken) {
      const decoded = verifyToken(cookies.verifiedConfirmToken)
      setPayload(decoded)
    } else {
      history.push('/')
    }
  }, [cookies.verifiedConfirmToken])

  if (payLoad !== initialState) {
    return (
      <div className="alert">
        Hi {payLoad.firstName},
        {payLoad.verified === 'once' &&
          ' You have already verified your account. Please signin to continue.'}
        {payLoad.verified === true &&
          ' Your account has been activated. Please signin to continue.'}
      </div>
    )
  } else {
    return <></>
  }
}

/**@desc token-expired */
export const TokenExpired = () => {
  const history = useHistory()
  const cookies = cookie.parse(document.cookie)

  const initialState = 'parsing-cookie'
  const [payLoad, setPayload] = useState(initialState)

  useEffect(() => {
    if (cookies.tokenExpired) {
      setPayload(cookies.tokenExpired)
    } else {
      history.push('/')
    }
  }, [cookies.verifiedConfirmToken])

  if (payLoad !== initialState) {
    return (
      <div className="container expired">
        <img src={expired} alt="" />
        <span>Token Expired. Please Try Again</span>
      </div>
    )
  } else {
    return <></>
  }
}

/**@desc email already registrer --> EAR_Error */
export const Error = ({ children }) => (
  <div className={'alert err'}>{children}</div>
)
