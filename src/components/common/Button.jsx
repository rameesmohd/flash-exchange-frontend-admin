import { Spin } from 'antd'
import React from 'react'

const Button = ({style,onclick,text,loading}) => {
  return (
    <>
      <button disabled={loading} className={style} onClick={onclick}>{loading ? <Spin
        indicator={
        <span
          style={{
            width: '24px',
            height: '24px',
            display: 'inline-block',
            border: '3px solid #ffffff',
            borderRadius: '50%',
            borderTopColor: 'transparent',
            animation: 'spin 1s linear infinite',
          }}/>
        }
      /> : text}
      </button>
    </>
  )
}

export default Button
