import React from 'react'
import { AppContent, AppSidebar, AppFooter, AppHeader } from '../components/index'
import OffersTable from './OffersTable'
import UsersTable from './UsersTable'
import ComplaintsTable from './ComplaintsTable'
import { useDispatch } from 'react-redux'
import { useNavigate } from 'react-router-dom'
const DefaultLayout = () => {

   const dispatch = useDispatch()
  const navigate = useNavigate()

  const handleLogout = () => {
    dispatch({ type: 'LOGOUT' })
    navigate('/login')
  }

  return (
    <div>
      <AppSidebar />
      <div className="wrapper d-flex flex-column min-vh-100">
        <AppHeader />
        <div className="body flex-grow-1">
          <AppContent />
          {/* <OffersTable/>
          <UsersTable/>
          <ComplaintsTable/> */}
        </div>
        <AppFooter />
      </div>
    </div>
  )
}

export default DefaultLayout
