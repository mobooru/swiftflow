module.exports = class SocketListener {
  constructor (key) {
    this.key = key
  }

  async trigger (peer, data, socket) {
    const timeStart = new Date()
    try {
      const res = await this.execute(peer, data)
      socket.emit(res.key, { ...res, executionTime: Date.now() - timeStart })
    } catch (e) {
      socket.emit('ERROR', { key: this.key, error: e.message, executionTime: Date.now() - timeStart })
    }
  }
}
