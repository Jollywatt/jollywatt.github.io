---
layout: post
title: "Mathematical One-liners"
author: "Joseph Wilson"
categories: maths
tags: [mathematics]
image: math-collage.png
blurb: >
 A collection of succinct but wonderfully satisfying mathematical results.
---

<script>
function toggleSpoilers() {
	let classes = document.body.classList
	if (classes.contains("spoiled")) {
		classes.remove("spoiled")
	} else {
		classes.add("spoiled")
	}
}
</script>

<style>
.spoiler {
	transition: 1s;
	color: transparent;
	border-bottom: 1px dashed #0005;
}

.spoiler:hover, .spoiled .spoiler {
	color: inherit;
	border-bottom: 1px dashed transparent;
}
</style>

This is a collection of succinct but wonderfully satisfying theorems.
[Email me](mailto:joseph.wilson@sms.vuw.ac.nz) if you have a good one!

The punchlines are hidden; try to guess the blanks or <a onclick="toggleSpoilers()">toggle “spoilers”</a>.

- *(Fundamental theorem of finite Abelian groups)* <br>
	A finite Abelian group is a direct sum of <span class="spoiler">prime-order cyclic groups</span>.


- The $$ℤ$$-modules are exactly the <span class="spoiler">Abelian groups</span>.

- A bounded entire function is <span class="spoiler">constant</span>.

- The only complete ordered field is <span class="spoiler">the real line</span>.

- *(Cayley’s theorem)* <br>
	All groups are <span class="spoiler">permutation groups</span>.


- *(Lagrange’s theorem)* <br>
	The order of a finite group is <span class="spoiler">divisible by</span> the orders of its subgroups.


- *(Cayley–Hamilton theorem)* <br>
	A square matrix <span class="spoiler">satisfies</span> its own characteristic polynomial.

- *(Green–Tao theorem)* <br>
	There are <span class="spoiler">arbitrarily long</span> arithmetic progressions of primes.

- *(Dirichlet’s Theorem)* <br>
	Every proper arithmetic sequence contains <span class="spoiler">infinitely many</span> primes.