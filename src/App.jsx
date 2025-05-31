import { BrowserRouter,Routes , Route, Navigate } from 'react-router-dom'
import Users from './pages/master/Users'
import Manager from './pages/master/Manager'
import Transactions from './pages/Transactions'
import DashboardLayout from './components/layout/DashboardLayout'
import InvestmentDetail from './pages/InvestmentDetail'
import Login from './pages/Login'
import { useSelector } from 'react-redux'
import Deposits from './pages/master/Deposits'
import Withdrawal from './pages/master/Withdrawal'
import AddFunds from './pages/master/AddFunds'
import SendEmail from './pages/master/SendEmail'

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
            <Route index element={<PrivateMasterRoute element={<Manager/>}/>}/>
            <Route path='deposits' element={<PrivateMasterRoute element={<Deposits/>}/>}/>
            <Route path='withdrawal' element={<PrivateMasterRoute element={ <Withdrawal/> }/>}/>
            <Route path='orders' element={<PrivateMasterRoute element={ <Withdrawal/> }/>}/>
            <Route path='users' element={<PrivateMasterRoute element={<Users />}/>}/>
            <Route path='transactions' element={<PrivateMasterRoute element={<Transactions />}/>}/>
            <Route path='add-funds' element={<PrivateMasterRoute element={<AddFunds/>}/>}/>
            <Route path='send-email' element={<PrivateMasterRoute element={<SendEmail/>}/>}/>
        </Route>
      </Routes>
    </BrowserRouter>
    </>
  )
}

export default App
