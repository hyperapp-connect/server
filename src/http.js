import express from "express"
import path from "path"

import render from "./render"
import router from "./router"

// this is needed for ssr rendering.
// if window is not set rendering will throw
global.window = {
  location: {
    pathname: "/"
  }
}

export const defaultProps = {
  host: "localhost",
  port: 3000,
  protocol: "http",
  actions: {},
  serve: [
    path.join(process.cwd(), "dist"),
    path.join(process.cwd(), "src", "client", "assets")
  ]
}

export const init = async (p = {}) => {
  const props = Object.assign({}, defaultProps, p)
  const { host, port, protocol, actions, serve, client } = props

  const app = express()

  serve.forEach(p => app.use(express.static(p, { index: "index.html" })))

  app.use(express.urlencoded({ extended: true }))
  app.use(express.json())

  app.use("/api", router({ actions }))

  app.use((req, res, next) => {
    // this is needed for ssr rendering the hyperapp/router
    global.window = {
      location: {
        pathname: req.path
      }
    }

    next()
  })

  app.use(render(props))

  app.listen(port, () => console.log(`http server listening to ${port}`))
  return app
}

export default init
