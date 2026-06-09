#metadata((
  date: datetime(year: 2021, month: 07, day: 12),
  blurb: [
    A paper on composing Lorentz transformations in terms of their bivector generators using the geometric algebra of spacetime, submitted to the International Journal of Geometric Methods in Modern Physics.
  ],
  categories: ("research", "maths")
))

#title[Explicit Baker–Campbell–Hausdorff–Dynkin formula for Spacetime via Geometric Algebra]

Joseph Wilson, Matt Visser

*In brief.*
In $≤4$ dimensions, there's a simple formula for the bivector $sigma_3$ in terms of bivectors $sigma_1$ and $sigma_2$ such that $e^(sigma_1) e^(sigma_2) = plus.minus e^(sigma_3)$.

*Abstract.*
We present a compact Baker–Campbell–Hausdorff–Dynkin formula for the composition of Lorentz transformations $e^(sigma_i)$ in the spin representation (a.k.a. Lorentz rotors) in terms of their generators $sigma_i$:

$
  ln(e^(sigma_1)e^(sigma_2)) =
	tanh^(-1)((
		tanh sigma_1 + tanh sigma_2 + 1/2 [tanh sigma_1, tanh sigma_2]
	)/(
		1 + 1/2 {tanh sigma_1, tanh sigma_2}
	))
$

This formula is general to geometric algebras (a.k.a. real Clifford algebras) of dimension $≤ 4$, naturally generalising Rodrigues' formula for rotations in $RR^3$.
In particular, it applies to Lorentz rotors within the framework of Hestenes' spacetime algebra, and provides an efficient method for composing Lorentz generators.
Computer implementations are possible with a complex $2×2$ matrix representation realised by the Pauli spin matrices.
The formula is applied to the composition of relativistic $3$-velocities yielding simple expressions for the resulting boost and the concomitant Wigner angle.

*Full paper.* At #link("https://doi.org/10.1142/S0219887821502261")[doi.org/10.1142/S0219887821502261] and on #link("https://doi.org/10.48550/arXiv.2107.00343")[Arχiv].
