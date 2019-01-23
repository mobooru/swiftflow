const fs = require('fs')
const path = require('path')
const { promisify } = require('util')

const readdir = promisify(fs.readdir)

class EndpointManager {
  constructor (base, logger) {
    this.base = base
    this.endpoints = {}
    this.log = logger || (() => {})
  }

  async installEndpoint (app, file, base = this.base, progress = 1, length = 1) {
    try {
      this.log(`[${progress}/${length}] Installing "${file}"`)
      let Endpoint = require(path.resolve(base, file))
      let endpoint = new Endpoint()
      if (this.endpoints[endpoint.constructor.name]) throw new Error(`Endpoint with the name "${endpoint.constructor.name}" already exists.`)
      endpoint.install(app)
      this.endpoints[endpoint.constructor.name] = endpoint
      this.log(`[${progress}/${length}] Successfully installed "${file}"`)
    } catch (e) {
      this.log(`[${progress}/${length}] Tried installing "${file}" but encountered an error.`, e)
    }
  }

  async install (app) {
    app.use((req, res, next) => {
      req.start = Date.now()
      res.setHeader('X-Powered-By', 'SwiftFlow (https://github.com/mobooru/swiftflow)')
      res.setHeader('Access-Control-Allow-Origin', '*')
      next()
    })

    if (this.base) {
      const files = await readdir(this.base)
      let progress = 1

      for (const file in files) {
        await this.installEndpoint(app, files[file], this.base, progress, files.length)
        progress++
      }

      return this.endpoints
    }
  }
}

module.exports = EndpointManager
