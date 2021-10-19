---
layout: post
title: "A Simple Example of a Connection With Torsion"
author: "Joseph Wilson"
categories: math
tags: []
blurb: Interactive timeline of famous scientists throughout history, using Wikidata.
---


While learning general relativity as an undergrad, I was always uneasy with the idea of _torsion_ in relation to affine connections.
I was familiar with phrases like, “torsion measures how a frame _twists_ as it undergoes parallel transport,” but was sceptical to allow this lofty phrase serve as a mental image.
It was only until I found some examples that indeed I realised that this _is_ precisely what torsion measures.

The following example is one which gave me an _aha!_ moment.

## A “rolling” connection on $$ℝ^2$$.

Consider a connection on the plane defined in such a way that a vector undergoing parallel transport rotates in the $$xy$$-plane in proportion to its motion along the $$x$$-direction.
That is, define a connection so that the vector field defined by

$$
\vec u(x, y) = \mqty( \cos kx \\ \sin kx)
,$$

which spins counter-clockwise when moving in the $$+x$$-direction, is covariantly constant, $$∇_μ \vec u = 0$$.


We can write the covariant derivative
$$
∇_μu^a = ∂_μu^a + Γ^a{}_{μb}u^b
$$
more easily by reading the Latin indices as the two components of a matrix.
Then, for differentiation in the $$x$$-direction, we have

$$
∇_x \vec u = ∂_x \vec u + Γ_x \vec u
= \mqty(-k\sin kx \\ +k\cos kx) + Γ_x \mqty( \cos kx \\ \sin kx)
$$

where $$ Γ_x \vec u$$ is matrix multiplication.
Enforcing $$∇_x \vec u = 0$$ implies that the matrix $$Γ_x$$ must be

$$
Γ_x = \mqty(Γ^x{}_{xx} & Γ^x{}_{xy} \\ Γ^y{}_{xx} & Γ^y{}_{xy})
= \mqty(0 & -k \\ +k & 0)
.$$

The $$y$$-direction is trivial, since $$\vec u$$ does not depend on $$y$$.
And so,
$$
∇_y \vec u = ∂_y \vec u + Γ_y\vec u = Γ_y\vec u 
$$
is zero only when

$$
Γ_y = \mqty(Γ^x{}_{yx} & Γ^x{}_{yy} \\ Γ^y{}_{yx} & Γ^y{}_{yy})
= \mqty(0 & 0 \\ 0 & 0)
.$$

### This connection has zero curvature...

If we calculated the Riemann curvature
$$
R = \dd Γ + Γ ∧ Γ
,$$
we would find that this connection is flat, since $$\dd Γ = 0$$ (all Christoffel symbols are constant) and

$$
Γ ∧ Γ
% = (Γ_x \dd x + Γ_y \dd y) ∧ (Γ_x \dd x + Γ_y \dd y)
= (Γ_x Γ_y - Γ_y Γ_x) \, \dd x ∧ \dd y
= 0
$$

also vanishes since $$Γ_y = 0$$.


### ...but non-zero torsion

However, the torsion
$$
T^λ{}_{μν} = Γ^λ{}_{μν} - Γ^λ{}_{νμ}
$$
does not vanish:

$$
T_x = \mqty(T^x{}_{xx} & T^x{}_{xy} \\ T^y{}_{xx} & T^y{}_{xy}) = \mqty(0 & -k \\ 0 & 0)
,\qquad
 T_y = \mqty(T^x{}_{yx} & T^x{}_{yy} \\ T^y{}_{yx} & T^y{}_{yy}) = \mqty(+k & 0 \\ 0 & 0)
.$$

We can see that the torsion measures the wavenumber $$k$$ controlling the rate at which vectors spin when parallel transported along the $$x$$ axis.