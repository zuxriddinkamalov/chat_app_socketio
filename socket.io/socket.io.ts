import { Server, Socket } from 'socket.io'
import jwt from 'jsonwebtoken'

import { MessageModel } from './../models/message/message.model'
import { RoomModel } from './../models/room/room.model'
import { ServerModel } from '../models/server/server.model'
import User from '../models/user/user.model'
import options from '../config'

export const ListenToSocketEndPoints = async (io: Server) => {
  const serversArr = await ServerModel.getServersArr()
  serversArr.forEach((server) => {
    io.of(server.endpoint).on('connection', async (socket: Socket) => {
      socket.on('authenticate', async (token) => {
        try {
          const decodedData = await jwt.verify(
            token,
            options.jwtSecret as string
          )
          const userData = await User.findById(
            //@ts-ignore
            decodedData._id,
            '_id login avatar room'
          ).lean()
          const initialData = {
            serversArr,
            userData,
          }
          socket.emit('authorized', initialData)
        } catch (error) {
          socket.emit('not authorized')
        }
      })

      socket.on('getServerData', async (serverId) => {
        const currentServerDataFull = await ServerModel.findById(
          serverId,
          '_id title image endpoint isPrivate rooms'
        ).lean()
        const { rooms, ...serverData } = currentServerDataFull
        socket.emit('currentServerData', serverData)
        socket.emit('currentServerRoomsArr', rooms)
      })

      socket.on(
        'changeRoom',
        async ({ roomId, userId }: { roomId: string; userId: string }) => {
          await leaveRoom(userId, io, server.endpoint, socket)

          await joinRoom(userId, roomId, socket)
          //  RoomModel.findByIdAndUpdate(roomId, {
          //   $addToSet: {
          //     currentUsers: userId,
          //   },
          // }).populate({
          //   path: 'currentUsers',
          //   select: 'login avatar',
          // })

          // io.of(server.endpoint).to(roomId).emit('userJoined', userData)
        }
      )

      socket.on(
        'newMessageToServer',
        async ({
          message,
          userId,
          roomId,
        }: {
          message: string
          userId: string
          roomId: string
        }) => {
          const newMessage = await new MessageModel({
            text: message,
            user: userId,
            room: roomId,
          })

          await newMessage.save((error, newMessageDoc) =>
            MessageModel.populate(
              newMessageDoc,
              { path: 'user', model: User },
              (err, savedAndPopulatedMessage) =>
                io
                  .of(server.endpoint)
                  .to(roomId)
                  .emit('savedMessage', savedAndPopulatedMessage)
            )
          )
        }
      )
    })
  })
}

const leaveRoom = async (
  userId: string,
  io: Server,
  endpoint: string,
  socket: Socket
) => {
  const userData = await User.findById(userId).lean()
  if (userData!.room) {
    await socket.leave(userData!.room.toString())
    await User.findByIdAndUpdate(userId, {
      $unset: { room: '' },
    })

    const roomData = await RoomModel.findById(userData!.room)
      .populate({
        path: 'users',
      })
      .lean()

    await io
      .of(endpoint)
      .to(userData!.room.toString())
      .emit('usersUpdate', roomData.users)
  }
}

const joinRoom = async (
  userId: string,
  roomId: string,

  socket: Socket
) => {
  await socket.join(roomId.toString())

  await User.findByIdAndUpdate(userId, {
    $set: { room: roomId },
  })

  const roomDataFull = await RoomModel.findById(roomId)
    .populate({
      path: 'messages',
    })
    .populate({
      path: 'users',
    })
    .lean()
  const { messages, users, ...roomData } = roomDataFull

  await socket.emit('currentRoomData', roomData)
  await socket.emit('currentRoomUsers', users)
  await socket.emit('currentRoomMessages', messages)
  await socket.to(roomId).emit('usersUpdate', users)
}
