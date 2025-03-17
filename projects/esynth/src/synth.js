class Voice {
	constructor(destination) {
		this.ctx = destination.context

		this.envelopeNode = this.ctx.createGain()
		this.envelopeNode.connect(destination)
		this.envelopeNode.gain.value = 0

		this.oscNode = this.ctx.createOscillator()
		this.oscNode.connect(this.envelopeNode)

		this.envelope = {
			attack: 0.03,
			decay: .3,
			sustain: 0.3,
			release: .3,
		}

	}

	start(t = this.ctx.currentTime) {
		this.oscNode.start(t)

		// attack
		t += this.envelope.attack
		this.envelopeNode.gain.linearRampToValueAtTime(1, t)

		// decay
		this.envelopeNode.gain.setTargetAtTime(this.envelope.sustain, t, this.envelope.decay)
	}

	release(t = this.ctx.currentTime) {
		this.envelopeNode.gain.cancelAndHoldAtTime(t)
		this.envelopeNode.gain.setTargetAtTime(0, t, this.envelope.release)

		let cutoff = 6*this.envelope.release
		this.oscNode.stop(t + cutoff)
	}

	panic() {
		this.oscNode.stop()
	}
}




class OscSynth extends EventEmitter {
	constructor() {
		super()
		this.voices = {}
	}

	onNotedown(id, noteData) {
		let envelope
		if (noteData.vol !== undefined) {
			if (math.isNumber(noteData.vol)) {
				envelope = {
					attack: 0, decay: 0, sustain: noteData.vol, release: 0,
				}
			} else envelope = noteData.vol
		}


		this.voices[id] = noteData.freqs.map(freq => {
			let voice = new Voice(this.destination)

			voice.oscNode.frequency.value = freq
			voice.oscNode.type = noteData.waveform || 'sine'

			if (envelope !== undefined) voice.envelope = envelope

			voice.start()
			return voice
		})
	}

	onNoteup(id, noteData) {
		this.voices[id].forEach(voice => voice.release())
	}

	panic() {
		for (const voices of Object.values(this.voices)) {
			for (const voice of voices) {
				voice.panic()
			}
		}
		this.voices = {}
	}

}
