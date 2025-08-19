import { Navigate } from 'react-router-dom'
import { auth } from './firebase'

const PrivateRoute = ({ children }) => {
  const user = auth.currentUser
  return user ? children : <Navigate to="/login" replace />
}

export default PrivateRoute
