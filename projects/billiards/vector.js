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


Interactive.prototype.lineConnecting = function(from, to, {arrow, color} = {}) {
  let line = this.line(0,0,0,0)
  line.update = () => {
    line.x1 = from.x
    line.y1 = from.y
    line.x2 = to.x
    line.y2 = to.y
  }
  line.addDependency(from, to)

  line.style.stroke = color

  const arrowhead = this.arrowhead(line.style.stroke)
  line.setAttribute('marker-end', `url(#${arrowhead.id})`)

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
  constructor(interactive, state) {
    this.interactive = interactive
    this.state = state

    this.origin = {x: interactive.width*3/4, y: interactive.height/2}

    this.bodies = [
      interactive.circle(this.origin.x, this.origin.y, 0),
      interactive.circle(this.origin.x, this.origin.y, 0),
    ]

    this.lines = [
      interactive.line(0, 0, 0, 0),
      interactive.line(0, 0, 0, 0),
    ]

    for (var i = 0; i < 2; i++) {
      let group = this.interactive.group()
      this.lines[i].style.stroke = this.bodies[i].style.fill = COLORSCHEME[i]

      const arrowhead = interactive.arrowhead(COLORSCHEME[i]);
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

    let momenta = this.state.momenta[t < 0 ? 'initial' : 'final']
    let velocities = momenta.map((p, i) => p.mul(1/this.state.masses[i]))

    this.lines.forEach((line, i) => {
      let o = vec(this.bodies[i].cx, this.bodies[i].cy)
      line.x1 = o.x
      line.y1 = o.y
      o = o.add(momenta[i].mul(0.5))
      line.x2 = o.x
      line.y2 = o.y
    })

    this.bodies[0].cx = this.origin.x + velocities[0].x*t
    this.bodies[0].cy = this.origin.y + velocities[0].y*t
    this.bodies[1].cx = this.origin.x + velocities[1].x*t
    this.bodies[1].cy = this.origin.y + velocities[1].y*t

    this.bodies[0].r = massToRadius(this.state.masses[0])
    this.bodies[1].r = massToRadius(this.state.masses[1])

    // this.bodies.forEach(body => body.style.opacity = α*0.7)
  }
}

class Scene {
  constructor(selector) {
    this.element = document.querySelector(selector)
    this.interactive = new Interactive(this.element)

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
 
    this.anim = new BilliardDiagram(this.interactive, this.state)

    this.origin = {x: this.interactive.width/4, y: this.interactive.height/2}


    // this.element.addEventListener('mouseover', e => {
    //   e.stopPropagation();
    this.play()
    // })
    // this.element.addEventListener('mouseout', () => this.playing = false)

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
      this.state.time = t/1e3 % 2 - 1
      this.onFrame()
      if (this.playing) requestAnimationFrame(onFrame)
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

    this.l1i = this.interactive.lineConnecting(this.origin, this.c1i, {color: COLORSCHEME[0], arrow: true})
    this.l2i = this.interactive.lineConnecting(this.origin, this.c2i, {color: COLORSCHEME[1], arrow: true})
    this.l1f = this.interactive.lineConnecting(this.origin, this.c1f, {color: COLORSCHEME[0], arrow: true})
    this.l2f = this.interactive.lineConnecting(this.origin, this.c2f, {color: COLORSCHEME[1], arrow: true})

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

    this.origin = {x: this.interactive.width/4, y: this.interactive.height/2}
    this.c1i = this.controlAt(this.state.momenta.initial[0])
    this.c1f = this.controlAt(this.state.momenta.final[0])
    this.cΣ = this.controlAt(this.state.momenta.initial[0].add(this.state.momenta.initial[1]))

    this.l1i = this.interactive.lineConnecting(this.origin, this.c1i, {color: COLORSCHEME[0], arrow: true})
    this.l2i = this.interactive.lineConnecting(this.c1i   , this.cΣ , {color: COLORSCHEME[1], arrow: true})
    this.l1f = this.interactive.lineConnecting(this.origin, this.c1f, {color: COLORSCHEME[0], arrow: true})
    this.l2f = this.interactive.lineConnecting(this.c1f   , this.cΣ , {color: COLORSCHEME[1], arrow: true})
    this.lΣ  = this.interactive.lineConnecting(this.origin, this.cΣ)

    this.lΣ.style.strokeDasharray = 5
    // this.lΣ.style.stroke = 'black'

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



class Figure3 extends Scene {
  constructor() {
    super(...arguments)

    this.origin = {x: this.interactive.width/4, y: this.interactive.height/2}
    this.c1i = this.controlAt(this.state.momenta.initial[0])
    this.c1f = this.controlAt(this.state.momenta.final[0])
    this.cΣ = this.controlAt(this.state.momenta.initial[0].add(this.state.momenta.initial[1]))

    this.l1i = this.interactive.lineConnecting(this.origin, this.c1i, {color: COLORSCHEME[0], arrow: true})
    this.l2i = this.interactive.lineConnecting(this.c1i,    this.cΣ,  {color: COLORSCHEME[1], arrow: true})
    this.l1f = this.interactive.lineConnecting(this.origin, this.c1f, {color: COLORSCHEME[0], arrow: true})
    this.l2f = this.interactive.lineConnecting(this.c1f,    this.cΣ,  {color: COLORSCHEME[1], arrow: true})
    this.lΣ  = this.interactive.lineConnecting(this.origin, this.cΣ)

    this.lΣ.style.strokeDasharray = 5
    // this.lΣ.style.stroke = 'black'

    this.locus = this.interactive.ellipse(10, 10, 50, 20)
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

      let pathLength = this.locus.root.getTotalLength()
      let n = 800
      this.locusPoints = []
      for (var i = 0; i < n; i++) {
        let a = i/n*pathLength
        let point = this.locus.root.getPointAtLength(a)
        this.locusPoints.push(vec(point).rotate(θ))
      }
    }

    this.locus.update()

    this.locus.addDependency(this.c1i, this.cΣ)

    this.c1f.onchange = () => {

      this.snapToLocus()
      this.updateState()
      this.c1f.updateDependents()
      this.anim.update()
    }

    this.c1f.update = () => this.snapToLocus()

    this.c1f.addDependency(this.c1i, this.cΣ)
    this.c1f.onchange()

    this.updateState()



  }

  snapToLocus() {
    let lengths = this.locusPoints.map(point => vec(point).sub(this.c1f).length)

    let closest = {index: 0, length: Infinity}
    lengths.forEach((length, i) => {
      if (length < closest.length) {
        closest.length = length
        closest.index = i
      }
    })

    let closestPoint = this.locusPoints[closest.index]

    this.c1f.x = closestPoint.x
    this.c1f.y = closestPoint.y
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





window.onload = function() {
  window.fig1 = new Figure1('#figure-1')
  window.fig2 = new Figure2('#figure-2')
  window.fig3 = new Figure3('#figure-3')
}