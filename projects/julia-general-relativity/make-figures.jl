using DiffGeoToy
using DiffGeoToy.DifferentialEquations
using DiffGeoToy.GLMakie

cd("~/Sites/jollywatt/projects/julia-general-relativity")

function spherefig()

	f((θ, φ)) = [
		sin(θ)cos(φ),
		sin(θ)sin(φ),
		cos(θ),
	]

	points = [f([θ, φ]) for θ ∈ range(0, π, 32), φ ∈ range(0, 2π, 64)]
	x, y, z = eachslice(stack(points), dims=1)
	wireframe(x, y, z, transparency=true, alpha=0.1, color=:blue)
	surface!(x, y, z, transparency=true, alpha=0.2)

	zoom!(current_axis().scene, .9)
	save("sphere.png", current_figure(), resolution=(1500, 1100))
	# current_figure()
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
	surface!(x, y, z, transparency=true, alpha=0.2)
	wireframe(x, y, z, transparency=true, alpha=0.1, color=:blue)

	# path = stack([f(sol(t)[3:4]) for t ∈ 0:0.1:30])
	path = mapslices(f, sol(0:0.1:30)[3:4,:], dims=1)
	lines!(path, linewidth=3, color=:black)

	zoom!(current_axis().scene, .8)
	save("torus-geodesic.png", current_figure(), resolution=(1500, 1100))
	current_figure()
end

function paralleltransfig(t)
	newfigure()
	empty!(t.listeners)

	f((θ, φ)) = [
		sin(θ)cos(φ - π),
		sin(θ)sin(φ - π),
		cos(θ),
	]

	g(x) = let ∂f = ∂(f, x)
		∂f*∂f'
	end

	ℳ = Iterators.product(range(0, π, length=32 + 1), range(0, 2π, length=64 + 1))
	plotmanifold!(f, ℳ)

	θ = π/4
	γ(t) = [θ, t]

	plotpath!(f, γ, t)

	U0 = [
		-1  1       0       0
		 0  0 -csc(θ) +csc(θ)
	]

	sol = solveparalleltrans(U0, g, γ, 10)

	plotvectors!(f, sol, t)


	T = range(0, 1, 100)
	T = @. -2π*(cospi(T) - 1)/2
	record(current_figure(), "sphere-transport.mp4", T, framerate=30) do tt
		t[] = tt
	end
end