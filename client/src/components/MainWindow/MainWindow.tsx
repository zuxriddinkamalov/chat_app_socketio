import React from 'react'
import { css } from '@emotion/react'

import styled from 'styled-components'
import RoomHeader from './RoomHeader/RoomHeader'
import MessageList from './MessageList/MessageList'
import CreateMessageForm from './CreateMessageForm/CreateMessageForm'
import { useColorModeValue } from '@chakra-ui/react'

const MainWindow = () => {
  const bgColor = useColorModeValue('#FFFFFF', '#2D3748')

  return (
    <section
      css={css`
        grid-column: 2/3;
        grid-row: 2/3;

        width: 100%;
        height: 100%;
        flex-direction: column;
        position: relative;

        background-color: ${bgColor};
      `}
    >
      <div>messages</div>
      {/* <RoomHeader />
      <MessageList />
      <CreateMessageForm /> */}
    </section>
  )
}

export default MainWindow
