let layouts = {}
layouts.default = (() => {
	let layout = {}

	let keyCodeMap = [
		["Backquote", "Digit1", "Digit2", "Digit3", "Digit4", "Digit5", "Digit6", "Digit7", "Digit8", "Digit9", "Digit0", "Minus", "Equal", "Backspace"],
		["KeyQ", "KeyW", "KeyE", "KeyR", "KeyT", "KeyY", "KeyU", "KeyI", "KeyO", "KeyP", "BracketLeft", "BracketRight", "Backslash"],
		["KeyA", "KeyS", "KeyD", "KeyF", "KeyG", "KeyH", "KeyJ", "KeyK", "KeyL", "Semicolon", "Quote", "Enter"],
		["KeyZ", "KeyX", "KeyC", "KeyV", "KeyB", "KeyN", "KeyM", "Comma", "Period", "Slash"],
	]

	let keyLabels = [
		`\`1234567890-=⌫`,
		`QWERTYUIOP[]\\`,
		`ASDFGHJKL;'↵`,
		`ZXCVBNM,./`,
	]

	let totalWidth = 15

	// let indents = [0, 1.5, 1.8, 2.35]
	let indents = [0, 1.5, 2, 2.5]
	let coordIndents = [-1, 0, 0, 0]

	keyCodeMap.forEach((keyCodes, row) => {
		keyCodes.forEach((keyCode, col) => {
			let x = indents[row] + col
			let y = row

			layout[keyCode] = {
				label: keyLabels[row][col],
				position: [x, y],
				size: [1, 1],
				type: '2d-key',
				coords: {
					x: coordIndents[row] + col,
					y: 3 - row,
				},
			}
		})
	})

	layout["Backspace"].size[0] = totalWidth - layout["Backspace"].position[0]
	layout["Backslash"].size[0] = totalWidth - layout["Backslash"].position[0]
	layout["Enter"].size[0] = totalWidth - layout["Enter"].position[0]
	layout["Tab"] = {
		label: '⇥',
		position: [0, 1],
		size: [indents[1], 1],
	}
	layout["Space"] = {
		label: '⎵',
		position: [indents[3] + 2, 4],
		size: [5, 1],
	}
	layout["CapsLock"] = {
		label: '⇪',
		position: [0, 2],
		size: [indents[2], 1],
	}
	layout["ShiftLeft"] = {
		label: '⇧',
		position: [0, 3],
		size: [indents[3], 1],
	}
	layout["ShiftRight"] = {
		label: '⇧',
		position: [indents[3] + 10, 3],
	}
	layout["ShiftRight"].size = [totalWidth - layout["ShiftRight"].position[0], 1]

	return layout
})()

layouts.mine = (() => {
	const layout = Object.assign({}, layouts.default)

	layout["Home"] = {
		label: '⇱',
		position: [15, 0],
		size: [1, 1],
	}
	layout["PageUp"] = {
		label: '⇞',
		position: [15, 1],
		size: [1, 1],
	}
	layout["PageDown"] = {
		label: '⇟',
		position: [15, 2],
		size: [1, 1],
	}
	layout["End"] = {
		label: '⇲',
		position: [15, 3],
		size: [1, 1],
	}

	return layout
})()
