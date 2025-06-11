import React, { useState } from 'react';
import { Button, Divider, Flex, Image, Modal,Typography } from 'antd';
import UploadScreenshot from '../components/UploadScreenshot'
import { DeleteOutlined } from '@ant-design/icons';
import { adminDelete } from '../services/adminApi';
import { Popconfirm } from 'antd';
const {Text} = Typography

const App = ({order}) => {
    const [orderState,setOrderState]=useState(order)
    const [openModal, setOpenModal] = useState(false);
    const [previewImage, setPreviewImage] = useState('');
    const [previewOpen, setPreviewOpen] = useState(false);
    const [loading,setLoading] = useState(false)

    const handleRemove= async(url)=>{
        setLoading(true)
        try {
            const response = await adminDelete(`/orders/${orderState._id}/screenshots?url=${url}`)
            if(response.success) { 
                setOrderState(response.order)
            }
        } catch (error) {
            console.log(error);
        } finally {
            setLoading(false)
        }
    }
    
    return (
        <Flex vertical gap="middle" align="flex-start">
        <Button type="primary" className='bg-blue-500' onClick={() => setOpenModal(true)}>
            Uploads
        </Button>
        <Modal
            title="Receipts"
            centered
            open={openModal}
            onOk={() => setOpenModal(false)}
            onCancel={() => setOpenModal(false)}
            okButtonProps={{style : {background : "black"}}}
        >
        <Text></Text>
       {orderState.receipts.map((value, index) => (
        <>
            <Image
            src={value}
            width={'100%'}
            height={200}
            className="object-cover"
            style={{ border: '1px solid black' }}
            />
            <Flex justify='end' className='mb-2'>
           <Popconfirm
                title="Are you sure?"
                okText="Yes"
                cancelText="No"
                onConfirm={() => handleRemove(value)}
                disabled={loading}
                okButtonProps={{style : {backgroundColor : "black"}}}
            >
            <DeleteOutlined
                className="text-lg cursor-pointer bg-white hover:scale-110 rounded-full"
                style={{ pointerEvents: loading ? 'none' : 'auto', opacity: loading ? 0.5 : 1 }}
            />
            </Popconfirm>
            </Flex>
            </>
        ))}

        { previewImage && (
            <Image
                wrapperStyle={{ display: 'none' }}
                preview={{
                visible: previewOpen,
                onVisibleChange: visible => setPreviewOpen(visible),
                afterOpenChange: visible => !visible && setPreviewImage(''),
            }}
                src={previewImage}
            />
        )}

        <Divider/>
        <Text className='text-lg font-semibold'>Add Receipts</Text>

        {/* //Upload */}
        <UploadScreenshot order={orderState} setOrder={setOrderState}/>
        
        </Modal>
        </Flex>
    );
};
export default App;