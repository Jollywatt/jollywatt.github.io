---
layout: post
title: "Mathematical One-liners"
author: "Joseph Wilson"
categories: interactive
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


- *(Liouville's theorem)* <br>
	A bounded complex differentiable function is <span class="spoiler">constant</span>.

- *(Cauchy’s integral theorem)* <br>
	The integral of a holomorphic function around a loop <span class="spoiler">vanishes identically</span>.

- A complete ordered field is <span class="spoiler">the real line</span>.

- *(Cayley’s theorem)* <br>
	All groups are <span class="spoiler">permutation</span> groups.

- *(Lagrange’s theorem)* <br>
	The order of a finite group is <span class="spoiler">divisible by</span> the orders of its subgroups.

- *(Fundamental theorem of finite Abelian groups)* <br>
	A finite Abelian group is a direct sum of <span class="spoiler">prime-order cyclic groups</span>.

- The $$ℤ$$-modules are exactly the <span class="spoiler">Abelian groups</span>.

- *(Cayley–Hamilton theorem)* <br>
	A square matrix <span class="spoiler">satisfies</span> its own characteristic polynomial.

- *(Green–Tao theorem)* <br>
	There are <span class="spoiler">arbitrarily long</span> arithmetic progressions of primes.

- *(Dirichlet’s Theorem)* <br>
	Every proper arithmetic sequence contains <span class="spoiler">infinitely many</span> primes.

- Two random infinite graphs are <span class="spoiler">isomorphic</span> with probability one.