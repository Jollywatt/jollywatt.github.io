// to compile, this file must be placed in the source directory of fletcher
// https://github.com/Jollywatt/typst-fletcher
// jujutsu change ID zuomxqlwtkxxrzqpqnmmxqxvmxpyvtpl
// git commit ID 882ef5915d80aa84ee52e040f0de1bddfae46c18


#import "@preview/cetz:0.4.1"
#import "/src/exports.typ": diagram, node, edge, cetz, flexigrid
#import "@preview/equate:0.3.2": equate


#show: equate.with(number-mode: "label")
#set math.equation(numbering: "(1)", supplement: "eq.")

#show heading: it => pad(it, y: 1em)
#set par(justify: true)

#show figure: it => [#it#metadata(it.body)<something>]


// #set page(width: 18cm, height: auto)

#import "/src/flexigrid.typ": cell-sizes-from-rects

#let cell-sizes-from-rects-general(rects, gutter, cell-sizer) = {
  let (u-min, u-max) = (float.inf, -float.inf)
  let (v-min, v-max) = (float.inf, -float.inf)

  for rect in rects {
    let (u, v) = rect.pos
    if u < u-min { u-min = u }
    if u-max < u { u-max = u }
    if v < v-min { v-min = v }
    if v-max < v { v-max = v }
  }
  if float.is-infinite(u-min) { u-min = 0}
  if float.is-infinite(u-max) { u-max = 0}
  if float.is-infinite(v-min) { v-min = 0}
  if float.is-infinite(v-max) { v-max = 0}

  (u-min, u-max) = (calc.floor(u-min), calc.ceil(u-max))
  (v-min, v-max) = (calc.floor(v-min), calc.ceil(v-max))

  // add extra zero-size padding rows/cols around content
  // to make coordinate extrapolation beyond bounds correct
  u-min -= 1
  v-min -= 1
  u-max += 1
  v-max += 1

  let (n-cols, n-rows) = (u-max - u-min + 1, v-max - v-min + 1)
  let (col-sizes, row-sizes) = ((0,)*n-cols, (0,)*n-rows)

  for node in rects {
    let (u, v) = node.pos
    let (i, j) = (u - u-min, v - v-min)
    let (i-floor, j-floor) = (calc.floor(i), calc.floor(j))
    let (i-fract, j-fract) = (calc.fract(i), calc.fract(j))

    let (w, h) = node.size
    w *= node.weight
    h *= node.weight


    // regime 1: rect spans two cells, both cells get a minimum width

    let w0 = col-sizes.at(i-floor)
    let w1 = col-sizes.at(i-floor + 1)
    let (w0new, w1new) = cell-sizer(w, w0, w1, i-fract, gutter)
    col-sizes.at(i-floor) = calc.max(w0, w0new)
    col-sizes.at(i-floor + 1) = calc.max(w1, w1new)

    let h0 = row-sizes.at(j-floor)
    let h1 = row-sizes.at(j-floor + 1)
    let (h0new, h1new) = cell-sizer(h, h0, h1, j-fract, gutter)
    row-sizes.at(j-floor) = calc.max(h0, h0new)
    row-sizes.at(j-floor + 1) = calc.max(h1, h1new)

  }

  return (
    u-min: u-min,
    u-max: u-max,
    v-min: v-min,
    v-max: v-max,
    col-sizes: col-sizes,
    row-sizes: row-sizes,
    col-gutter: gutter,
    row-gutter: gutter,
  )
}

#let flexigrid(
  objects,
  gutter: 1,
  origin: (0,0),
  columns: auto,
  rows: auto,
  name: none,
  debug: false,
  cell-sizer: (w, w0, w1, u, g) => (0, 0),
) = {
  import "/src/flexigrid.typ": *
  let col-spec = interpret-rowcol-spec(columns)
  let row-spec = interpret-rowcol-spec(rows)

  objects = utils.as-array(objects)

  cetz.draw.get-ctx(ctx => {

    let gutter = cetz.util.resolve-number(ctx, gutter)
    let (_, origin) = cetz.coordinate.resolve(ctx, origin)
    // cetz.draw.translate(origin) // todo

    ctx.shared-state.fletcher = (
      pass: "layout",
      nodes: (),
      edges: (),
      current: (node: 0, edge: 0),
    )

    // for the layout pass, we resolve uv coords by treating them as xy
    let layout-pass-ctx = with-coordinate-resolver(ctx, (ctx, c) => {
      if type(c) == dictionary {
        if "uv" in c { return c.uv }
        if "xy" in c { return c.xy }
      } 
      return c
    })

    // run layout pass to retrieve fletcher objects
    let layout-pass = cetz.process.many(layout-pass-ctx, objects)
    let (nodes, edges) = layout-pass.ctx.shared-state.fletcher

    // compute grid cell sizes and positions
    let grid = cell-sizes-from-rects-general(nodes, gutter, cell-sizer)
    grid.col-sizes = apply-rowcol-spec(ctx, col-spec, grid.col-sizes)
    grid.row-sizes = apply-rowcol-spec(ctx, row-spec, grid.row-sizes)
    grid += cell-centers-from-sizes(grid)

    let uv-resolver(ctx, c) = {
      if type(c) == dictionary {
        if "uv" in c { return utils.uv-to-xy(grid, c.uv) }
        if "xy" in c { return c.xy }
        if "rel" in c and type(c.rel) == array and c.rel.all(x => type(x) in (int, float)) {
          let (_, prev-xy) = cetz.coordinate.resolve(ctx, c.at("to", default: ()))
          let prev-uv = utils.xy-to-uv(grid, prev-xy)
          let new-uv = cetz.vector.add(prev-uv, c.rel)
          return utils.uv-to-xy(grid, new-uv)
        }
      }
      return c
    }

    nodes = nodes.map(node => place-node-in-grid(node, grid))

    // provide extra context used by objects
    (ctx => {
      ctx = with-coordinate-resolver(ctx, uv-resolver)
      ctx.shared-state.fletcher = (
        pass: "final",
        nodes: nodes,
        edges: edges,
        current: (node: 0, edge: 0), // index of current object
        flexigrid: grid,
        debug: debug,
      )
      return (ctx: ctx)
    },)

    objects

    // draw help lines and flexigrid cells
    draw-flexigrid(grid, debug: debug)
    if debug-level(debug, "grid.xy") {
      draw-xy-grid(origin, grid)
    }

    // destroy flexigrid context (use group?)
    (ctx => {
      ctx.shared-state.remove("fletcher")
      return (ctx: ctx)
    },)

  })
}


#let fig(W, m0, m1, u, g, cell-sizer, Y: 6) = cetz.canvas({
  import cetz.draw: *
  set-style(content: (padding: 0.1em))

  let h = .5

  let bl = blue.transparentize(30%)
  let re = red.transparentize(30%)

  scale(y: -1)
  grid((0,0), (W,Y), stroke: 0.5pt + gray)

  let brace(..args, label: none, anchor: "north") = cetz.draw.group({
    cetz.decorations.brace(..args, name: "brace", content-offset: .5em)
    cetz.draw.content("brace.content", label)
  }) 

  brace((W,0), (0,0), label: $W$, anchor: "south")

  let samples = range(101).map(t => {
    t = t/100
    let g = t*Y
    let y = g

    let (w0, w1) = cell-sizer(W, m0, m1, u, g)
    w0 = calc.max(w0, m0)
    w1 = calc.max(w1, m1)

    let l = g + w0/2 + w1/2 // length between cell centers
    let x0 = W/2 - u*l
    let x1 = x0 + l

    return (x0: x0, w0: w0, x1: x1, w1: w1, y: y)
  })

  ({
    line(
      ..samples.map(((x0, w0, x1, w1, y)) => (x0 + w0/2, y)).rev(),
      ..samples.map(((x0, w0, x1, w1, y)) => (x0 - w0/2, y)),
      fill: blue.transparentize(90%), stroke: blue.transparentize(50%)
    )

    line(
      ..samples.map(((x0, w0, x1, w1, y)) => (x1 + w1/2, y)).rev(),
      ..samples.map(((x0, w0, x1, w1, y)) => (x1 - w1/2, y)),
      fill: red.transparentize(90%), stroke: red.transparentize(50%)
    )
    line(..samples.map(((x0, y)) => (x0, y)), stroke: (dash: "dashed", paint: blue, thickness: 0.5pt))
    line(..samples.map(((x1, y)) => (x1, y)), stroke: (dash: "dashed", paint: red, thickness: 0.5pt))
  })

  if type(g) != array { g = (g,) }

  floating(for g in g {
    let (w0, w1) = cell-sizer(W, m0, m1, u, g)
    w0 = calc.max(w0, m0)
    w1 = calc.max(w1, m1)

    let l = g + w0/2 + w1/2 // length between cell centers
    let x0 = W/2 - u*l
    let x1 = x0 + l
    let y = g

    


    set-style(rect: (stroke: none))
    line((W/2,0), (W/2,y), stroke: (dash: "dashed", thickness: 0.5pt))

    group({
      translate(y: y)

      rect((x0 - w0/2,0), (x0 + w0/2,h), fill: bl, stroke: bl)
      brace((x0 - w0/2,h), (x0 + w0/2,h), label: $w_0$)

      rect((x1 - w1/2,0), (x1 + w1/2,h), fill: re, stroke: re)
      brace((x1 - w1/2,h), (x1 + w1/2,h), label: $w_1$)

      rect((x0 + w0/2,0), (x0 + w0/2 + g,h), fill: black.transparentize(90%))
      brace((x0 + w0/2,h), (x1 - w1/2,h), label: $g$)

      circle((x0, 0), radius: 1pt)
      content((), $x_0$, anchor: "north")
      circle((x1, 0), radius: 1pt)
      content((), $x_1$, anchor: "north")
      circle(((1 - u)*x0 + u*x1, 0), radius: 1pt, stroke: black)
      content((), $x_t$, anchor: "north")
    })
  })






})





= Layout algorithms for flexible tabular grids

This is a development log about the "flexigrid" layout algorithm for fletcher.

#show heading.where(level: 2): set heading(numbering: (i, j) => (j - 1), supplement: [Algorithm])
#show heading.where(level: 2): it => context pad(y: 1em)[
  #it.supplement
  #(it.numbering)(..counter(heading).get()):
  #it.body
]

== Normal coordinates

The simplest way to lay out nodes on a page is to place them at Cartesian coordinates on a fixed grid.

#figure(cetz.canvas({
  import cetz.draw: *
  set-style(node: (stroke: 1pt))
  flexigrid(debug: "grid", {
    node((-1,-1))
    node((0,0))[A wide cell]
    node((0,1))[Cell]
    node((1,1))[A\ tall\ cell]
    node((2,2))
  })
}))

== Standard table layouts <table-layout>

If we want a table-like layout in which cells grow to accommodate nodes, the simplest approach is to require nodes to have integer coordinates.
The row/column sizes are set to the maximum height/width of the nodes present in that row/column.

#figure(diagram(debug: "grid", gutter: 0, {
  import cetz.draw: *
  set-style(node: (stroke: 1pt))
  node((0,0))[A wide cell]
  node((0,1))[Cell]
  node((1,1))[A\ tall\ cell]
}))

Cell gutter may then applied by adding a uniform gap between rows and columns.

#figure(diagram(debug: "grid", gutter: 1, {
  import cetz.draw: *
  set-style(node: (stroke: 1pt))
  node((0,0))[A wide cell]
  node((0,1))[Cell]
  node((1,1))[A\ tall\ cell]
}))

In the presence of cell gutter, the center positions $x_0$ and $x_1$ of flexigrid cells of widths $w_0$ and $w_1$ are constrained by
$
x_1 - x_0 = g + (w_0 + w_1)/2
$
where $g >= 0$ is the gutter between adjacent cells.


As a layout algorithm, for each node placed we update the cell widths as
$
  w'_u = max(w_u, W)
$
where $W$ is the width of the node at position $u in ZZ$ and $w_u$ is the original cell width at column $u$.

== Linear interpolation

To allow fractional positioning of nodes, we can define an _elastic_ coordinate system which linearly interpolates between row/column center points.
If $u in RR$ is an elastic coordinate, then the corresponding physical coordinate is
$
x_(u) = (1 - t)x_(floor(n)) + t x_(floor(u)+ 1)
$
where $t = u - floor(u) in [0, 1)$ and $x_i$ are the row/column centers for $i in ZZ$.

If we place a node of width $W$ at $x_u$, how do we update the cell sizes?

A simple method is to linearly interpolate the allocation of the width into each cell, according to
$
  w'_0 &= (1 - t)W \
  w'_1 &= t W \
$
which agrees with @table-layout when $u in ZZ$.
The actual cell size is then the maximum of the new size $w'_i$ and the original size $w_i$ without the node:
$
  w_i <- max(w_i, w'_i)
$

This works well when there is no gutter between cells:

#let cell-sizer-linear(w, m0, m1, t, gutter) = {
  let w0 = calc.max(m0, (1 - t)*w)
  let w1 = calc.max(m1, t*w)
  return (w0, w1)
}

#figure(grid(columns: (35mm,)*3, gutter: 1cm, align: center, ..range(6).map(n => cetz.canvas({
  let u = n/5
  import cetz.draw: *
  set-style(node: (stroke: 1pt))
  flexigrid(debug: "grid.cells grid.coords", gutter: 0, {
    node((u,0))[A cell at $u = #calc.round(u, digits: 2)$]
    node((0,1))[Cell]
    node((1,1))[A\ tall\ cell]
  }, cell-sizer: cell-sizer-linear)
}))))

However, placing nodes with cell gutter leads to cells being unnecessarily large:

// #cetz.canvas({
#figure(grid(columns: (42mm,)*3, gutter: 1cm, align: center, ..(0.2, 0.5, 0.8).map(u => cetz.canvas({
  import cetz.draw: *
  set-style(node: (stroke: 1pt))
  flexigrid(debug: "grid.cells grid.coords", gutter: 1, {
    node((u,0))[A cell at $u = #calc.round(u, digits: 2)$]
    node((0,1))[Cell]
    node((1,1))[A\ tall\ cell]
  }, cell-sizer: cell-sizer-linear)
}))))

Notice that the first column is too wide for $u = 0.2$ and the last column is too wide for $u = 0.8$. Both columns are too wide for $u = 0.5$.

Another way to visualise the problem is with @linear which shows the cell centers $x_0$ and $x_1$ and widths $w_0$ and $w_1$ on the horizontal axis as a function of the gutter $g$ on the vertical axis.


#figure(
  fig(6, 0, 0, .5, 2, cell-sizer-linear, Y: 4),
  caption: [
    Node of width $W = 6$ placed at $u = 1 slash 2$, so that each cell gets half the width, $w_0 = w_1 = W slash 2$.
  ],
) <linear>


Notice that the cells in @linear (blue and red) reach outside the span of the node, $W$.
As the cell gutter $g$ increases, the cells contain less of the node yet do not shrink.

#let demofig(cell-sizer) = {
  let N = 8
  range(N + 1).map(t => {
    t /= N
    let (lo, hi) = (0, 2)
    let u = (1 - t)*lo + t*hi
    cetz.canvas({
      import cetz.draw: *
      let g = 1
      flexigrid(debug: "grid.cells", gutter: g, {
        node((0,0))
        node((3,0))
        let n(x) = text(white, align(horizon, box(x)))
        node((1,0), fill: blue.transparentize(50%), n[Cell], inset: 3mm)
        node((2,0), fill: red.transparentize(50%), n[Very very wide cell], inset: 3mm)
        node((u,0), align(center, box(width: 33mm)[$u = #u$]), fill: white.transparentize(20%), stroke: 1pt, inset: 1mm)
      }, cell-sizer: cell-sizer)
    })
  }).join()
}

#figure(demofig(cell-sizer-linear), caption: [Example of interpolation with the linear layout algorithm.]) <linear-interp>

== Tight algorithm

#let cell-sizer-tight(w, m0, m1, u, g) = {
  assert(0 <= u and u <= 1)
  if u == 0 { return (w, m1) }
  if u == 1 { return (m0, w) }

  let x0 = -u/2*calc.max(
    (2*g + m1 + m0)/(1),
    (2*g + m1 +  w)/(1 + u),
    (2*g +  w + m0)/(2 - u),
    (2*g +  w +  w)/(2),
  )

  let x1 = (u - 1)/u*x0
  let w0 = 2*x0 + w
  let w1 = w - 2*x1
  return (w0, w1)
}

To fix the aforementioned problem, we must define the desired layout behaviour taking into account cell gutter.


Consider placing a node of width $W$ at elastic coordinate $0 <= u <= 1$.
If the span of a cell is fully contained in the span of the node, we want the cell to expand by the maximum amount it can while still being fully contained.
If a cell is not fully contained in the node's span, it does not change size when the node is placed.

This results in the scenario in @tight1, where the cells separate to respect increasing gutter $g$ but also shrink to ensure they stay within the node $W$.

#figure(
  fig(6, 0, 0, 1/3, (1, 4), cell-sizer-tight, Y: 6.5),
  caption: [
    Node at $u = 1 slash 3$ of width $W = 6$ placed with the tight layout algorithm.
  ],
) <tight1>

If the cells have an existing positive width, then our picture looks like @tight2.

#{
  let W = 6
  let (w0, w1) = (2, 1)
  figure(
  fig(W, w0, w1, 1/3, (2, 5), cell-sizer-tight, Y: 6.5),
  caption: [
    Node at $u = 1 slash 3$ of width $W = #W$ where the blue and red columns have existing widths $w_0 = #w0$ and $w_1 = #w1$.
  ],
)} <tight2>

To calculate the new cell widths $w'_0$ and $w'_1$ for a given $u$, $W$ and $g$ along with the original widths $w_0$ and $w_1$, we first write down the coordinates of the inner edges of the cells.

For the left cell (blue), there are two cases to consider.
- _Fully contained in the node:_ In this case, the left end of the cell is at the left end of the node, at coordinate $-W/2$. The cell width is $2x_0 + W$, so the inner end (right) of the cell is at
  $ x_0^"inner" = 2x_0 + W/2. $
- _Not fully contained:_ In this case, the cell is unaffected and keeps its initial width $w_0$.
  The inner (right) end of the cell is then
  $ x_0^"inner" = x_0 + w_0/2. $

The correct end point is the rightmost or maximum of these two.
Similar reasoning applies to the right node (red).
$
  x_0^"inner" &= max{2x_0 + W/2, x_0 + w_0/2} \
  x_1^"inner" &= min{2x_1 - W/2, x_1 - w_1/2} \
$

The gap between the cells is therefore
$
  g = x_1^"inner" - x_0^"inner" &= min{
    && x_1 - x_0 - (w_1 + w_0)/2, 
    quad && x_1 - 2x_0 - (w_1 + W)/2, \
    &&& 2x_1 - x_0 - (W + w_0)/2,
    && 2x_1 - 2x_0 - (W + W)/2}.
$
Remembering that we set $x_t = 0$,  we may use $(1 - t)x_0 + t x_1 = 0$ to eliminate $x_1 = (t - 1)/t x_0$.
$
  g &= min{
    && ((t - 1)/t - 1) x_0 - (w_1 + w_0)/2,
    quad && ((t - 1)/t - 2) x_0 - (w_1 + W)/2, \
    &&& (2(t - 1)/t - 1) x_0 - (W + w_0)/2,
    && (2(t - 1)/t - 2) x_0 - (W + W)/2} \
$
Simplifying this gives
$
  -t g &= max{x_0 + t(w_1 + w_0)/2, (1 + t) x_0 + t(w_1 + W)/2, (2 - t) x_0 + t(W + w_0)/2,  2 x_0 + t W}
$
where the $min$ turns into a $max$ because we multiplied by $-t <= 0$.
Notice that the right-hand side is a linear function of $x_0$ with positive slope.
We can therefore solve for $x_0$ by solving each case independently and taking the maximum solution (prove this to yourself by drawing some lines).
$
x_0 &= -t/2 max{2g + w_1 + w_0, (2g + w_1 + W)/(1 + t), (2g + W + w_0)/(2 - t), (2g + 2W)/(2) }
$
The new width of the cells are then:
$
  w'_0 &= 2x_0 + W \
  w'_1 &= 2((t - 1)/t) x_0 - W \
$


@tight-interp demonstrates the tight layout algorithm for various values of $u$.
Notice that, for each example, the center of the node at $u$ is exactly at the linear interpolation of the cell centers, and that the cells are never too large (always tightly fitting nodes they contain).

#figure(demofig(cell-sizer-tight), caption: [Example of interpolation with the tight layout algorithm.]) <tight-interp>

