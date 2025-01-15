import { collection, getDocs, doc, deleteDoc } from 'firebase/firestore'
import { useState, useEffect } from 'react'
import { db } from '../firebase'
import React from 'react'
import {
  CCard,
  CCardBody,
  CCardHeader,
  CCol,
  CTable,
  CTableBody,
  CTableHead,
  CTableHeaderCell,
  CTableRow,
  CTableDataCell,
  CButton,
  CNav,
  CNavItem,
  CNavLink,
} from '@coreui/react'

const UsersTable = () => {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [activeTab, setActiveTab] = useState('Admin')

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const usersCollection = collection(db, 'users')
        const usersSnapshot = await getDocs(usersCollection)
        const usersList = usersSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
          timestamp: doc.data().timestamp?.toDate(),
        }))
        setUsers(usersList)
      } catch (err) {
        console.error('Error fetching users:', err)
        setError('Failed to fetch users. Please try again later.')
      } finally {
        setLoading(false)
      }
    }

    fetchUsers()
  }, [])

  const formatDate = (date) => {
    if (!date) return 'N/A'
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date)
  }

  const handleDelete = async (id) => {
    const confirmed = window.confirm('Are you sure you want to delete this user?')
    if (confirmed) {
      try {
        await deleteDoc(doc(db, 'users', id))
        setUsers((prevUsers) => prevUsers.filter((user) => user.id !== id))
        alert('User deleted successfully.')
      } catch (err) {
        console.error('Error deleting user:', err)
        alert('Failed to delete user. Please try again later.')
      }
    }
  }

  const handleEdit = (id) => {
    alert(`Navigate to the edit page for user ID: ${id}`)
  }

  const filteredUsers = users.filter((user) => user.role === activeTab)

  return (
    <CCol xs={12}>
      <CCard className="mb-4">
        <CCardHeader>
          <strong>المستخدمين</strong>
          <CNav variant="tabs">
            <CNavItem>
              <CNavLink
                active={activeTab === 'Admin'}
                onClick={() => setActiveTab('Admin')}
              >
                Admin
              </CNavLink>
            </CNavItem>
            <CNavItem>
              <CNavLink
                active={activeTab === 'Customer'}
                onClick={() => setActiveTab('Customer')}
              >
                Customers
              </CNavLink>
            </CNavItem>
          </CNav>
        </CCardHeader>

        <CCardBody>
          {loading ? (
            <p>Loading users...</p>
          ) : error ? (
            <p className="text-danger">{error}</p>
          ) : (
            <CTable striped>
              <CTableHead>
                <CTableRow>
                  <CTableHeaderCell>#</CTableHeaderCell>
                  <CTableHeaderCell>Name</CTableHeaderCell>
                  <CTableHeaderCell>Phone Number</CTableHeaderCell>
                  <CTableHeaderCell>Email</CTableHeaderCell>
                  {activeTab === 'Customer' && (
                    <>
                      <CTableHeaderCell>CreatedAt</CTableHeaderCell>
                      <CTableHeaderCell>Subscribed</CTableHeaderCell>
                      <CTableHeaderCell>Offers</CTableHeaderCell>
                    </>
                  )}
                  <CTableHeaderCell>Actions</CTableHeaderCell>
                </CTableRow>
              </CTableHead>
              <CTableBody>
                {filteredUsers.map((user, index) => (
                  <CTableRow key={user.id}>
                    <CTableHeaderCell>{index + 1}</CTableHeaderCell>
                    <CTableDataCell>{user.name || 'N/A'}</CTableDataCell>
                    <CTableDataCell>{user.phoneNumber || 'N/A'}</CTableDataCell>
                    <CTableDataCell>{user.email || 'N/A'}</CTableDataCell>
                    {activeTab === 'Customer' && (
                      <>
                        <CTableDataCell>{formatDate(user.timestamp)}</CTableDataCell>
                        <CTableDataCell>{user.subscribed ? 'Yes' : 'No'}</CTableDataCell>
                        <CTableDataCell>
                          {user.offers && user.offers.length > 0 ? (
                            <ul>
                              {user.offers.map((offer, index) => (
                                <li key={index}>{offer}</li>
                              ))}
                            </ul>
                          ) : (
                            'No Offers'
                          )}
                        </CTableDataCell>
                      </>
                    )}
                    <CTableDataCell>
                      <CButton
                        color="info"
                        size="sm"
                        className="me-2"
                        onClick={() => handleEdit(user.id)}
                      >
                        Edit
                      </CButton>
                      <CButton color="danger" size="sm" onClick={() => handleDelete(user.id)}>
                        Delete
                      </CButton>
                    </CTableDataCell>
                  </CTableRow>
                ))}
              </CTableBody>
            </CTable>
          )}
        </CCardBody>
      </CCard>
    </CCol>
  )
}

export default UsersTable
