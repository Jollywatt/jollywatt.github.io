---
layout: post
title: "Hands-on general relativity with Julia"
author: "Joseph Wilson"
categories: math
tags: []
draft: true
---

<style>
figure img {
  max-height: 350px;
}
</style>

Four years after I took general relativity, my professor asked me to send him an old animation I had made during his course showing _parallel transport of vectors around a line of latitude on the sphere_.
Actually, I wasn’t the one who had made it (though I was flattered that he had thought so!)
But this prompted me to give it a go.

The tool I reached for was Julia. To my delight, the whole thing was rather simple to make.
This was the humble result:

<video src="{{ site.github.url }}/projects/julia-general-relativity/latitude-parallel-transport.mp4" width="50%" controls></video>

While taking that course, I remember thinking that numerically computing geodesics or simulating parallel transport were frightfully involved and required a mess of technical computing. Not so.
If you have similar impression, read on.

## Contents
{:.no_toc}

* hello
{:toc}

## Step 0: Maps between manifolds

<!-- When deciding how to deal with manifolds and maps between them with a computer, there were two main directions to go: represent them symbolically and use a CAS to do all the algebra; or represent them numerically.

I chose to stick with numbers. This allows us to 
 -->
The very first task is to decide how to represent the main mathematical objects.
Manifolds and homomorphisms between them can feel complicated and abstract, but with a choice of coordinates, they’re just vectors and functions between vector spaces.

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


Here’s how you might use this embedding to plot a surface with [`Makie.jl`](https://juliapackages.com/p/Makie):

```julia
using GLMakie
circle = range(0, 2π, length=64 + 1)
x, y, z = eachslice(stack([f([θ, φ]) for θ ∈ circle, φ ∈ circle]), dims=1)
wireframe(x, y, z, transparency=true, alpha=0.1, color=:blue)
surface!(x, y, z, transparency=true, alpha=0.2)
```

<figure>
  <img src="{{ site.github.url }}/projects/julia-general-relativity/sphere.png">
</figure>

## Step 1: Automatic differentiation

Differential geometry has lots of ‘$$∂$$’s.
We want to have derivatives of homomorphisms such as `f` be computed _automatically_.
There are many approaches to doing this with Julia, ranging from using [`Symbolics.jl`](https://juliapackages.com/p/Symbolics) for algebraic differentiation to using [`Zygote.jl`](https://juliapackages.com/p/Zygote) and friends to differentiate code.

In our case, we’re not doing anything fancy — just making vectors from mathematical functions line `sin` — so all we’ll need is an implementation of dual numbers.

### Dual numbers

If you extend the reals by adding an element $$ε ≠ 0$$ satisfying $$ε^2 = 0$$, then you can get derivative information for free when you evaluate a function $$f$$ with $$+ε$$, since

$$
f(x + ε) = f(x) + ε f'(x)
.$$

The function value is the real part, and its derivative is the coefficient of $$ε$$. If we denote this coefficient by $$⟨\quad⟩_ε$$, we have our dual number derivative formula:

$$
f'(x) = ⟨f(x + ε)⟩_ε
$$

To do this in Julia, the [`TaylorSeries.jl`](https://juliapackages.com/p/TaylorSeries) package is fine. 
Here’s computing the derivative of $$\sin(x)$$ at $$x = \frac{π}{3}$$:

```julia
julia> using TaylorSeries

julia> sin(Taylor1([π/3, 1]))
 0.8660254037844386 + 0.5000000000000001 t + 𝒪(t²)

julia> ans[1] # get the ε term
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

For a vector-valued function $$\vec f : ℝ^m → ℝ^n$$, we have a matrix of derivatives (a Jacobian).

$$
∂\vec f(\vec x) ≔
\mqty[
∂_μ f^ν(\vec x)
]_{μν} =
\mqty[
∂_1 \vec f(\vec x) \\
\vdots \\
∂_m \vec f(\vec x)
] =
\mqty[
∂_1 f^1(\vec x) & \cdots & ∂_1 f^n(\vec x) \\
\vdots & \ddots & \vdots \\
∂_m f^1(\vec x) & \cdots & ∂_n f^n(\vec x)
]
$$


The Jacobian is conventionally the transpose of this, but we would like to have the first dimension (along columns) to run along the first index that appears, $$μ$$, and the second dimension (along rows) along the the second index, $$ν$$.
This will make the generalisation to higher order tensors natural.

Spelling this out with our dual number derivative formula:

$$
∂\vec f(\vec x) =
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

This means our implementation for `∂` works even on functions which call `∂`, letting us compute higher order derivatives in the obvious way.
For example, $$∂_μ ∂_ν f^λ(\vec x)$$ may be evaluated as:

```julia
∂∂f(x) = ∂(x′ -> ∂(f, x′), x)
```

Notice that this produces a three dimensional array, since $$∂_μ ∂_ν f^λ(\vec x)$$ has three indices.

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

We can access a particular component with normal multidimensional indexing, like `∂∂f(x)[μ,ν,λ]`.
(This shows how `∂` diverges slightly from other Jacobian implementations: ours doesn’t flatten extra dimensions to produce a matrix.)


## Step 2: Metrics and Christoffel symbols

To do things like compute geodesics and simulate parallel transport, we need the metric $$g_{μν}$$ and Christoffel symbols $$Γ^λ{}_{μν}$$ for the manifold we define.


### Induced metrics

If our manifold is a parametric surface embedded in $$ℝ^n$$, such as our sphere embedding $$f : 𝕊^2 → ℝ^3$$, then we should be able to compute the metric on the surface induced by the ambient Euclidean metric, $$η = \operatorname{diag}(1, \dots, 1)$$.
Specifically, the induced metric $$g$$ is the _pullback_ of $$η$$ by $$f$$.

$$
g ≔ f^*η
$$

The pullback $$f^*$$ is defined so that this is equivalent to

$$
g(\vec u, \vec v) ≔ η(f_*\vec u, f_*\vec v)
$$

where $$f_*$$ is the _pushforward_ — nothing but the Jacobian matrix from before.

$$
f_* \big|_{\vec x} ≡ ∂\vec f(\vec x)
$$

With coordinates, the action on a vector may be written as

$$
(f_* \vec u )^ν\big|_{\vec x} = ∂_μ f^ν(\vec x) \, u^μ
$$

so that the component form of $$g(\vec u, \vec v)$$ is:

$$
\begin{align*}
g_{μν} u^μ v^ν &= η_{ρσ} \, ∂_μ f^ρ u^μ \, ∂_ν f^σ u^ρ \\
g_{μν} &= ∂_ρ f^μ \, η_{μν} \, ∂_σ f^ν \\
\end{align*}
$$

Really, this is just matrix-matrix multiplication.

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
The Christoffel symbols are defined in terms of the metric and its first derivatives as

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

Within the `@tensor` expression, any Julia identifier inside `[ ]` is treated as an index, whose range is automatically computed at runtime, with repeated indices summed.
The `:=` means a new array is created.

To test this out and check that the basic symmetry $$Γ^λ{}_{μν} = Γ^λ{}_{νμ}$$ holds:

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

A geodesic is a curve $$\vec x(t)$$ satisfying the _geodesic equation_,

$$
\dot x^μ(t) ∇_μ \dot x^λ(t) = 0
.$$

In words, the velocity vector $$\dot x$$ is covariantly constant along the direction it points.
Unpacking the covariant derivative, this becomes:

$$
\dot x^μ(t) ∂_μ \dot x^λ(t) + \dot x^μ(t) Γ^λ{}_{μν} \big|_{\vec x(t)} \dot x^ν(t) = 0
$$

Simplifying using the chain rule $$\frac{\dd x^μ}{\dd t}\frac{∂\dot{x}^λ}{∂x^μ} = \ddot x^λ$$ and leaving the position and $$t$$-dependence implicit, we have a system of second order ordinary differential equations

$$
\ddot x^λ = -Γ^λ{}_{μν} \dot x^μ \dot x^ν
.$$

Julia has good support for numerically solving ODEs.
We will use the [`DifferentialEquations.jl`](https://juliapackages.com/p/DifferentialEquations) package.
It requires the ODE to be put into standard form,
$$
\ddot{x} = f_\text{geodesic}(\dot{x}, x, g, t)
.$$
The third argument can contain any extra data needed to evaluate $$\ddot{x}$$, which is just the metric $$g$$ in our case.

Additionally, the first argument of the Julia function is the array to write the derivatives $$y''$$ into (optional, but leads to better performance).

```julia
function geodesic!(ẍ, ẋ, x, g, t)
  @tensor ẍ[λ] = -Γ(g, x)[λ,μ,ν]*ẋ[μ]*ẋ[ν]
end
```

Here’s an example of numerically solving the geodesic equation with some initial data.
Take our sphere, and imagine launching a particle eastward along the equator, $$θ = π/2$$.

```julia
julia> using DifferentialEquations

julia> ẋ0 = [0., 1.]; x0 = [π/2, 0.]; tspan = (0, 10);

julia> prob = SecondOrderODEProblem(geodesic!, ẋ0, x0, tspan, g)
ODEProblem with uType ArrayPartition{Float64, Tuple{Vector{Float64}, Vector{Float64}}} and tType Int64. In-place: true
timespan: (0, 10)
u0: ([0.0, 1.0], [1.5707963267948966, 0.0])

julia> sol = solve(prob);
```

The solution object `sol` is matrix-like, with four rows and $$n$$ columns

$$
\mqty[
\dot{\vec x}(t_1) & \cdots & \dot{\vec x}(t_n) \\
\vec x(t_1) & \cdots & \vec x(t_n) \\
]
,$$

so we can extract just $$\vec x(t)$$ by taking the bottom two rows.
```julia
julia> sol[3:4,:]
2×6 Matrix{Float64}:
 1.5708  1.5708      1.5708     1.5708    1.5708    1.5708
 0.0     0.00141306  0.0155436  0.156849  1.56991  10.0
```

We can see that our geodesic curve stays at the equator $$θ = π/2$$ and orbits around with $$φ$$ increasing at one radian per unit time.

Boring, but correct!


### Interesting example: Doughnut geodesics

Let’s combine what we have so far to compute some geodesic curves on a torus.

```julia
using TaylorSeries
using TensorOperations
using DifferentialEquations
using GLMakie

function ∂(f, x)
  I = eachindex(x)
  derivs = [f([Taylor1([x[i], i == j]) for i ∈ I]) for j ∈ I]
  getindex.(stack(derivs, dims=1), 1)
end

function Γ(g, x)
  G⁻¹ = inv(g(x))
  ∂G = ∂(g, x)
  @tensor Γ[λ,μ,ν] := 2\G⁻¹[λ,σ]*(∂G[μ,σ,ν] + ∂G[ν,σ,μ] - ∂G[σ,μ,ν])
end

function geodesic!(ẍ, ẋ, x, g, t)
  @tensor ẍ[λ] = -Γ(g, x)[λ,μ,ν]*ẋ[μ]*ẋ[ν]
end

R = 2
r = 1.5

# parametric torus
f((θ, φ)) = [
  (R + r*cos(φ))*cos(θ),
  (R + r*cos(φ))*sin(θ),
  r*sin(φ),
]

# embedded torus metric
g(x) = let df = ∂(f, x)
  df*df'
end

# plot torus
circle = range(0, 2π, length=64 + 1)
x, y, z = eachslice(stack([f([θ, φ]) for θ ∈ circle, φ ∈ circle]), dims=1)
wireframe(x, y, z, transparency=true, alpha=0.1, color=:blue)
surface!(x, y, z, transparency=true, alpha=0.2)

# compute geodesic
prob = SecondOrderODEProblem(geodesic!, [0.06, 1], [0., 0.], (0, 20), g)
sol = solve(prob)

# plot geodesic
path = stack([f(sol(t)[3:4]) for t ∈ 0:0.1:20])
lines!(path, linewidth=3, color=:black)
```

<figure>
  <img src="{{ site.github.url }}/projects/julia-general-relativity/torus-geodesic.png"/>
</figure>

## More to come…