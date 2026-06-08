class Particle extends Layer {
	constructor() {
		super(...arguments)
		this.age = 0
		this.size = rand(1)
		this.x = rand(-80, 80)
		this.y = rand(-80, 80)
		this.vx = rand(-1, 1)/2
		this.vy = rand(-1, 1)/2
		this.color = 'white'
		this.max_age = 4e2
		this.peak_age = 1e2
		this.alive = true
	}

	step(Δt) {
		this.x += this.vx*Δt
		this.y += this.vy*Δt
		this.age += Δt
		this.alpha = Math.min(this.age/this.peak_age, 1 - (this.age - this.peak_age)/this.max_age)
		if (this.age > this.max_age) this.alive = false
	}

	draw(t, Δt) {
		this.step(Δt)
		this.ctx.fillStyle = 'white'
		this.ctx.globalAlpha = this.alpha
		this.ctx.fillCircle(this.x, this.y, this.size)
	}
}

class Starfield extends Layer {
	constructor() {
		super(...arguments)
		this.particles = []
		this.spawnRate = 1e-1
		this.spawned = 0
	}

	drawing(t, Δt) {
		this.spawned += Δt*this.spawnRate
		while (this.spawned > 1) {
			this.particles.push(new Particle(this.ctx))
			this.spawned--
		}
		this.ctx.globalCompositeOperation = 'destination-over'


		for (var i = this.particles.length - 1; i >= 0; i--) {
			let particle = this.particles[i]
			particle.draw(t, Δt)
			if (!particle.alive) this.particles.splice(i, 1)
		}

	}
}

class Background extends Canvas {
	constructor(canvas) {
		super(canvas)
		this.starField = new Starfield(this.ctx)
	}
	drawing(t, Δt) {
		this.starField.draw(t, Δt)	
	}
}


function pingpong(t, min=0, max=1) {
	let x = (1 - Math.cos(t*τ/2))/2
	return (max - min)*x + min
}


class Spiralgraph extends Layer {
	constructor() {
		super(...arguments)
		this.defaults({
			R_outer: 300,
			N: 360,
			ω: 1e-4,
			turns_x: 1,
			turns_y: 1,
			fill: null,
			stroke: 'white',
			α: 1,
			φ: 0,
		})
		this.defaults({
			R_inner: this.R_outer,
		})
	}

	θ(ωt, x) {
		let θ = τ*x
		θ += ωt
		return {θ1: θ, θ2: 4*θ}
	}

	drawing(t) {
		let N = this.N
		for (var i = -N/2; i < N/2; i++) {
			this.ctx.beginPath()
			let {θ1, θ2, color, thickness} = this.θ(this.ω*t, i/this.N)
			// console.log(this.R_outer*Math.sin(this.turns_x*θ1 + this.φ*t), -this.R_outer*Math.cos(this.turns_y*θ1))
			this.ctx.moveTo(this.R_outer*Math.sin(this.turns_x*θ1 + this.φ*t), -this.R_outer*Math.cos(this.turns_y*θ1))
			this.ctx.lineTo(this.R_inner*Math.sin(this.turns_x*θ2 + this.φ*t), -this.R_inner*Math.cos(this.turns_y*θ2))
			this.ctx.globalAlpha = this.α

			if (this.stroke) {
				this.ctx.strokeStyle = something(color, this.stroke)
				this.ctx.lineWidth = something(thickness, this.thickness)
				this.ctx.stroke()
			}

			if (this.fill) {
				({θ1, θ2} = this.θ(this.ω*t, (i + 1)/this.N))

				this.ctx.lineTo(this.R_inner*Math.sin(this.turns_x*θ2), -this.R_inner*Math.cos(this.turns_y*θ2))
				this.ctx.lineTo(this.R_outer*Math.sin(this.turns_x*θ1), -this.R_outer*Math.cos(this.turns_y*θ1))
				this.ctx.fillStyle = something(color, this.fill)
				this.ctx.fill()
			}
		}
	}
}
