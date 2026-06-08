A mixture of my digital art, photography, and drawing.


#let img(path, ..args) = {
  let src = "art/" + path
  metadata(asset(src, read(path, encoding: none)))
  html.img(src: src, ..args)
}

#html.style(```css
.s1 { width: 75%; }
.s2 { width: calc(var(--main-width)/2 - var(--gap)/2); }
.slide {
  border-radius: 100%;
  background: black;
	padding: 1em;
	box-sizing: border-box;
	overflow: hidden;
}
.slide canvas {
	width: 100%;
	height: 100%;
}

```.text)

#html.div(style: ```css
text-align: center;
display: flex;
justify-content: center;
--gap: 2vw;
gap: var(--gap);
flex-wrap: wrap;
```.text, {
  img("siamese.png", class: "s2")
  img("cafe-roi.png", class: "s2")
  img("Robin.png", class: "s2")
  img("Quail.png", class: "s2")
  img("maths-orb.png", class: "s1")
  for slide in (4, 5, 3, 2) {
    show: html.div.with(class: "slide s2")
    link(<lightshow>, html.canvas(width: 600, height: 600, class: "lightshow-" + str(slide)))
  }
  img("louie-et-garon.jpg", class: "s1")
  img("bubble.jpg", class: "s2")
  img("bold-and-brash.jpg", class: "s2")
})


#for src in ("color-utils.js",
"global.js",
"main.js",
"0.motif.js",
"1.genesis.js",
"2.earth.js",
"3.church.js",
"4.crescendo.js",
"5.dessert.js") {
  html.script(src: "Gatherings Lightshow/" + src)
}


#html.script(```js
window.canvasClasses = {
0: Poster,
1: Genesis,
2: Earth,
3: Church,
4: Crescendo,
5: Dessert,
}

window.joe = new Controller()
window.addEventListener('load', event => {
joe.start()
joe.t = 2e5

Array.from(document.querySelectorAll('canvas')).forEach((el, i) => {
	let canvas = new window.canvasClasses[i](el)
	canvas.fadeRate = 1e-1

	el.addEventListener("mousemove", event => {
		let rate = event.buttons ? 5 : 0.5

		let delta = rate*event.movementX
		canvas.timeDeltaMomentum += delta
	})

	joe.canvases[i] = canvas

})

})
```.text)
