#metadata((
  date: datetime(year: 2026, month: 04, day: 19),
  blurb: [
  Feynman diagrams are associated with complicated physics, but they can also be found hiding in relatively simple questions about Gaussian random variables.
  ],
  categories: ("maths",),
))

#title[Feynman diagrams without any physics]

#import "@preview/cetz:0.5.0"
#import cetz.draw: bezier
#import "@preview/fletcher:0.5.8"

#html.style(```css
.block-equation {
  text-align: center;
}
table {
  table-layout : fixed;
  border-collapse: collapse;
  margin-bottom: 30px;
  width: 100%;
}
table, td {
  border: none;
}
td {
  text-align: center;
  padding: 0;
}
.callout {
  background: rgb(187, 235, 245);
  padding: .8em;
  margin: 1em -.8em;
  border-radius: 5pt;
  box-shadow: inset 0 2pt 4pt #0002;
}
```.text)


#show math.equation.where(block: true): it => {
  if state("i").get() == true { return it }
  html.div(html.frame(it), class: "block-equation")
}

#show math.equation.where(block: false): it => {
  box(html.frame(it))
}

#show math.arrow.long.l.r: $quad <--> quad$


#let diagram(body) = {
  cetz.canvas({
    import cetz.draw: *
    set-transform(cetz.matrix.ident(4))
    set-style(content: (padding: 0.5em))
    body
  })
}

#let draw-matching(verts, edges, colors: none) = {
  let n = verts.len()
  import cetz.draw: *
  for i in range(n) {
    anchor(str(i), verts.at(i))
    on-layer(1, circle(str(i), radius: 2pt, stroke: none, fill: black))
  }
  for i in range(n) {
    for j in range(i) {
      line(str(i), str(j), stroke: 0.5pt + luma(90%))
    }
  }

  for (i, (s, t)) in edges.enumerate() {
    let d = calc.min(n - calc.abs(s - t), calc.abs(s - t))
    let c = {
      if colors == none { color.oklch(70%, 70%, 200deg + d * 30deg) } else { colors.at(i) }
    }
    line(str(s), str(t), stroke: c + 2pt)
  }
}

#let draw-graph(n, edges, labels: ()) = {
  show: html.frame
  let verts = range(n).map(i => (i * 360deg / n, 0.7))
  diagram({
    import cetz.draw: *
    rotate(90deg + 180deg / n)
    draw-matching(verts, edges)
  })
}

#let draw-hex(edges, labels: none, colors: none) = {
  show: html.frame
  diagram({
    import cetz.draw: *
    let verts = range(6).map(i => (calc.floor(i / 3), calc.rem(i, 3) / 1.5))
    draw-matching(verts, edges, colors: colors)
    if labels != none {
      for (i, l) in labels.enumerate() {
        content(verts.at(i), l, anchor: if i < 3 { "east" } else { "west" })
      }
    }
  })
}

#let find-perfect-matchings(symbols) = {
  if symbols.len() == 0 { return ((),) }

  let (first, ..tail) = symbols
  let matchings = ()
  for (i, other) in tail.enumerate() {
    let rest = tail.slice(0, i) + tail.slice(i + 1)
    for c in find-perfect-matchings(rest) {
      matchings.push(((first, other), ..c))
    }
  }
  return matchings
}


#let loop(pt, dir, ..args, angle: 90deg, size: 1.2) = {
  import cetz.draw: *
  group({
    translate(pt)
    rotate(dir)
    bezier((0, 0), (0, 0), (+angle / 2, size), (-angle / 2, size), ..args)
  })
}

#let edge(a, b, bend: 0, ..args) = {
  import cetz.draw: *
  if bend == 0 {
    line(a, b, ..args)
  } else {
    arc-through(a, ((a, 50%, b), bend, 90deg, b), b, ..args)
  }
}

#let leg(a, angle, stroke: 3pt) = edge(a, (rel: (angle, 5pt)), stroke: stroke)
#let aleg(a, angle) = leg(a, angle, stroke: (paint: black.transparentize(60%), thickness: 1pt))

#let vert(..args) = {
  import cetz.draw: *
  for pt in args.pos() {
    circle(pt, radius: 2pt, stroke: none, fill: black)
  }
}

#let callout(..args) = html.div(class: "callout", ..args)

== A tale from elementary probability theory

Feynman diagrams are associated with complicated physics, but they can also be found hiding in relatively simple questions about Gaussian random variables.

For example, suppose I asked you to calculate the expectation value
$
  I = EE[(X_1^3 + X_2^3 + X_3^3 + X_4^3)^2]
$
where each $X_i$ is a (not necessarily independent) normal random variable with zero mean.
Say I want the answer in terms of the covariances $EE[X_i X_j] = Sigma_(i j)$ between the variables.

If you are especially visually-minded (and considerably brilliant) you may find yourself eventually drawing the following diagrams...

$
  #let dumbbell = diagram({
    import cetz.draw: *
    let (a, b) = ((0, 0), (1, 0))
    vert(a, b)
    loop(a, 180deg)
    loop(b, 0deg)
    line(a, b)
  })
  #let theta = diagram({
    import cetz.draw: *
    let (a, b) = ((0, 0), (1, 0))
    vert(a, b)
    edge(a, b, bend: +.5)
    edge(a, b)
    edge(a, b, bend: -.5)
  })
  9 times dumbbell quad + quad 6 times theta
$
...on your way to producing the answer, which is in this case is
$
  I = sum_(i=1)^4 sum_(j=1)^4 ( 9 Sigma_(i i) Sigma_(i j) Sigma_(j j) + 6 Sigma_(i j)^3 ).
$

#html.details({
  html.summary[
    Here's some Julia code approximately showing that this formula is correct.
  ]
  ```julia
  julia> using Distributions, Statistics

  julia> Σ = let A = rand(4,4); A'A end # make a symmetric matrix
  4×4 Matrix{Float64}:
   1.41971   0.705302  0.965598  1.47976
   0.705302  0.391487  0.566326  0.72258
   0.965598  0.566326  0.893622  1.02381
   1.47976   0.72258   1.02381   1.58154

  julia> X = MultivariateNormal(Σ);

  julia> sum(9Σ[i,i]Σ[i,j]Σ[j,j] + 6Σ[i,j]^3 for i=1:4, j=1:4)
  313.9236215857006

  julia> mean(sum(x.^3)^2 for x in eachcol(rand(X, 10_000_000)))
  313.4874899506917
  ```
})

#callout[
  This post explains how exactly these figures come into being from a combinatorics perspective, and how you can solve similar problems in a way that involves cool Feynman diagrams.
]

== Isserlis' theorm

There is one key result from which all of the ensuing combinatorics sprouts: #link("https://en.wikipedia.org/wiki/Isserlis%27s_theorem")[Isserlis' theorm], which says that if you have a bunch of Gaussian random variables $X_1, ..., X_n$ where $EE[X_i] = 0$, then the mean of their product is
$
  EE[X_1 dots.c X_n] = sum_("perfect matchings"\ "of the set" {1, ..., n}) quad product_("pairs" (i, j) \ "in matching") EE[X_i X_j].
$
A _perfect matching_ of a set is a disjoint partition of the set into pairs. For example, here are the perfect matchings of four distinguishable objects:

#table(
  columns: 3,
  ..find-perfect-matchings(range(4)).map(g => draw-graph(4, g))
)

Isserlis' theorem says we can expand $EE[X_1 X_2 X_3 X_4]$ into three terms, each a product of covariances $EE[X_i X_j] = Sigma_(i j)$, according to the the three perfect matchings above:
$
  EE[X_1 X_2 X_3 X_4] = Sigma_12 Sigma_34 + Sigma_13 Sigma_24 + Sigma_14 Sigma_23
$

Note that $EE[X_1 dots.c X_n] = 0$ whenever $n$ is odd---you can't pair up an odd number of objects!

== Doing it the long way

For the sake of concreteness, here's the working for the original problem.
We start by expanding the square of a sum into a sum of squares:
$
  I = EE[lr(size: #80%, (sum_(i=1)^4 X_i^3))^2] = sum_(i=1)^4 sum_(j=1)^4 EE[X_i^3 X_j^3]
$
We can apply Isserlis' theorem to each of these terms.
Even though $E[X_i^3 X_j^3]$ contains repeated variables, the theorem asks us to enumerate all perfect matchings of the six objects ${i, i, i, j, j, j}$.
For example, here is one perfect matching:
#let g = find-perfect-matchings(range(6)).at(0)
#let ij = ($i$, $i$, $i$, $j$, $j$, $j$)
$
  #draw-hex(g, labels: ij)
  <-->
  #g.map(((a, b)) => $EE[X_#ij.at(a) X_#ij.at(b)]$).join()
  = #g.map(((a, b)) => $Sigma_(#ij.at(a) #ij.at(b))$).join()
$

In general, there are $(n - 1)!! = (n - 1)(n - 3)(n - 5) dots.c 1$ matchings of $n$ objects if $n$ is even, so there are $6!! = 5 dot 3 dot 1 = 15$ matchings for six objects.
Well, here they are:


#table(
  columns: 5,
  ..find-perfect-matchings(range(6)).map(g => {
    html.frame(pad(5pt, draw-hex(g)))
  })
)

All these matchings correspond to all the terms in the sum:
$
  EE[X_i^3 X_j^3] & =
                    #find-perfect-matchings("iiijjj".clusters()).map(g => {
                      $&&$
                      g.map(((a, b)) => { $Sigma_(#symbol(a) #symbol(b))$ }).join()
                    }).join($ \
                    & + $) \
                  & =      && 9 Sigma_(i i) Sigma_(i j) Sigma_(j j)
                              + 6 Sigma_(i j) Sigma_(i j) Sigma_(i j)
$
This simplifies into just two distinct terms, after which we sum over the indices $i$ and $j$ to find the total value of $I$.

Of course, you probably wouldn't enumerate the terms one by one like this.
You would try to skip straight to the last line.
But how can you know the different possible terms and the coefficients they should get?


== Doing it with Feynman diagrams

The trick is to separate the objects ${i, i, i, j, j, j}$ into two groups drawn at the same point, so that instead of finding all perfect matchings of six objects, we must find all ways to pair up the legs of two degree three vertices:

$
  #draw-hex(g, labels: ij, colors: (red, blue, green))
  <-->
  #diagram({
    import cetz.draw: *
    let (a, b) = ((0, 0), (1, 0))
    set-style(stroke: 2pt)
    loop(a, 180deg, stroke: red)
    edge(a, b, stroke: blue)
    loop(b, 0deg, stroke: green)
    vert(a)
    vert(b)
    floating({
      content(a, $i^3$, anchor: "north")
      content((to: b, rel: (-3pt, 0)), $j^3$, anchor: "north")
    })
  })
  <-->
  Sigma_(i i) Sigma_(i j) Sigma_(j j)
$

When regarded this way, distinct perfect matchings that result in the same term have the same diagram (if the legs of a vertex aren't distinguishable).
This makes it much easier to find the possible distinct terms---and more importantly, involves cooler diagrams.
For instance, it is easy to tell that there are only two distinct terms, since you can't join the vertices in any other way.
#table(
  columns: 2,
  $#diagram({
    let (a, b) = ((0, 0), (1, 0))
    loop(a, 180deg)
    edge(a, b)
    loop(b, 0deg)
    vert(a)
    vert(b)
  }) <--> Sigma_(i i) Sigma_(i j) Sigma_(j j)$,
  $#diagram({
    let (a, b) = ((0, 0), (1.5, 0))
    edge(a, b, bend: +.5)
    edge(a, b)
    edge(a, b, bend: -.5)
    vert(a)
    vert(b)
  }) <--> Sigma_(i j)^3$,
)
It is much more difficult, however, to determine the correct coefficients of each term.
The coefficient should tell us how many diagrams there are of that topology if the legs of each vertex _are_ distinguishable.

If we're careful, we can count the number of choices we made when drawing each diagram.
The following figure tries to illustrate what I can't explain well in words: at each step, choose a vertex leg "$#diagram(vert((0, 0)) + leg((0, 0), 0deg))$" and count your options: how many other vertex legs can you connect to so that you end up with an edge you want?
Repeat these steps until you complete the diagram.
Sometimes you encounter two forking options: steps performed in series have their multiplicities multiplied, while alternative steps add.

For example, here are all the ways of drawing
"$#diagram({
  cetz.draw.scale(0.6)
  let (a, b) = ((0, 0), (1, 0))
  loop(a, 180deg)
  edge(a, b)
  loop(b, 0deg)
  vert(a)
  vert(b)
})$",
starting from the highlighted leg "$#diagram(vert((0, 0)) + leg((0, 0), 0deg))$".
Two options result in a loop, and the other three result in a bar, so we branch into two topologically distinct possibilities, and so on...

#let c(olor) = olor.lighten(50%)
#let c-1 = c(teal)
#let c-2 = c(blue)
#let c-3 = c(green)

#{
  let d1 = diagram({
    let (a, b) = ((0, 0), (2, 0))
    loop(a, -60deg, angle: 120deg, size: 2, stroke: c-2)
    loop(a, 60deg, angle: 120deg, size: 2, stroke: c-2)
    let (s1, s2) = (1.5, 1.5)
    bezier(a, b, (rel: (s1, 0), to: a), (rel: (60deg, s2), to: b), stroke: c-3)
    bezier(a, b, (rel: (s1, 0), to: a), (rel: (180deg, s2), to: b), stroke: c-3)
    bezier(a, b, (rel: (s1, 0), to: a), (rel: (-60deg, s2), to: b), stroke: c-3)
    vert(a) + leg(a, 0deg) + aleg(a, 120deg) + aleg(a, 240deg)
    vert(b) + aleg(b, 180deg) + aleg(b, 60deg) + aleg(b, 300deg)
  })

  let d2a = diagram({
    let (a, b) = ((0, 0), (1, 0))
    loop(a, 180deg, angle: 120deg, size: 2)
    bezier(a, b, (rel: (.5, 0), to: a), (rel: (60deg, 1), to: b), stroke: c-3)
    bezier(a, b, (rel: (.5, 0), to: a), (rel: (180deg, 1), to: b), stroke: c-3)
    bezier(a, b, (rel: (.5, 0), to: a), (rel: (-60deg, 1), to: b), stroke: c-3)
    vert(a) + leg(a, 0deg) + aleg(a, 120deg) + aleg(a, 240deg)
    vert(b) + aleg(b, 180deg) + aleg(b, 60deg) + aleg(b, 300deg)
  })

  let d3a = diagram({
    let (a, b) = ((0, 0), (1, 0))
    loop(a, 180deg, angle: 120deg, size: 2)
    edge(a, b)
    loop(b, 0deg, angle: 120deg, size: 2, stroke: c-1)
    leg(b, 60deg)
    vert(a) + aleg(a, 0deg) + aleg(a, 120deg) + aleg(a, 240deg)
    vert(b) + aleg(b, 180deg) + leg(b, 60deg) + aleg(b, 300deg)
  })

  let d2b = diagram({
    let (a, b) = ((0, 0), (1, 0))
    edge(a, b)
    loop(a, 180deg, angle: 120deg, size: 2, stroke: c-1)
    vert(a) + leg(a, 0deg) + aleg(a, 120deg) + aleg(a, 240deg)
    vert(b) + aleg(b, 180deg) + aleg(b, 60deg) + aleg(b, 300deg)
  })

  let df = diagram({
    let (a, b) = ((0, 0), (1, 0))
    loop(a, 180deg, angle: 120deg, size: 2)
    edge(a, b)
    loop(b, 0deg, angle: 120deg, size: 2)
    vert(a) + aleg(a, 0deg) + aleg(a, 120deg) + aleg(a, 240deg)
    vert(b) + aleg(b, 180deg) + aleg(b, 60deg) + aleg(b, 300deg)
  })

  $
    #fletcher.diagram(edge-stroke: 1pt, {
      import fletcher: edge, node
      node((.5, 0), d1, name: <start>)
      edge("->", 2, center, stroke: c-2)
      node((0, 1), d2a)
      edge("->", 3, center, stroke: c-3)
      node((.5, 2), d3a, name: <merge>)
      edge("->", <end>, 1, center, stroke: c-1)

      edge(<start>, "->", auto, 3, center, stroke: c-3)
      node((1, 1), d2b)
      edge("->", <merge>, 1, center, stroke: c-1)

      node((.5, 3), df, name: <end>)
    })
  $
}
Working down the figure we can see there are $(2 dot 3 + 3 dot 1) dot 1 = 9$ ways to make this diagram, treating vertex legs as distinguishable.
Therefore, the coefficient of the corresponding term is $9$.

The other diagram is slightly easier to compute the multiplicity for:
It comes out as $3 dot 2 dot 1 = 6$.

#{
  let (a, b) = ((0, 0), (1.5, 0))
  let d1 = diagram({
    let (s1, s2) = (1.5, 1.5)
    bezier(a, b, (rel: (s1, 0), to: a), (rel: (60deg, s2), to: b), stroke: c-3)
    bezier(a, b, (rel: (s1, 0), to: a), (rel: (180deg, s2), to: b), stroke: c-3)
    bezier(a, b, (rel: (s1, 0), to: a), (rel: (-60deg, s2), to: b), stroke: c-3)
    vert(a) + leg(a, 0deg) + aleg(a, 120deg) + aleg(a, 240deg)
    vert(b) + aleg(b, 180deg) + aleg(b, 60deg) + aleg(b, 300deg)
  })
  let d2 = diagram({
    edge(a, b)
    let (s1, s2) = (1.5, 1.5)
    cetz.draw.floating({
      bezier(a, b, (rel: (120deg, s1), to: a), (rel: (60deg, s2), to: b), stroke: c-2)
      bezier(a, b, (rel: (120deg, s1), to: a), (rel: (-60deg, s2), to: b), stroke: c-2)
    })
    vert(a) + aleg(a, 0deg) + leg(a, 120deg) + aleg(a, 240deg)
    vert(b) + aleg(b, 180deg) + aleg(b, 60deg) + aleg(b, 300deg)
  })
  let d3 = diagram({
    edge(a, b)
    let (s1, s2) = (1.5, 1.5)
    bezier(a, b, (rel: (120deg, s1), to: a), (rel: (60deg, s2), to: b))
    bezier(a, b, (rel: (240deg, s1), to: a), (rel: (-60deg, s2), to: b), stroke: c-1)
    vert(a) + aleg(a, 0deg) + leg(a, 120deg) + aleg(a, 240deg)
    vert(b) + aleg(b, 180deg) + aleg(b, 60deg) + aleg(b, 300deg)
  })
  let df = diagram({
    edge(a, b)
    let (s1, s2) = (1.5, 1.5)
    bezier(a, b, (rel: (120deg, s1), to: a), (rel: (60deg, s2), to: b))
    bezier(a, b, (rel: (240deg, s1), to: a), (rel: (-60deg, s2), to: b))
    vert(a) + aleg(a, 0deg) + aleg(a, 120deg) + aleg(a, 240deg)
    vert(b) + aleg(b, 180deg) + aleg(b, 60deg) + aleg(b, 300deg)
  })
  $
    #fletcher.diagram(edge-stroke: 1pt, node-shape: rect, {
      import fletcher: edge, node
      node((0, 0), d1)
      edge("->", 3, center, stroke: c-3)
      node((1, 0), d2)
      edge("->", 2, center, stroke: c-2)
      node((2, 0), d3)
      edge("->", 1, center, stroke: c-1)
      node((3, 0), df)
    })
  $
}


Now that we know the terms and their coefficients, we have determined
$
  EE[X_i^3 X_j^3] = 9 Sigma_(i i) Sigma_(i j) Sigma_(j j) + 6 Sigma_(i j)^2
$
so we can obtain the final answer by summing over indices:
#callout[
  $
    I = sum_(i=1)^4 sum_(j=1)^4 (9 Sigma_(i i) Sigma_(i j) Sigma_(j j) + 6 Sigma_(i j)^2)
  $
]

== Finding diagram multiplicities

We can try to find a formula to more easily determine the multiplicities of each diagram.
In our case, the formula
$
  (3!)^2/(2^ell product_k k!)
$
where $ell$ is the number of loops and $k$ the number of parallel edges for each pair of vertices.

To see this, consider what happens if you permute the labels of the legs at any single vertex.
The diagram's topology doesn't change, since the legs stay at their vertex, but the specific perfect matching of the legs might be different.
Remember, we want to count all the perfect matchings that give the same diagram.

For example, the two perfect matchings below differ in that the legs $i_1$ and $i_3$ are swapped:
#let gs = find-perfect-matchings(range(6))
$
  #draw-hex(gs.at(0), labels: ($i_3$, $i_2$, $i_1$, $j_3$, $j_2$, $j_1$), colors: (red, blue, green))
  stretch(|->, size: #2cm)^(i_1 <-> i_3)
  #draw-hex(gs.at(6), labels: ($i_1$, $i_2$, $i_3$, $j_3$, $j_2$, $j_1$), colors: (blue, red, green))
$
#let little-bumbell = box(html.frame(diagram({
  import cetz.draw: *
  scale(0.5)
  let (a, b) = ((0, 0), (1, 0))
  set-style(stroke: 1.5pt)
  loop(a, 180deg, stroke: red)
  edge(a, b, stroke: blue)
  loop(b, 0deg, stroke: green)
  vert(a)
  vert(b)
})))
But these are distinct perfect matchings which both correspond to the
"#little-bumbell"
diagram.

So, counting all leg permutations, does that mean there are $(3!)^2 = 36$ different perfect matchings for this diagram?
Not quite, because some leg permutations don't change the perfect matching.
Specifically, swapping legs in a loop does nothing:
$
  #draw-hex(gs.at(0), labels: ($i_3$, $i_2$, $i_1$, $j_3$, $j_2$, $j_1$), colors: (red, blue, green))
  stretch(|->, size: #2cm)^(i_2 <-> i_3)
  #draw-hex(gs.at(0), labels: ($i_2$, $i_3$, $i_1$, $j_3$, $j_2$, $j_1$), colors: (red, blue, green))
$

#let little-theta-rgb = box(html.frame(diagram({
  import cetz.draw: *
  scale(0.5)
  let (a, b) = ((0, 0), (1, 0))
  set-style(stroke: 1.5pt)
  edge(a, b, bend: +0.3, stroke: red)
  edge(a, b, stroke: blue)
  edge(a, b, bend: -0.3, stroke: green)
  vert(a)
  vert(b)
})))
Also, if there are parallel edges sharing the same vertices, like in the "#little-theta-rgb" diagram, then permuting parallel edges among themselves does nothing either:
$
  #draw-hex(gs.at(7), labels: ($i_3$, $i_2$, $i_1$, $j_3$, $j_2$, $j_1$), colors: (red, blue, green))
  stretch(|->, size: #2cm)^(i_1, j_1 <-> i_3, j_3)
  #draw-hex(gs.at(7), labels: ($i_1$, $i_2$, $i_3$, $j_1$, $j_2$, $j_3$), colors: (green, blue, red))
$
For $k$ parallel edges, there are $k!$ ways to order them that give the same perfect matching.

Therefore, we originally overcounted by a factor of two for each loop present, and by a factor of $k!$ for each set of $k$ parallel edges.
After dividing out the denominator $2^ell product_k k!$ we are left with the correct diagram multiplicities
$
  (3!)^2/(2^ell product_k k!)
$
which is $6$ for #little-theta-rgb and $9$ for #little-bumbell.

= A more complex example

Why do some Feynman diagrams have squiggly lines?

Suppose someone asks you to compute
$
  I = EE[(A^top A phi)^4]
$
where $A = (A_1, ..., A_n)^top$ is a vector of zero-mean Gaussian random variables that correlate with each other as $EE[A_i A_j] = Sigma_(i j)$.
Say $phi$ is another such random variable with variance $sigma^2$, but which is independent of all the others, so $EE[A_i phi] = EE[A_i] EE[phi] = 0$.
Expanding the expression:
$
  I = sum_(i,j,k,l=1)^n EE[(A_i^2 phi)(A_j^2 phi)(A_k^2 phi)(A_l^2 phi)]
$
Each term in this sum separates into $EE[A_i^2 A_j^2 A_k^2 A_l^2] EE[phi^4]$, and we can consider each factor independently.

But this isn't as cool because it doesn't lead to Feynman diagrams with multiple edge types.

So lets consider $EE[(A_i^2 phi)(A_j^2 phi)(A_k^2 phi)(A_l^2 phi)]$ as one thing.
Isserlis's theorm tells us to express this as a sum of all $(10 - 1)!! = 945$ perfect matchings over the ten random variables in this expression.
This we shouldn't do, but we can find the distinct terms that appear and their multiplicities by drawing diagrams.
Simply treat each of the four groups $A_i^2 phi$ as a vertex with three legs, one for each of the factors ${A_i, A_i, phi}$.


#let wavy(it) = {
  cetz.draw.get-ctx(ctx => {
    let (ctx, drawables) = cetz.process.many(ctx, it)

    let len = drawables.map(d => cetz.path-util.length(d.segments)).sum()
    cetz.decorations.wave(it, amplitude: 0.1, segments: int(len / 0.2))
  })
}


However, if we join a $A_i$-leg to a $phi$-leg in our diagram, this corresponds to a perfect matching that involves a correlation term $EE[A_i phi] = 0$ which vanishes.
We can simply disregard all such perfect matchings.
An easy way to enforce this is to colour the $A_i$-type legs and $phi$-legs differently, and to say edges can only link legs of the same colour.
Let's draw $A_i$-type edges as $#diagram(edge((0, 0), (1, 0)))$ and $phi$-type edges as $#diagram(wavy(edge((0, 0), (1, 0))))$ just to make it cool.

Here are all possible terms:

#let term-bow-bow = $#(3 * 1) tr(Sigma)^4 sigma^4$
#let term-bow-phi = $#(3 * 4) tr(Sigma)^2 tr(Sigma^2) sigma^4$
#let term-phi-phi = $#(3 * 4) tr(Sigma^2)^2 sigma^4$
#let term-fig-H = $#(3 * 8) tr(Sigma^2)^2 sigma^4$
#let term-fig-S = $#(3 * 32) tr(Sigma^4) sigma^4$
#let term-fig-X = $#(3 * 16) tr(Sigma^4) sigma^4$
#let term-ooo = $#(3 * 8) tr(Sigma)^2 tr(Sigma^2) sigma^4$
#let term-kite = $#(3 * 32) tr(Sigma)tr(Sigma^3) sigma^4$

#let bow-bow = $
  #diagram({
    let (a, b, c, d) = ((0, 0), (1, 0), (0, 1), (1, 1))
    vert(a)
    vert(b)
    vert(c)
    vert(d)
    wavy(edge(a, b))
    wavy(edge(c, d))
    loop(a, 180deg)
    loop(b, 0deg)
    loop(c, 180deg)
    loop(d, 0deg)
  })\ #term-bow-bow
$

#let bow-phi = $
  #diagram({
    let (a, b, c, d) = ((0, 0), (1, 0), (0, 1), (1, 1))
    vert(a)
    vert(b)
    vert(c)
    vert(d)
    wavy(edge(a, b))
    wavy(edge(c, d))
    loop(a, 180deg)
    loop(b, 0deg)
    edge(c, d, bend: 0.3)
    edge(c, d, bend: -0.3)
  })\ #term-bow-phi
$
#let phi-phi = $
  #diagram({
    let (a, b, c, d) = ((0, 0), (1, 0), (0, 1), (1, 1))
    vert(a)
    vert(b)
    vert(c)
    vert(d)
    wavy(edge(a, b))
    wavy(edge(c, d))
    edge(a, b, bend: 0.3)
    edge(a, b, bend: -0.3)
    edge(c, d, bend: 0.3)
    edge(c, d, bend: -0.3)
  })\ #term-phi-phi
$
#let fig-H = $
  #diagram({
    let (a, b, c, d) = ((0, 0), (1, 0), (0, 1), (1, 1))
    vert(a)
    vert(b)
    vert(c)
    vert(d)
    wavy(edge(a, b))
    wavy(edge(c, d))
    edge(a, c, bend: 0.3)
    edge(a, c, bend: -0.3)
    edge(b, d, bend: 0.3)
    edge(b, d, bend: -0.3)
  })\ #term-fig-H
$
#let fig-S = $
  #diagram({
    let (a, b, c, d) = ((0, 0), (1, 0), (0, 1), (1, 1))
    vert(a)
    vert(b)
    vert(c)
    vert(d)
    wavy(edge(a, b))
    wavy(edge(c, d))
    edge(a, b, bend: -0.3)
    edge(a, c)
    edge(b, d)
    edge(c, d, bend: 0.3)
  })\ #term-fig-S
$
#let fig-X = $
  #diagram({
    let (a, b, c, d) = ((0, 0), (1, 0), (0, 1), (1, 1))
    vert(a)
    vert(b)
    vert(c)
    vert(d)
    wavy(edge(a, b))
    wavy(edge(c, d))
    edge(a, d)
    edge(a, c)
    edge(b, d)
    edge(b, c)
  })\ #term-fig-X
$
#let ooo = $
  #diagram({
    let (a, b, c, d) = range(4).map(x => (x * 0.8, 0))
    vert(a)
    vert(b)
    vert(c)
    vert(d)
    wavy(edge(a, b))
    wavy(edge(c, d))
    loop(a, 180deg)
    loop(d, 0deg)
    edge(b, c, bend: 0.4)
    edge(b, c, bend: -0.4)
  })\ #term-ooo
$
#let kite = $
  #diagram({
    let (a, b, c, d) = ((0, 0), (.8, 0), (1.6, 0.6), (1.6, -0.6))
    vert(a)
    vert(b)
    vert(c)
    vert(d)
    wavy(edge(a, b))
    wavy(edge(c, d))
    loop(a, 180deg)
    edge(b, c)
    edge(b, d)
    edge(c, d, bend: 0.4)
  })\ #term-kite
$

#table(
  columns: 3,
  ..(bow-bow, bow-phi, phi-phi),
)

#table(
  columns: 3,
  ..(fig-H, fig-S, fig-X),
)

#table(
  columns: 2,
  ..(ooo, kite),
)

The final value of $I = EE\[\(A^top A phi)^4]$ is simply the sum of these.
#html.details({
  html.summary[
    Here's some more Julia to check that it works.
  ]
  ```julia
  julia> using LinearAlgebra: tr

  julia> Σ = let A = rand(4,4); A'A end;

  julia> X = MultivariateNormal(Σ);

  julia> mean((sum(A.^2)*randn())^4 for A in eachcol(rand(X, 100_000_000)))

  195435.69579829712

  julia> 3sum([
            tr(Σ)^4
            4tr(Σ^2)tr(Σ)^2
            4tr(Σ^2)^2
            8tr(Σ^2)^2
            32tr(Σ^4)
            16tr(Σ^4)
            8tr(Σ^2)tr(Σ)^2
            32tr(Σ^3)tr(Σ)
           ])
  193862.80787076356
  ```
})


We've used a trick to write things in terms of traces instead of indices.
Note that we are summing over all indices, so terms like $Sigma_(i j) Sigma_(j i)$ can be interpreted as matrix multiplication $(Sigma Sigma)_(i i) = tr(Sigma^2)$.
For our example, this trick happens to work for everything so our final answer won't have any summation signs or indices at all.

The multiplicities are a little hard to find, but it can be done using the tree-drawing method illustrated above.
I have not found a nice combinatorial formula that explains the multiplicities of these diagrams like we had before.
Maybe next time?
