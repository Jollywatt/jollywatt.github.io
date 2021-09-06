
function thm(p, n, dual=false, sig=undefined) {
	if (sig === undefined) sig = parameters.sig.getValue().map(i => 1)
	parameters.sig.setValue(sig);
	parameters.p.setValue(p);
	parameters.n.setValue(n);
	parameters.dual.setValue(dual);
	renderTheorem();
}

class Parameter {
	constructor(name, props) {
		this.name = name;
		this.inputEl = document.querySelector(`.input[name=${this.name}]`);
		this.outputEl = document.querySelector(`.output[name=${this.name}]`);

		Object.assign(this, props);

		if (this.oninput === undefined) this.oninput = () => {};
		this.inputEl.addEventListener('input', () => {
			this.oninput(this.outputEl, this.getValue())
		});

		window.addEventListener('load', () => {
			this.inputEl.dispatchEvent(new Event('input'));
		});
	}

	getValue() {
		return this.read(this.inputEl);
	}

	setValue(value) { // from input el
		if (value === null) return;
		this.write(this.inputEl, value);

		if (this.silenced) return; // lock to avoid recursion

		this.silenced = true;		
		this.oninput(this.outputEl, value);
		this.silenced = false;
	}
}

let parameters = {

	p: new Parameter('p', {
		read: el => Number(el.value),
		write: (el, p) => el.value = p,
		oninput: (el, p) => {
			let n = parameters.n.getValue();
			if (0 < p) {
				if (0 < n && n <= p) parameters.n.setValue(p + 1);
			} else if (p < 0) {
				parameters.n.setValue(0);
			}

			katex.render(p >= 0 ? `p = ${p}` : `p \\ge 0`, el);
		}
	}),
	n: new Parameter('n', {
		read: el => Number(el.value),
		write: (el, n) => console.log('...', el.value = n),
		oninput: (el, n) => {
			let sig = parameters.sig.getValue();
			sig.splice(n); // sig = sig[:n]
			while (sig.length < n) sig.push(sig[sig.length - 1] || 1);
			parameters.sig.setValue(sig);

			if (0 < n && n <= parameters.p.getValue()) parameters.p.setValue(n - 1);

			katex.render(n >= 1 ? `n = ${n}` : `n \\ge 1`, el);
		}
	}),
	dual: new Parameter('dual', {
		read: el => el.checked,
		write: (el, check) => el.checked = check,
		oninput: (el, check) => katex.render(check ? `\\star ω` : `ω`, el),
	}),
	sig: new Parameter('sig', {
		read: el => Array.from(el.textContent.trim()).map(i => i == '-' ? -1 : 1),
		write: (el, sig) => {
			el.textContent = sig.map(i => i > 0 ? '+' : '-').join('') || 'any';
		},
		oninput: (el, sig) => {
			parameters.n.setValue(sig.length, true);
		}
	})
};

function isLorentzian(sig) {
	return sig.slice(1).every(i => i*sig[0] < 0);
}

function spaceFromSignature({p, n, sig}) {
	let space = new Space(sig);

	if (0 <= n) {
		if (n <= 3 && sig.every(i => i > 0)) {
			space.labels = 'xyz';
			space.indexNotation = false;
		} else if (n <= 4 && space.isLorentzian()) {
			space.labels = 'txyz';
			space.indexNotation = false;
		}
	} else {
	}

	return space;
}

function ΩNames(N) {
	return {
		1: `\\mathcal C`,
		2: `\\mathcal S`,
		3: `\\mathcal V`,
	}[N] || `Ω`;
}

let faces = {

	'Component Form:': ({p, n, sig, dual}) => {
		let lhs, rhs;
		if (p < 0) {
			let ω = `ω`;
			if (dual) ω = `\\star ${ω}`;
			lhs = `\\dd ${ω}`;
			rhs = `${ω}`;
		} else {
			let space, ω;
			if (1 <= n) {
				space = spaceFromSignature({p, n, sig});
				ω = space.generalForm('ω', p);
			} else {
				// if (sig )
				space = new Space(Array(p + 1).fill(1), {labels: ('ijklmnn')});
				ω = space.Form([
					space.SimpleForm(range(p).map(i => i + 1), {coeff: 'ω'})
				]);
			}

			window.w = ω
			if (parameters.dual.getValue()) ω = ω.dual().canonical();
			let dω = ω.d().canonical().collectTerms();

			lhs = texQty(dω.render(), dω.terms.length > 1);
			rhs = texQty(ω.render(), ω.terms.length > 1);

		}

		let Ω = ΩNames(p + 1);

		return {tex: `\\int_{${Ω}} ${lhs} = \\int_{∂${Ω}} ${rhs}`};
	},

	'Standard Notation:': ({p, n, sig, dual}) => {

		let tex;
		let details = [];
		if (p == 0) {
			if (n == 1) tex = `\\int_a^b \\pdv{f(x)}{x} \\dd x = f\\Big|_a^b`;
			else {
				tex = `\\int_{\\mathcal C} \\vec\\nabla f \\cdot \\dd\\vec\\ell = f\\Big|_a^b`;
				details.push(`$\\mathcal C$ is a curve in $${n || `n`}$-space with start point at $a$ and end point $b$`);
			}
		} else if (p == 1) {
			let vecsym = `u`;
			let vec = `\\vec ${vecsym}`;

			if (dual) {
				// divergence theorems
				let div = isLorentzian(sig) ? `` : `\\operatorname{div}`;
				
				let lint = `\\int`;
				let rint = `\\oint`;
				if (1 <= n && n <= 3) {
					let i = 'ii'.substr(0, n - 1);
					lint = `\\${i}int`;
					rint = `\\o${i}nt`;
				}

				let Ω = ΩNames(n);
				let ld = {
					1: `\\dd\\ell`,
					2: `\\dd A`,
					3: `\\dd V `,
				}[n] || `\\dd Ω`;
				let rd;
				if (isLorentzian(sig)) {
					let metric = `η`;
					rd = {
						1: `n^μ \\, \\dd\\ell`,
						2: `\\dd A^μ`,
					}[n - 1] || `\\dd Σ^μ`;
					tex = `${lint}_{${Ω}} ${metric}^{μν} ∂_μ ${vecsym}_ν \\, ${ld} = ${rint}_{∂${Ω}} ${vecsym}_μ ${rd}`;

					details.push(`$${vecsym}_μ$ is a $${n || `n`}$-covector related to $ω$ by $${vecsym}_μ = (\\star ω)_μ$ (where $\\star$ denotes the Hodge dual)`);
					details.push(`$${metric} \\cong \\operatorname{diag}(${sig.map(i => i > 0 ? `+1` : `-1`).join()})$ is the spacetime metric`);
					details.push(`$∂_i$ stands for $\\pdv{}{x^i}$`);
					details.push(`$${rd}$ is an outward-facing element of the boundary $∂${Ω}$`);

				} else {
					let unitnormal = `\\hat{\\bm n}`;
					rd = {
						1: `\\dd\\ell`,
						2: `\\dd A`,
					}[n - 1] || `\\dd Σ`;
					tex = `${lint}_{${Ω}} ${div} ${vec} \\, ${ld} = ${rint}_{∂${Ω}} ${vec} \\cdot ${unitnormal} \\, ${rd}`;

					details.push(`where $${vec}$ is a $${n || `n`}$-vector (related to $ω$ by $${vecsym}_i = (\\star ω)_i$ where $\\star$ denotes the Hodge dual)`);
					details.push(`$${unitnormal}$ is an outward-facing unit vector normal to the ${{1: `line`, 2: `area`}[n - 1] || `hypersurface`} element $${rd}$`); 
				}
				details.splice(details.length - 1, 0, `$${ld}$ is an element of the ${{2: `area`, 3: `volume`}[n] || `region`} $${Ω}$`);
				



			} else {
				// curl theorems
				let curl = `\\operatorname{curl}`;
				if (n !== 3) curl += `_\\text{${n || `$n$`}D}`;

				let Ω = `\\mathcal S`;
				let ld = `\\dd\\vec A`;
				let rd = `\\dd\\vec r`;
				tex = `\\iint\\limits_{${Ω}} (${curl}${vec})\\cdot${ld} = \\oint_{∂${Ω}} ${vec} \\cdot ${rd}`;
				details.push(`$${vec}$ is a $${n || `n`}$-vector (related to $ω$ by $${vecsym}_i = ω_i$)`);
				details.push(`the vector $${ld}$ is outward-facing and normal to the 2-surface $${Ω}$`);
				details.push(`$${rd}$ is the line element around the 1-dimensional boundary of $${Ω}$`);
			}
		}

		let detailsTex;
		if (details.length) {
			detailsTex = `where `;
			for (var i = 0; i < details.length; i++) {
				detailsTex += details[i];
				if (i < details.length - 2) detailsTex += `;&nbsp;`;
				if (i == details.length - 2) detailsTex += ` and `;
			}
			detailsTex += '.';
		}
		return {tex: tex, details: detailsTex};
	}


}

function renderTheorem() {
	let config = {};
	for (let name in parameters) config[name] = parameters[name].getValue();
	// console.log(config)

	while (boxEl.firstChild) boxEl.removeChild(boxEl.firstChild);

	let first = true;
	for (let face in faces) {
		let {tex, details} = faces[face](config);

		if (!tex) continue;

		let titleEl = document.createElement('h3');
		titleEl.textContent = face;
		
		let texEl = document.createElement('div');
		katex.render(tex, texEl, {
			displayMode: true,
			macros: macros_physics,
		});

		let detailsEl = document.createElement('p');
		detailsEl.innerHTML = details || ``;

		[titleEl, texEl, detailsEl].forEach(el => boxEl.appendChild(el));
		renderMathInElement(detailsEl, {
			delimiters: [
				{left: '$', right: '$', display: false},
			],
			macros: macros_physics
		});

	}
}

parametersTableEl.addEventListener('input', renderTheorem);
window.addEventListener('load', renderTheorem);