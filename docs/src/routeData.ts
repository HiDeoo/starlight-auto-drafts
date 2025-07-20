import { defineRouteMiddleware } from '@astrojs/starlight/route-data'

export const onRequest = defineRouteMiddleware((context) => {
  if (process.env['TEST']) return

  const { starlightRoute } = context.locals

  starlightRoute.sidebar = starlightRoute.sidebar.filter((item) => {
    return item.type !== 'group' || item.label !== 'Tests'
  })
})
