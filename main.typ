#asset("styles.css", read("/assets/styles.css"))
#asset("assets/header.png", read("/assets/header.png", encoding: none))
#asset("assets/me.jpg", read("/assets/me.jpg", encoding: none))


#let template(body) = {
  html.link(href: "/styles.css", rel: "stylesheet")

  html.link(
    href: "https://fonts.googleapis.com/css2?family=Crimson+Text:ital,wght@0,400;0,700;1,400;1,700&family=Mirza&display=swap",
    rel: "stylesheet",
  )

  html.header({
    link(<home>)[= Jollywatt]
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



#let posts = {
  readdir("content/posts")
    .filter(path => path.ends-with(".typ"))
    .map(path => {
      let name = path.split("/").last().replace(regex("\.typ$"), "")
      (
        path: path,
        name: name,
        id: label("post-" + name),
      )
    })
}


#for post in posts {
  [#document(post.name + ".html", {
      template(include post.path)
    }) #post.id]
}

#document("blog/index.html", {
  template[
    #title[Blog]

    #for post in posts {
      [- #link(post.id)[#post.name]]
    }
  ]
}) <blog>
