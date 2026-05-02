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
    const debug = new URLSearchParams(window.location.search).has('debugTargets')

    ecs.defineState('default')
      .initial()
      .listen(world.events.globalId, 'reality.imagefound', (e) => {
        if (hasRedirected) return

        const {name} = e.data as any
        const {imageTargetName, redirectUrl} = schemaAttribute.get(eid)

        if (debug) {
          ;(window as any).__lastImageTargetFound = name
          const elId = 'it-debug'
          let el = document.getElementById(elId)
          if (!el) {
            el = document.createElement('div')
            el.id = elId
            el.style.cssText = [
              'position:fixed',
              'left:12px',
              'bottom:12px',
              'z-index:99999',
              'padding:10px 12px',
              'border-radius:10px',
              'background:rgba(0,0,0,0.65)',
              'color:#fff',
              'font:600 13px/1 system-ui,-apple-system,Segoe UI,Roboto,sans-serif',
            ].join(';')
            document.body.appendChild(el)
          }
          el.textContent = `imagefound: ${String(name)}`
        }

        if (!redirectUrl) return
        if (name !== imageTargetName) return

        hasRedirected = true
        window.location.assign(redirectUrl)
      })
  },
})

