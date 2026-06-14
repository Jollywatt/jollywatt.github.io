#metadata((
  date: datetime(year: 2021, month: 07, day: 09),
  blurb: [
    A collection of succinct but wonderfully satisfying mathematical results.
  ],
  image: "/assets/math-collage.png",
  categories: ("maths", "interactive"),
))

#title[Mathematical One-liners]

This is a collection of succinct but wonderfully satisfying theorems.
The punchlines are hidden; try to guess the blanks!
#strong(link("javascript:toggleNames();")[Toggle theorem names.])
#strong(link("javascript:toggleSpoilers();")[Toggle spoilers.])

#let spoiler(it) = html.span(class: "spoiler", it)

#let fact(body, name: none) = {
  if name == none [- #body]
  else [
    - #body \ #emph(html.span(class: "theorem-name", name))
  ]
}
#fact(name: [Liouville's theorem])[Any bounded complex differentiable function is #spoiler[constant].]

#fact(name: [Jordan normal form])[Any matrix is similar to an #spoiler[upper triangular matrix].]

#fact(name: [Cauchy's integral theorem])[The integral of a holomorphic function around a loop #spoiler[vanishes identically].]

#fact(name: [Riemann Mapping Theorem])[Strict subsets of $CC$ which are #spoiler[nonempty, open, and simply connected] are related by a conformal mapping.]

#fact[A complete ordered field is #spoiler[isomorphic to the real line].]

#fact[Every field is a subfield of #spoiler[the surreal numbers].]

#fact(name: [Cayley's theorem])[All groups are #spoiler[permutation] groups.]

#fact(name: [Lagrange's theorem])[The order of a finite group is #spoiler[divisible by] the orders of its subgroups.]

#fact(name: [Fundamental theorem of finite Abelian groups])[A finite Abelian group is a direct sum of #spoiler[prime-order cyclic groups].]

#fact[The $ZZ$-modules are exactly the #spoiler[Abelian groups].]

#fact(name: [Cayley–Hamilton theorem])[A square matrix #spoiler[satisfies] its own characteristic polynomial.]

#fact(name: [Green–Tao theorem])[There are #spoiler[arbitrarily long] arithmetic progressions of primes.]

#fact(name: [Dirichlet's Theorem])[Every proper arithmetic sequence contains #spoiler[infinitely many] primes.]

#fact[Two random infinite graphs are #spoiler[isomorphic] with probability one.]

#fact(name: [Hurwitz's Theorem])[Every normed division algebra is #spoiler[isomorphic] to $RR$, $CC$, $HH$ or $OO$.]



#html.script(```js
function toggleSpoilers() {
		document.body.classList.toggle("spoiled")
}
function toggleNames() {
		document.body.classList.toggle("shownames")
}
```.text)

#html.style(```css
.spoiler {
		transition: 1s;
		color: transparent;
		border-bottom: 1px dashed #0005;
}

.spoiler:hover, .spoiled .spoiler {
		color: inherit;
		border-bottom: 1px dashed transparent;
}

.theorem-name::before { content: "("; color: initial }
.theorem-name::after { content: ")"; color: initial }

.theorem-name {
		transition: 1s;
		color: transparent;
		border-bottom: 1px dashed #0005;
}

.theorem-name:hover, .shownames ul em {
		color: inherit;
		border-bottom: 1px dashed transparent;
}
```.text)
