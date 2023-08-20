---
layout: post
title: "Hands-on general relativity with Julia"
author: "Joseph Wilson"
categories: math
tags: []
draft: true
---

Four years after I took general relativity, my professor asked me to send him an old animation I had made during his course showing “parallel transport of vectors around a line of latitude on the sphere” — except I wasn’t the one who had made it (though I was flattered that he had thought so!)
Even so, I didn’t want to respond empty handed…

The tool I reached for was Julia. To my delight, the whole thing was rather simple to make.
This was the humble result:

<video src="{{ site.github.url }}/assets/media/latitude-parallel-transport.mp4" width="50%" controls></video>

I remember thinking that numerically computing geodesics or simulating parallel transport were frightfully involved and required a mess of technical computing. Not so.
If you have similar impression, read on.


## Step 0: Maps between manifolds

<!-- When deciding how to deal with manifolds and maps between them with a computer, there were two main directions to go: represent them symbolically and use a CAS to do all the algebra; or represent them numerically.

I chose to stick with numbers. This allows us to 
 -->
The very first task is to decide how to represent the main mathematical objects.
Manifolds and homomorphisms between them can feel complicated and abstract, but with a choice of coordinates, they’re just vectors and functions vectors to vectors.

Here’s an embedding $$f: 𝕊^2 → ℝ^3$$ of a sphere into 3D space using the usual spherical coordinates $$(θ, φ)$$, as a Julia function:

```julia
f((θ, φ)) = [
  sin(θ)cos(φ),
  sin(θ)sin(φ),
  cos(θ),
]
```

Notice this has one vector argument which is de-structured into two scalars.

```julia
julia> f([π/2, 0]) # meridian point on the equator
3-element Vector{Float64}:
 1.0
 0.0
 6.123233995736766e-17
```

You could imagine doing something fancier and more object-oriented, like defining a `Manifold` in terms of charts and transition functions. Don’t. Dead simple is good.

## Step 1: Automatic differentiation

Differential geometry has lots of ‘$$∂$$’s.
We want to have derivatives of homomorphisms such as `f` be computed _automatically_.
There are many approaches to doing this with Julia, ranging from using [`Symbolics.jl`](https://juliapackages.com/p/Symbolics) for algebraic differentiation to using [`Zygote.jl`](https://juliapackages.com/p/Zygote) and friends to differentiate code.

In our case, we’re not doing anything fancy, just making vectors from mathematical functions line `sin`, so all we’ll need are dual numbers.

### Dual numbers

If you extend the reals by adding an element $$ε ≠ 0$$ satisfying $$ε^2 = 0$$, then you can get derivative information for free when you evaluate a function $$f$$ with a $$+ε$$, since

$$
f(x + ε) = f(x) + ε f'(x)
.$$

The real part is the value, and the derivative is the $$ε$$-part, which we denote with $$⟨\quad⟩_ε$$.

$$
f'(x) = ⟨f(x + ε)⟩_ε = \frac{f(x + ε) - f(x)}{ε}
$$

To do this in Julia, the [`TaylorSeries.jl`](https://juliapackages.com/p/TaylorSeries) package is fine. 
Here’s $$\sin(x + ε)$$ at $$x = π/3$$…

```julia
julia> using TaylorSeries

julia> sin(Taylor1([π/3, 1]))
 0.8660254037844386 + 0.5000000000000001 t + 𝒪(t²)

julia> ans[1] # get the ε-part
0.5000000000000001

julia> ans == cos(π/3)
true
```

### Computing Jacobians

This trick works for functions of vectors, too.
We simply add $$+ε$$ to the component we want to differentiate with respect to:

$$
∂_μ f(\vec x) = \bigg⟨ f\left(\begin{bmatrix}x^1 \\ \vdots \\ x^μ + ε \\ \vdots \\ x^n \end{bmatrix}\right) \bigg⟩_ε
$$

For a function $$f : ℝ^m → ℝ^n$$, we have a matrix of derivatives (a Jacobian).

$$
\mqty[
∂_μ f^ν(\vec x)
]_{μν} =
\mqty[
∂_1 \vec f(\vec x) \\
\vdots \\
∂_n \vec f(\vec x)
] =
\mqty[
∂_1 f^1(\vec x) & \cdots & ∂_1 f^m(\vec x) \\
\vdots & \ddots & \vdots \\
∂_n f^1(\vec x) & \cdots & ∂_n f^m(\vec x)
]
$$


We want to be able to compute the whole Jacobian matrix with the first dimension (columns) running along the first index that appears, $$μ$$, and the second dimension (rows) along the second index, $$ν$$.

$$
\mqty[
\bigg⟨f^1\qty(\mqty[x^1 + ε\\\vdots\\x^n])\bigg⟩_ε & \cdots & \bigg⟨f^m\qty(\mqty[x^1 + ε\\\vdots\\x^n])\bigg⟩_ε \\
\vdots & \ddots & \vdots \\
\bigg⟨f^1\qty(\mqty[x^1\\\vdots\\x^n + ε])\bigg⟩_ε & \cdots & \bigg⟨f^m\qty(\mqty[x^1\\\vdots\\x^n + ε])\bigg⟩_ε \\
]
$$

Here’s a literal Julia implementation:

```julia
"""
Jacobian matrix of a vector-to-vector function.
"""
function ∂(f, x)
  I = eachindex(x)
  derivs = [f([Taylor1([x[i], i == j]) for i ∈ I]) for j ∈ I]
  matrix = stack(derivs, dims=1) # stack the vectors into rows of a matrix
  getindex.(matrix, 1) # take ε-part of each component
end
```

Let’s test it on our sphere embedding map `f` by comparing it to the analytic Jacobian.

```julia
julia> ∂f((θ, φ)) = [
           +cos(θ)cos(φ) +cos(θ)sin(φ) -sin(θ)
           -sin(θ)sin(φ) +sin(θ)cos(φ)       0
       ];

julia> all(∂(f, x) ≈ ∂f(x) for x in eachcol(rand(2,100)))
true
```
So far so good.

### Higher order derivatives

But what about second order derivatives?

Luckily, since this is Julia, `TaylorSeries.jl` is generic and lets you construct Taylor series whose coefficients are themselves Taylor series.

This means our implementation for `∂` works even on functions which call `∂`, lettings us compute higher order derivatives in the obvious way.
For example, $$∂_μ ∂_ν f^λ(\vec x)$$ is written as:

```julia
∂∂f(x) = ∂(x′ -> ∂(f, x′), x)
```

Notice that this produces a three dimensional array, since $$∂_μ ∂_ν f^λ(\vec x)$$ has three free indices.

```julia
julia> ∂∂f([1,2])
2×2×3 Array{Float64, 3}:
[:, :, 1] =
  0.350175  -0.491295
 -0.491295   0.350175

[:, :, 2] =
 -0.765147  -0.224845
 -0.224845  -0.765147

[:, :, 3] =
 -0.540302  -0.0
 -0.0       -0.0
```

We can get a particular component with normal multidimensional indexing, like `∂∂f(x)[μ,ν,λ]`.
(This shows how `∂` diverges slightly from other Jacobian implementations: it doesn’t flatten extra dimensions.)


## Step 2: Metrics and Christoffel symbols

To compute geodesics on things like spheres or tori, we need the metric $$g_{μν}$$ and Christoffel symbols $$Γ^λ{}_{μν}$$.


### Induced metrics

If we already have a parametric description of the surface in $$ℝ^n$$, such as our sphere embedding $$f$$, then we should be able to get the surface metric induced by the ambient Euclidean metric, $$η = \operatorname{diag}(1, \dots, 1)$$.
Specifically, we need pullback of $$η$$ by $$f$$.

$$
g \coloneqq f^*η
$$

This is the same as

$$
g(\vec u, \vec v) = η(f_*\vec u, f_*\vec v)
$$

where $$f_*$$ is the pushforward — nothing but the Jacobian, given coordinates:

$$
(f_* \vec u )^ν\big|_{\vec x} = ∂_μ f^ν(\vec x) \, u^μ
$$

Therefore, the component form of $$g(\vec u, \vec v)$$ is

$$
\begin{align*}
g_{μν} u^μ v^ν &= η_{ρσ} \, ∂_μ f^ρ u^μ \, ∂_ν f^σ u^ρ \\
g_{μν} &= ∂_ρ f^μ \, η_{μν} \, ∂_σ f^ν \\
\end{align*}
$$

Really, this is matrix-matrix multiplication.

$$
g = f_* η (f_*)^\intercal = f_* (f_*)^\intercal
$$

The Julia translation is just as pretty:

```julia
g(x) = let ∂f = ∂(f, x)
  ∂f*∂f'
end
```

Let’s sanity check it again:

```julia
julia> g_sphere((θ, ϕ)) = [
           1        0
           0 sin(θ)^2
       ];

julia> all(g(x) ≈ g_sphere(x) for x in eachcol(rand(2, 100)))
true
```

### Christoffel symbols

Now comes the interesting maths.
We’ll need the Christoffel symbols, which are

$$
Γ^λ{}_{μν} = \frac12g^{λσ}\qty(\partial_μ g_{σν} + \partial_ν g_{σμ} - \partial_σ g_{μν})
.$$

Implementing this in Julia is just a matter of summing over all the right components.
A nice way of doing this is to use an Einstein summation package like [`TensorOperations.jl`](https://juliapackages.com/p/TensorOperations) which provides a macro for enabling summation convention.

```julia
using TensorOperations

function Γ(g, x)
  ∂g = ∂(g, x)
  @tensor Γ[λ,μ,ν] := 2\inv(g(x))[λ,σ]*(∂g[μ,σ,ν] + ∂g[ν,σ,μ] - ∂g[σ,μ,ν])
end
```

Within the `@tensor` expression, any Julia identifier inside `[ ]` is treated as an index, whose range is automatically computed at runtime, with repeated indices implicitly summed.
The `:=` means a new array is created.

To test it out and check that the basic symmetry $$Γ^λ{}_{μν} = Γ^λ{}_{νμ}$$ holds:

```julia
julia> Γ(g, [1,2])
2×2×2 Array{Float64, 3}:
[:, :, 1] =
 0.0  0.0
 0.0  0.642093

[:, :, 2] =
 0.0       -0.454649
 0.642093   0.0

julia> ans == permutedims(ans, (1, 3, 2))
true
```

## Step 3: Geodesics

Now we get to the cool stuff — geodesics.

A geodesic is a curve $$\vec x(t)$$ satisfying

$$
\dot x^μ(t) ∇_μ \dot x^λ(t) = 0
,$$

that is, the velocity vector $$\dot x$$ is covariantly constant along the direction it points.
Unpacking the covariant derivative, this becomes:

$$
\dot x^μ(t) ∂_μ \dot x^λ(t) + \dot x^μ(t) Γ^λ{}_{μν} \big|_{\vec x(t)} \dot x^ν(t) = 0
$$

Simplifying using the chain rule $$\frac{\dd x^μ}{\dd t}\frac{∂\dot{x}^λ}{∂x^μ} = \ddot x^λ$$ and leaving arguments implicit:

$$
\ddot x^λ = -Γ^λ{}_{μν} \dot x^μ \dot x^ν
$$

This is a system of second order ordinary differential equations.
Julia has good support for numerically solving ODEs.
We will use [`DifferentialEquations.jl`](https://juliapackages.com/p/DifferentialEquations).
To use it, we must put the ODE into standard form, $$y'' = f(y', y, t)$$.

$$
\ddot{\vec{x}} = f_\text{geodesic}(\dot{\vec{x}}, \vec{x}, t)
$$

The Julia package expects two extra arguments: the first argument is the array to write the derivatives of $$\ddot{\vec{x}}$$ into (optional, but leads to better performance); the other is a parameter before $$t$$ to pass in any other data, like the metric.

```julia
function geodesic!(ẍ, ẋ, x, g, t)
  @tensor ẍ[λ] = -Γ(g, x)[λ,μ,ν]*ẋ[μ]*ẋ[ν]
end
```

Here’s an example of solving it with some initial data.
Take our sphere again, and imagine launching a particle eastward along the equator, $$θ = π/2$$.

```julia
julia> using DifferentialEquations

julia> ẋ0 = [0., 1.]; x0 = [π/2, 0.]; tspan = (0, 10);

julia> prob = SecondOrderODEProblem(geodesic!, ẋ0, x0, tspan, g)
ODEProblem with uType ArrayPartition{Float64, Tuple{Vector{Float64}, Vector{Float64}}} and tType Int64. In-place: true
timespan: (0, 10)
u0: ([0.0, 1.0], [1.5707963267948966, 0.0])

julia> sol = solve(prob);
```

The solution object `sol` is matrix-like, with the form

$$
\mqty[
\dot{\vec x}(t_1) & \cdots & \dot{\vec x}(t_n) \\
\vec x(t_1) & \cdots & \vec x(t_n) \\
]
,$$

so we can extract just $$\vec x(t)$$ by taking the bottom two rows:
```julia
julia> sol[3:4,:]
2×6 Matrix{Float64}:
 1.5708  1.5708      1.5708     1.5708    1.5708    1.5708
 0.0     0.00141306  0.0155436  0.156849  1.56991  10.0
```

We can see that our geodesic curve stays at the equator $$θ = π/2$$ and orbits around with $$φ$$ increasing at one radian per unit time.

Boring, but correct!

## More to come…