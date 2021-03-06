module.exports = class SocketServer {
  constructor (io) {
    this.peers = {}
    this.listeners = {}

    this.io = io

    this.newConnection = this.newConnection.bind(this)
    this.authenticate = this.authenticate.bind(this)
  }

  listen () {
    this.io.on('connection', this.newConnection)
  }

  async newConnection (socket) {
    this.io.to('stats').emit('CLIENT_CONNECTED', { id: socket.id })
    socket.on('authenticate', (data) => this.authenticate(socket, data))

    Object.keys(this.listeners).forEach(key =>
      socket.on(key, data =>
        this.listeners[key].trigger(this.peers[socket.id], data, socket))
    )
  }

  async disconnected (socket) {
    this.io.to('stats').emit('CLIENT_DISCONNECTED', { id: socket.id })
    delete this.peers[socket.id]
  }

  async authenticate (socket, data) {
    let AUTHENTICATION
    try {
      AUTHENTICATION = await this.validateAuthenticity(data)
      if (!AUTHENTICATION) throw new Error('NOT_AUTHENTICATED')

      this.io.to('stats').emit('CLIENT_AUTHENTICATED', { id: socket.id })

      this.peers[socket.id] = { ...AUTHENTICATION }

      socket.on('disconnect', () => this.disconnected(socket))
      this.applyAuthenticatedListeners(socket)
      if (AUTHENTICATION.JOIN_CHANNEL) socket.join(AUTHENTICATION.JOIN_CHANNEL)
      socket.emit('authenticated', true)
    } catch (e) {
      socket.emit('authenticated', false)
    }
  }

  async broadcast (channel, event, data) {
    this.io.to(channel).emit(event, data)
  }

  async register (Listener) {
    const listener = new Listener(this.io)
    this.listeners[listener.key] = listener
  }

  async validateAuthenticity (data) {
    return data
  }

  async applyAuthenticatedListeners (socket) {

  }
}
