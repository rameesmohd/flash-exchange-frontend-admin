import { BrowserRouter,Routes , Route, Navigate } from 'react-router-dom'
import Users from './pages/admin/Users'
import DashboardLayout from './components/layout/DashboardLayout'
import Login from './pages/Login'
import { useSelector } from 'react-redux'
import Deposits from './pages/admin/Deposits'
import Withdrawal from './pages/admin/Withdrawal'
import AddFunds from './pages/admin/AddFunds'
import SendEmail from './pages/admin/SendEmail'
import Funds from './pages/admin/Funds'
import Orders from './pages/admin/Orders'
import Address from './pages/admin/Address'

function App() {
  const adminToken = useSelector((state) => state.Admin?.token);
  const PrivateMasterRoute = ({ element, ...rest }) => {
    return adminToken ? element : element;
  };
  return (
    <>
    <BrowserRouter>
      <Routes>
        <Route path='/login' element={<Login/>}/>
        <Route path='/' element={<PrivateMasterRoute element={<DashboardLayout />}/>}>
            {/* main */}
            <Route path='deposits' element={<PrivateMasterRoute element={<Deposits/>}/>}/>
            <Route path='withdrawal' element={<PrivateMasterRoute element={ <Withdrawal/> }/>}/>
            <Route path='orders' element={<PrivateMasterRoute element={ <Orders/> }/>}/>
            <Route path='users' element={<PrivateMasterRoute element={<Users />}/>}/>
            <Route path='funds' element={<PrivateMasterRoute element={<Funds />}/>}/>
            <Route path='address' element={<PrivateMasterRoute element={<Address />}/>}/>
            
            {/* Extra */}
            <Route path='add-funds' element={<PrivateMasterRoute element={<AddFunds/>}/>}/>
            <Route path='send-email' element={<PrivateMasterRoute element={<SendEmail/>}/>}/>
        </Route>
      </Routes>
    </BrowserRouter>
    </>
  )
}

export default App
