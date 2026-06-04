// #asset("styles.css", read("/assets/styles.css"))
// #asset("assets/header.png", read("/assets/header.png", encoding: none))
// #asset("assets/me.jpg", read("/assets/me.jpg", encoding: none))
#for file in glob("assets/*.*") {
  asset(file, read(file, encoding: none))
}

#show math.equation.where(block: true): it => {
  if target() == "html" {
    html.div(html.frame(it), class: "block-equation")
  } else {
    it
  }
}

#show math.equation.where(block: false): it => {
  box(html.frame(it))
}




#let template(body) = {
  html.link(href: "/assets/styles.css", rel: "stylesheet")

  html.link(
    href: "https://fonts.googleapis.com/css2?family=Crimson+Text:ital,wght@0,400;0,700;1,400;1,700&family=Mirza&display=swap",
    rel: "stylesheet",
  )

  html.header({
    html.div(class: "site-name", link(<blog>)[Jollywatt])
    html.nav({
      link(<about>)[About]
      link(<blog>)[Blog]
      link("?")[Research]
      link("?")[Software]
      link("?")[Art]
      link("?")[Resumé]
    })
  })

  html.main({
    body
  })

  html.footer({})
}

#document("index.html", {
  template[
    welcome
  ]
}) <home>




#document("about.html", template(include "content/about.typ")) <about>

#let post-info = ()
#for path in glob("content/posts/**/*.typ") {
  let name = path.split("/").last().replace(regex("\.typ$"), "")
  let doc = document(name + ".html", {
    template(include path)
  })
  let id = label("post-" + name)
  [#doc #id]
  post-info.push((id: id, path: path))
}

#let all-posts() = (
  post-info
    .map(post-info => {
      let title = query(selector(title).within(post-info.id)).first().body
      let meta = query(selector(metadata).within(post-info.id)).first().value
      (
        ..post-info,
        title: title,
        ..meta,
      )
    })
    .sorted(key: meta => meta.date)
    .rev()
)

#document("blog/index.html", {
  template[

    #context for meta in all-posts() {
      html.div(class: "post-meta", meta.date.display("[day] [month repr:long] [year]"))
      heading(link(meta.id, meta.title))

      if "image" in meta {
        link(meta.id, html.img(src: meta.image))
      }

      if "blurb" in meta {
        meta.blurb
      } else {
        panic("missing blurb for " + meta.path)
      }

      html.hr()
    }
  ]
}) <blog>


#context for m in query(metadata) {
  let v = m.value
  if type(v) == dictionary and "asset" in v {
    let it = asset(v.to, read(v.asset, encoding: none))
    if "label" in v {
      [#it #v.label]
    } else { it }

  } else if type(v) == content and v.func() == asset {
    v
  }
}
