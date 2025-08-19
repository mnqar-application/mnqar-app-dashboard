import { legacy_createStore as createStore } from 'redux'

const initialState = {
  sidebarShow: true,
  theme: 'light',
  isAuthenticated: false,
}

const changeState = (state = initialState, { type, ...rest }) => {
    switch (type) {
    case 'set':
      return { ...state, ...rest }
    case 'LOGIN':
      return { ...state, isAuthenticated: true }
    case 'LOGOUT':
      return { ...state, isAuthenticated: false }
    default:
      return state
  }
}

const store = createStore(changeState)
export default store
