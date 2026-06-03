#metadata((
  date: datetime(year: 2020, month: 03, day: 17),
  categories: ("interactive",),
  blurb: [
    Interactively tabulate the special cases of Stokes’ theorem, $integral_Omega dif omega = integral_(partial Omega) omega$.
  ],
))

#title[The Many Faces of Stokes’ Theorem]

The #link("https://en.wikipedia.org/wiki/Stokes%27_theorem")[generalised Stokes theorem] has the remarkably compact form
$
  #rect($ integral_Omega dif omega = integral_(partial Omega) omega $)
$
where $Omega$ is a $k$-dimensional #link("https://en.wikipedia.org/wiki/Manifold#Manifold_with_boundary")[manifold with boundary] $partial Omega$, and $omega$ is a $(k - 1)$-form on $Omega$.

While it may seem alien at first when expressed in full generality, you may recognise some of the many special cases of Stokes’ theorem, especially from vector calculus.

= Special cases of Stokes' theorem

Adjust the parameters below or select a preset to see the associated Stokes theorem.


#for it in (
  "katex.min.js",
  "katex.min.css",
  "physics-macros.min.js",
  "main.js",
  "exterior-algebra.js",
  "index.html",
) {
  metadata(asset("stokes/" + it, read(it)))
}

#html.iframe(src: "/stokes/index.html", style: ```css
width: 100%;
height: 27em;
border: none;
```.text)
The metric signature is relevant to the #link("https://en.wikipedia.org/wiki/Hodge_star_operator")[Hodge dual] operation (which requires the notion of a metric). Divergence-type theorems arise naturally when $ω$ is the Hodge dual of a $1$-form
