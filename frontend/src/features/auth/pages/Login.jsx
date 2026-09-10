import React, { useState } from 'react'
import '../pages/auth.form.css'
import { Link, useNavigate } from 'react-router'
import { useAuth } from '../hooks/useAuth.js'

function Login() {
  const { loading, handleLogin } = useAuth()
  const navigate = useNavigate()

  const [ email, setEmail ] = useState("")
  const [ password, setPassword ] = useState("")

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      await handleLogin({ email, password })
      navigate('/')
    } catch (error) {
      console.error("Login failed:", error)
    }
  }

  if (loading) {
    return (<main><h1>Loading.......</h1></main>)
  }

  return (
    <>
      <div className="main">
        <div className="form-contianer">
          <h1>Login</h1>
          <form onSubmit={handleSubmit}>
            <div className="input-group">
              <label htmlFor='email'>Email</label>
              <input 
                value={email}
                onChange={(e) => setEmail(e.target.value)} 
                type='email' 
                id='email' 
                name='email' 
                placeholder='Enter email address'
              />
            </div>

            <div className="input-group">
              <label htmlFor='password'>Password</label>
              <input 
                value={password}
                onChange={(e) => setPassword(e.target.value)} 
                type='password' 
                id='password' 
                name='password' 
                placeholder='Enter password'
              />
            </div>

            <button className='button primary-button'>Login</button>
          </form>
          <p>
            Don't have an account? <Link to={"/register"}>Register</Link>
          </p>
        </div>
      </div>
    </>
  )
}

export default Login