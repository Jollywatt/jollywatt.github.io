function range(n, f=(x=>x)) {
	return Array.from({length: n}, (x, i) => f(i));
}

function signOfPermutation(perm) {
	let n = perm.length;
	let sign = 1;
	for (var i = 0; i < n; i++) {
		for (var j = i + 1; j < n; j++) {
			if (perm[i] > perm[j]) sign *= -1;
		}
	}
	return sign;
}

function antisymComps(n, p) {
	function f(n, p) {
		if (p <= 0) return [[]];
		return range(n).map(i => n - i).map(i => f(i - 1, p - 1).map(j => [i, ...j])).flat();
	}
	return f(n, p).map(term => term.map(i => n - i));
}

function texQty(tex, useParens) {
	if (!useParens) return tex;
	if (tex.match(/\\qty\(.*\)/)) return `\\qty{${tex}}`;
	return `\\qty(${tex})`;
}

class Space {
	constructor(signature, {labels=null, indexNotation=true}={}) {
		this.signature = signature;
		this.dim = signature.length;
		this.labels = labels || range(this.dim);
		this.indexNotation = indexNotation;
	}

	SimpleForm() {
		return new SimpleForm(this, ...arguments);
	}

	Form() {
		return new Form(this, ...arguments);
	}

	generalForm(symbol, p) {
		return new Form(this, antisymComps(this.dim, p).map(comps => {
			comps = this.canonicalComps(comps);
			return new SimpleForm(this, comps, {
				coeff: `${symbol}_{${comps.map(i => this.getCoord(i, false)).join('')}}`
			});
		}));
	}

	getCoord(i, index) {
		if (index === undefined) index = this.indexNotation;
		let symbol = this.labels[i];
		return index ? `x^{${symbol}}` : symbol;
	}

	texDerivative(tex, i) {
		return `\\pdv{${tex}}{${this.getCoord(i)}}`;
	}

	isLorentzian() {
		return this.signature.slice(1).every(i => i*this.signature[0] < 0);
	}

	canonicalComps(comps) {
		let newComps;
		if (comps.length === this.dim - 1) {
			// particular preference for writing 2-forms in 3-space to highlight symmetry
			let preferred;
			if (this.dim === 3) {
				preferred = [[1, 2], [2, 0], [0, 1]];
			} else if (this.dim === 4 && this.isLorentzian()) {
				preferred = [[1, 2, 3], [0, 2, 3], [0, 3, 1], [0, 1, 2]];
			}

			if (preferred !== undefined) newComps = preferred[range(this.dim).find(i => comps.indexOf(i) == -1)];
		}

		if (newComps === undefined) newComps = comps.concat().sort();

		return newComps;
	}
}

class Renderable {
	show() {
		katex.render(this.render(), boxEl, {
			displayMode: true,
			macros: macros_physics,
		});
	}
}


class SimpleForm extends Renderable {
	constructor(space, comps, {sign=1, coeff=``}={}) {
		super();
		this.space = space;
		this.comps = comps;
		this.sign = sign;
		this.coeff = coeff;
	}

	HodgeDual() {
		let dualComps = range(this.space.dim).filter(i => this.comps.indexOf(i) === -1);
		let sign = this.sign*signOfPermutation([...this.comps, ...dualComps]);
		this.comps.forEach(i => {
			sign *= this.space.signature[i];
		});
		let newSimpleForm = this.space.SimpleForm(dualComps, {
			sign: sign, coeff: this.coeff
		});
		return newSimpleForm;
	}
	// dual = this.HodgeDual;

	renderCoeff() {
		return `${this.sign > 0 ? '+' : '-'} ${this.coeff}`;
	}

	render() {
		let tex = this.comps.map(
			i => this.space.getCoord(i)
		).map(
			i => `\\dd ${i}`
		).join(`\\wedge `);

		let texCoeff = this.renderCoeff();
		if (!texCoeff.match(/\}\s*$/)) texCoeff += ` \\, `; // add space between symbol and \dd

		return `${texCoeff} ${tex}` || `0`;
	}

	

	canonical() {
		let newComps = this.space.canonicalComps(this.comps);

		let sign = this.sign*signOfPermutation(this.comps)*signOfPermutation(newComps);

		return this.space.SimpleForm(newComps, {sign: sign, coeff: this.coeff});

	}

	

	exteriorDerivative() {
		let terms = [];
		for (var i = 0; i < this.space.dim; i++) {
			if (this.comps.indexOf(i) !== -1) continue;
			terms.push(this.space.SimpleForm([i, ...this.comps], {
				sign: this.sign, coeff: this.space.texDerivative(this.coeff, i)
			}));
		}
		return this.space.Form(terms);

	}
	// d = this.exteriorDerivative;

}
SimpleForm.prototype.d = SimpleForm.prototype.exteriorDerivative;
SimpleForm.prototype.dual = SimpleForm.prototype.HodgeDual;

class Form extends Renderable {
	constructor(space, terms) {
		super();
		this.space = space;
		this.terms = terms;
	}

	render() {
		let tex = this.terms.map(term => term.render()).join(' ');
		return tex.replace(/^\s*\+\s*/, '') || `0`;
	}

	canonical() {
		let leftTerms = [];
		let rightTerms = [];
		this.terms.forEach(term => {
			let comps = term.comps;
			if (String(comps) === String(this.space.canonicalComps(comps))) { // god js why
				// term is already canonical
				leftTerms.push(term);
			} else {
				leftTerms.push(term.canonical());
			}
		});
		return this.space.Form([...leftTerms, ...rightTerms]);
	}

	HodgeDual() {
		return this.space.Form(this.terms.map(term => term.HodgeDual()));
	}
	// dual = this.HodgeDual;


	exteriorDerivative() {
		return this.space.Form(this.terms.map(term => term.exteriorDerivative().terms).flat());
	}
	// d = this.exteriorDerivative;

	collectTerms() {
		let byKey = {};
		this.terms.forEach(term => {
			let key = String(term.comps);
			if (!(key in byKey)) byKey[key] = {};
			byKey[key].comps = term.comps;
			if (byKey[key].terms === undefined) byKey[key].terms = [];
			byKey[key].terms.push(term);
		})
		for (let key in byKey) {
			if (byKey[key].terms.length === 2) { // curl type
				byKey[key].terms.sort(term => -term.sign);
			}
			byKey[key].coeff = byKey[key].terms.map(term => term.renderCoeff()).join(' ');
		}

		let newTerms = Object.keys(byKey).map(key => this.space.SimpleForm(byKey[key].comps, {
			coeff: texQty(byKey[key].coeff.replace(/^\s*\+\s*/, ''), byKey[key].terms.length > 1)
		,	sign: 1
		}));;

		return this.space.Form(newTerms);
	}
}
Form.prototype.d = Form.prototype.exteriorDerivative
Form.prototype.dual = Form.prototype.HodgeDual


function R(n) {
	let labels = n <= 3 ? 'xyz'.substr(0, n) : null;
	return new Space(Array(n).fill(1), {labels: labels});
}

Minkowski = new Space([-1, 1, 1, 1], {labels: 'txyz'});

[dx, dy, dz] = range(3).map(i => R(3).SimpleForm([i]));