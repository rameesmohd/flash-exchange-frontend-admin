import {
investment,
deposit,
withdrawal,
settings,
} from '../../assets/dashboard/index'

const masterSidebarOptions = 
  [
    { 
      icon : investment,       
      title: "Users", nav: '/users' },
    { 
      icon:settings,
        title: "Orders", nav: '/orders' },
    { 
      icon:deposit,
        title: "Deposit", nav: '/deposits' },
    {  
      icon: withdrawal,      
        title: "Withdrawal", nav: '/withdrawal' },
  ];

  export {
    masterSidebarOptions,
  }

  