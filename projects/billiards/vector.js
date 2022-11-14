import Interactive from "https://vectorjs.org/interactive.js";




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
  length() {
    return Math.hypot(this.x, this.y)
  }
  normalize() {
    return this.mul(1/this.length())
  }

}

window.vec = function(a, b) {
  if (arguments.length == 1) return new Vec(a)
  else if (arguments.length == 2) return new Vec({x: a, y: b})
  else throw "unrecognised arguments"
}


Interactive.prototype.lineConnecting = function(from, to) {
  let line = this.line(0,0,0,0)
  line.update = () => {
    line.x1 = from.x
    line.y1 = from.y
    line.x2 = to.x
    line.y2 = to.y
  }

  line.addDependency(...[from, to].filter(obj => obj.constructor.name == 'Control'))
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


class MomentumDiagram {
  constructor(interactive, state) {
    this.interactive = interactive
    this.state = state

    this.origin = {x: interactive.width/4, y: interactive.height/2}
    this.c1i = interactive.control(this.origin.x + 10, this.origin.y - 80)
    this.c1f = interactive.control(this.origin.x + 60, this.origin.y + 20)
    this.cΣ = interactive.control(this.origin.x + 100, this.origin.y - 100)

    ;[this.c1i, this.c1f, this.cΣ].forEach(control => {
      control.onchange = () => {
        this.updateState()
        control.updateDependents()
      }
    })

    this.l1i = interactive.lineConnecting(this.origin, this.c1i)
    this.l2i = interactive.lineConnecting(this.c1i, this.cΣ)

    this.l1f = interactive.lineConnecting(this.origin, this.c1f)
    this.l2f = interactive.lineConnecting(this.c1f, this.cΣ)
    this.lΣ = interactive.lineConnecting(this.origin, this.cΣ)

    this.lΣ.style.strokeDasharray = 5
    // this.lΣ.style.stroke = 'black'



    this.l1i.style.stroke = COLORSCHEME[0]
    this.l2i.style.stroke = COLORSCHEME[1]
    this.l1f.style.stroke = COLORSCHEME[0]
    this.l2f.style.stroke = COLORSCHEME[1]



    ;[this.l1i, this.l2i, this.l1f, this.l2f].forEach(line => {
      const arrowhead = this.interactive.arrowhead(line.style.stroke)
      line.setAttribute('marker-end', `url(#${arrowhead.id})`)

      line.update()
    })

    this.lΣ.update()

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
    let t = this.state.time = (new Date().getTime()/1.5e3) % 2 - 1
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
  constructor(interactive) {
    this.interactive = interactive

    this.state = {
      masses: [1, 1],
      momenta: {
        initial: [
          {x: 10, y: -10},
          {x: 10, y: 5},
        ],
        final: [
          {x: 10, y: 5},
          {x: 10, y: -10},
        ],
      },
      time: 0,
    }
 
    this.diagram = new MomentumDiagram(this.interactive, this.state)
    this.anim = new BilliardDiagram(this.interactive, this.state)

    this.play()

  }

  play() {
    const onFrame = () => {
      this.anim.update()
      this.diagram.onFrame()
      if (this.playing) requestAnimationFrame(onFrame)
    }
    this.playing = true
    requestAnimationFrame(onFrame)
  }

}

window.scene = new Scene(new Interactive('figure-1'))