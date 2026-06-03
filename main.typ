#asset("styles.css", read("/assets/styles.css"))
#asset("assets/header.png", read("/assets/header.png", encoding: none))

#let template(body) = {
  html.link(href: "/styles.css", rel: "stylesheet")

  html.link(
    href: "https://fonts.googleapis.com/css2?family=Crimson+Text:ital,wght@0,400;0,700;1,400;1,700&family=Mirza&display=swap",
    rel: "stylesheet",
  )

  html.header({
    link(<home>)[= Jollywatt]
    html.nav({
      link("?")[About]
      link("?")[Blog]
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
