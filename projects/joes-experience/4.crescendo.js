class Fractal extends Layer {
	constructor() {
		super(...arguments)
		this.defaults({
			xres: 40,
			yres: 40,
			xlim: [-1.5, 1.5],
			ylim: [-1.5, 1.5],
			n: 8,
			A: 0.6,
			B: 0.05,
			Q: 0.0125,
		})

	}

	get xspan() { return this.xlim[1] - this.xlim[0] }
	get yspan() { return this.ylim[1] - this.ylim[0] }

	transformToAxes() {
		this.ctx.resetTransform()
		this.ctx.scale(this.ctx.canvas.width, this.ctx.canvas.height)
		this.ctx.scale(1/this.xspan, 1/this.yspan)
		this.ctx.translate(-this.xlim[0], -this.ylim[0])
		this.ctx.scale(1, -1)
	}

	drawing(t) {
		this.transformToAxes()
		this.ctx.rotate(-t*1e-4)
		const Δx = this.xspan/this.xres
		const Δy = this.yspan/this.yres
		let ωt = t*5e-4
		let R = this.A + this.B*Math.sin(this.Q*t)
		let c = new Complex(R*Math.cos(ωt) - 0.2, R*Math.sin(ωt))
		this.ctx.globalCompositeOperation = 'lighter'

		for (var x = this.xlim[0]; x < this.xlim[1]; x += Δx) {
			for (var y = this.ylim[0]; y < this.ylim[1]; y += Δy) {
				let z = juliaSet(x, y, c, this.n)

				let {color, radius} = colormap(z.re, z.im)
				this.ctx.fillStyle = color
				this.ctx.fillCircle(x, y, 1.5*Δx/2*radius)
			}
		}
		// console.log(7)

	}
}


class Crescendo extends Canvas {
	constructor(canvas) {
		super(canvas)
		this.fractal = new Fractal(this.ctx)

		this.nRings = 5
		this.R = this.size()/2

		this.glow = new RadialGradient(this.ctx, {
			gradient: new Gradient({
				0: '#f0f8',
				1: '#f0f0',
			}),
			R: this.R
		})
	}

	drawing(t) {
		this.ctx.globalAlpha = 1
		this.fractal.draw(t)

		this.ctx.globalCompositeOperation = 'lighter'

		this.glow.draw()
		return

		this.ctx.strokeStyle = 'orange'
		this.ctx.lineWidth = 2

		this.ctx.globalCompositeOperation = 'lighter'

		for (var i = 0; i < this.nRings; i++) {
			let δ = t/1e2 % 1
			let x = (i + δ)/this.nRings
			this.ctx.beginPath()
			this.ctx.circle(0, 0, x*this.R)
			this.ctx.globalAlpha = Math.sin(x*τ/2)
			this.ctx.stroke()
		}

	}
}

// let cycle = new Gradient({
// 0.0: [121, 30, 2, 255.0],
// 0.3: [218, 21, 0, 255.0],
// 0.38: [255, 233, 212, 255.0],
// 0.57: [79, 12, 107, 255.0],
// 0.79: [142, 12, 77, 255.0],
// 0.96: [121, 30, 2, 255.0]
// })

let cycle = new Gradient({
0.0: [121, 30, 2, 255.0],
0.1: [218, 21, 0, 255.0],
0.28: [255, 233, 212, 255.0],
0.48: [63, 255, 156, 255.0],
0.63: [79, 12, 107, 255.0],
0.86: [142, 12, 77, 255.0],
0.96: [121, 30, 2, 255.0]
})

function colormap(x, y) {
	let θ = Math.atan2(y, x)
	let r = Math.hypot(x, y)
	let v = 1 - Math.tanh(r)
	return {
		// color: new Color(`hsl(${360/τ*θ}deg 100% ${100*v}%)`).toHex(),
		color: cycle.colorAt(θ/τ + 0.5).toHex(),
		radius: v,
	}
}


function juliaSet(x, y, c, n=6) {
	let z = new Complex(x, y)
	while (n-- > 0) {
		z = z.mul(z).add(c)
	}
	return z
}