import { Server, Socket } from 'socket.io'
import { ServerModel } from '../models/server/server.model'

export const ListenToSocketEndPoints = async (io: Server) => {
  const serversArr = await ServerModel.getServersArr()
  serversArr.forEach((server) => {
    io.of(server.endpoint).on('connection', async (socket: Socket) => {
      socket.emit('serversArr', serversArr)

      //Get and Send populated server data
      const PopulatedCurrentServerData = await ServerModel.findAndPopulateCurrentServer(
        server.endpoint
      )

      socket.emit('currentServerData', PopulatedCurrentServerData)

      // const nsData = namespaces.map((ns) => {
      //   return {
      //     img: ns.img,
      //     endpoint: ns.endpoint,
      //   }
      // })
    })
  })
}
