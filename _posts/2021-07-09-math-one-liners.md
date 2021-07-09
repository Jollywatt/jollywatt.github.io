---
layout: post
title: "Mathematical One-liners"
author: "Joseph Wilson"
categories: journal
tags: [maths]
image: mandel.png
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

A collection of succinct but wonderfully satisfying mathematical results.
<!-- split -->
<a href="mailto:joseph.wilson@sms.vuw.ac.nz">Email me</a> if you have a good one!
Try to guess the blanks. Click to <button onclick="toggleSpoilers()">toggle “spoilers”.</button>

- **(Fundamental theorem of finite Abelian groups)** <br>
	A finite Abelian group is a direct sum of <span class="spoiler">prime-order cyclic groups</span>.


- The $$ℤ$$-modules are exactly the <span class="spoiler">Abelian groups</span>.

- A bounded entire function is <span class="spoiler">constant</span>.

- The only complete ordered field is <span class="spoiler">the real line</span>.

- **(Cayley’s theorem)** <br>
	All groups are <span class="spoiler">permutation groups</span>.


- **(Lagrange’s theorem)** <br>
	The order of a finite group is <span class="spoiler">divisible by</span> the orders of its subgroups.


- **(Cayley–Hamilton theorem)** <br>
	A square matrix <span class="spoiler">satisfies</span> its own characteristic polynomial.

