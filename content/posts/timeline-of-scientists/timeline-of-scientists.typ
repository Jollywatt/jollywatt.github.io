#metadata((
  date: datetime(year: 2021, month: 08, day: 16),
  categories: ("interactive",),
  blurb: [
    Interactive timeline of famous scientists throughout history, using Wikidata.
  ],
  permalink: "timeline-of-scientists",
))

#metadata(asset("/assets/sample-query.json", read("sample-query.json")))

#title[Timeline of Scientists]

This is an interactive timeline of famous mathematicians and physicists throughout history.
The data is pulled from #link("https://wikidata.org")[Wikidata].

#html.script(src: "https://unpkg.com/vis-timeline@7.5.1/standalone/umd/vis-timeline-graph2d.min.js")

#html.div(class: "fullwidth")[
  Showing #html.input(id: "display-count", type: "number", value: "50") #html.button[↩︎] scientists, in decreasing order of number of Wikidata entities named after them.
  Hold `alt` and scroll to zoom.
  #html.div(id: "timeline")
]

#html.style(```css
.fullwidth {
  width: 100vw;
  background: hsl(40deg, 82%, 98%);
  position: relative;
  min-height: 200px;
  left: calc(50% - 50vw);
  padding: 5vw;
  box-sizing: border-box;
  box-shadow: 0px 12px 16px #0002;
}

#timeline .vis-item.vis-selected {
	/*height: 130px;*/
}

#timeline .vis-item:not(:hover):not(.vis-selected) .if-hover,
#timeline .vis-item:hover .if-not-hover,
#timeline .vis-item.vis-selected .if-not-hover,
#timeline .vis-item:not(.vis-selected) .if-selected {
	display: none;
}

.vis-item.vis-range:hover, .vis-item.vis-range.vis-selected {
	min-width: fit-content;
	z-index: 100;
	box-shadow: 0 2px 6px #0003;
}

.vis-item .vis-item-content {
  padding: 0 5px !important;
}
```.text)

#html.script(```js

window.addEventListener("load", () => {
  document.querySelectorAll("button").forEach(el => {
    el.onclick = () => buttonUpdate()
  })
  document.querySelectorAll("input").forEach(el => {
    el.onchange = () => buttonUpdate()
  })
})

class SPARQLQueryDispatcher {
	constructor( endpoint ) {
		this.endpoint = endpoint;
	}

	query( sparqlQuery ) {
		const fullUrl = this.endpoint + '?query=' + encodeURIComponent( sparqlQuery );
		const headers = { 'Accept': 'application/sparql-results+json' };

		return fetch( fullUrl, { headers } ).then( body => body.json() );
	}
}


function buttonUpdate() {
  console.log("hi")
	let count = document.getElementById('display-count').value
	fetch("/assets/sample-query.json")
		.then(response => response.json())
		.then(json => buildTimeline(json, count));
}

function query() {
	const endpointUrl = 'https://query.wikidata.org/sparql';
	const sparqlQuery = `
	SELECT ?human ?humanLabel ?family_nameLabel ?dob ?dod ?count
	WHERE
	{
	  {
	    SELECT
	      ?human
	      (COUNT(?item) as ?count)
	      (SAMPLE(?dobs) as ?dob)
	      (SAMPLE(?dods) as ?dod)
	      (SAMPLE(?family_names) as ?family_name)
	      (SAMPLE(?names) as ?name)
	    WHERE
	    {
	      VALUES ?fields { wd:Q395 wd:Q413 wd:Q18362 wd:Q901 }

	      ?human wdt:P31 wd:Q5.
	      ?human wdt:P101 ?fields.
	      ?item wdt:P138 ?human.

	      ?human wdt:P569 ?dobs.

	      OPTIONAL {
	        ?human wdt:P570 ?dods.
	        ?human wdt:P734 ?family_names.
	        ?human wdt:P1559 ?names.
	      }
	    }
	    GROUP BY ?human ?name
	  }


	  SERVICE wikibase:label { bd:serviceParam wikibase:language "en" }
	}
	ORDER BY DESC(?count)
	`

	const queryDispatcher = new SPARQLQueryDispatcher( endpointUrl );
	queryDispatcher.query( sparqlQuery ).then( response => {
		buildTimeline(response)
	});

}


// specify options
var options = {
	stack: true,
	horizontalScroll: true,
	verticalScroll: true,
	zoomKey: "altKey",
	maxHeight: 600,
	end: new Date(),
	margin: {
		item: 5, // minimal margin between items
		axis: 5, // minimal margin between items and the axis
	},
	// zoom max/min, specified in milliseconds
	zoomMin: 1e3*60*60*24*30, // about a month
	orientation: "top",
	order: (a, b) => b.info.score - a.info.score,
	xss: { disabled: true }, // IMPORTANT: required for html attributes to be preserved; https://github.com/visjs/vis-timeline/pull/1010
	template: (item, element, data) => {
		console.log('retemplate')
		let i = item.info
		// element.innerHTML = `
		return `
			<span class="if-not-hover">${i.shortname}</span>
			<span class="if-hover">${i.fullname}</span>
			<a class="if-selected" href=${item.info.wikidata} target="_blank">🔗</a>
			<div class="if-selected">
				<div>${i.dob.toLocaleDateString()} – ${i.isAlive ? 'present' : i.dod.toLocaleDateString()}</div>
				<div>${i.country || ''}</div>
			</div>
		`
	}
};


// create timeline
var container = document.getElementById("timeline");
window.itemSet = new vis.DataSet()
window.timeline = new vis.Timeline(container, itemSet, options);



function flattenEntities(row) {
	let flat = {}
	for (let prop in row) flat[prop] = row[prop]?.value
	return flat
}


function buildTimeline(response, maxItems=30) {
	const data = response.results.bindings

	itemSet.clear()

	let count = 0
	for (let entry of data) {
		count++
		if (count > maxItems) break

		entry = flattenEntities(entry)

		let info = {
			fullname: entry.humanLabel,

			score: entry.count,
			wikidata: entry.human,
			country: entry.countryLabel,
			dob: new Date(entry.dob),
			isAlive: entry.dod === undefined,
		}
		if (!info.isAlive) info.dod = new Date(entry.dod)

		info.shortname = entry.family_nameLabel || info.fullname,

		itemSet.add({
			start: info.dob,
			end: info.isAlive ? new Date() : info.dod,
			info,
		})
	}

	// timeline.setItems(itemSet)

	let {min, max} = timeline.getDataRange()
	timeline.setWindow(min, max)
}


buttonUpdate()
```.text)
