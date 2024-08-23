class Earth extends Canvas {
	constructor() {
		super(...arguments)
		this.defaults({
			gradient: new Gradient({
0.0: [19, 98, 154, 0.0],
0.26: [4, 106, 227, 255.0],
0.39: [192, 245, 255, 255.0],
0.45: [200, 224, 103, 255.0],
0.58: [74, 221, 26, 255.0],
0.85: [9, 159, 99, 255.0],
1.0: [0, 223, 255, 0.0]
			}),
			spiralgraph: new Spiralgraph(this.ctx, {
				R_outer: this.size()/2,
				R_inner: this.size()/3.5,
				ω: 1e-3,
				α: 0.2,
				θ: (ωt, x) => {
					let θ = τ*x
					return {
						θ1: θ,
						θ2: θ*ωt,
						color: this.gradient.colorAt(x + 1/2).toHex()
					}
				},
				thickness: 8,
			})
		})
		this.glow = new Glow(this.ctx, '#c778', this.size()/2)
		this.fade = new RadialGradient(this.ctx, {
			R: this.size()/2,
			gradient: new Gradient({
				0.7: '#0000',
				1: '#000f',
			})
		})
	}

// Cresten Hegel
// Calum Turner
// Perrigen ALexander

	drawing(t) {
		this.ctx.globalCompositeOperation = 'lighter'
		this.glow.draw()
		this.spiralgraph.draw(t)
		this.ctx.globalCompositeOperation = 'source-over'
		this.fade.draw()
	}

}