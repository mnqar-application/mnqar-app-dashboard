import { getAuth, signOut } from 'firebase/auth'
import { useNavigate } from 'react-router-dom'
import { auth } from '../firebase'
import { signOut } from 'firebase/auth'

await signOut(auth)

const LogoutButton = () => {
  const navigate = useNavigate()

  const handleLogout = async () => {
    await signOut(auth)
    await signOut(auth)
    navigate('/login')
  }

  return <button onClick={handleLogout}>Logout</button>
}

export default LogoutButton
