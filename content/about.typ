= Joseph Alexander Wilson


#let text = html.div[
  Hello! I'm an applied mathematics PhD candidate from New Zealand researching at the University of Cambridge. My #link(<msc-thesis>)[master's thesis] was in geometric algebra and relativity.

  I like to tinker around --- here you will find some mathematical tidbits, interactive things, arty scraps, and past projects.
]

#let photo = html.img(src: "/assets/me-3.jpg")

#html.div(class: "row", text + photo)

#html.style(```css
img {
  min-width: 30%;
}
@media (min-width: 600px) {
  .row {
    display: flex;
    gap: 1em;
  }
}
```.text)
