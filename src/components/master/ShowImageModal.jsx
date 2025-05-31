import React, { useState } from 'react';
import { Button, Modal } from 'antd';
const App = ({record,role,isModalOpen,setIsModalOpen,onSubmit}) => {

  const handleSubmit = (status) => {
    onSubmit(status)
    setIsModalOpen(false);
  };
  const handleCancel = (status) => {
    setIsModalOpen(false);
  };

  return (
    <>
      <Modal 
        title="Basic Modal"
        open={isModalOpen}
        onCancel={handleCancel}
        footer={[
          <Button key="reject" danger onClick={()=>handleSubmit('unavailable')}>
            Reject
          </Button>,
          <Button key="approve" style={{ backgroundColor: "gray", color: "white" }} onClick={()=>handleSubmit('verified')}>
            Approve
          </Button>,
        ]}
      >
        {
          record && role && record[role].map((value,index)=><img src={value} alt="" srcset="" />)
        }
      </Modal>
    </>
  );
};
export default App;
