class Enpoint {
  constructor (path) {
    this.path = path

    this.trigger = this.trigger.bind(this)
  }

  install (app) {
    app[this.isPost ? 'post' : 'get'](this.path, this.trigger)
  }

  async trigger (req, res, next) {
    let response = { success: false, error: 'Failed to execute trigger.' }
    let params = { ...req.params, ...req.query }

    try {
      response = { success: true, ...(await this.execute(params, req)) }
    } catch (e) {
      console.warn(e)
      response = { success: false, error: e.message }
    }

    res.setHeader('swiftflow-params', JSON.stringify(params))
    res.setHeader('swiftflow-executionTime', Date.now() - req.start)

    if (response.redir) { res.redirect(response.redir); return }
    if (response.rawdata && response.mime) {
      res.setHeader('content-encoding', 'binary')
      res.set('Content-Type', response.mime)
      res.send(response.rawdata)
      return
    }

    if (response.text) {
      res.send(response.text)
      return
    }

    response['params'] = params
    response['executionTime'] = Date.now() - req.start

    res.status(response.success ? 200 : 500).send(response)
  }
}

module.exports = Enpoint
