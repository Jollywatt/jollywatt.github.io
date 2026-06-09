#metadata((
  date: datetime(year: 2021, month: 10, day: 19),
  categories: ("maths",),
  blurb: [
    A minimal example of a connection on the plane which exhibits torsion.
  ],
  permalink: "simple-torsion-example",
))

#title[A Simple Example of a Connection With Torsion]

While learning general relativity as an undergrad, I was uneasy with the idea of _torsion_ of an affine connection.
Familiar phrases like "torsion measures how a frame _twists_ as it undergoes parallel transport" seemed too lofty to serve as a helpful mental model.

The following example is one which gave me an _aha!_ moment.

= A "rolling" connection on $RR^2$.

Consider a connection on the plane defined in such a way that a vector undergoing parallel transport rotates in the $x y$-plane in proportion to its motion along the $x$-direction.
That is, define a connection so that the vector field defined by
$ arrow(u)(x, y) = (cos k x, sin k x) $
which spins counter-clockwise when moving in the $+x$-direction, is covariantly constant, $nabla_mu vec u = 0$.


We can write the covariant derivative
$
  nabla_(mu u)^a = partial_mu u^a + Gamma^a_(mu b) u^b
$
more easily by reading the Latin indices as the two components of a matrix.
Then, for differentiation in the $x$-direction, we have
$
  nabla_x arrow(u) = partial_x arrow(u) + Gamma_x arrow(u)
  = vec(-k sin k x, +k cos k x) + Gamma_x vec(cos k x, sin k x)
$
where $$ Gamma_x arrow(u)$$ is matrix multiplication.
Enforcing $∇_x arrow(u) = 0$ implies that the matrix $Gamma_x$ must be
$
  Gamma_x = mat(Gamma^x#none _(x x), Gamma^x#none _(x y); Gamma^y#none _(x x), Gamma^y#none _(x y))
  = mat(0, -k; +k, 0)
  .
$
The $y$-direction is trivial, since $arrow(u)$ does not depend on $y$.
And so,
$
  nabla_y arrow(u) = partial_y arrow(u) + Gamma_y arrow(u) = Gamma_y arrow(u)
$
is zero only when
$
  Gamma_y = mat(Gamma^x#none _(y x), Gamma^x#none _(y y); Gamma^y#none _(y x), Gamma^y#none _(y y))
  = mat(0, 0; 0, 0)
  .
$

== This connection has zero curvature...

If we calculated the Riemann curvature
$ R = dif Gamma + Gamma ∧ Gamma, $
we would find that this connection is flat, since $dif Gamma = 0$ (all Christoffel symbols are constant) and

$
  Gamma ∧ Gamma & = (Gamma_x dif x + Gamma_y dif y) ∧ (Gamma_x dif x + Gamma_y dif y) \
                & = (Gamma_x Gamma_y - Gamma_y Gamma_x) dif x ∧ dif y
                  = 0
$

also vanishes since $Gamma_y = 0$.

== ...but non-zero torsion

However, the torsion
$
  T^λ#none _(mu ν) = Gamma^λ#none _(mu ν) - Gamma^λ#none _(ν mu)
$
does not vanish:
$
  T_x = mat(T^x#none _(x x), T^x#none _(x y); T^y#none _(x x), T^y#none _(x y)) = mat(0, -k; 0, 0),
  quad
  T_y = mat(T^x#none _(y x), T^x#none _(y y); T^y#none _(y x), T^y#none _(y y)) = mat(+k, 0; 0, 0)
  .
$
We can see that the torsion measures the wavenumber $k$ controlling the rate at which vectors spin when parallel transported along the $x$ axis.
