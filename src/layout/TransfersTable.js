import { collection, getDocs, doc, updateDoc } from 'firebase/firestore'
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
  CFormSwitch,
} from '@coreui/react'

const TransfersTable = () => {
  const [transactions, setTransactions] = useState([])
  const [expandedSeller, setExpandedSeller] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Fetch transfers
  useEffect(() => {
    const fetchTransfers = async () => {
      try {
        const snapshot = await getDocs(collection(db, 'transactions'))
        const txList = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }))
        setTransactions(txList)
      } catch (err) {
        console.error(err)
        setError('Failed to fetch transfers')
      } finally {
        setLoading(false)
      }
    }
    fetchTransfers()
  }, [])

  // Group transfers by seller
  const groupedBySeller = transactions.reduce((acc, tx) => {
    const seller = tx.sellerName || 'Unknown'
    if (!acc[seller]) acc[seller] = []
    acc[seller].push(tx)
    return acc
  }, {})

  const toggleSeller = (seller) => {
    setExpandedSeller(expandedSeller === seller ? null : seller)
  }

  const formatBoolean = (value) => (value ? '✔' : '❌')

  // Handle confirmCommission update
  const handleToggleCommission = async (txId, currentValue) => {
    try {
      const ref = doc(db, 'transactions', txId)
      await updateDoc(ref, { confirmCommission: !currentValue })

      // Update locally
      setTransactions((prev) =>
        prev.map((t) =>
          t.id === txId ? { ...t, confirmCommission: !currentValue } : t
        )
      )
    } catch (err) {
      console.error('Failed to update commission', err)
    }
  }

  return (
    <CCol xs={12}>
      <CCard className="mb-4">
        <CCardHeader>
          <strong>الحوالات</strong>
        </CCardHeader>
        <CCardBody>
          {loading ? (
            <p>Loading...</p>
          ) : error ? (
            <p className="text-danger">{error}</p>
          ) : (
            <CTable striped hover>
              <CTableHead>
                <CTableRow>
                  <CTableHeaderCell>#</CTableHeaderCell>
                  <CTableHeaderCell>Seller Name</CTableHeaderCell>
                  <CTableHeaderCell>Total Sale</CTableHeaderCell>
                  <CTableHeaderCell>Total Commission</CTableHeaderCell>
                  <CTableHeaderCell>Whole Commission</CTableHeaderCell>
                  <CTableHeaderCell>Actions</CTableHeaderCell>
                </CTableRow>
              </CTableHead>
              <CTableBody>
                {Object.entries(groupedBySeller).map(([seller, sellerTx], idx) => {
                  const totalSale = sellerTx.reduce(
                    (sum, t) => sum + Number(t.salePrice || 0),
                    0
                  )
                  const totalCommission = sellerTx.reduce((sum, t) => {
                    const commission = parseFloat(t.priceCommission)
                    return sum + (isNaN(commission) ? 0 : commission)
                  }, 0)
                  const wholeCommission = sellerTx.every(
                    (t) => t.confirmCommission
                  )

                  return (
                    <React.Fragment key={seller}>
                      <CTableRow onClick={() => toggleSeller(seller)}>
                        <CTableHeaderCell>{idx + 1}</CTableHeaderCell>
                        <CTableDataCell>{seller}</CTableDataCell>
                        <CTableDataCell>{totalSale}</CTableDataCell>
                        <CTableDataCell>
                          {totalCommission.toFixed(2)}
                        </CTableDataCell>
                        <CTableDataCell>
                          {formatBoolean(wholeCommission)}
                        </CTableDataCell>
                        <CTableDataCell>
                          <CButton size="sm" color="info">
                            {expandedSeller === seller
                              ? 'Hide Transactions'
                              : 'View Transactions'}
                          </CButton>
                        </CTableDataCell>
                      </CTableRow>

                      {expandedSeller === seller &&
                        sellerTx.map((tx, tIdx) => (
                          <CTableRow key={tx.id} className="table-active">
                            <CTableDataCell colSpan={6}>
                              <CTable striped bordered hover size="sm">
                                <CTableHead>
                                  <CTableRow>
                                    <CTableHeaderCell>#</CTableHeaderCell>
                                    <CTableHeaderCell>Sale Price</CTableHeaderCell>
                                    <CTableHeaderCell>Commission</CTableHeaderCell>
                                    <CTableHeaderCell>Confirm Commission</CTableHeaderCell>
                                    <CTableHeaderCell>Payment Date</CTableHeaderCell>
                                    <CTableHeaderCell>Bank / Account / IBAN</CTableHeaderCell>
                                    <CTableHeaderCell>Ad Link</CTableHeaderCell>
                                    <CTableHeaderCell>Images</CTableHeaderCell>
                                  </CTableRow>
                                </CTableHead>
                                <CTableBody>
                                  <CTableRow>
                                    <CTableHeaderCell>{tIdx + 1}</CTableHeaderCell>
                                    <CTableDataCell>{tx.salePrice}</CTableDataCell>
                                    <CTableDataCell>
                                      {Number(tx.priceCommission || 0).toFixed(2)}
                                    </CTableDataCell>
                                    <CTableDataCell>
                                      <CFormSwitch
                                        checked={!!tx.confirmCommission}
                                        onChange={() =>
                                          handleToggleCommission(
                                            tx.id,
                                            tx.confirmCommission
                                          )
                                        }
                                        label={tx.confirmCommission ? 'Paid' : 'Unpaid'}
                                      />
                                    </CTableDataCell>
                                    <CTableDataCell>{tx.paymentDate}</CTableDataCell>
                                    <CTableDataCell>
                                      {tx.bankName} / {tx.accountNumber} / {tx.iban}
                                    </CTableDataCell>
                                    <CTableDataCell>
                                      <a
                                        href={`http://${tx.adLink}`}
                                        target="_blank"
                                        rel="noreferrer"
                                      >
                                        {tx.adLink}
                                      </a>
                                    </CTableDataCell>
                                    <CTableDataCell>
                                      {tx.selectedImages?.map((img, i) => (
                                        <img
                                          key={i}
                                          src={img}
                                          alt={`img-${i}`}
                                          style={{
                                            width: 50,
                                            marginRight: 5,
                                            borderRadius: 4,
                                          }}
                                        />
                                      ))}
                                    </CTableDataCell>
                                  </CTableRow>
                                </CTableBody>
                              </CTable>
                            </CTableDataCell>
                          </CTableRow>
                        ))}
                    </React.Fragment>
                  )
                })}
              </CTableBody>
            </CTable>
          )}
        </CCardBody>
      </CCard>
    </CCol>
  )
}

export default TransfersTable
