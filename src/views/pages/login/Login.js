import React, { useState } from 'react'
import {
  CButton,
  CCard,
  CCardBody,
  CCardGroup,
  CCol,
  CContainer,
  CForm,
  CFormInput,
  CInputGroup,
  CInputGroupText,
  CRow,
  useColorModes,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilLockLocked, cilUser, cilContrast } from '@coreui/icons'

import { auth, db } from '../../../firebase'
import { collection, query, where, getDocs } from 'firebase/firestore'
import { signInWithEmailAndPassword, signOut } from 'firebase/auth'
import { useNavigate } from 'react-router-dom'

const Login = () => {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  const { colorMode } = useColorModes('coreui-free-react-admin-template-theme')

  const handleLogin = async (e) => {
    e.preventDefault()
    setError('')

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password)
      const user = userCredential.user
      const q = query(collection(db, 'users'), where('email', '==', user.email))
      const querySnapshot = await getDocs(q)

      if (querySnapshot.empty) {
        setError('No user record found in Firestore')
        await signOut(auth)
        return
      }

      const userData = querySnapshot.docs[0].data()
      if (userData.role !== 'Admin') {
        setError('Access denied. Admins only.')
        await signOut(auth)
        return
      }

      navigate('/users')
    } catch (err) {
      setError(err.message)
    }
  }

  // Set card background based on theme
  const cardStyle =
    colorMode === 'dark'
      ? { backgroundColor: '#1c1f26', color: '#fff' }
      : { backgroundColor: '#fff', color: '#000' }

  return (
    <div
      className={`min-vh-100 d-flex flex-row align-items-center ${colorMode === 'dark' ? 'bg-dark' : 'bg-body-tertiary'}`}
    >
      <CContainer>
        <CRow className="justify-content-center">
          <CCol md={8}>
            <CCardGroup>
              <CCard className="p-4" style={cardStyle}>
                <CCardBody>
                  <CForm onSubmit={handleLogin}>
                    <h1>Login</h1>
                    <p className="text-body-secondary">Sign In to your account</p>

                    <CInputGroup className="mb-3">
                      <CInputGroupText>
                        <CIcon icon={cilUser} />
                      </CInputGroupText>
                      <CFormInput
                        type="email"
                        placeholder="Email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                      />
                    </CInputGroup>

                    <CInputGroup className="mb-4">
                      <CInputGroupText>
                        <CIcon icon={cilLockLocked} />
                      </CInputGroupText>
                      <CFormInput
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                      />
                      <CInputGroupText
                        style={{ cursor: 'pointer' }}
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {/* Using the available icon instead of cilEye/cilEyeSlash */}
                        <CIcon icon={cilContrast} />
                      </CInputGroupText>
                    </CInputGroup>

                    {error && <p style={{ color: 'red' }}>{error}</p>}

                    <CRow>
                      <CCol xs={6}>
                        <CButton color="primary" className="px-4" type="submit">
                          Login
                        </CButton>
                      </CCol>
                    </CRow>
                  </CForm>
                </CCardBody>
              </CCard>
            </CCardGroup>
          </CCol>
        </CRow>
      </CContainer>
    </div>
  )
}

export default Login
