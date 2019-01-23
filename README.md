# SwiftFlow
Maintainable expressjs endpoints.
___
## Install
```
npm i --save swiftflow
```

## Example

```js
// server.js
const app = require("express")()
const { EndpointManager } = require("swiftflow")

// Create a new EndpointManager, points to a directory of JS files.
const endpoints = new EndpointManager("./endpoints")

// Install all JS files in "./endpoints" then listen on port 80.
endpoints.install(app).then(() => app.listen(80))
```

```js
// endpoints/hello.js
const { Endpoint } = require('swiftflow')

// Export a class that extends from the SwiftFlow Endpoint class.
module.exports = class HelloEndpoint extends Endpoint {
  constructor () {
    super('/api/hello/:name') // The path this endpoint will listen to.
  }

  async execute (params) {
    // All variables like .params and .query gets combined into a single object, "params".
    const { name } = params
    
    // The Endpoint class automatically handles returns and sends it to the client.
    return { response: `Hi there ${name}!` }
  }
}
```