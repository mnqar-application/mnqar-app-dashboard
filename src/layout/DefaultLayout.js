import React from 'react'
import { AppContent, AppSidebar, AppFooter, AppHeader } from '../components/index'
import OffersTable from './OffersTable'
import UsersTable from './UsersTable'
import ComplaintsTable from './ComplaintsTable'

const DefaultLayout = () => {
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
