---
layout: post
title: "Billiard geometry: Visually solving elastic collisions"
author: "Joseph Wilson"
tags: []
blurb: stuff
---

<link rel="stylesheet" href="https://vectorjs.org/library.css">

<style>
.control .point { fill: black; }
.control .handle { stroke: black; }
</style>

<script src="assets/vector.min.js"></script>
<script src="projects/billiards/vector.js"></script>


<div id="figure-1"></div>

## Conservation of momentum

Momentum is always conserved.
If $$𝒑_1$$ and $$𝒑_2$$ are the initial momentum vectors of the two incident bodies, then

$$ 𝒑_1 + 𝒑_2 = 𝒑'_1 + 𝒑'_2 $$

where $$'$$ indicates the value after the collision.

We can more easily visualise this constraint by drawing the momenta tip-to-tail, connecting to the same total momentum before and after the collision:

<div id="figure-2"></div>

## Conservation of energy

<div id="figure-3"></div>