---
layout: post
title: The Many Faces of Stokes’ Theorem
categories: interactive
blurb: >
  Interactively tabulate the special cases of Stokes’ theorem, \( \int_Ω \dd ω = \int_{∂Ω} ω \).
---

{% assign project_url = site.github.url | append: "projects/stokes-theorem/" %}

The [generalised Stokes theorem](https://en.wikipedia.org/wiki/Stokes%27_theorem) has the remarkably compact form

$$ \boxed{ \int_Ω \dd ω = \int_{∂Ω} ω } $$

where $$Ω$$ is a $$k$$-dimensional [manifold with boundary](https://en.wikipedia.org/wiki/Manifold#Manifold_with_boundary) $$∂Ω$$, and $$ω$$ is a $$(k - 1)$$-form on $$Ω$$.

While it may seem alien at first when expressed in full generality, you may recognise some of the many special cases of Stokes’ theorem, especially from vector calculus.

## Special cases of Stokes’ theorem:

Adjust the parameters below or select a preset to see the associated Stokes theorem.

- <button onclick="thm(0, 1)">Fundamental Theorem</button>
- <button onclick="thm(0, 0)">Gradient Theorem</button>
- <button onclick="thm(1, null, true)">Divergence Theorem</button>
- <button onclick="thm(1, null, true, [1, -1, -1, -1])">Divergence Theorem (Lorentzian)</button>
- <button onclick="thm(1, 2)">Green’s (2D curl) Theorem</button>
- <button onclick="thm(1, 3)">Kelvin–Stokes (3D curl) Theorem</button>

<table id="parametersTableEl" style="white-space: nowrap;">
	<tr>
		<th colspan="2">Ambient Space:</th>
		<td class="output" name="n"></td>
		<td><input class="input" type="range" name="n" min="0" max="5" value="1"></td>
		<td>Metric signature: </td>
		<td contenteditable class="input output" name="sig" style="font-family: monospace; width: 5em;"></td>
	</tr>
	<tr>
		<th colspan="2">Differential Form:</th>
		<td class="output" name="p"></td>
		<td><input class="input" type="range" name="p" min="-1" max="4" value="0"></td>
		<td><label for="dualCheckbox"><input class="input" type="checkbox" name="dual" id="dualCheckbox">Hodge dual:</label></td>
		<td class="output" name="dual"></td>
	</tr>
</table>

The metric signature is relevant to the [Hodge dual](https://en.wikipedia.org/wiki/Hodge_star_operator) operation (which requires the notion of a metric). Divergence-type theorems arise naturally when $$ω$$ is the Hodge dual of a $$1$$-form.

<div id="boxEl"></div>

<style>
table#parametersTableEl {
  border: none;
}
table#parametersTableEl td, table#parametersTableEl th {
	padding: 1ex;
	border: none;
}
table#parametersTableEl td:nth-child(2n), table#parametersTableEl th:nth-child(2n) {
	text-align: right;
}
table#parametersTableEl td label, table#parametersTableEl th label {
	display: block;
}
</style>


<script src="{{ project_url }}/main.js"></script>
<script src="{{ project_url }}/exterior_algebra.js"></script>