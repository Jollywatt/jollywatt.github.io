class Church extends Canvas {

	/*
	ruby
	*/

	constructor(canvas) {
		super(canvas)
		let g = this.gradient = new Gradient({
			// 0.00:	'#ffffff00',
			// 0.30:	'#ff8303ff',
			// 0.9:	'#865d00ff',
			// 1.00:	'#00000000',
			0.0:	[2,0,36,0],
			.23:	[246,156,19,255],
			.68:	[247,130,63,255],
			.51:	[248,77,154,255],
			1.0:	[255,255,255,0],
		})
		this.rimColor = '#ffa66520'
		this.R = this.size()/2
		this.spiralgraph = new Spiralgraph(this.ctx, {
			N: 500,
			ω: 2e-4,
			R_inner: this.R,
			R_outer: this.R*0.85,
			stroke: new Color('yellow').toHex(),
			α: 0.5,
		})
		this.spiralgraph.θ = (ωt, x) => {
			let θ = 2.6*Math.sin(ωt/3)*τ*x
			θ += ωt
			let α = 10*Math.cos(x*τ/2)
			return {
				θ1: θ,
				θ2: 4*θ,
				color: g.colorAt(x).toHex(),
				thickness: α,
			}
		}

		this.glow = new Glow(this.ctx, '#48fa', this.size()/2)
	}

	drawing(t) {
		this.ctx.globalCompositeOperation = 'lighter'
		this.glow.draw()
		this.spiralgraph.draw(t)

		// this.ctx.beginPath()
		// this.ctx.lineWidth = 0.15*this.R
		// this.ctx.circle(0, 0, this.R*1.85/2)
		// this.ctx.strokeStyle = this.rimColor
		// this.ctx.stroke()
	}
}
