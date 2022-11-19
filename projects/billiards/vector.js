const COLORSCHEME = [
  'rgb(147 22 50)',
  'rgb(35 71 152)',
]

class Vec {
  constructor({x, y}) {
    this.x = x
    this.y = y
  }

  add() {
    const v = vec(...arguments)
    return vec(this.x + v.x, this.y + v.y)
  }
  sub() {
    const v = vec(...arguments)
    return vec(this.x - v.x, this.y - v.y)
  }
  mul(λ) {
    return vec(this.x*λ, this.y*λ)
  }
  get length() {
    return Math.hypot(this.x, this.y)
  }
  get angle() {
    return Math.atan2(this.y, this.x)
  }
  normalize() {
    return this.mul(1/this.length)
  }
  rotate(θ) {
    θ = this.angle + θ
    let r = this.length
    return vec(r*Math.cos(θ), r*Math.sin(θ))
  }

  toArray() {
    return [this.x, this.y]
  }

}

window.vec = function(a, b) {
  if (arguments.length == 1) return new Vec(a)
  else if (arguments.length == 2) return new Vec({x: a, y: b})
  else throw "unrecognised arguments"
}


Interactive.prototype.lineConnecting = function(from, to, options = {}) {
  let line = this.line(0,0,0,0)
  line.update = () => {
    line.x1 = from.x
    line.y1 = from.y
    line.x2 = to.x
    line.y2 = to.y
  }
  line.addDependency(from, to)

  for (let k in options) line.style[k] = options[k]

  if (options.arrow) {
    const arrowhead = this.arrowhead(line.style.stroke)
    line.setAttribute('marker-end', `url(#${arrowhead.id})`)
  }

  line.update()
  return line
}

Interactive.prototype.arrowhead = function(color) {
  if (this.arrowheads === undefined) this.arrowheads = {}
  if (this.arrowheads[color] === undefined) {
    const arrowhead = this.arrowheads[color] = this.marker(10, 3, 12, 10)
    arrowhead.path('M 0 0 L 12 3 L 0 6 z')
    arrowhead.setAttribute('orient', 'auto-start-reverse')
    arrowhead.style.fill = color
  }
  return this.arrowheads[color] 
}

function massToRadius(mass) {
  return 10*Math.sqrt(mass)
}

class BilliardDiagram {
  constructor(interactive, state, crosshairs) {
    this.interactive = interactive
    this.state = state

    this.origin = vec(this.interactive.width*3/4, this.interactive.height/2)

    this.crosshairs = crosshairs
    if (this.crosshairs) {
      this.tangent = this.interactive.line(0,0,0,0)
      this.normal = this.interactive.line(0,0,0,0)

      this.normal.style.stroke = '#6D1C76'
      this.tangent.style.stroke = '#ddd'
      this.normal.style.strokeDasharray = 2
      // this.tangent.style.strokeDasharray = 2
    }

    this.bodies = [
      this.interactive.circle(this.origin.x, this.origin.y, 0),
      this.interactive.circle(this.origin.x, this.origin.y, 0),
    ]

    this.lines = [
      this.interactive.line(0, 0, 0, 0),
      this.interactive.line(0, 0, 0, 0),
    ]

    for (var i = 0; i < 2; i++) {
      let group = this.interactive.group()
      this.lines[i].style.stroke = this.bodies[i].style.fill = COLORSCHEME[i]

      const arrowhead = this.interactive.arrowhead(COLORSCHEME[i]);
      this.lines[i].setAttribute('marker-end', `url(#${arrowhead.id})`)

      group.appendChild(this.bodies[i])
      group.appendChild(this.lines[i])
      group.style.mixBlendMode = 'multiply'
    }

    this.update()
  }

  update() {
    let t = this.state.time
    let α = Math.max(1, 10*(1 - Math.abs(t)))

    let normal
    if (this.crosshairs) {
      normal = this.state.momenta.initial[0].sub(this.state.momenta.final[0]).normalize()
      let p = [-1, +1].map(λ => normal.mul(40*λ).add(this.origin))
      this.normal.x1 = p[0].x
      this.normal.y1 = p[0].y
      this.normal.x2 = p[1].x
      this.normal.y2 = p[1].y

      let tangent = normal.rotate(Math.PI/2).normalize()
      p = [-1, +1].map(λ => tangent.mul(20*λ).add(this.origin))
      this.tangent.x1 = p[0].x
      this.tangent.y1 = p[0].y
      this.tangent.x2 = p[1].x
      this.tangent.y2 = p[1].y      
    }




    let momenta = this.state.momenta[t < 0 ? 'initial' : 'final']
    let velocities = momenta.map((p, i) => p.mul(1/this.state.masses[i]))

    this.bodies[0].r = massToRadius(this.state.masses[0])
    this.bodies[1].r = massToRadius(this.state.masses[1])

    let offsets = this.crosshairs ? [
      normal.mul(-this.bodies[0].r),
      normal.mul(+this.bodies[1].r),
    ] : [vec(0, 0), vec(0, 0)]

    this.bodies[0].cx = this.origin.x + velocities[0].x*t + offsets[0].x
    this.bodies[0].cy = this.origin.y + velocities[0].y*t + offsets[0].y
    this.bodies[1].cx = this.origin.x + velocities[1].x*t + offsets[1].x
    this.bodies[1].cy = this.origin.y + velocities[1].y*t + offsets[1].y




    this.lines.forEach((line, i) => {
      let o = vec(this.bodies[i].cx, this.bodies[i].cy)
      line.x1 = o.x
      line.y1 = o.y
      o = o.add(momenta[i].mul(0.5))
      line.x2 = o.x
      line.y2 = o.y
    })

    // this.bodies.forEach(body => body.style.opacity = α*0.7)



  }
}

class Scene {
  constructor(selector, crosshairs) {
    this.element = document.querySelector(selector)
    this.interactive = new Interactive(this.element, {
      width: 600,
      height: 350,
      // border: false,
    })

    this.state = {
      masses: [1, 1],
      momenta: {
        initial: [
          vec(10, -80),
          vec(90, -20),
        ],
        final: [
          vec(60, 20),
          vec(40, -120),
        ],
      },
      time: 0,
    }
 
    this.anim = new BilliardDiagram(this.interactive, this.state, crosshairs)

    this.origin = {x: this.interactive.width/4, y: this.interactive.height/2}


    this.timer = null
    this.element.addEventListener('mouseover', e => {
      clearTimeout(this.timer)
      this.play()
    })
    this.element.addEventListener('mouseout', () => {
      this.timer = setTimeout(() => this.playing = false, 1e3)
    })

  }

  controlAt(v) {
    const control = this.interactive.control(...vec(this.origin).add(v).toArray())
    control.onchange = () => {
      this.updateState()
      control.updateDependents()
      this.anim.update()
    }
    return control
  }

  play() {
    if (this.playing) return
    this.startTime = new Date().getTime()

    const onFrame = () => {
      this.anim.update()
      let t = new Date().getTime() - this.startTime
      let lastTime = this.state.time
      this.state.time = t/1e3 % 2 - 1

      this.onFrame()

      if (this.playing || lastTime < this.state.time) requestAnimationFrame(onFrame)
    }
    this.playing = true
    requestAnimationFrame(onFrame)
  }

}

class Figure1 extends Scene {
  constructor() {
    super(...arguments)

    this.c1i = this.controlAt(this.state.momenta.initial[0])
    this.c2i = this.controlAt(this.state.momenta.initial[1])
    this.c1f = this.controlAt(this.state.momenta.final[0])
    this.c2f = this.controlAt(this.state.momenta.final[1])

    this.l1i = this.interactive.lineConnecting(this.origin, this.c1i, {stroke: COLORSCHEME[0], arrow: true})
    this.l2i = this.interactive.lineConnecting(this.origin, this.c2i, {stroke: COLORSCHEME[1], arrow: true})
    this.l1f = this.interactive.lineConnecting(this.origin, this.c1f, {stroke: COLORSCHEME[0], arrow: true})
    this.l2f = this.interactive.lineConnecting(this.origin, this.c2f, {stroke: COLORSCHEME[1], arrow: true})

    this.updateState()

  }

  onFrame() {
    let i = this.state.time < 0 ? 1 : 0.1
    let f = this.state.time > 0 ? 1 : 0.1
    this.l1i.style.opacity = i
    this.l2i.style.opacity = i
    this.l1f.style.opacity = f
    this.l2f.style.opacity = f
  }

  updateState() {
    this.state.momenta.initial[0] = vec(this.c1i).sub(this.origin)
    this.state.momenta.initial[1] = vec(this.c2i).sub(this.origin)
    this.state.momenta.final[0] = vec(this.c1f).sub(this.origin)
    this.state.momenta.final[1] = vec(this.c2f).sub(this.origin)
  }
}



class Figure2 extends Scene {
  constructor() {
    super(...arguments)

    this.c1i = this.controlAt(this.state.momenta.initial[0])
    this.c1f = this.controlAt(this.state.momenta.final[0])
    this.cΣ = this.controlAt(this.state.momenta.initial[0].add(this.state.momenta.initial[1]))

    this.l1i = this.interactive.lineConnecting(this.origin, this.c1i, {stroke: COLORSCHEME[0], arrow: true})
    this.l2i = this.interactive.lineConnecting(this.c1i   , this.cΣ , {stroke: COLORSCHEME[1], arrow: true})
    this.l1f = this.interactive.lineConnecting(this.origin, this.c1f, {stroke: COLORSCHEME[0], arrow: true})
    this.l2f = this.interactive.lineConnecting(this.c1f   , this.cΣ , {stroke: COLORSCHEME[1], arrow: true})
    this.lΣ  = this.interactive.lineConnecting(this.origin, this.cΣ)

    this.lΣ.style.strokeDasharray = 5

    this.updateState()

  }

  onFrame() {
    let i = this.state.time < 0 ? 1 : 0.1
    let f = this.state.time > 0 ? 1 : 0.1
    this.l1i.style.opacity = i
    this.l2i.style.opacity = i
    this.l1f.style.opacity = f
    this.l2f.style.opacity = f
  }

  updateState() {
    this.state.momenta.initial[0] = vec(this.c1i).sub(this.origin)
    this.state.momenta.initial[1] = vec(this.cΣ).sub(this.c1i)
    this.state.momenta.final[0] = vec(this.c1f).sub(this.origin)
    this.state.momenta.final[1] = vec(this.cΣ).sub(this.c1f)
  }
}


function closestPointOnEllipse(foci, l, z) {
  let origin = vec(foci[0]).add(foci[1]).mul(1/2)
  let α = -vec(foci[0]).sub(origin).angle
  let ζ = z.sub(origin).rotate(α)

  let F = foci.map(p => z.sub(p).length)

  let a = origin.sub(foci[1]).length
  let μ = Math.acosh(l/(2*a))
  let nu = Math.acos(-(F[0] - F[1])/(2*a))

  let ζ0 = vec(Math.cosh(μ)*Math.cos(nu), Math.sinh(μ)*Math.sin(nu)*Math.sign(ζ.y)).mul(a)
  let z0 = ζ0.rotate(-α).add(origin)

  return z0
}

class Figure3 extends Figure2 {
  constructor() {
    super(...arguments)

    this.locus = this.interactive.ellipse(0, 0, 0, 0)
    this.locus.style.fill = 'none'
    this.locus.style.stroke = 'green'

    this.locus.update = () => {
      let p1 = this.state.momenta.initial[0]
      let p2 = this.state.momenta.initial[1]
      let pΣ = p1.add(p2)

      let l = p1.length + p2.length

      this.locus.rx = l/2
      this.locus.ry = Math.sqrt(Math.pow(l, 2) - Math.pow(pΣ.length, 2))/2

      let θ = this.locus.θ = pΣ.angle
      this.locus.style.transform = `rotate(${θ}rad)`

      let center = pΣ.mul(1/2).add(this.origin).rotate(-θ)
      this.locus.cx = center.x
      this.locus.cy = center.y
    }

    this.locus.update()

    this.locus.addDependency(this.c1i, this.cΣ)

    this.c1f.onchange = () => {
      this.snapToEllipse()
      this.updateState()
      this.c1f.updateDependents()
      this.anim.update()
    }

    this.c1f.update = () => this.snapToEllipse()

    this.c1f.addDependency(this.c1i, this.cΣ)
    this.c1f.onchange()

    this.updateState()

  }

  snapToEllipse() {
    let l = this.state.momenta.initial[0].length + this.state.momenta.initial[1].length
    let closest = closestPointOnEllipse([this.origin, this.cΣ], l, vec(this.c1f))
    this.c1f.x = closest.x
    this.c1f.y = closest.y

  }
}



class Figure4 extends Figure3 {
  constructor() {
    super(...arguments)

    this.l1i1f  = this.interactive.lineConnecting(this.c1i, this.c1f, {
      stroke: '#6D1C76',
      strokeDasharray: 2
    })
  }
}



window.onload = function() {
  window.fig1 = new Figure1('#figure-1')
  window.fig2 = new Figure2('#figure-2')
  window.fig3 = new Figure3('#figure-3')
  window.fig4 = new Figure4('#figure-4', true)
}