import {
investment,
deposit,
withdrawal,
settings,
} from '../../assets/dashboard/index'

const adminSidebarOptions = 
  [
    { 
      icon : investment,       
      title: "All Users", nav: '/users' },
    { 
      icon:settings,
      title: "Address Orders", nav: '/orders' },
    { 
      icon:deposit,
        title: "$ Deposits", nav: '/deposits' },
    {  
      icon: withdrawal,      
        title: "$ Withdrawals", nav: '/withdrawal' },
    {  
      icon: withdrawal,      
      title: "Wallet Address", nav: '/address' },
    { 
      icon:settings,
      title: "Our Funds", nav: '/funds' },
  ];

  export {
    adminSidebarOptions,
  }

  