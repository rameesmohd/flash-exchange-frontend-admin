import React, { useState } from 'react';
import { PlusOutlined } from '@ant-design/icons';
import { Image, Upload, message } from 'antd';
import axios from 'axios';
import { adminPost } from '../services/adminApi';
import { Button } from 'antd';

const getBase64 = file =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = error => reject(error);
  });

const App = ({order,setOrder}) => {
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewImage, setPreviewImage] = useState('');
  const [fileList, setFileList] = useState([]);

  const handlePreview = async (file) => {
    if (!file.url && !file.preview) {
      file.preview = await getBase64(file.originFileObj);
    }
    setPreviewImage(file.url || file.preview);
    setPreviewOpen(true);
  };

  const handleChange = ({ fileList: newFileList }) => {
    setFileList(newFileList);
  };

  const handleUpload = async ({ file, onSuccess, onError }) => {
    const data = new FormData();
    data.append('file', file);
    data.append('upload_preset', 'unsigned_preset'); // Set this in Cloudinary → Settings → Upload
    data.append('folder', 'order-screenshots');
    try {
      const res = await axios.post(
        'https://api.cloudinary.com/v1_1/dj5inosqh/image/upload',
        data
      );
      // Attach URL to file
      file.url = res.data.secure_url;
      file.public_id = res.data.public_id;
      onSuccess(res.data, file);
    } catch (err) {
      console.error('Upload error:', err);
      message.error('Upload failed.');
      onError(err);
    }
  };

  const handleRemove = async (file) => {
    if (!file.public_id) return;
    try {
      await adminPost('/delete-image', { public_id: file.public_id });
      return true;
    } catch (err) {
      console.error('Delete failed:', err);
      message.error('Failed to delete image');
      return false;
    }
  };

  const handleSaveUrls = async () => {
  const urls = fileList
    .filter(file => file.url)
    .map(file => file.url);
  try {
    const response = await adminPost(`/orders/${order._id}/screenshots`, { urls });
    if(response.success){
      setOrder(response.result)
      setFileList([])
      message.success('Screenshots saved to order');
    }
  } catch (err) {
    console.error(err);
    message.error('Failed to save screenshots');
  }
  };


  const uploadButton = (
    <button style={{ border: 0, background: 'none' }} type="button">
      <PlusOutlined />
      <div style={{ marginTop: 8 }}>Upload</div>
    </button>
  );

  return (
    <div className='mt-4'>
      <Upload
        customRequest={handleUpload}
        listType="picture-card"
        fileList={fileList}
        onPreview={handlePreview}
        onChange={handleChange}
        onRemove={handleRemove} 
      >
        {fileList.length >= 8 ? null : uploadButton}
      </Upload>

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

      <Button type="primary" className='bg-blue-500' onClick={handleSaveUrls} disabled={fileList.length === 0}>
        Save Screenshots
      </Button>
    </div>
  );
};

export default App;
