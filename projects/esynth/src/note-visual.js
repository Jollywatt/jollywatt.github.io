class NoteVisual {
	constructor(canvasEl, noteHandler) {
		this.canvas = canvasEl
		this.noteHandler = noteHandler

		this.ctx = this.canvas.getContext('2d')

	}

	draw() {
		for (const id in this.noteHandler.notes) {
			const note = this.noteHandler.notes[id]
			const { freqs, } = note
			freqs.forEach(freq => this.drawNote(freq))
		}
	}

}

class Spiralscope extends NoteVisual {
	constructor() {
		super(...arguments)

		this.spiralSpacing = 0.5
		this.freqScale = 440/*Hz*/

		this.dotRadius = 6
		this.widthDecay = 2

		const halfSize = [this.canvas.width/2, this.canvas.height/2]
		this.outerRadius = Math.min(...halfSize) - 0
		this.innerRadius = this.outerRadius*0.4

		this.ctx.translate(...halfSize)
		this.ctx.fillStyle = theme('--color-accent')
		this.ctx.strokeStyle = theme('--color-accent')
		this.ctx.font = `15px ${theme('--font-family')}`

	}

	coords(freq) {
		const x = freq/this.freqScale
		let r = (1 + Math.tanh(this.spiralSpacing*Math.log(x)))/2
		r = this.innerRadius + (this.outerRadius - this.innerRadius)*r
		const θ = 2*Math.PI*(Math.log2(x) - 1/4)

		return [r*Math.cos(θ), r*Math.sin(θ)]
	}

	getNotes() {
		const notes = []
		for (const id in this.noteHandler.notes) {
			const note = this.noteHandler.notes[id]
			note.freqs.forEach(freq => {
				notes.push({...note, freq, coords: this.coords(freq)})
			})
		}
		return notes
	}

	draw() {
		this.ctx.clear()

		// draw spiral
		this.ctx.save()
		this.ctx.beginPath()
		this.ctx.strokeStyle = '#0001'
		for (var f = 20; f < 20_000; f *= 1.01) {
			this.ctx.strokeStyle = colorFromFreq(f).toCSS()
			this.ctx.lineTo(...this.coords(f))
			this.ctx.stroke()
			this.ctx.beginPath()
			this.ctx.moveTo(...this.coords(f))
		}
		this.ctx.restore()


		const notes = this.getNotes()
		for (var i = 0; i < notes.length; i++) {
			for (var j = 0; j < i; j++) {
				const note1 = notes[i]
				const note2 = notes[j]

				let ratio = note1.freq/note2.freq
				if (ratio < 1) ratio = 1/ratio
				const frac = math.roundFraction(ratio)
				const harmony = clamp(2/frac.d, 0, 1) // 0 (inharmonious) to 1 (perfect harmony)
				const detune = frac - ratio
				const ratioColor = new Color({r: math.abs(detune)/0.01, g: 0, b: 0})

				let text = '?'
				let thickness = 1
				if (frac !== undefined) {
					if (math.abs(detune) <= 1e-5) 
						text = `${frac.n}/${frac.d}`
					else {
						text = `${frac.n}/${frac.d}${detune > 0 ? '♯' : '♭'}`
					}
					thickness = 2*this.dotRadius*harmony//((frac.d - 1)/this.widthDecay + 1) || 1
				}

				// interval line
				this.ctx.save()
				this.ctx.beginPath()
				this.ctx.strokeStyle = 'gold'
				this.ctx.globalAlpha = 0.7*harmony
				this.ctx.lineWidth = thickness
				this.ctx.moveTo(...note1.coords)
				this.ctx.lineTo(...note2.coords)
				this.ctx.stroke()
				this.ctx.restore()

				const midpoint = math.divide(math.add(note1.coords, note2.coords), 2)

				this.ctx.save()
				// this.ctx.beginPath()
				// this.ctx.fillStyle = 'white'
				// const metrics = this.ctx.measureText(text)
				// const width = 2*(metrics.actualBoundingBoxLeft + metrics.actualBoundingBoxRight) + 1
				// const height = 2*(metrics.actualBoundingBoxDescent + metrics.actualBoundingBoxAscent) + 1
				// this.ctx.fillRect(midpoint[0] - width/2, midpoint[1] - height/2, width, height)
				// // this.ctx.ellipse(...midpoint, .width/2 + 2, 0, 2*Math.PI)
				// this.ctx.fill()

				this.ctx.textBaseline = 'middle'
				this.ctx.textAlign = 'center'
				this.ctx.fillStyle = ratioColor.toCSS()
				this.ctx.fillText(text, ...midpoint)
				this.ctx.restore()

			}
		}

		super.draw()
	}

	drawNote(freq) {
		const coords = this.coords(freq)
		if (!coords.every(Number.isFinite)) return

		this.ctx.save()
		this.ctx.setLineDash([2,4])

		// // draw line from center
		// this.ctx.beginPath()
		// this.ctx.moveTo(0, 0)
		// this.ctx.lineTo(...coords)
		// this.ctx.stroke()

		// draw dot
		this.ctx.fillStyle = colorFromFreq(freq).toCSS()
		this.ctx.beginPath()
		this.ctx.arc(...coords, this.dotRadius, 0, 2*Math.PI)
		this.ctx.fill()
		this.ctx.restore()

	}
}
