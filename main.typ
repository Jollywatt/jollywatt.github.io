
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

  show: html.div.with(class: "container")

  html.header({
    html.div(class: "site-name", link(<blog>)[Jollywatt])
    html.nav({
      link(<about>)[About]
      link(<blog>)[Blog]
      // link("?")[Research]
      link(<software>)[Software]
      link(<art>)[Art]
      link(<cv>)[Resumé]
    })
  })

  html.main({
    body
  })

  html.footer({
    html.hr()
    [
      Made entirely with #link("https://typst.app")[Typst]
    ]
  })
}

#document("index.html", template[
  welcome
]) <home>


#document("art.html", template(include "content/art/art.typ")) <art>
#document("software.html", template(include "content/software.typ")) <software>


#document("about.html", template(include "content/about.typ")) <about>
#document("resume.pdf", include "content/cv.typ") <cv>

#let post-meta(id) = {
   query(selector(metadata).within(id)).first().value
}

#let post-info = ()
#for path in glob("content/posts/**/*.typ") {
  let name = path.split("/").last().replace(regex("\.typ$"), "")
  let id = label(name)
  let doc = document("blog/" + name + ".html", template({
    context html.div(class: "post-meta", {
      let meta = post-meta(id)
      meta.date.display("[day] [month repr:long] [year]")
    })
    include path
  }))
  [#doc #id]
  post-info.push((id: id, path: path))
}

#let all-posts() = (
  post-info
    .map(post-info => {
      let title = query(selector(title).within(post-info.id)).first().body
      let meta = post-meta(post-info.id)
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
  html.style(
    ```css
    .cover-image {
      max-height: 200px;
      overflow-y: hidden;
      border-radius: var(--rounded);
      box-shadow: 0 4px 8px #0002;
    }
    ```.text,
  )
  template[

    #context (
      all-posts()
        .map(meta => {
          html.div(class: "post-meta", {
            meta.date.display("[day] [month repr:long] [year]")

            meta.at("categories", default: ()).map(tag => [ #sym.bullet #tag]).join()
          })

          heading(link(meta.id, meta.title))

          if "image" in meta {
            html.div(class: "cover-image", {
              link(meta.id, html.img(src: meta.image))
            })
          }

          if "blurb" in meta {
            meta.blurb
          } else {
            panic("missing blurb for " + meta.path)
          }
        })
        .join(html.hr())
    )
  ]
}) <blog>



/* assets */

#for file in glob("assets/*.*") {
  asset(file, read(file, encoding: none))
}

#context for m in query(metadata) {
  let v = m.value
  if type(v) == dictionary and "asset" in v {
    let it = asset(v.to, read(v.asset, encoding: none))
    if "label" in v {
      [#it #v.label]
    } else { it }
  } else if type(v) == content {
    v
  }
}
