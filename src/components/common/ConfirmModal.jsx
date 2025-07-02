import React, { useState } from 'react';
import { Modal, Button, Input,Typography } from 'antd';
const {Text} = Typography

const ConfirmModal = ({
  visible,
  title = "Are you sure?",
  content = "Do you really want to perform this action?",
  onConfirm,
  onCancel,
  confirmText = "Yes",
  cancelText = "Cancel",
  loading = false,
  type
}) => {

  const [txid,setTxid]=useState('')
  const [err,setErr]=useState('')

  const handleOk = ()=>{
    try {
      if(type==='approve'){
        if(!txid) {
          setErr('Please enter txid')
          return
        }
        onConfirm(txid)
      } else { 
        onConfirm()
      }
    } catch (error) {
      console.log(error);
    }
  }

  return (
    <Modal
      title={title}
      open={visible}
      onOk={handleOk}
      onCancel={onCancel}
      confirmLoading={loading}
      okText={confirmText}
      cancelText={cancelText}
      centered
       okButtonProps={{ style: { backgroundColor: '#1890ff', borderColor: '#1890ff', color: '#fff' } }}
    >
      {content}
      {
        type=='approve' &&
        <>
        <Input
          type=''
          size='large'
          title='Transaction Id'
          className='mt-8'
          placeholder='PASTE TRC-20 TXID'
          required
          onChange={(e)=>setTxid(e.target.value)}
        />
        <Text type='danger'>{err}</Text>
      </>
      }
    </Modal>
  );
};

export default ConfirmModal;
