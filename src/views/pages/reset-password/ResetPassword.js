import React, { useState, useEffect } from 'react'
import { CButton, CForm, CFormInput, CContainer } from '@coreui/react'
import { auth, db } from '../../../firebase'
import { updatePassword, reauthenticateWithCredential, EmailAuthProvider } from 'firebase/auth'
import { collection, query, where, getDocs, updateDoc, serverTimestamp } from 'firebase/firestore'
import { useNavigate } from 'react-router-dom'
import bcrypt from 'bcryptjs'

const ResetPassword = () => {
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [user, setUser] = useState(null)
  const navigate = useNavigate()

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((u) => setUser(u))
    return () => unsubscribe()
  }, [])

const handleSubmit = async (e) => {
  e.preventDefault()

  if (!user) return alert('No user logged in.')
  if (!currentPassword || !newPassword || !confirmPassword)
    return alert('Enter all password fields.')
  if (newPassword !== confirmPassword) return alert('New passwords do not match.')

  try {
    // Attempt reauthentication
    try {
      const credential = EmailAuthProvider.credential(user.email, currentPassword.trim())
      await reauthenticateWithCredential(user, credential)
    } catch (err) {
      if (err.code === 'auth/invalid-credential') {
        console.warn('Reauthentication failed, but we will try to update password anyway.')
      } else {
        throw err
      }
    }

    // Update password in Auth
    await updatePassword(user, newPassword.trim())

    // Update Firestore record by email with hashed password
    const usersRef = collection(db, 'users')
    const q = query(usersRef, where('email', '==', user.email))
    const querySnapshot = await getDocs(q)

    if (!querySnapshot.empty) {
      const docRef = querySnapshot.docs[0].ref
      const hashedPassword = bcrypt.hashSync(newPassword.trim(), 10)
      await updateDoc(docRef, {
        password: hashedPassword,
        passwordUpdatedAt: serverTimestamp(),
      })
    } else {
      console.warn('No Firestore document found for this email.')
    }

    alert('Password updated successfully!')
  } catch (err) {
    alert('Error updating password or Firestore: ' + err.message)
  }
}



  return (
    <CContainer className="mt-5" style={{ maxWidth: '400px' }}>
      <h3 className="mb-4">Reset Password</h3>
      <CForm onSubmit={handleSubmit} className="d-flex flex-column gap-3">
        <CFormInput
          type="password"
          placeholder="Current password"
          value={currentPassword}
          onChange={(e) => setCurrentPassword(e.target.value)}
          required
        />
        <CFormInput
          type="password"
          placeholder="New password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          required
        />
        <CFormInput
          type="password"
          placeholder="Confirm new password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
        />
        <CButton type="submit" color="warning">
          Reset Password
        </CButton>
      </CForm>
    </CContainer>
  )
}

export default ResetPassword
