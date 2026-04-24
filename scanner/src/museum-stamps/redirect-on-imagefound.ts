import * as ecs from '@8thwall/ecs'

ecs.registerComponent({
  name: 'Redirect on Image Target Found',
  schema: {
    imageTargetName: ecs.string,
    redirectUrl: ecs.string,
  },
  schemaDefaults: {
    imageTargetName: '',
    redirectUrl: '',
  },
  stateMachine: ({world, eid, schemaAttribute}) => {
    let hasRedirected = false

    ecs.defineState('default')
      .initial()
      .listen(world.events.globalId, 'reality.imagefound', (e) => {
        if (hasRedirected) return

        const {name} = e.data as any
        const {imageTargetName, redirectUrl} = schemaAttribute.get(eid)

        if (!redirectUrl) return
        if (name !== imageTargetName) return

        hasRedirected = true
        window.location.assign(redirectUrl)
      })
  },
})

