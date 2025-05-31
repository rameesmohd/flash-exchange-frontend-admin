import { Button, Dropdown, Space } from 'antd';
import React from 'react'

const App = ({direction,itemsList,btnContent}) => {
  return (
    <>
       <Space direction={direction}>
            <Space wrap>
                <Dropdown
                menu={{ items: itemsList }}
                placement="bottomRight"
                >
                <Button className='border-none'>
                    {btnContent}
                </Button>
                </Dropdown>
            </Space>
       </Space>
    </>
  )
}

export default App
