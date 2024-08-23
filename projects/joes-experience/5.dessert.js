	
class Dessert extends Canvas {
	constructor(canvas) {
		super(canvas)
		this.spiralgraph = new Spiralgraph(this.ctx).set({
			N: 400,
			ω: 2e-5,
			R_inner: this.size()/2,
			R_outer: this.size()/2*0.9,
			turns_x: 3,
			turns_y: 2,
			stroke: '#5fabec',
			// fill: true,
			φ: 7e-4,
			thickness: 6,
			α: 0.3,
		})
		this.gradient = new Gradient({
			 .00: [2  , 0  , 36 , 0  ],
			 // .16: [66 , 9  , 121, 255],
			 .16: '#ff00be',
			 .61: [99 , 154, 230, 255],
			 .62: [244, 248, 255, 255],
			 .72: [107, 187, 255, 255],
			1.00: [107, 187, 255, 0  ],
		})
		this.spiralgraph.θ = (ωt, x) => {
			let θ = 0.4*Math.sin(2*ωt)*τ*x
			θ += ωt
			let α = 0.2*Math.cos(x*τ/2)
			return {
				θ1: θ,
				θ2: 4*θ,
				color: this.gradient.colorAt((x + 1/2)).toHex(),
			}
		}
	}

	drawing(t) {
		this.ctx.globalCompositeOperation = 'lighter'
		this.spiralgraph.draw(t)
	}
}
