import React, { createContext } from 'react'
import socketIOClient, { Socket } from 'socket.io-client'
import { useDispatch, useSelector } from 'react-redux'
import { messagesActions } from '../redux/messages/messages.actions'
import { serversActions } from '../redux/servers/servers.actions'
import { roomsActions } from '../redux/rooms/rooms.actions'
import { selectCurrentServer } from '../redux/servers/servers.selectors'
import { IServerData } from '../types/types'

export const SocketContext = createContext(null as any)

interface Iprops {
  children: React.ReactNode
}

export const SocketProvider = (props: Iprops) => {
  const { children } = props
  let socket: Socket
  let nsSocket: Socket
  let ws

  const dispatch = useDispatch()
  const currentServer = useSelector(selectCurrentServer)

  const initialize = () => {
    socket = socketIOClient.io('http://localhost:5000/test1')

    socket.on('serversArr', (serversArr: IServerData[]) => {
      dispatch(serversActions.updateServers(serversArr))
      dispatch(serversActions.updateCurrentServer(serversArr[0]))
    })

    socket.on('currentServerData', (currentServerData: IServerData) => {
      dispatch(serversActions.updateCurrentServer(currentServerData))
    })

    // if (!currentServer) {
    //   joinNs('/wiki')
    // } else {
    //   joinNs(currentServer)
    // }
  }

  // const joinNs = (endpoint: string) => {
  //   if (nsSocket) nsSocket.close()

  //   nsSocket = socketIOClient.io(endpoint)

  //   nsSocket.on('nsRoomLoad', (nsRooms: any) => {
  //     dispatch(roomsActions.updateRooms(nsRooms))
  //     // joinRoom(nsRooms[0].roomTitle)
  //   })

  //   nsSocket.on('messageToClients', (msg: string) => {
  //     dispatch(messagesActions.addNewMessage(msg))
  //   })
  // }

  // const joinRoom = (roomName: string) => {
  //   nsSocket.emit('joinRoom', roomName)
  //   dispatch(roomsActions.updateCurrentRoomName(roomName))

  //   nsSocket.on('updateMembers', (usersInARoom: any) =>
  //     dispatch(roomsActions.updatePeopleCount(usersInARoom))
  //   )

  //   nsSocket.on('historyCatchUp', (history: any) => {
  //     dispatch(messagesActions.addHistory(history))
  //     // console.log(history)
  //   })
  // }

  // const sendMessage = (message: string) => {
  //   nsSocket.emit('newMessageToServer', message)
  // }

  ws = {
    // sendMessage,
    initialize,
    // joinNs,
    // joinRoom,
  }

  return <SocketContext.Provider value={ws}>{children}</SocketContext.Provider>
}
