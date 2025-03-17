class Main {
	constructor() {

		this.ctx = new AudioContext()

		this.inputHandler = new InputHandler(document.body)

		this.inputLayout = layouts.default

		this.noteHandler = new NoteHandler(this.ctx)

		let noteVisualEl = document.getElementById('note-visual')
		// this.ratioscope = new Ratioscope(ratioscopeEl)
		this.noteVisual = new Spiralscope(noteVisualEl, this.noteHandler)


		let visualEl = document.getElementById('keyboard-visual')
		this.keyboardVisual = new KeyboardVisual(visualEl, this.inputLayout)

		this.paramTable = new ParameterTable(document.getElementById('formulas'))


		this.paramTable.on('change', () => {
			this.keyboardVisual.colorKeys(keyCode => {
				return this.keyColor(keyCode)
			})
		})


		this.inputHandler.on('key', (keyCode, pressed) => {
			if (keyCode === 'Escape') {
				this.noteHandler.panic()
				this.synth.panic()
				this.inputHandler.panic()
				return
			}
			if (keyCode === 'Space') {
				if (pressed) this.noteHandler.sustained = true
				else this.noteHandler.releaseSustained()
			}

			let keyEls = this.keyboardVisual.keyEls[keyCode]
			if (keyEls === undefined) return
			keyEls.keyEl.classList[pressed ? 'add' : 'remove']('held')
		})

		this.masterGainNode = this.ctx.createGain()
		this.masterGainNode.gain.value = 0.1
		this.masterGainNode.connect(this.ctx.destination)

		this.synth = new OscSynth(this.masterGainNode)

		this.inputHandler.on('keydown', (keyCode, repeated) => {
			if (repeated) return // prevent key repeat

			const keyEvaluation = this.evaluateKey(keyCode)
			if (keyEvaluation === undefined) return
			const {vol, freq, osc} = keyEvaluation

			const freqs = math.filter(math.isCollection(freq) ? freq : [freq], Number.isFinite)


			this.noteHandler.newNote(keyCode, {
				waveform: osc,
				vol,
				freqs,
			})

		})
		this.inputHandler.on('keyup', keyCode => {
			this.noteHandler.releaseNote(keyCode)
		})


		this.synth.triggerOn(this.noteHandler)

		this.noteHandler.on('*', () => this.noteVisual.draw())
		this.noteVisual.draw()
	}

	evaluateKey(keyCode) {
		if (!(this.inputLayout[keyCode]?.type === '2d-key')) return
		let keyData = this.inputLayout[keyCode]

		return this.paramTable.evaluateAll({
			keyData,
		})
	}



	keyColor(keyCode) {
		const keyEvaluation = this.evaluateKey(keyCode)
		if (keyEvaluation === undefined) return new Color(theme('--color-accent'))

		let {freq} = keyEvaluation
		if (math.isCollection(freq)) freq = math.min(freq)

		return colorFromFreq(freq)
	}



	getConfig() {
		return {
			paramTable: this.paramTable.getConfigs()
		}
	}

	storeConfig(now) {
		if (now === undefined) {
			this.storeConfigTimeoutID = setTimeout(this.storeConfig(true), 1e3)
			return
		}

		if (this.storeConfigTimeoutID) clearTimeout(this.storeConfigTimeoutID)

		console.info('storing config')

		const config = this.getConfig()
		sessionStorage.setItem('config', JSON.stringify(config))

	}

	loadConfig(config) {
		console.info(`loading config`, config)
		this.paramTable.loadConfigs(config.paramTable)
	}
}

math.import({
	union: function(...collections) {
		return math.flatten(collections)
	},
	kron2: function(a, b) {
		if (math.isCollection(a) && math.isCollection(b)) {
			return math.kron(a, b)
		} else {
			return math.multiply(a, b)
		}
	},
	justify: function(root, freqs, rtol) {
		if (math.isCollection(root)) {
			if (root.length === 0) return freqs
			root = math.min(root)
		}
		// if (math.isCollection(root)) root = throw error('not implemented')
		if (!math.isNumber(root)) return freqs
		if (!math.isCollection(freqs)) freqs = [freqs]
		return freqs.map(freq => {
			const frac = math.roundFraction(freq/root, rtol)
			return frac*root
		})

	},
	roundFraction: function(x, maxDenom=12) {
		if (math.isCollection(x)) return x.map(i => math.roundFraction(i, maxDenom))

		let best = math.fraction(math.round(x), 1)
		for (d = 2; d <= maxDenom; d++) {
			const rational = math.fraction(math.round(x*d), d)
			if (math.abs(rational - x) < math.abs(best - x)) best = rational
		}
		return best
	},
})

function fixmath(node) {
	if (node.type === 'ArrayNode') {
		return new math.FunctionNode("union", node.items.map(fixmath))
	} else if (node.type === 'OperatorNode' && node.op === '*') {
		return new math.FunctionNode("kron2", node.args.map(fixmath))
	} else return node.map(fixmath)
}


window.addEventListener('load', async event => {
	window.main = new Main()

	main.convoluterNode = main.ctx.createConvolver()
	main.convoluterNode.buffer = await fetchAudio(main.ctx, 'audio/impulse-2.wav')
	main.convoluterNode.connect(main.masterGainNode)
	main.synth.destination = main.convoluterNode



	const presetsMenu = new UIMenu(presets)
	document.getElementById('presets').appendChild(presetsMenu.element)
	const configField = new UITextArea('config-field')
	const configCopyButton = new UIButton("Copy")
	const configLoadButton = new UIButton("Load")
	
	document.getElementById('config').appendChild(configCopyButton.element)
	document.getElementById('config').appendChild(configLoadButton.element)
	document.getElementById('config').appendChild(configField.element)
	
	presetsMenu.on('change', () => {
		main.loadConfig(presetsMenu.data[presetsMenu.value])
		main.paramTable.trigger('change')
	})
	
	configCopyButton.on('click', () => {
		const data = JSON.stringify(main.getConfig(), null, 2)
		navigator.clipboard.writeText(data)
	})
	configLoadButton.on('click', () => {
		try {
			const data = JSON.parse(configField.element.value)
			main.loadConfig(data)
			configField.element.classList.remove('invalid')
		} catch (e) {
			console.error(e)
			configField.element.classList.add('invalid')
		}
	})

	main.paramTable.on('change', () => {
		console.log("Writing config field")
		const data = JSON.stringify(main.getConfig())
		configField.setValue(data)
	})

	const configString = sessionStorage.getItem('config')
	if (configString) {
		let config
		try {
			config = JSON.parse(configString)
		} catch (error) {
			if (error.constructor !== SyntaxError) throw error
		}
		if (config) try {
			main.loadConfig(config)
		} catch (error) {
			console.error(`couldn't load config`, config, `threw`, error)
		}
	} else {
		main.loadConfig({
			paramTable: [
				{
					symbol: 'osc',
					category: 'osc',
					type: 'waveform',
					permanence: 'required',
				},
				{
					symbol: 'vol',
					category: 'vol',
					type: 'env',
					permanence: 'required',
				},
				{
					symbol: 'freq',
					category: 'freq',
					type: 'expr',
					config: { expr: '70*y*2^(x/4)*[1, 1/2]', },
					permanence: 'required',
				},
			],
		})
	}

	main.paramTable.resolveDependencies()
	main.paramTable.trigger('change')

	const activeKeysDisplayEl = document.getElementById('active-keys')
	main.inputHandler.on('key', keyCode => {
		activeKeysDisplayEl.innerText = Object.keys(main.inputHandler.activeKeys).join(' ')
	})




})

window.addEventListener('beforeunload', event => {
	if (main.paramTable.rows.length <= 1) return
	const config = main.getConfig()
	sessionStorage.setItem('config', JSON.stringify(config))
})


