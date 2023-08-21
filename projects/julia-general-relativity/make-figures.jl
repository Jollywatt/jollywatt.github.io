# using DifferentialEquations
# using TaylorSeries
using TensorOperations
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


function spherefig()

	f((θ, φ)) = [
		sin(θ)cos(φ),
		sin(θ)sin(φ),
		cos(θ),
	]

	circle = range(0, 2π, length=64 + 1)
	x, y, z = eachslice(stack([f([θ, φ]) for θ ∈ circle, φ ∈ circle]), dims=1)
	wireframe(x, y, z, transparency=true, alpha=0.1, color=:blue)
	surface!(x, y, z, transparency=true, alpha=0.2)

	zoom!(current_axis().scene, .9)
	save("sphere.png", current_figure(), resolution=(1500, 1100))
end

function torusfig()
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


	prob = SecondOrderODEProblem(geodesic!, [0.06, 1], [0., 0.], (0, 30), g)
	sol = solve(prob)

	# plot torus
	circle = range(0, 2π, length=64 + 1)
	x, y, z = eachslice(stack([f([θ, φ]) for θ ∈ circle, φ ∈ circle]), dims=1)
	wireframe(x, y, z, transparency=true, alpha=0.1, color=:blue)
	surface!(x, y, z, transparency=true, alpha=0.2)

	path = stack([f(sol(t)[3:4]) for t ∈ 0:0.1:30])
	lines!(path, linewidth=3, color=:black)

	zoom!(current_axis().scene, .8)
	save("torus-geodesic.png", current_figure(), resolution=(1500, 1100))
end