class UIInput extends EventEmitter {

	bindValue(object, key) {
		this.setValue(object[key])
		this.on('change', () => {
			object[key] = this.value
		})
	}

	setValue(value) {
		const changed = this.value !== value
		this.value = value
		if (changed) this.trigger('change')
	}

}

class UICheckbox extends UIInput {
	constructor() {
		super()
		this.element = document.createElement('input')
		this.element.type = 'checkbox'

		this.element.addEventListener('change', () => this.trigger('change'))
	}

	setValue(value) {
		this.element.checked = value
		super.setValue(value)
	}

	onChange() {
		this.value = this.element.checked
	}
}

class UIButton extends UIInput {
	constructor(text) {
		super()

		this.element = document.createElement('button')
		this.element.textContent = text

		this.element.addEventListener('click', () => this.trigger('click'))
	}
}

class UIMenu extends UIInput {
	/* A helper class for creating <select> elements, populated with options
	   with individual associated callbacks, provided in an object literal. */

	constructor(options, initialValue) {
		super()

		this.element = document.createElement('select')

		this.initializers = {}
		this.initializeWrapper = callback => callback()

		this.data = {}

		this.populateMenu(this.element, options)

		this.element.addEventListener('change', () => {
			this.trigger('change')
		})

		if (initialValue !== undefined) this.setValue(initialValue)
	}

	setValue(value) {
		this.element.value = value
		super.setValue(value)
	}

	onChange() {
		this.value = this.element.value

		let init = this.initializers[this.value]
		if (init === undefined) init = () => {}
		this.initializeWrapper(init)

	}

	populateMenu(groupEl, options) {
		options.forEach(option => {
			// option can be {text, value, ...} or group {group, options}

			if (option.constructor === String) option = {text: option}
			if (option.text !== undefined) {
				// is a menu option

				let optionEl = document.createElement('option')

				optionEl.textContent = option.text
				if (option.value !== undefined) optionEl.value = option.value

				// this.initializers[option.value] = option.initializer
				// this.destructors[option.value] = option.destructor
				this.data[option.value || option.text] = option.data

				groupEl.appendChild(optionEl)
			} else if (option.group !== undefined) {
				// is a option group

				let subgroupEl = document.createElement('optgroup')
				subgroupEl.setAttribute('label', option.group)
				this.populateMenu(subgroupEl, option.options)

				groupEl.appendChild(subgroupEl)
			} else throw Error('invalid menu builder literal')
		})
	}
}


class UINumber extends UIInput {
	constructor(step=1) {
		super()

		this.element = document.createElement('input')
		this.element.classList.add('ui-input')
		this.element.setAttribute('type', 'number')
		this.element.setAttribute('step', step)

		this.element.addEventListener('change', () => this.trigger('change'))
	}

	onChange() {
		let value = Number(this.element.value)

		if (isNaN(value)) {
			this.element.classList.add('invalid')
			return false
		} else {
			this.element.classList.remove('invalid')
			this.value = value
		}
	}

	setValue(value) {
		this.element.value = value
		super.setValue(value)
	}
}

class UISlider extends UIInput {
    constructor({value=50, min=0, max=100, step=1}) {
        super()

        this.minInput = new UINumber(step)
        this.maxInput = new UINumber(step)
        this.minInput.setValue(min)
        this.maxInput.setValue(max)

        this.element = document.createElement('div')
        this.element.classList.add('ui-slider')

        this.slider = document.createElement('input')
        this.slider.setAttribute('type', 'range')
        this.slider.setAttribute('min', min)
        this.slider.setAttribute('max', max)
        this.slider.setAttribute('step', step)
		this.slider.value = value

        this.element.appendChild(this.minInput.element)
        this.element.appendChild(this.slider)
        this.element.appendChild(this.maxInput.element)

        this.slider.addEventListener('input', () => this.trigger('change'))
		const update = () => {
			this.trigger('change')
			this.updateSliderRange()
		}
        this.minInput.on('change', update)
        this.maxInput.on('change', update)
    }

    updateSliderRange() {
        const min = Number(this.minInput.element.value)
        const max = Number(this.maxInput.element.value)

        if (!isNaN(min) && !isNaN(max)) {
            this.slider.setAttribute('min', min)
            this.slider.setAttribute('max', max)
        }
    }

    onChange() {
        this.value = {
			value: Number(this.slider.value),
			min: this.minInput.value,
			max: this.maxInput.value,
		}
    }

    setValue({value, min, max}) {
        this.slider.value = value
		this.minInput.setValue(min)
		this.maxInput.setValue(max)
        super.setValue({value, min, max})
    }
}

class UITextArea extends UIInput {
	constructor(classes='') {
		super()

		this.element = document.createElement('input')
		this.element.setAttribute('type', 'text')
		
		this.element.addEventListener('change', () => this.trigger('change'))

		for (const className of classes.matchAll(/\S+/g)) {
			this.element.classList.add(className)
		}
	}

	setValue(value) {
		this.element.value = value
		super.setValue(value)
	}
}

class UIText extends UIInput {
	constructor(classes='') {
		super()

		this.element = document.createElement('span')
		this.editor = CodeMirror(this.element, {
			extraKeys: {
				Enter: () => document.activeElement.blur(),
				Tab: false,
			},
			value: "hi",
		})

		this.editor.on('beforeChange', (cm, changeObj) => {
			// Limit text to a single line
			return changeObj.update(null, null, [changeObj.text.join('')])
		})

		this.editor.on('change', () => this.trigger('change'))

		this.editorElement = this.editor.getWrapperElement()
		for (const className of classes.matchAll(/\S+/g)) {
			this.editorElement.classList.add(className)
		}

	}

	onChange() {
		this.value = this.editor.getValue()
	}

	setValue(value) {
		this.editor.setValue(value)
		setTimeout(() => this.editor.refresh())
		super.setValue(value)
	}
}

class UIExpression extends UIText {
	constructor() {
		super(...arguments)
	}

	onChange() {
		if (this === null) return console.log('cm bug??') // cm bug??

		const classList = this.editor.getWrapperElement().classList
		const value = this.editor.getValue()
		let exprTree
		try {
			exprTree = math.parse(value)
		} catch (error) {
			if (error instanceof SyntaxError) {
				classList.add('invalid')
				return false
			} else throw error
		}

		this.compiled = fixmath(exprTree)

		this.value = value
		classList.remove('invalid')
	}

	freeVariables() {
		return new Set(math.parse(this.value)
			.filter(node => node.isSymbolNode)
			.map(node => node.name)
			.filter(name => !(name in math)))
	}
}

function fetchAudio(ctx, url) {
	return fetch(url).then(response => response.arrayBuffer())
		.then(arrayBuffer => ctx.decodeAudioData(arrayBuffer))
}
