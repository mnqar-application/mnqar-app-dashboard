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
  CBadge,
} from '@coreui/react'

const ComplaintsTable = () => {
  const [offers, setOffers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedCategory, setSelectedCategory] = useState('')
  const [selectedSubcategory, setSelectedSubcategory] = useState('')
  const [filteredOffers, setFilteredOffers] = useState([])
  const [sortOrder, setSortOrder] = useState('asc')
  const [groupedByDefendant, setGroupedByDefendant] = useState(false)

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
        const offersCollection = collection(db, 'complaints')
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

  const groupByDefendant = () => {
    const grouped = offers.reduce((acc, offer) => {
      const defendant = offer.defendant || 'N/A'
      if (!acc[defendant]) {
        acc[defendant] = []
      }
      acc[defendant].push(offer)
      return acc
    }, {})

    const groupedAndFlattened = Object.values(grouped).flat()

    setFilteredOffers(groupedAndFlattened)

    setGroupedByDefendant(!groupedByDefendant)
  }

  // const sortByField = (field) => {
  //   const sorted = [...filteredOffers].sort((a, b) => {
  //     const valueA = a[field] || ''
  //     const valueB = b[field] || ''
  //     return sortOrder === 'asc' ? valueA.localeCompare(valueB) : valueB.localeCompare(valueA)
  //   })
  //   setFilteredOffers(sorted)
  //   setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
  // }

  // const [sortByDefendantOrder, setSortByDefendantOrder] = useState('asc'); // State for sort order of defendant

  // const handleSortByDefendant = () => {
  //   const sortedOffers = [...filteredOffers].sort((a, b) => {
  //     const defendantA = a.defendant ? a.defendant.toLowerCase() : '';
  //     const defendantB = b.defendant ? b.defendant.toLowerCase() : '';

  //     if (sortByDefendantOrder === 'asc') {
  //       return defendantA.localeCompare(defendantB);
  //     } else {
  //       return defendantB.localeCompare(defendantA);
  //     }
  //   });

  //   setFilteredOffers(sortedOffers);
  //   setSortByDefendantOrder(sortByDefendantOrder === 'asc' ? 'desc' : 'asc'); // Toggle the sort order
  // };

  // const [sortOrder, setSortOrder] = useState('asc'); // Track current sort order (asc or desc)

  // const sortByField = (field) => {
  //   const sorted = [...filteredOffers].sort((a, b) => {
  //     const valueA = a[field] || '';
  //     const valueB = b[field] || '';

  //     return sortOrder === 'asc'
  //       ? valueA.localeCompare(valueB)
  //       : valueB.localeCompare(valueA);
  //   });

  //   setFilteredOffers(sorted);
  //   setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc'); // Toggle sort order
  // };

  const sortByField = (field) => {
    const sorted = [...filteredOffers].sort((a, b) => {
      const valueA = a[field] || ''
      const valueB = b[field] || ''
      return sortOrder === 'asc' ? valueA.localeCompare(valueB) : valueB.localeCompare(valueA)
    })
    setFilteredOffers(sorted)
    setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
  }

  const handleSearch = (e) => {
    const query = e.target.value.toLowerCase()
    const filtered = offers.filter(
      (offer) =>
        (offer.description || '').toLowerCase().includes(query) ||
        (offer.defendant || '').toLowerCase().includes(query) ||
        (offer.reporter || '').toLowerCase().includes(query),
    )
    setFilteredOffers(filtered)
  }

  return (
    <CCol xs={12}>
      <CCard className="mb-4">
        <CCardHeader className="d-flex justify-content-between align-items-center">
          <strong>البلاغات</strong>
          <CTableHeaderCell onClick={() => sortByField('defendant')}>
            Defendant {sortOrder === 'asc' ? '▲' : '▼'}
          </CTableHeaderCell>

          {/* <CTableHeaderCell onClick={() => sortByField('defendant')}>
  Defendant {sortOrder === 'asc' ? '▲' : '▼'}
</CTableHeaderCell> */}

          {/* <div> */}
          {/* <CButton color="primary" size="sm" onClick={groupByDefendant} className="ms-2">
              {groupedByDefendant ? 'Ungroup' : 'Group by Defendant'}
            </CButton> */}
          {/* </div> */}
          {/* <CTableHeaderCell onClick={() => sortByField('reporter')}>
              Reporter {sortOrder === 'asc' ? '▲' : '▼'}
            </CTableHeaderCell> */}
          {/* <CCardHeader className="d-flex justify-content-between align-items-center"> */}
          {/* <strong>البلاغات</strong> */}
          {/* <div> */}
          {/* <CButton
      color="primary"
      size="sm"
      onClick={groupByDefendant}
      className="ms-2"
    >
      {groupedByDefendant ? 'Ungroup' : 'Group by Defendant'}
    </CButton>
    <CButton
      color="primary"
      size="sm"
      onClick={handleSortByDefendant}
      className="ms-2"
    >
      Sort by Defendant ({sortByDefendantOrder === 'asc' ? 'Asc' : 'Desc'})
    </CButton> */}
          {/* </div> */}
        </CCardHeader>

        {/* </CCardHeader> */}

        <input
          type="text"
          placeholder="Search..."
          className="form-control mb-3"
          onChange={handleSearch}
        />

        <CCardBody>
          {loading ? (
            <p>Loading complaints...</p>
          ) : error ? (
            <p className="text-danger">{error}</p>
          ) : (
            <CTable striped>
              <CTableHead>
                <CTableRow>
                  <CTableHeaderCell>#</CTableHeaderCell>
                  <CTableHeaderCell>Reporter Number</CTableHeaderCell>
                  <CTableHeaderCell>Defendant Number</CTableHeaderCell>
                  <CTableHeaderCell>Description</CTableHeaderCell>
                  <CTableHeaderCell>Date received</CTableHeaderCell>
                  <CTableHeaderCell>Status</CTableHeaderCell>
                  <CTableHeaderCell>Actions</CTableHeaderCell>
                </CTableRow>
              </CTableHead>
              <CTableBody>
                {filteredOffers.map((offer, index) => (
                  <CTableRow key={offer.id}>
                    <CTableHeaderCell>{index + 1}</CTableHeaderCell>
                    <CTableDataCell>{offer.reporter || 'N/A'}</CTableDataCell>
                    <CTableDataCell>{offer.defendant || 'N/A'}</CTableDataCell>
                    <CTableDataCell>{offer.description || 'N/A'}</CTableDataCell>
                    <CTableDataCell>{formatDate(offer.timestamp)}</CTableDataCell>
                    <CTableDataCell>
                      <CBadge color="warning">{offer.status || 'N/A'}</CBadge>
                    </CTableDataCell>
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
                ))}
              </CTableBody>
            </CTable>
          )}
        </CCardBody>
      </CCard>
    </CCol>
  )
}

export default ComplaintsTable
