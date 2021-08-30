---
layout: post
title: "Explicit Baker-Campbell-Hausdorff-Dynkin formula for Spacetime via Geometric Algebra"
author: "Joseph Wilson and Matt Visser"
categories: research
link: https://arxiv.org/abs/2107.00343
link_label: arχiv
tags: [physics, mathematics]
---

**Abstract.**
We present a compact Baker–Campbell–Hausdorff–Dynkin formula for the composition of Lorentz transformations $$e^{σ_i}$$ in the spin representation (a.k.a. Lorentz rotors) in terms of their generators $$σ_i$$:

$$
	\ln(e^{σ_1}e^{σ_2}) =
	\tanh^{-1}(\frac{
		\tanh σ_1 + \tanh σ_2 + \frac12[\tanh σ_1, \tanh σ_2]
	}{
		1 + \frac12\qty{\tanh σ_1, \tanh σ_2}
	})
$$

This formula is general to geometric algebras (a.k.a. real Clifford algebras) of dimension $$≤ 4$$, naturally generalising Rodrigues' formula for rotations in $$ℝ^3$$.
In particular, it applies to Lorentz rotors within the framework of Hestenes' spacetime algebra, and provides an efficient method for composing Lorentz generators.
Computer implementations are possible with a complex $$2×2$$ matrix representation realised by the Pauli spin matrices.
The formula is applied to the composition of relativistic $$3$$-velocities yielding simple expressions for the resulting boost and the concomitant Wigner angle.