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
      title: "Users", nav: '/users' },
    { 
      icon:settings,
      title: "Funds", nav: '/funds' },
    { 
      icon:settings,
        title: "Orders", nav: '/orders' },
    { 
      icon:deposit,
        title: "Deposit", nav: '/deposits' },
    {  
      icon: withdrawal,      
        title: "Withdrawal", nav: '/withdrawal' },
    {  
      icon: withdrawal,      
      title: "Address", nav: '/address' },
  ];

  export {
    adminSidebarOptions,
  }

  