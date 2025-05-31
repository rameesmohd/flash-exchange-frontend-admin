import React, { useEffect, useState } from 'react'
import { adminGet } from '../../services/adminApi'
import { Card, Tag, Typography, Row, Col, Button, Space } from 'antd';
const { Text, Title } = Typography;
import { formatDate } from '../../services/formatDate';

const Address = () => {
  const [addressList,setAddressList]=useState([])
  const [loading,setLoading]=useState(false)

  const fetchAddress=async()=>{
    try {
        setLoading(true)
        const response = await adminGet('/address')
        if(response.success){
            setAddressList(response.result)
        }
    } catch (error) {
        console.log(error);
    } finally {
        setLoading(false)
    }
  }

  useEffect(()=>{
    fetchAddress()
  },[])

  return (
    <div className='p-2 my-2'>
      <div className=' text-lg my-2'>Company Address</div>
     {
  addressList.map((value, index) => (
    <Card
      key={index}
      size="small"
      style={{
        backgroundColor: '#fff',
        borderRadius: 10,
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)',
        marginBottom: 12,
      }}
      bodyStyle={{ padding: 16 }}
    >
      {/* Top Section */}
      <Row justify="space-between" align="middle">
        <Col md={12} sm={24} xs={24}>
          <Tag
            color="geekblue"
            style={{
              borderRadius: '50%',
              width: 32,
              height: 32,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 'bold',
            }}
          >
            {value.priority}
          </Tag>
        </Col>
        <Col>
          <Text type="secondary" style={{ fontSize: 12 }}>
            TRC-20 Address
          </Text>
          <br />
          <Text strong copyable style={{ fontSize: 13 }}>
            { value.address}
          </Text>
        </Col>
      </Row>

      {/* Flag Info */}
      <Row style={{ marginTop: 10 }}>
        <Col className='flex justify-between' span={24}>
          <Text className='capitalize text-start' type="warning" style={{ fontSize: 12 }}>
            ⚑ Flag: {`${value.flag}` || 'None'}
          </Text>

          <Text className='capitalize text-end' type="" style={{ fontSize: 12 }}>
             Status: {`${value.status}` || 'None'}
          </Text>
        </Col>
      </Row>

      {/* Timestamps */}
      <Row style={{ marginTop: 10 }} justify="space-between">
        <Col>
          <Text type="secondary" style={{ fontSize: 11 }}>
            Created: {value.createdAt && formatDate(value.createdAt)}
          </Text>
        </Col>
        <Col>
          <Text type="secondary" style={{ fontSize: 11 }}>
            Updated: {value.updatedAt && formatDate(value.updatedAt)}
          </Text>
        </Col>
      </Row>

      {/* Action */}
      <Row style={{ marginTop: 8 }} justify="end">
        <Button type="primary" danger size="small">
          Disable
        </Button>
      </Row>
    </Card>
  ))
}
      <Button type='primary' className='text-center my-auto w-full cursor-pointer bg-gray-700 text-white rounded-lg '>+</Button>
    </div>
  )
}

export default Address
