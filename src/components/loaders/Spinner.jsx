import { Spin } from 'antd'
import React from 'react'

const Spinner = ({style}) => {
  return (
    <div className={style}>
        <Spin/>
    </div>
  )
}

export default Spinner
