class Parameter extends EventEmitter {
	constructor(config, defaults) {
		super()
		this.config = {...defaults, ...config}
		this.element = document.createElement('span')
	}

	getDependentParameters() {
		return new Set()
	}
}

class ConstantParameter extends Parameter {
	constructor(config) {
		super(config, { value: 1, })
		this.value = value
		this.element.textContent = `${value}`
	}
	evaluate() {
		return this.value
	}
}

class NumberParameter extends Parameter {
	constructor(config) {
		super(config, { value: 1, })

		this.input = new UINumber()
		this.input.bindValue(this.config, 'value')
		this.triggerOn(this.input, 'change')

		this.input.on('change', () => { console.log('change'); this.trigger('change') })

		this.element.appendChild(this.input.element)
	}

	evaluate() {
		return this.config.value
	}
}

class SliderParameter extends Parameter {
	constructor(config) {
		super(config, { value: 1, min: 0, max: 100, step: 1, })

		this.input = new UISlider(this.config)

		// this.input.bindValue(this.config, 'value')
		this.input.on('change', () => {
			console.log("slider change", this.input)
			this.config = this.input.value
			this.trigger('change')
		})
		this.triggerOn(this.input, 'change')

		this.element.appendChild(this.input.element)
	}

	evaluate() {
		return this.config.value
	}
}

class KeyCoordParameter extends Parameter {
	constructor(config, directionSymbols) {
		super(config, { startFrom: 1, direction: 1, })

		this.startInput = new UINumber()
		this.startInput.bindValue(this.config, 'startFrom')

		this.directionInput = new UIMenu([
			{ text: directionSymbols[0], value: +1 },
			{ text: directionSymbols[1], value: -1 },
		])
		this.directionInput.bindValue(this.config, 'direction')

		this.element.appendChild(span('starting at '))
		this.element.appendChild(this.startInput.element)
		this.element.appendChild(span(' increasing '))
		this.element.appendChild(this.directionInput.element)

		;[this.startInput, this.directionInput].forEach(input => {
			this.triggerOn(input, 'change')
		})
	}

	evaluate(coord) {
		return this.config.startFrom + this.config.direction*coord
	}
}
class KeyRowParameter extends KeyCoordParameter {
	constructor(config) {
		super(config, ['↑', '↓'])
	}

	evaluate({ keyData, }) {
		return super.evaluate(keyData.coords.y)
	}
}
class KeyColumnParameter extends KeyCoordParameter {
	constructor(config) {
		super(config, ['→', '←'])
	}

	evaluate({ keyData, }) {
		return super.evaluate(keyData.coords.x)
	}
}

class ExpressionParameter extends Parameter {
	constructor(config) {
		super(config, { expr: '1', })

		this.input = new UIExpression()
		this.input.bindValue(this.config, 'expr') // should automatically default to this.config.expr
		this.input.on('change', () => {
			delete this.compiled
			this.trigger('change')
		})

		this.element = this.input.element
	}

	evaluate(data, scope) {
		// if (!this.compiled) this.compiled = math.compile(this.config.expr)
		// return this.compiled.evaluate(scope)
		return this.input.compiled.evaluate(scope)
	}

	getDependentParameters() {
		return this.input.freeVariables()
	}
}

class WaveformParameter extends Parameter {
	constructor(config) {
		super(config, { waveform: 'sine', })
		this.menu = new UIMenu(['sine', 'sawtooth', 'triangle', 'square'])
		this.menu.bindValue(this.config, 'waveform')
		this.element.appendChild(this.menu.element)
	}

	evaluate() {
		return this.config.waveform
	}
}

class EnvelopeParameter extends Parameter {
	constructor(config) {
		super(config, { attack: 0, decay: 0, sustain: 1, release: 0, })
		this.inputs = {}
		;['attack', 'decay', 'sustain', 'release'].forEach((item, i) => {
			this.element.appendChild(span((i > 0 ? `; ` : ``) + `${item} ` ))
			const input = this.inputs[item] = new UINumber(0.05)
			input.bindValue(this.config, item)
			this.element.appendChild(input.element)
		})
	}
	evaluate() {
		return this.config
	}
}

class KeyStateParameter extends Parameter {
	constructor(config) {
		super(config, {
			key: 'Home',
			mode: 'press',
			on: '1',
			off: '0',
		})

		this.inputs = {}

		this.inputs.key = new UIText('small')
		this.inputs.mode = new UIMenu([
			{ text: 'pressed', value: 'press', },
			{ text: 'toggled', value: 'toggle', },
		])
		this.inputs.on = new UIExpression('small')
		this.inputs.off = new UIExpression('small')

		for (const input in this.inputs) {
			this.inputs[input].bindValue(this.config, input)
		}

		this.element = span(
			'if ',
			this.inputs.key.element,
			'is ',
			this.inputs.mode.element,
			', then ',
			this.inputs.on.element,
			' else ',
			this.inputs.off.element,
		)

		main.inputHandler.on('key', keyCode => {
			if (keyCode === this.config.key) {
				this.trigger('change')
			}
			this.trigger('show')
		})
		main.inputHandler.on('keydown', keyCode => {
			if (keyCode === this.config.key) {
				this.toggleState ^= true
				this.trigger('change')
				console.log(keyCode)
			}
		})

		this.toggleState = false

	}

	evaluate(data, scope) {
		let state
		if (this.config.mode === 'toggle') state = this.toggleState
		else state = main.inputHandler.activeKeys[this.config.key]
		return this.inputs[state ? 'on' : 'off'].compiled.evaluate(scope)
	}

	getDependentParameters() {
		return new Set([
			...this.inputs.on.freeVariables(),
			...this.inputs.off.freeVariables(),
		])
	}
}


class ModifierParameter extends Parameter {
	constructor(config) {
		super(config, {
			modifier: 'Shift',
			left: true,
			right: true,
			on: '1',
			off: '0',
		})

		this.inputs = {}

		this.inputs.modifier = new UIMenu([
			{ text: "Shift", value: "Shift", },
			{ text: "Control", value: "Ctrl", },
			{ text: "Alt", value: "Alt", },
		])
		this.inputs.left = new UICheckbox()
		this.inputs.right = new UICheckbox()
		this.inputs.on = new UIExpression('small')
		this.inputs.off = new UIExpression('small')

		for (const input in this.inputs) {
			this.inputs[input].bindValue(this.config, input)
		}

		this.element = span(
			'if ',
			this.inputs.modifier.element,
			el('label', this.inputs.left.element,  span(' left')),
			', ',
			el('label', this.inputs.right.element, span(' right')),
			', then ',
			this.inputs.on.element,
			' else ',
			this.inputs.off.element,
		)
	}

	evaluate({ inputHandler, }, scope) {
		let state = false
		;['Left', 'Right'].forEach(side => {
			if (this.config[side.toLowerCase()]) {
				state |= inputHandler.activeKeys[`${this.config.modifier}${side}`]
			}
		})
		state |= inputHandler.activeKeys[`${this.config.modifier}Right`]
		return this.inputs[state ? 'on' : 'off'].compiled.evaluate(scope)
	}

	getDependentParameters() {
		return new Set([
			...this.inputs.on.freeVariables(),
			...this.inputs.off.freeVariables(),
		])
	}
}

class ArrowKeyParameter extends Parameter {
	constructor(config) {
		super(config, { value: 0, step: 1, controls: 'up-down', })

		this.inputs = {
			value: new UINumber(),
			step: new UINumber(),
			controls: new UIMenu([
				{ text: '↕', value: 'up-down', },
				{ text: '↔', value: 'left-right', },
			]),
		}

		for (const input in this.inputs) {
			this.inputs[input].bindValue(this.config, input)
			this.triggerOn(this.inputs[input], 'change')
		}

		this.element = span(
			this.inputs.value.element,
			' control with ',
			this.inputs.controls.element,
			' in steps of ',
			this.inputs.step.element,
		)

		main.inputHandler.on('keydown', keyCode => {
			const delta = {
				'up-down': { ArrowUp: +1, ArrowDown: -1, },
				'left-right': { ArrowRight: +1, ArrowLeft: -1, },
			}[this.config.controls][keyCode] || 0
			this.inputs.value.setValue(this.config.value + delta*this.config.step)
			if (delta !== 0) {
				this.trigger('show')
				this.trigger('change')
			}
		})
	}

	evaluate() {
		return this.config.value
	}
}

class ChordDataParameter extends Parameter {
	/*
	Modes:
	- previous keydown
	- first pressed of chord / last released
	*/
	constructor(config) {
		super(config, {mode: 'count'})

		this.inputs = {
			mode: new UIMenu([
				{text: 'Note count', value: 'count'},
				{text: 'Last of chord', value: 'last'},
				{text: 'First of chord', value: 'first'},
				{text: 'Lowest note', value: 'min'},
				{text: 'Highest note', value: 'max'},
			]),
		}

		for (const input in this.inputs) {
			this.inputs[input].bindValue(this.config, input)
		}


		this.element = span(
			this.inputs.mode.element,
		)

		this.currentChord = []
		this.previousValue = null

		main.noteHandler.on('notedown', (id, note) => {
			this.currentChord.push(id)
			this.previousValue = main.noteHandler.notes[id]?.freqs
		})
		main.noteHandler.on('noteup', id => {
			const i = this.currentChord.indexOf(id)
			if (i < 0) return // note not in chord
			if (this.currentChord.length === 1) {
				this.lastReleased = id
			}
			this.currentChord.splice(i, 1)
		})
	}

	evaluate() {
		// if (this.config.mode === 'count') return this.currentChord.length + 1
		switch (this.config.mode) {
			case 'count': return this.currentChord.length + 1
			case 'first':
				// if (this.currentChord.length === 0) return this.previousValue
				const id = this.currentChord[0] || this.lastReleased
				let freqs = main.noteHandler.notes[id]?.freqs
				if (freqs === undefined) freqs = []
				return this.previousValue = freqs
			case 'last':
				return this.previousValue
		}
		const freqs = main.noteHandler.notes[this.previousNote]?.freqs
		if (freqs === undefined) return 1
		return math.min(freqs)
	}
}

const categoryOptions = {
	freq: [
		{
			text: 'Constant',
			value: 'const',
			data: config => new NumberParameter(config),
		},
		{
			text: 'Slider',
			value: 'slider',
			data: config => new SliderParameter(config),
		},
		{
			text: 'Expression',
			value: 'expr',
			data: config => new ExpressionParameter(config),
		},
		{
			group: 'Keyboard Input',
			options: [
				{
					text: 'Key Row',
					value: 'key-row',
					data: config => new KeyRowParameter(config),
				},
				{
					text: 'Key Column',
					value: 'key-col',
					data: config => new KeyColumnParameter(config),
				},
				{
					text: 'Modifier Key',
					value: 'mod-key',
					data: config => new ModifierParameter(config),
				},
				{
					text: 'Key State',
					value: 'key',
					data: config => new KeyStateParameter(config),
				},
				{
					text: 'Arrow Keys',
					value: 'arrows',
					data: config => new ArrowKeyParameter(config),
				},
			]
		},
		{
			group: 'Notes',
			options: [
				{
					text: 'Chord Data',
					value: 'notes',
					data: config => new ChordDataParameter(config),
				},
			],
		},
	],

	osc: [
		{
			text: 'Basic Waveform',
			value: 'waveform',
			data: config => new WaveformParameter(config),
		},
	],

	vol: [
		{
			text: 'Envelope',
			value: 'env',
			data: config => new EnvelopeParameter(config),
		},
	],
}


function defaultParamType(symbol) {
	if (symbol in main.inputLayout) {
		return { type: 'key', config: { key: symbol, }, }
	}
	return {
		'x': { type: 'key-col', },
		'y': { type: 'key-row', },
		'shift': { type: 'mod-key', config: { modifier: 'Shift', }, },
		'h': { type: 'arrows', config: { controls: 'left-right', }, },
		'v': { type: 'arrows', config: { controls: 'up-down', }, },
	}[symbol] || { type: 'expr', }
}
