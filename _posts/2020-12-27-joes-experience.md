---
layout: post
title: "Light installation for Gatherings Restaurant"
author: "Joseph Wilson"
categories: interactive
coverimage: lightshow.png
tags: []
blurb: >
  Projector light show made for a multi-sensory dining experience.
---

A projected light show made for a multi-sensory dining experience at [Gatherings restaurant](https://www.gatherings.co.nz).

[Interactive fullscreen version](/projects/joes-experience/).

<style>

#gallery {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 40px;
  background: black;
  border-radius: 5pt;
}

#gallery canvas {
  width: 45%;
}

.black {
  background: black;
  color: #fffa;
  text-align: center;
  border-radius: 5pt;
  padding: 20pt;
  margin: 20pt 0;
  font-size: 0.9em;
  font-style: italic;

}

.black canvas {
  width: 85%;
}

</style>

<div class="black">
  <h3>Act 0: Arrival</h3>
  <p>
  Pet nat // sparkling white wine, honey, fielding, clover, shoreline, waipara champagne, popping.
  <br>
  Canapes, kina w potato, ricotta and seaweed tart // refined, interesting, saline, creamy green.
  </p>
  <canvas joe="0" width="1000" height="1000"></canvas>
</div>

<div class="black">
  <h3>Act 1: Genesis</h3>
  <p>
  Saltlick chardonnay, north Otago, 2015 // acid, hazy orange, green gaze, plums, transparent, open.
  <br>
  Crayfish and tomatoes // capsicum, smoky sweetness.</p>
  <canvas joe="1" width="1000" height="1000"></canvas>
</div>

<div class="black">
  <h3>Act 2: Richness and Shimmer</h3>
  <p>
  Limestone hills, Pinot noir // ash, wood, aromatic, Umeboshi, black olives, floral aroma.
  <br>
  Lado and raw tuna // red iron, flowers that grow on coastlines, native species, chewy fish, soft fat.
  </p>
  <canvas joe="2" width="1000" height="1000"></canvas>
</div>

<div class="black">
  <h3>Act 3: Catholic churches and Earth</h3>
  <p>
  Arden pinot noir 2018 // clay in soil, volume, roundness, saline, freshness.
  <br>
  Pumpkin, black garlic, yoghurt, onion // hemp seeds, nuttiness and fat, depth and earthiness.
  </p>
  <canvas joe="3" width="1000" height="1000"></canvas>
</div>

<div class="black">
  <h3>Act 4: Crescendo</h3>
  <p>
  Limestone Syrah - truffles, elderberries, black currants // wholesome, big notes, rich, chocolate.
  <br>
  Venison dish // autumnal forests, barbecue, elderberries, mushrooms, deep in the bush, raining.
  </p>
  <canvas joe="4" width="1000" height="1000"></canvas>
</div>

<div class="black">
  <h3>Act 5: Dessert</h3>
  <p>
  Dessert wine, 2011, still in barrel, convert Viognier // cloudy sweet.
  <br>
  Rhubarb cooked in black boy peach compot, kafir infused with kawa kawa, citrus granita.
  </p>
  <canvas joe="5" width="1000" height="1000"></canvas>
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
window.addEventListener('load', event => {
  main = new Controller()
  main.start()
  main.t = 2e5


  document.querySelectorAll('canvas').forEach(el => {
    let i = Number(el.getAttribute('joe'))
    main.canvases[i] = new window.canvasClasses[i](el)

    el.addEventListener("mousemove", event => {
      let rate = event.buttons ? 2 : 0.1
      let delta = rate*event.movementX
      main.canvases[i] .timeDeltaMomentum += delta
    })

  })

})

</script>