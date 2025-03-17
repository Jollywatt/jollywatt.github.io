class BufferSynth extends NoteHandler {
	constructor() {
		super(...arguments)

		this.chunkDuration = 0.03
		this.chunkSize = this.ctx.sampleRate*this.chunkDuration
	}

	newNote() {
		if (!this.playing) this.start()
		super.newNote(...arguments)
	}

	releaseNote() {
		super.releaseNote(...arguments)

		if (Object.keys(this.notes).length === 0) this.stop()
	}

	sample(t) {
		let total = 0
		for (const id in this.notes) {
			const note = this.notes[id]
			total += this.sampleNote(t, note)
		}
		return total
	}

	schedule(startTime) {
		let start = this.ctx.currentTime

		let buffer = this.ctx.createBuffer(1, this.chunkSize, this.ctx.sampleRate)
		let channel = buffer.getChannelData(0)
		let t0 = startTime
		for (var i = 0; i < channel.length; i++) {
			let t = t0 + i/this.ctx.sampleRate
			channel[i] = this.sample(t)
		}
		let source = this.ctx.createBufferSource()
		source.buffer = buffer
		source.connect(this.destination)

		source.start(startTime)

		if (this.playing) {
			let nextTime = startTime + this.chunkDuration
			let waitTime = nextTime - this.ctx.currentTime
			// console.log(this.ctx.currentTime - start)
			setTimeout(() => this.schedule(nextTime), waitTime*1000 - 50)
		}
	}

	start() {
		if (this.playing) return console.error(`already playing`)
		this.playing = true
		this.schedule(this.ctx.currentTime)
	}

	stop() {
		this.playing = false
	}
}
