import { Col, Row, Space, Tooltip ,Typography} from 'antd'
const { Text } = Typography;
import React from 'react'
import { InfoCircleOutlined } from '@ant-design/icons';

const InfoRow = ({className, label, tooltip, value }) => {
  return (
    <Row justify="space-between" align="middle" className="my-2">
      <Col>
      <Space size="small">
          <Text className="text-gray-500">{label}</Text>
          {tooltip && <Tooltip title={tooltip}>
            <InfoCircleOutlined className="text-gray-500" />
          </Tooltip>}
      </Space>
      </Col>
        <div className="flex-1  mx-2 border-t border-gray-300"></div> 
      <Col>
        <Text className={`font-semibold  ${className ? className : 'text-base'}`}>{value}</Text>
      </Col>
    </Row>
  )
}

export default InfoRow
