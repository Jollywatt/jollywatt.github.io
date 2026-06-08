#import "@preview/cetz:0.5.2"

#let subs(it, ..args) = {
  if type(it) == content and "text" in it.fields() { it = it.text }
  for (k, v) in args.named() {
    it = it.replace("{" + k + "}", str(v))
  }
  return it
}

#let set-perspective = cetz.draw.set-transform((
  (1, 0,-0.5, 0),
  (0,-1,+0.5, 0),
  (0, 0,   0, 0),
  (0, 0,   0, 1),
))


#let drawer(dest, body, width: 1, height: 1, inner: auto) = context {
  counter("drawer-layer").step()
  let (color, gutter, depth, thickness: t, units) = state("drawer").get()
  let inner = if inner == auto { color } else { inner }


  let open = false
  let cls = "drawer" + if open { " open" }
  show: html.div.with(
    class: cls,
    style: subs(
      ```
      --layer: -{layer};
      margin-top: -{depth}em;
      margin-left: -{depth}em;
      ```,
      layer: counter("drawer-layer").get().first(),
      depth: depth,
    ),
  )
  show: it => link(dest, it)
  html.div(class: "drawer-label", body)
  show: html.frame
  cetz.canvas(length: 1em, {
    import cetz.draw: *
    set-perspective
    let w = width * units.width + (width - 1) * gutter
    let h = height * units.height
    let d = 2 * depth
    let coords = (
      front: ((0, 0), (w, 0), (w, h), (0, h)),
      back: ((0, 0, d), (w, 0, d), (w, h, d), (0, h, d)),
      left: ((0, 0, 0), (0, 0, d), (0, h, d), (0, h, 0)),
      right: ((w - t, 0, 0), (w - t, 0, d - t), (w - t, h, d - t), (w - t, h, 0)),
      top: ((0, 0, 0), (w, 0, 0), (w, 0, d), (w - t, 0, d), (w - t, 0, t), (t, 0, t), (t, 0, d), (0, 0, d)),
    )

    set-style(stroke: (thickness: 1pt, join: "round"))
    line(..coords.back, close: true, fill: inner.darken(40%))
    line(..coords.right, close: true, fill: inner.darken(30%))
    line(..coords.left, close: true, fill: color.darken(20%))
    line(..coords.front, close: true, fill: color.darken(0%))
    boolean(
      line((0, 0, d), (w, 0, d), (w, 0, 0), (0, 0, 0), close: true),
      line((t, 0, d - t), (w - t, 0, d - t), (w - t, 0, t), (t, 0, t), close: true),
      op: "difference",
      fill: inner.darken(0%),
    )
  })
}


#let chest-frame(
  width,
  height,
  ..args,
) = context html.frame(cetz.canvas(length: 1em, {
  let (units, chest-depth, rim, shoe, leg, gutter, color) = args.named()
  import cetz.draw: *
  set-style(stroke: (thickness: 1pt, join: "round"))
  scale(y: -1)
  set-perspective
  let w = 2 * rim + width * units.width + (width - 1) * gutter
  let h = 2 * rim + height * units.height + (height - 1) * gutter
  let d = 2 * chest-depth
  let coords = (
    right: ((w - shoe, h + leg), (w - shoe, h + leg, d), (w - shoe, 0, d), (w - shoe, 0, 0)),
    front: ((0, 0), (w, 0), (w, h + leg), (w - shoe, h + leg), (w - shoe, h), (shoe, h), (shoe, h + leg), (0, h + leg)),
    left: ((0, h + leg), (0, h + leg, d), (0, 0, d), (0, 0, 0)),
    top: ((w, 0, 0), (w, 0, d), (0, 0, d), (0, 0, 0)),
  )
  line(..coords.right, close: true, fill: color.darken(20%))
  line(..coords.front, close: true, fill: color)
  line(..coords.left, close: true, fill: color.darken(20%))
  line(..coords.top, close: true, fill: color.darken(5%))
}))


#let chest-of-drawers(
  ..args,
  color: gray,
  width: 1,
  height: 1,
  units: (width: 4, height: 3),
  on-shelf: none,
  rim: 1,
  shoe: 1,
  leg: 0.7,
  gutter: 0.2,
  chest-depth: 1,
  drawer-depth: 1.2,
  drawer-thickness: 0.5,
) = context {
  counter("chest-layer").step()
  let css = subs(
    ```
    height: {height}em;
    --color: {color};
    --chest-depth: {chest-depth}em;
    --drawer-depth: {drawer-depth}em;
    --rim: {rim}em;
    --layer: {layer};
    --gutter: {gutter}em;
    ```,
    height: 2 * rim + height * units.height + (height - 1) * gutter + leg,
    color: color.to-hex(),
    chest-depth: chest-depth,
    drawer-depth: drawer-depth,
    rim: rim,
    layer: 1e3 - counter("chest-layer").get().first(),
    gutter: gutter,
  )

  show: html.div.with(class: "chest-of-drawers", style: css)

  html.div(class: "chest-top", on-shelf)

  chest-frame(
    width,
    height,
    units: units,
    color: color,
    chest-depth: chest-depth,
    rim: rim,
    shoe: shoe,
    leg: leg,
    gutter: gutter,
  )

  show: html.nav.with(
    class: "drawers-outer",
    style: subs(
      ```
      width: {w}em;
      height: {h}em;
      ```,
      w: width * units.width + (width - 1) * gutter + 1e-3,
      h: height * units.height + (height - 1) * gutter,
    ),
  )

  state("drawer").update((
    units: units,
    color: color,
    gutter: gutter,
    depth: drawer-depth,
    thickness: drawer-thickness,
  ))
  counter("drawer-layer").update(0)
  html.div(class: "drawers", args.pos().join())
}

#let template(body) = {
  html.link(rel: "preconnect", href: "https://fonts.googleapis.com")
  html.link(rel: "preconnect", href: "https://fonts.gstatic.com", crossorigin: "anonymous")
  html.link(href: "https://fonts.googleapis.com/css2?family=Noto+Serif+JP:wght@200..900&family=Zen+Maru+Gothic&display=swap", rel: "stylesheet")
  html.link(href: "/styles.css", rel: "stylesheet")
  body
}

#let furniture(chests) = {
  html.div(class: "furniture", chests)
}

#let shelf(depth: 4) = {
  show: html.div.with(
    class: "shelf",
    style: subs(
      ```css
      --shelf-depth: {depth}em;
      ```,
      depth: depth/2,
    )
  )
  show: html.frame
  cetz.canvas(length: 1em, {
    import cetz.draw: *
    set-perspective
    let (w, h) = (15, 1)
    let d = depth

    stroke((join: "round"))
    set-style(stroke: black, fill: luma(90%))

    let cutout = boolean(
      op: "difference",
      rect((0,0), (d,d)),
      circle((0,d), radius: d - h),
    )

    let shoe-width = 0.5
    let shoe(t) = group({
      translate(x: t*(w - shoe-width))
      boolean(
        op: "union",
        on-zy(cutout, x: shoe-width),
        rect((0,d,d - h), (shoe-width,0,d - h), stroke: none),
      )
      on-zy(cutout)
    })

    shoe(0)
    shoe(0.5)
    shoe(1)

    on-xy(rect((0,0), (w,h))) // front
    on-xz(rect((0,0), (w,d))) // top

  })
}

#let bookshelf(books, book-depth: 3) = {
  show: html.nav.with(class: "bookshelf",)
  counter("layer").update(0)
  html.div(class: "books", books)
  shelf()
}

#let book(
  dest,
  body,
  date: none,
  color: gray,
  height: 6,
  width: 1.5,
  depth: 3,
) = context {
  counter("layer").step()

  let open = state("current-page").get() == dest
  let cls = "book" + if open { " open" }
  show: html.div.with(
    class: cls,
    style: subs(
      ```
      --layer: -{layer};
      --book-height: {height}em;
      --book-width: {width}em;
      --book-depth: {depth}em;
      ```,
      layer: counter("layer").get().first(),
      height: height,
      width: width,
      depth: depth,
    ),
  )
  show: link.with(dest)
  html.div(class: "book-spine", {
    html.span(body, class: "book-spine-vertical")
    html.span(date, class: "book-spine-horizontal")
  })
  show: html.frame
  cetz.canvas(length: 1em, {
    import cetz.draw: *
    set-perspective
    let h = height
    let w = width
    let d = depth
    stroke((join: "round"))
    set-style(stroke: black, fill: color)

    on-zy(rect((0,0), (d,h)))
    on-xy(rect((0,0), (w,h)))
    on-xz({
      let N = int(width*4)
      rect((0,0), (w,d), fill: white)
      range(N).map(n => n/(N - 1)).map(t => {
        line((t*w,0), (t*w,d), stroke: 0.5pt)
      }).join()
    })
  })
}
