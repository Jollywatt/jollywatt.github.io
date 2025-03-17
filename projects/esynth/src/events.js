class InputHandler extends EventEmitter {
	/* Handle user input such as key pressed, keep track of key states */
	constructor(listenedEl) {
		super()

		this.listenedEl = listenedEl
		this.activeKeys = {}

		this.listenedEl.addEventListener('keydown', event => {
			this.keydown(event.code)
			if (/^Space$|^Tab$|^Alt|^Control|^Home$|^End$|^Page|^Arrow/.test(event.code)) {
				event.preventDefault()
				// console.log(`prevented ${event.code}`)
			}
		})
		this.listenedEl.addEventListener('keyup', event => this.keyup(event.code))
		window.addEventListener('blur', event => this.panic())

		// this.keyupListeners = []
		// this.keydownListeners = []
		// this.keyListeners = []
	}

	panic() {
		for (const keyCode in this.activeKeys) {
			this.keyup(keyCode)
		}
		this.activeKeys = {}
	}

	keydown(keyCode) {
		const repeated = this.activeKeys[keyCode] // detect key repeat
		this.activeKeys[keyCode] = true
		this.trigger('keydown', keyCode, repeated)
		this.trigger('key', keyCode, true)
	}

	keyup(keyCode) {
		if (keyCode in this.activeKeys) {
			delete this.activeKeys[keyCode]
		}
		// this.keyupListeners.forEach(f => f(keyCode))
		// this.keyListeners.forEach(f => f(keyCode, false))
		this.trigger('keyup', keyCode)
		this.trigger('key', keyCode, false)
	}
}




class NoteHandler extends EventEmitter {
	constructor(ctx) {
		super()
		this.ctx = ctx
		this.notes = {} // {keyCode: <data>}
		// this.counters = {} // want every note to have a unique ID, even if played by same key

		this.sustained = false
		this.sustainedNotes = []

	}

	newNote(keyCode, noteData) {
		let id = `${keyCode}`
		while (id in this.notes) {
			// '${id}' -> '${id}-1' -> '${id}-2' -> ...
			id = id.replace(/-(\d+)|$/, (_, m) => `-${Number(m || 0) + 1}`)
		}

		const note = this.notes[id] = {
			createdAt: this.ctx.currentTime,
			keyCode,
			...noteData,
		}

		this.trigger('notedown', id, note)
	}

	releaseNote(keyCode) {
		// release all notes created by keyCode
		// i.e., with ids of the form keyCode-1, -2, etc
		for (const id in this.notes) {
			if (id.startsWith(keyCode)) this.releaseNoteById(id)
		}

	}

	releaseNoteById(id) {
		if (this.sustained) {
			this.sustainedNotes.push(id)
		} else {
			delete this.notes[id]
			this.trigger('noteup', id)
		}
	}

	releaseSustained() {
		this.sustained = false
		this.sustainedNotes.forEach(id => this.releaseNoteById(id))
		this.sustainedNotes = []
	}

	panic() {
		for (const id in this.notes) {
			delete this.notes[id]
			this.trigger('noteup', id)
		}
	}

}
