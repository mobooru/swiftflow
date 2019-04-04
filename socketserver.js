const SocketIO = require('socket.io')

module.exports = class SocketServer {
  constructor(server) {
    this.peers = {}

    this.server = server

    this.io = SocketIO.listen(this.server)

    this.newConnection = this.newConnection.bind(this)
    this.authenticate = this.authenticate.bind(this)
  }

  listen(port) {
    this.server.listen(port)

    this.io.on('connection', this.newConnection)
  }

  async newConnection(socket) {
    this.io.to('stats').emit('CLIENT_CONNECTED', { id: socket.id })
    socket.on('authenticate', (data) => this.authenticate(socket, data))
  }

  async disconnected(socket) {
    this.io.to('stats').emit('CLIENT_DISCONNECTED', { id: socket.id })
    delete this.peers[socket.id]
  } 

  async authenticate(socket, data) {
    let AUTHENTICATION;
    try {
      AUTHENTICATION = await this.validateAuthenticity(data)
      if (!AUTHENTICATION) throw new Error('NOT_AUTHENTICATED')

      this.io.to('stats').emit('CLIENT_AUTHENTICATED', { id: socket.id, channel: data.JOIN_CHANNEL || 'NONE' })
  
      this.peers[socket.id] = { ...AUTHENTICATION }
      if (data.JOIN_CHANNEL) socket.join(data.JOIN_CHANNEL)
      
      socket.on('disconnect', () => this.disconnected(socket))
      this.applyListeners(socket)
    } catch (e) {
      socket.send('error', e)
    }
  }
  
  async validateAuthenticity(data) {
    return data
  }

  async applyListeners(socket) { }
}