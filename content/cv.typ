#let accent = rgb(60,150,60).lighten(40%)
#let margin = 65mm
#let kebab-gap = 5mm

#let kebab-item = (lhs, mid, rhs) => context {
	let dx = measure(lhs).width
	let lineh = measure([.#rhs]).height

	move(
		dx: -dx - 2*kebab-gap,
		align(top, grid(
			columns: 3,
			box(height: lineh, align(bottom, text(top-edge: "x-height", lhs))),
			box(width: 2*kebab-gap, height: lineh, align(horizon + center, mid)),
			block(width: 13cm, rhs),
		))
	)

}

#let kebab-bullets = (
	place(center + top,
		line(start: (0pt, 0pt), end: (0pt, -3mm), stroke: white + 1.5pt)) +
		circle(radius: 3pt, stroke: accent, fill: accent),
	circle(radius: 3pt, stroke: accent, fill: white),
	circle(fill: accent, radius: 1.7pt),
)

#let dot = (lhs, rhs) => {
	let level = if lhs.func() == heading {
		calc.min(lhs.at("depth"), kebab-bullets.len()) - 1
	} else {2}

	v((8mm, 0mm, -0.2em).at(level, default: 2))
	kebab-item(
		lhs,
		kebab-bullets.at(level),
		rhs,
	)
}

#show list: it => {
	it.children.map(item => dot([], item.body)).join()
}

#let where = smallcaps
#let UC = where[University of Canterbury]

#set page(
	margin: (left: margin, y: 2cm, right: 2cm),
	background: align(top + left, line(
		start: (margin - kebab-gap, 0mm),
		end: (margin - kebab-gap, 100%),
		stroke: accent,
	)),
	footer: context [
		#dot[#counter(page).display()][#counter(page).final().at(0)]
	]
)


#set text(font: "Montserrat", size: 10.5pt, fallback: false)
#show heading: set text(weight: 400, size: .8em)
#show heading.where(level: 1): strong

#set strong(delta: 100)


#show link: it => underline(text(fill: accent.darken(50%), it))


#box((
	block(text(size: 23pt, [Joseph #h(1fr) Alexander #h(1fr) Wilson], weight: 300)),
	pad(y: .16em, line(start: (-kebab-gap, 0pt), end: (100%, 0pt), stroke: accent)),
	(
		`jo.alex.w@gmail.com`,
		link("https://jollywatt.github.io")[jollywatt.github.io],
		[Cambridge, UK],
		// [PhD Candidate],
	).intersperse(h(1fr)).join()
).join(), width: 105mm)


#let sections = (
skills: [

	#dot[= Skills and Interests][
		// #link("https://github.com/Jollywatt/")[GitHub profile] and
		// #link("https://jollywatt.github.io/")[Personal website]
		Broad interests in software, mathematics, pedagogy
	]

	#dot[== Open source][
		#link("https://github.com/Jollywatt/typst-fletcher")[fletcher] (Typst diagramming package)
		#link("https://github.com/Jollywatt/GeometricAlgebra.jl")[GeometricAlgebra.jl] (Julia),
	]
	#dot[== Languages][English, French (CEFR B1)]
	#dot[== Hobbies][Piano, modern jive dance]
	#dot[== Design][Scientific typesetting, graphic design, web design]

	#dot[== Code][Julia, Python, R, Jujutsu VCS / Git, Typst, Unix, Node, React]
],

edu: [

	#dot[= Education][]//[_Maintained A#super[+] GPA across all qualifications_]

	#dot[== 2024-present][*PhD in Engineering*, #where[University of Cambridge], UK]

	Applications of geometric algebra in engineering, supervisor Prof.~Joan Lasenby.

	#dot[== 2021--2022][*Master of Science with Distinction*, #where[Victoria University of Wellington], NZ]

	Thesis #link("https://openaccess.wgtn.ac.nz/articles/thesis/Geometric_Algebra_for_Special_Relativity_and_Manifold_Geometry/21185911")[Geometric Algebra for Special Relativity and Manifold Geometry] supervised by Dr.~Matt Visser, GPA 9/9.

	#dot[== 2020][*Postgraduate Certificate in Science*, #where[University of Canterbury], NZ]

	Literature review #link("https://jollywatt.github.io/assets/pdf/2020.Strong-CP-Problem-and-Axions.pdf")[An Overview of the Strong _CP_ Problem and Axion Cosmology] supervised by Dr.~Jenni Adams, GPA 9/9.

	#dot[== 2017--2019][*Bachelor of Science with First Class Honours*, #where[University of Canterbury], NZ]

	Honours project #link("https://jollywatt.github.io/assets/pdf/2019.Asymptotic-Structure-of-FLRW.pdf")[Asymptotic Structure and Symmetries of FLRW Universes] supervised by Dr.~David Wiltshire, GPA 9/9.
	Included summer research projects:

	- #link("https://jollywatt.github.io/model-of-galactic-bar-and-disk")[Visualising the Freudenreich 1998 Model of the Galactic Bar and Disk]
	- #link("https://jollywatt.github.io/assets/pdf/2019.Crystal-Band-Structures-CP2K.pdf")[Computing Crystal Band Structures with CP2K]

],

work: [

	#dot[= Work experience][_References available on request_]

	#dot[== 2022--2024][
		*Statistical and Data Analyst*, #where[Statistics New Zealand]
	]

	// 	Contributions in the Research and Development Hub:

	// - Creation of the #link("https://www.stats.govt.nz/research/experimental-administrative-population-census-third-iteration-data-sources-methods-and-quality-for-household-information/")[experimental administrative household dataset].
	- Technical leader in the Statistical Computing Network, led #smallcaps[R for Data Science] book club.


	#dot[== 2021][
		*Tutor and lab demonstrator*, #where[Victoria University of Wellington]
	]

	// #dot[== 2020-2021][
	// 	*Private tutor for maths and physics*, #where[University of Canterbury]
	// ]

	#dot[== 2020][
		*Tutor and teacher's assistant*, #where[University of Canterbury]
	]

],

pubs: [

	#dot[= Publications][]

	#dot[2021][#link("https://doi.org/10.1142/S0219887821502261")[Explicit BCHD formula for Spacetime via Geometric Algebra]]
	J.~Wilson, M.~Visser, #where[Int.~J.~of Geometric Methods in Modern Physics]

],

awards: [

	#dot[= Awards][]

	#let nzd(x) = x + h(1pt) + [NZD]

	#let worth = it => it
	#let worth = it => none

	#dot[== 2024][International Cambridge Scholarship]
	#dot[/*2024*/][Prince of Wales Student for 2024-25]
	#dot[== 2021][Wellington Master's by Thesis Scholarship #worth[(#nzd[15k] and tuition fees)]]
	#dot[== 2019][University of Canterbury Senior Scholarship #worth[(#nzd[2k])]]
	#dot[/*2019*/][Summer Research Scholarship #worth[(#nzd[2k] and tuition fees)]]
	#dot[== 2018][Vice-Chancellor's Excellence Award #worth[(fees for extra course in bioethics)]]
	#dot[/*2018*/][William Brent Wilson Memorial Prize]
	#dot[/*2018*/][University of Canterbury Mathematics & Statistics Scholarship #worth[(#nzd[3k])]]
	#dot[== 2017][Madam Tiong Guok Hua Memorial Prize in Science #worth[(#nzd[3.8k])]]
	#dot[/*2017*/][Institute of Physics Prize]

]

)

#par(justify: true)[
Engineering PhD student at the University of Cambridge, interested in geometric algebra, statistical inference and computer graphics.
]

#sections.edu
#sections.pubs
#sections.skills
#sections.work
#sections.awards
