class ExpressionSynth {
	constructor() {
		this.ctx = new AudioContext()

		this.inputHandler = new InputHandler(document.body)

		this.inputLayout = layouts.default

		let visualEl = document.getElementById('keyboard-visual')
		this.keyboardVisual = new KeyboardVisual(visualEl, this.inputLayout)

		this.formulaTable = new FormulaTable(document.getElementById('formulas'))


		this.formulaTable.addVariable('out', 'expr', { expr: 'A*sin(2pi*100*t*y*(1 + x/3))' })
		this.formulaTable.addVariable('A', 'env')

		this.inputHandler.keyListeners.push((keyCode, pressed) => {
			let keyEls = this.keyboardVisual.keyEls[keyCode]
			if (keyEls === undefined) return
			keyEls.keyEl.classList[pressed ? 'add' : 'remove']('held')
		})

		this.masterGainNode = this.ctx.createGain()
		this.masterGainNode.gain.value = 0.2
		this.masterGainNode.connect(this.ctx.destination)


		this.synth = new BufferSynth(this.masterGainNode)
		this.synth.sampleNote = (t, note) => this.formulaTable.evaluate({
			note,
			scope: {
				t,
				x: note.coords[0],
				y: note.coords[1],
			},
		})

		this.inputHandler.keydownListeners.push(keyCode => {
			if (!(this.inputLayout[keyCode]?.type === '2d-key')) return
			let coords = this.inputLayout[keyCode].coords

			this.synth.newNote(keyCode, { coords })
		})
		this.inputHandler.keyupListeners.push(keyCode => {
			this.synth.releaseNote(keyCode)
		})

		this.inputHandler.keyListeners.push(keyCode => {
			stuff.innerText = JSON.stringify(this.inputHandler.activeKeys)
		})

	}
}

window.addEventListener('load', event => {
	window.expressionSynth = new ExpressionSynth()
})

window.everycounts = {}
function everyn(n) {
	if (n in everycounts) {
		if (everycounts[n]++ >= n) {
			everycounts[n] = 0
			return true
		}
	} else everycounts[n] = 0
	return false
}
