import React, { useRef, useState } from 'react';
import { Badge, Button, Drawer, theme } from 'antd';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Outlet } from 'react-router-dom'
import { BellOutlined, LogoutOutlined, MenuOutlined } from '@ant-design/icons';
import logo from '../../assets/logo.png'
import { adminSidebarOptions } from '../../content/dashboard/sidebar';
import { notification as notificationIcon, profile as profileIcon,wallet as walletIcon } from '../../assets/dashboard'
import { logoutUser } from '../../services/adminApi';

const items = [
  {
    key: '1',
    label: (
      <Badge count={5} offset={[10, 0]}>
        <span className="font-semibold text-blue-600">Notifications</span>
      </Badge>
    ), 
    icon: <BellOutlined />,
  },
  {
    key: '2',
    type: 'divider',
  },
  {
    key: '6',
    label: <span className="text-red-500">Logout</span>,
    icon: <LogoutOutlined />,
  },
];

const itemsList = [
  {
    key: 'sub2',
    label: 'My Wallet',
    icon: <img src={walletIcon} className='text-gray-500' alt="Wallet Icon" width={24} height={24} />,
    children: [
      {
        key: '5',
        label: 'Investment Wallet',
      },
      {
        key: '6',
        label: 'Rebate Wallet',
      },
    ],
  },
  {
    type: 'divider',
  },
  {
    key: 'sub4',
    label: 'Profile',
    icon: <img src={profileIcon} className='text-gray-500' alt="Wallet Icon" width={24} height={24} />,
    children: [
      {
        key: '9',
        label: 'Terms and Conditions',
      },
      {
        key: '10',
        label: 'Profile',
      },
      {
        type: 'divider',
      },
      {
        key: '11',
        label: 'Signout',
      },
    ],
  },
  {
    type: 'divider',
  },
];

const listButtons = (sidebarOptions) => {
  const location = useLocation();

  return sidebarOptions.map((option, index) => (
    <p key={index}>
      <Link
        to={option.nav}
        className={`text-gray-600 flex items-center px-3 py-2 rounded-sm 
          ${location.pathname === option.nav ? 'bg-gray-200 text-blue-600' : 'hover:text-blue-600'} 
          hover:bg-gray-200`}
      >
        <span className="text-sm flex items-center mr-2 text-gray-400">
          <img src={option.icon} alt={`${option.title} icon`} />
        </span>
        {option.title}
      </Link>
    </p>
  ));
};

export default function App({role}) {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const { token } = theme.useToken();
  const containerRef = useRef(null); 


  const showDrawer = () => setOpen(!open);
  const onClose = () => setOpen(false);

  return (
    <div>                   
      {/* Navbar */}
      <nav className="border bg-white fixed top-0 z-50 w-full py-4 px-4" style={{ height: '64px' }}>
        <div className="flex lg:justify-between items-center">
          {/* Hamburger icon for small screens */}
          <button
            onClick={showDrawer}
            type="button"
            className="p-2 text-gray-500 rounded-lg lg:hidden hover:bg-gray-100"
          >
            {open ? 
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="tabler-icon tabler-icon-x"><path d="M18 6l-12 12"></path><path d="M6 6l12 12"></path></svg>
             : <MenuOutlined className="text-xl w-6 h-6"  />
            }
          </button>

          {/* Logo */}
          <Link to={'#'} className="flex px-3 items-center space-x-3 rtl:space-x-reverse">
            <span className="self-center text-xl font-semibold whitespace-nowrap text-blue-800">
              <img src={logo} alt="" className="h-6 w-6" />
            </span>
            <div className='text-lg capitalize'>E Value Admin</div>
          </Link>
            
           <Button onClick={()=>logoutUser()} icon={<LogoutOutlined />} className="text-red-500 border p-1 rounded-md text-sm cursor-pointer">Logout</Button>

        </div>
      </nav>

      {/* Menu Content */}
      <div
        ref={containerRef}
        className=" relative"
        style={{ zIndex: 1 }} // Main content z-index must be below the navbar
      >
        {/* Sidebar for large screens */}
        <aside className="hidden lg:block w-64 fixed top-16 left-0 h-full bg-white shadow-md">
          <div className="p-2 space-y-2">
             { listButtons(adminSidebarOptions)}
          </div>
        </aside>

        {/* Drawer Menu for small screens */}
        <Drawer
          placement="left"
          onClose={onClose}
          open={open}
          getContainer={() => containerRef.current} 
          width="16rem"
          mask={true} 
          style={{
            position: 'absolute',
            top: '60px', 
            boxShadow: 'none',
            border: 'none',
            padding : 0,
          }}
          bodyStyle={{
            padding: 0, 
            margin: 0,
          }}
          headerStyle={{
            display: 'none', 
          }}
          title={null} 
          >
        <div className="space-y-2">
          {listButtons(adminSidebarOptions) }
          </div>
        </Drawer>
      </div>

      <div className='sm:h-screen w-full pt-16 lg:pl-64 '>
         <div className='w-full px-2'>
            <Outlet />
         </div>
      </div>
    </div>
  );
}
