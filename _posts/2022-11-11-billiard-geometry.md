---
layout: post
title: "Billiard geometry: Visually solving elastic collisions"
author: "Joseph Wilson"
categories: interactive
tags: []
blurb: A neat relationship between elastic collisions and ellipses.
---

<link rel="stylesheet" href="https://vectorjs.org/library.css">

<style>
.control .point { fill: black; }
.control .handle { stroke: black; }

div[id^="figure"] {
	margin: auto;
	width: min-content;
}
div[id^="figure"] svg {
	box-shadow: 2px 4px 10px #0001 inset;
	border-radius: 10px;	
}
</style>

<script src="assets/vector.min.js"></script>
<script src="projects/billiards/vector.js"></script>

Suppose two bodies with initial momentum vectors $$𝒑_1$$ and $$𝒑_2$$ collide, so that the final momenta are $$𝒑_1'$$ and $$𝒑'_2$$.

<div id="figure-1"></div>

If no restrictions are placed on these four momentum vectors, then we can describe all kinds of collisions, including ones that violate momentum and energy conservation.

## Conservation of momentum

Momentum is always conserved, so that

$$ 𝒑_1 + 𝒑_2 = 𝒑_\text{total} = 𝒑'_1 + 𝒑'_2 .$$

We can more easily visualise this constraint by drawing the momentum vectors tip-to-tail.
The initial and final vector pairs must both extend to the same $$𝒑_\text{total}$$.

<div id="figure-2"></div>

The collisions we can describe look more realistic now that momentum is conserved, but we can still create or destroy kinetic energy…

## Conservation of energy

Energy conservation is a bit more interesting.
In an elastic collision, the total kinetic energy is conserved:

$$ \frac{(𝒑_1)^2}{2m_1} + \frac{(𝒑_2)^2}{2m_2} = T_\text{total} = \frac{(𝒑_1')^2}{2m_1} + \frac{(𝒑_2')^2}{2m_2} $$

If the masses are equal, this implies $$ \sqrt{(𝒑_1)^2 + (𝒑_2)^2} = \ell = \sqrt{(𝒑'_1)^2 + (𝒑'_2)^2} $$, with the geometric interpretation that the total of the “lengths” of the momentum vectors is the same before and after the collision.
This is the defining property of an ellipse with the origin and $$p_\text{total}$$ as foci:

<div id="figure-3"></div>

Now, all the scenarios we can describe are plausible elastic collisions.

## Angle of contact

To complete the picture, the tangent line at which the bodies kiss is found geometrically by connecting the ellipse points.

<div id="figure-4"></div>

Now, everything looks right, no matter what you do to the points!