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
  CFormSelect,
} from '@coreui/react'

const OffersTable = () => {
  const [offers, setOffers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedCategory, setSelectedCategory] = useState('')
  const [selectedSubcategory, setSelectedSubcategory] = useState('')
  const [filteredOffers, setFilteredOffers] = useState([])
  const [sortOrder, setSortOrder] = useState('asc')
  const [expandedRow, setExpandedRow] = useState(null)

  const categoriesList = [
    'دجاج',
    'بيض',
    'صوص',
    'اعلاف ومكملات غذائية',
    'معدات واجهزة',
    'مستلزمات الدواجن',
    'نقليات ومبردات',
    'السلخ والتغليف',
    'ثلاجات الحفظ والتخزين',
  ]

  const subCategoriesMap = {
    دجاج: ['دجاج مبرد', 'دجاج حي'],
    صوص: ['بيض مائدة', 'بيض مخصب'],
  }

  useEffect(() => {
    const fetchOffers = async () => {
      try {
        const offersCollection = collection(db, 'offers')
        const offersSnapshot = await getDocs(offersCollection)
        const offersList = offersSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
          timestamp: doc.data().timestamp?.toDate(),
        }))
        setOffers(offersList)
        setFilteredOffers(offersList)
      } catch (err) {
        console.error('Error fetching offers:', err)
        setError('Failed to fetch offers. Please try again later.')
      } finally {
        setLoading(false)
      }
    }

    fetchOffers()
  }, [])

  const handleCategoryChange = (e) => {
    const category = e.target.value
    setSelectedCategory(category)
    setSelectedSubcategory('')

    if (category) {
      const filtered = offers.filter((offer) => offer.category === category)
      setFilteredOffers(filtered)
    } else {
      setFilteredOffers(offers)
    }
  }

  const handleSubcategoryChange = (e) => {
    const subcategory = e.target.value
    setSelectedSubcategory(subcategory)

    if (subcategory) {
      const filtered = offers.filter(
        (offer) => offer.category === selectedCategory && offer.subcategory === subcategory,
      )
      setFilteredOffers(filtered)
    } else {
      const filtered = offers.filter((offer) => offer.category === selectedCategory)
      setFilteredOffers(filtered)
    }
  }

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
    const confirmed = window.confirm('Are you sure you want to delete this offer?')
    if (confirmed) {
      try {
        await deleteDoc(doc(db, 'offers', id))
        setOffers((prevOffers) => prevOffers.filter((offer) => offer.id !== id))
        setFilteredOffers((prevOffers) => prevOffers.filter((offer) => offer.id !== id))
        alert('Offer deleted successfully.')
      } catch (err) {
        console.error('Error deleting offer:', err)
        alert('Failed to delete offer. Please try again later.')
      }
    }
  }

  const handleEdit = (id) => {
    alert(`Navigate to the edit page for offer ID: ${id}`)
  }

  const handleSort = () => {
    const sortedOffers = [...filteredOffers].sort((a, b) => {
      const dateA = a.timestamp ? a.timestamp.getTime() : 0
      const dateB = b.timestamp ? b.timestamp.getTime() : 0

      return sortOrder === 'asc' ? dateA - dateB : dateB - dateA
    })

    setFilteredOffers(sortedOffers)
    setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
  }

  const handleRowToggle = (id) => {
    setExpandedRow(expandedRow === id ? null : id)
  }

  return (
    <CCol xs={12}>
      <CCard className="mb-4">
        <CCardHeader className="d-flex justify-content-between align-items-center">
          <strong>العروض</strong>
          <div>
            <CButton
              color="success"
              size="sm"
              onClick={() => alert('Navigate to create new offer page')}
              className="me-2"
              style={{color: 'white'}}
            >
              Create New Offer
            </CButton>
            <CButton color="primary" size="sm" onClick={handleSort}>
              Sort by Date {sortOrder === 'asc' ? '↑' : '↓'}
            </CButton>
          </div>
        </CCardHeader>

        <CCardBody>
          <div className="mb-3">
            {/* Category Dropdown */}
            <CFormSelect value={selectedCategory} onChange={handleCategoryChange}>
              <option value="">Select Category</option>
              {categoriesList.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </CFormSelect>

            {/* Subcategory Dropdown (Conditional) */}
            {selectedCategory && subCategoriesMap[selectedCategory] && (
              <CFormSelect
                value={selectedSubcategory}
                onChange={handleSubcategoryChange}
                className="mt-2"
              >
                <option value="">Select Subcategory</option>
                {subCategoriesMap[selectedCategory].map((subcategory) => (
                  <option key={subcategory} value={subcategory}>
                    {subcategory}
                  </option>
                ))}
              </CFormSelect>
            )}
          </div>

          {loading ? (
            <p>Loading offers...</p>
          ) : error ? (
            <p className="text-danger">{error}</p>
          ) : (
            <CTable striped>
              <CTableHead>
                <CTableRow>
                  <CTableHeaderCell>#</CTableHeaderCell>
                  <CTableHeaderCell>ID</CTableHeaderCell>
                  <CTableHeaderCell>Seller Number</CTableHeaderCell>
                  <CTableHeaderCell>Title</CTableHeaderCell>
                  {/* <CTableHeaderCell>Category</CTableHeaderCell> */}
                  <CTableHeaderCell>CreatedAt</CTableHeaderCell>
                  <CTableHeaderCell>Actions</CTableHeaderCell>
                </CTableRow>
              </CTableHead>
              <CTableBody>
                {filteredOffers.map((offer, index) => (
                  <>
                    <CTableRow key={offer.id} onClick={() => handleRowToggle(offer.id)}>
                      <CTableHeaderCell>{index + 1}</CTableHeaderCell>
                      <CTableDataCell>{offer.id || 'N/A'}</CTableDataCell>
                      <CTableDataCell>{offer.sellerData?.sellerPhone || 'N/A'}</CTableDataCell>
                      <CTableDataCell>{offer.title || 'N/A'}</CTableDataCell>
                      {/* <CTableDataCell>
                        {offer.category === 'صوص'
                          ? offer.subcategory + ' < ' + offer.category
                          : offer.category}
                      </CTableDataCell> */}
                      <CTableDataCell>{formatDate(offer.timestamp)}</CTableDataCell>
                      <CTableDataCell>
                        <CButton
                          color="info"
                          size="sm"
                          className="me-2"
                          onClick={() => handleEdit(offer.id)}
                        >
                          Edit
                        </CButton>
                        <CButton color="danger" size="sm" onClick={() => handleDelete(offer.id)}>
                          Delete
                        </CButton>
                      </CTableDataCell>
                    </CTableRow>

                    {expandedRow === offer.id && (
                      <CTableRow>
                        <CTableDataCell colSpan={7}>
                          <div className="p-3">
                            <strong>Details:</strong>
                            <p>Category:  {offer.category === 'صوص' || offer.category === 'دجاج'
                          ? offer.subcategory + ' < ' + offer.category
                          : offer.category}</p>

                            <p>Description: {offer.description || 'N/A'}</p>
                            <p>Price: {offer.price}</p>
                            <p>Weight: {offer.weight1} - {offer.weight2}</p>
                            <p>City: {offer.city}</p>
                          </div>
                        </CTableDataCell>
                      </CTableRow>
                    )}
                  </>
                ))}
              </CTableBody>
            </CTable>
          )}
        </CCardBody>
      </CCard>
    </CCol>
  )
}

export default OffersTable
