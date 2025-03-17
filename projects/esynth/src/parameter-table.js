class ParameterTable extends EventEmitter {
	constructor(tableEl) {
		super()
		this.tableEl = tableEl
		this.rows = [] // {symbol, type, param, permanence}

		this.tableEl.addEventListener('keydown', event => event.stopPropagation())
	}

	addParameter(config, index) {
		if (index === undefined) index = this.rows.length
		const paramRow = new ParameterRow(config)

		this.rows.splice(index, 0, paramRow)
		// this.tableEl.appendChild(paramRow.rowEl)
		this.tableEl.insertBefore(paramRow.rowEl, this.tableEl.children[index])

		paramRow.rowEl.querySelector('td.symbol').addEventListener('click', e => {
			paramRow.setPermanence('auto')
			e.stopPropagation()
		})

		paramRow.on('change', () => {
			this.resolveDependencies()
			this.trigger('change')
		})

	}

	removeParameter(index) {
		this.rows.splice(index, 1) // removes item at index
		this.tableEl.deleteRow(index)
	}

	indexOf(requestedSymbol) {
		for (let i = 0; i < this.rows.length; i++) {
			if (this.rows[i].symbol === requestedSymbol) return i
		}
	}

	evaluateAll(data) {
		const scope = {}
		for (let i = this.rows.length - 1; i >= 0; i--) {
			const {symbol, param} = this.rows[i]
			const value = scope[symbol] = param.evaluate(data, scope)

			// const displayResult = math.isCollection(value) ? math.format(value, 5) : value//JSON.stringify(value)
			const displayResult = math.format(value, 5)
			this.tableEl.querySelector(`tr[symbol=${symbol}] td.result`).textContent = displayResult
		}
		return scope
	}

	/*
	CURRENT THOUGHT:
	evaluateAll doesn't work
	*/

	getUsedParameters() {
		const params = new Set()
		for (const {symbol, param, permanence} of this.rows) {
			if (permanence !== 'auto') params.add(symbol)
			param.getDependentParameters().forEach(i => params.add(i))
		}
		return params
	}

	resolveDependencies() {
		const usedParams = this.getUsedParameters()

		// auto add
		usedParams.forEach(symbol => {
			if (this.indexOf(symbol) === undefined) {
				const { type, config, } = defaultParamType(symbol)
				this.addParameter({
					symbol,
					category: 'freq',
					type,
					config,
					permanence: 'auto',
				})
			}
		})

		// auto remove

		for (let i = 0; i < this.rows.length; i++) {
			const {symbol, permanence} = this.rows[i]
			if (!usedParams.has(symbol) && permanence === 'auto') {
				this.removeParameter(i--)
			}
		}
	}

	getConfigs() {
		return this.rows.map(({symbol, category, typeMenu, param, permanence}) => {
			return {symbol, category, type: typeMenu.value, config: param.config, permanence}
		})
	}

	loadConfigs(configs) {
		while (this.rows.length > 0) this.removeParameter(0)
		configs.forEach(config => this.addParameter(config))
	}

}



class ParameterRow extends EventEmitter {
	constructor({symbol, category, type, config, permanence='required'}) {
		super()

		this.symbol = symbol
		this.category = category

		this.rowEl = document.createElement('tr')
		this.rowEl.classList.add(permanence)
		this.rowEl.setAttribute('symbol', symbol)

		const promote = () => {
			if (this.permanence === 'auto') this.setPermanence('manual')
		}
		this.rowEl.addEventListener('click', () => this.promoteAutoToManual())

		this.setPermanence(permanence)

		;['symbol', 'type', 'controls', 'result'].forEach(cellClass => {
			const cellEl = this.rowEl.insertCell()
			cellEl.classList.add(cellClass)
		})

		this.rowEl.querySelector('td.symbol').textContent = symbol

		this.typeMenu = new UIMenu(categoryOptions[category])
		this.rowEl.querySelector('td.type').appendChild(this.typeMenu.element)

		this.typeMenu.setValue(type)
		this.initializeParameter(type, config)

		this.typeMenu.on('change', () => {
			const type = this.typeMenu.value

			this.initializeParameter(type) // triggers change
		})

		this.param.on('show', () => {
			try {
				const result = this.param.evaluate()
				this.rowEl.querySelector('td.result').textContent = math.format(result, 3)
			} catch {}
		})

		this.param.on("change", () => {
			this.trigger('change')
		})
	}


	setPermanence(permanence) {
		this.rowEl.classList.remove(this.permanence)
		this.permanence = permanence
		this.rowEl.classList.add(this.permanence)
	}

	promoteAutoToManual() {
		if (this.permanence === 'auto') this.setPermanence('manual')
	}

	initializeParameter(type, config) {
		const init = this.typeMenu.data[type]
		this.param = init(config)
		this.triggerOn(this.param, 'change')
		// this.param.on('change', () => this.promoteAutoToManual())

		const cellEl = this.rowEl.querySelector('td.controls')
		while (cellEl.childElementCount > 0) cellEl.firstChild.remove()
		cellEl.appendChild(this.param.element)

		this.trigger('change')
	}

	getConfig() {
		return {
			symbol: this.symbol,
			category: this.category,
			type: this.typeMenu.value,
			config: this.param.config,
			permanence: this.permanence,
		}
	}

	evaluate() {
		const value = this.param.evaluate(...arguments)
		console.log(`row ${this.symbol} eval'd`)
		this.rowEl.querySelector('td.result').textContent = value
		return value
	}
}
