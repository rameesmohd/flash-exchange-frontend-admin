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
import 'antd/dist/reset.css';

function App() {
  const adminAuth = useSelector((state) => state.Admin?.isAuthenticated);
  const PrivateMasterRoute = ({ element, ...rest }) => {
    return adminAuth ? element : <Navigate to={'/login'}/>;
  };
  return (
    <>
    <BrowserRouter>
      <Routes>
        <Route path='/login' element={<Login/>}/>
        <Route path='/' element={<PrivateMasterRoute element={<DashboardLayout />}/>}>

            {/* Redirect / to /users */}
            <Route index element={<Navigate to="users" replace />} />
            
            {/* main */}
            <Route path='users' element={<PrivateMasterRoute element={<Users />}/>}/>
            <Route path='deposits' element={<PrivateMasterRoute element={<Deposits/>}/>}/>
            <Route path='withdrawal' element={<PrivateMasterRoute element={ <Withdrawal/> }/>}/>
            <Route path='orders' element={<PrivateMasterRoute element={ <Orders/> }/>}/>
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
