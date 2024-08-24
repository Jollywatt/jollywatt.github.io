---
layout: page
title: Creative things
permalink: /art
---

<style>

.gallery {
	display: flex;
	flex-wrap: wrap;
	justify-content: center;
	align-items: center;
	gap: 40px;
}

.s1 { width: 80%; }
.s2 { width: calc(50% - 20px); }
.s40 { width: calc(40% - 20px); }
.s3 { width: calc(33% - 50px); }

.black {
	background: black;
	border-radius: 5px;
	inset: 10%;
}
.o {
	border-radius: 100%;
	height: 100%;
	aspect-ratio: 1/1;
}

canvas {
	width: 100%;
	height: 100%;
	border-radius: inherit;
}

a {
	border-radius: inherit;
}

</style>


A mixture of my digital art, photography, and drawing.


<div class="gallery">
	<img class="s2" src="{{ site.github.url }}/art/siamese.png"/>
	<img class="s2" src="{{ site.github.url }}/art/cafe-roi.png"/>
	<!--  -->
	<img class="s2" src="{{ site.github.url }}/art/Robin.png"/>
	<img class="s2" src="{{ site.github.url }}/art/Quail.png"/>
	<!--  -->
	<img class="s1" src="{{ site.github.url }}/art/louie-et-garon.jpg"/>
	<!--  -->
	<div class="black s40 o"><a href="{{ site.github.url }}/joes-experience"><canvas joe="3" width="600" height="600"/></a></div>
	<div class="black s2 o"><a href="{{ site.github.url }}/joes-experience"><canvas joe="2" width="600" height="600"/></a></div>
	<!--  -->
	<div class="black s2"><a href="{{ site.github.url }}/joes-experience"><canvas joe="4" width="600" height="600"/></a></div>
	<div class="black s2"><a href="{{ site.github.url }}/joes-experience"><canvas joe="5" width="600" height="600"/></a></div>
	<!--  -->
	<img class="s2" src="{{ site.github.url }}/art/bubble.jpg"/>
	<img class="s2" src="{{ site.github.url }}/art/bold-and-brash.jpg"/>
</div>


<script src="{{ site.github.url }}/projects/joes-experience/color-utils.js"></script>
<script src="{{ site.github.url }}/projects/joes-experience/global.js"></script>
<script src="{{ site.github.url }}/projects/joes-experience/main.js"></script>
<script src="{{ site.github.url }}/projects/joes-experience/0.motif.js"></script>
<script src="{{ site.github.url }}/projects/joes-experience/1.genesis.js"></script>
<script src="{{ site.github.url }}/projects/joes-experience/2.earth.js"></script>
<script src="{{ site.github.url }}/projects/joes-experience/3.church.js"></script>
<script src="{{ site.github.url }}/projects/joes-experience/4.crescendo.js"></script>
<script src="{{ site.github.url }}/projects/joes-experience/5.dessert.js"></script>

<script>

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

	document.querySelectorAll('.gallery canvas').forEach(el => {
		let i = Number(el.getAttribute('joe'))
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

</script>
