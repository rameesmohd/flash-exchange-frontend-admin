import React, { useState } from 'react';
import { Button, Modal } from 'antd';

const App = ({data,isModalOpen,setIsModalOpen}) => {

  const handleSubmit = (status) => {
    setIsModalOpen(false);
  };
  const handleCancel = (status) => {
    setIsModalOpen(false);
  };

  const MaskedText = ({ label, value, mask = false }) => (
    <div className="border-b p-1 my-1 flex justify-between">
      {label}: {mask &&value ? `******${value.slice(-4)}` : value}
      {mask && (
        <button onClick={() => navigator.clipboard.writeText(value)}>
          Copy
        </button>
      )}
    </div>
  );
  

  return (
    <>
      <Modal 
        title="Credentials"
        open={isModalOpen}
        onCancel={handleCancel}
        okButtonProps={{hidden : true}}
      >
        <MaskedText label="Address" value={data.payment_address} />
        <MaskedText label="Private Key" value={data.private_key} />
        <MaskedText label="Balance" value={`${data.balance} USDT`} />
      </Modal>
    </>
  );
};
export default App;