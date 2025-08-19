import React from 'react'
import { useSelector, useDispatch } from 'react-redux'

import {
  CCloseButton,
  CSidebar,
  CSidebarBrand,
  CSidebarFooter,
  CSidebarHeader,
  CSidebarToggler,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'

import { AppSidebarNav } from './AppSidebarNav'

// import { logo } from 'src/assets/brand/logo'
// import { newLogo } from 'src/assets/brand/Logo'
import newLogo from '../assets/brand/Logo.png'

import { sygnet } from 'src/assets/brand/sygnet'
// import { ReactComponent as Logo } from '../assets/brand/Logo.svg'
import Logo from '../assets/brand/Logo.svg'
import { useColorModes } from '@coreui/react'


// sidebar nav config
import navigation from '../_nav'

const AppSidebar = () => {
  const dispatch = useDispatch()
  const unfoldable = useSelector((state) => state.sidebarUnfoldable)
  const sidebarShow = useSelector((state) => state.sidebarShow)
  const { colorMode } = useColorModes('coreui-free-react-admin-template-theme')


  return (
    <CSidebar
  className="border-end"
  colorScheme={colorMode === 'dark' ? 'dark' : 'light'}
  position="fixed"
  unfoldable={unfoldable}
  visible={sidebarShow}
  onVisibleChange={(visible) => {
    dispatch({ type: 'set', sidebarShow: visible })
  }}
>

      <CSidebarHeader className="border-bottom">
        {/* <CSidebarBrand to="/">
          <CIcon customClassName="sidebar-brand-full" icon={logo} height={32} />
          <CIcon customClassName="sidebar-brand-narrow" icon={sygnet} height={32} />
        </CSidebarBrand> */}
       <CSidebarBrand to="/">
  <img src={Logo} alt="Logo" className="sidebar-brand-full" style={{ height: 32 }} />
  <img src={Logo} alt="Logo" className="sidebar-brand-narrow" style={{ height: 32 }} />
</CSidebarBrand>

        <CCloseButton
          className="d-lg-none"
          dark
          onClick={() => dispatch({ type: 'set', sidebarShow: false })}
        />
      </CSidebarHeader>
      <AppSidebarNav items={navigation} />
      <CSidebarFooter className="border-top d-none d-lg-flex">
        <CSidebarToggler
          onClick={() => dispatch({ type: 'set', sidebarUnfoldable: !unfoldable })}
        />
      </CSidebarFooter>
    </CSidebar>
  )
}

export default React.memo(AppSidebar)
