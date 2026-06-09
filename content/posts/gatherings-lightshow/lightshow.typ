#metadata((
date: datetime(year: 2020, month: 12, day: 27),
categories: ("interactive",),
image: "/media/lightshow.png",
blurb: [
  Projector light show made for a multi-sensory dining experience.
],
permalink: "Gatherings-Lightshow/index",
))
#title[Light installation for Gatherings Restaurant]

#metadata(asset("/media/lightshow.png", read("lightshow.png", encoding: none)))
#metadata[#asset("Gatherings-Lightshow/fullscreen.html", read("index.html")) <lightshow-fullscreen>]

These are the graphics from a projected light show made for a multi-sensory dining experience at #link("https://www.gatherings.co.nz")[Gatherings restaurant] in December, 2020.
The _motif_ for the event was a glass of red wine combined with a solar system...

#link(<lightshow-fullscreen>)[Interactive fullscreen version].


#html.style(```css

.scene {
  background: black;
  color: #fffa;
  text-align: center;
  border-radius: 5pt;
  padding: 20pt;
  margin: 20pt 0;
  font-size: 0.9em;
  font-style: italic;
  cursor: col-resize;

}

.scene canvas {
  width: 85%;
}

:root {
  backdrop-filter: invert(0.8);
  color-scheme: dark;
}

body {
  background: url("/assets/header.png") fixed top no-repeat;
  background-color: var(--sky-white);
  background-blend-mode: multiply;
  background-size: var(--main-width);
}


```.text)

#let scene(title, desc) = html.div(class: "scene")[
  == #title

  #desc

  #html.canvas(width: 1000, height: 1000)
]


#scene[Act 0: Arrival][
  Pet nat \// sparkling white wine, honey, fielding, clover, shoreline, waipara champagne, popping. \
  Canapes, kina w potato, ricotta and seaweed tart \// refined, interesting, saline, creamy green.
]

#scene[Act 1: Genesis][
  Saltlick chardonnay, north Otago, 2015 \// acid, hazy orange, green gaze, plums, transparent, open.
]

#scene[Act 2: Richness and Shimmer][
  Limestone hills, Pinot noir \// ash, wood, aromatic, Umeboshi, black olives, floral aroma. \
  Lado and raw tuna \// red iron, flowers that grow on coastlines, native species, chewy fish, soft fat.
]

#scene[Act 3: Catholic churches and Earth][
  Arden pinot noir 2018 \// clay in soil, volume, roundness, saline, freshness. \
  Pumpkin, black garlic, yoghurt, onion \// hemp seeds, nuttiness and fat, depth and earthiness.
]

#scene[Act 4: Crescendo][
  Limestone Syrah - truffles, elderberries, black currants \// wholesome, big notes, rich, chocolate. \
  Venison dish \// autumnal forests, barbecue, elderberries, mushrooms, deep in the bush, raining.
]

#scene[Act 5: Dessert][
  Dessert wine, 2011, still in barrel, convert Viognier \// cloudy sweet. \
  Rhubarb cooked in black boy peach compot, kafir infused with kawa kawa, citrus granita.
]

#let scr(path) = {
  let src = "/Gatherings Lightshow/" + path
  metadata(asset(src, read(path)))
  html.script(src: src)
}
#scr("color-utils.js")
#scr("global.js")
#scr("main.js")
#scr("0.motif.js")
#scr("1.genesis.js")
#scr("2.earth.js")
#scr("3.church.js")
#scr("4.crescendo.js")
#scr("5.dessert.js")


#html.script(```js
window.canvasClasses = {
  0: Poster,
  1: Genesis,
  2: Earth,
  3: Church,
  4: Crescendo,
  5: Dessert,
}
window.addEventListener('load', event => {
  main = new Controller()
  main.start()
  main.t = 2e5

  Array.from(document.querySelectorAll('canvas')).map((el, i) => {
    main.canvases[i] = new window.canvasClasses[i](el)

    el.addEventListener("mousemove", event => {
      let rate = event.buttons ? 4 : 0.5
      let delta = rate*event.movementX
      main.canvases[i] .timeDeltaMomentum += delta
    })

  })

})
```.text)
