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
	document.body.classList.toggle("spoiled")
}
function toggleNames() {
	document.body.classList.toggle("shownames")
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

ul em::before { content: "("; color: initial }
ul em::after { content: ")"; color: initial }

ul em {
	transition: 1s;
	color: transparent;
	border-bottom: 1px dashed #0005;
}

ul em:hover, .shownames ul em {
	color: inherit;
	border-bottom: 1px dashed transparent;
}

</style>

This is a collection of succinct but wonderfully satisfying theorems.
Leave a comment if you have a good one!

The punchlines are hidden; try to guess the blanks!<br>
<a onclick="toggleNames()">Toggle theorem names.</a><br>
<a onclick="toggleSpoilers()">Toggle spoilers.</a>


- *Liouville's theorem* <br>
	Any bounded complex differentiable function is <span class="spoiler">constant</span>.

- *Jordan normal form* <br>
	Any matrix is similar to an <span class="spoiler">upper triangular matrix</span>.

- *Cauchy’s integral theorem* <br>
	The integral of a holomorphic function around a loop <span class="spoiler">vanishes identically</span>.

- *Riemann Mapping Theorem* <br>
	Strict subsets of $$ℂ$$ which are <span class="spoiler">nonempty, open, and simply connected</span> are related by a conformal mapping.

- A complete ordered field is <span class="spoiler">isomorphic to the real line</span>.

- Every field is a subfield of <span class="spoiler">the surreal numbers</span>.

- *Cayley’s theorem* <br>
	All groups are <span class="spoiler">permutation</span> groups.

- *Lagrange’s theorem* <br>
	The order of a finite group is <span class="spoiler">divisible by</span> the orders of its subgroups.

- *Fundamental theorem of finite Abelian groups* <br>
	A finite Abelian group is a direct sum of <span class="spoiler">prime-order cyclic groups</span>.

- The $$ℤ$$-modules are exactly the <span class="spoiler">Abelian groups</span>.

- *Cayley–Hamilton theorem* <br>
	A square matrix <span class="spoiler">satisfies</span> its own characteristic polynomial.

- *Green–Tao theorem* <br>
	There are <span class="spoiler">arbitrarily long</span> arithmetic progressions of primes.

- *Dirichlet’s Theorem* <br>
	Every proper arithmetic sequence contains <span class="spoiler">infinitely many</span> primes.

- Two random infinite graphs are <span class="spoiler">isomorphic</span> with probability one.

- *Hurwitz’s Theorem* <br>
	Every normed division algebra is <span class="spoiler">isomorphic to $$ℝ$$, $$ℂ$$, $$ℍ$$ or $$𝕆$$.
