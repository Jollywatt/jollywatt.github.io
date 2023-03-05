---
layout: post
title: "Daylight Hours: A spherical geometry problem"
author: "Joseph Wilson"
categories: interactive
tags: []
blurb: |
  How many hours are there between sunrise and sunset?
  The Earth’s tilt makes this a fun geometry problem…
---

<script async src="https://www.desmos.com/api/v1.7/calculator.js?apiKey=dcb31709b452b1cf9dc26972add0fda6" onload="init()"></script>
<style>
.figlabel {
	font-family: sans-serif;
}
.fig {
	margin: auto;
	width: 450px;
	height: 350px;
}
</style>


How many hours are there between sunrise and sunset?
The Earth’s tilt makes this a fun geometry problem…

## Hours of daylight at the solstice

Let $$ε$$ be the Earth’s tilt, or _obliquity_. This is the angle between Earth’s axis of rotation $$N$$ and the normal to Earth’s orbital plane around the sun, $$O$$.
At first, let’s assume that the Earth tilts directly toward the sun (or directly away, for $$ε < 0$$).
This direct alignment occurs twice a year, at the summer and winder solstices.
We can consider seasons later; for now, assume we’re at summer solstice.


In this scenario, the boundary between day and night is a great circle whose angle from the north pole is $$ε$$.
In the figure below, we show the Earth with the north pole always pointing up, so that changing the tilt $$ε$$ changes the relative position of the sun.

<div id="fig1" class="fig"></div>

Now, let $$φ$$ be the latitude of a reference point on Earth, so that $$φ = 0$$ is on the equator, and $$φ > 0$$ is in the northern hemisphere.
Looking down on the north pole, we see that the number of daylight hours is determined by the arc length of the circle of latitude which lies outside the shadow of night.

<div id="fig2" class="fig"></div>

To find this arc length in terms of $$ε$$ and $$φ$$, we must find the points of intercept of the circle of latitude with the ellipse defined by the top-down view of the day/night boundary.

### Dawn and dusk intercept points

Assuming that the Earth is the unit circle, the circle of latitude has radius $$\cos φ$$, and the day/night ellipse has width $$\sin ε$$ and unit height. Parametrically, the ellipse is represented as

$$
(x, y) = (\sin ε \cos λ, \sin λ), λ ∈ [0, 2π)
.$$

This intercepts the circle when the length of the vector $$(x, y)$$ is the circle’s radius, $$\|(x, y)\| = \cos φ$$.
Squaring this, we get the intercept condition

$$
\sin^2 ε \cos^2 λ + \sin^2 λ = \cos^2 φ
$$

which, using $$\cos^2 λ = \frac12(1 + \cos 2λ)$$ and $$\sin^2 λ = \frac12(1 - \cos 2λ)$$, is the same as

$$
1 + \sin^2ε + (\sin^2 ε - 1)\cos 2λ = \cos^2φ
.$$

Solving for the parameter value $$λ$$, we get

$$
\cos 2λ = \frac{2\cos^2φ - \sin^2 ε - 1}{\sin^2 ε - 1}
= 2 \left( \frac{\sin^2 φ}{\cos^2 ε} \right) - 1
$$

where we use $$\cos^2 θ + \sin^2 θ = 1$$ twice to simplify.
Instead of solving directly for $$λ$$ here, note that the right-hand side matches the identity $$\cos 2λ = 2\cos^2 λ - 1$$, so we must have

$$
\cos λ = \frac{\sin φ}{\cos ε}
.$$

Inverting this in generality gives us

$$
λ = ±\arccos\left(\frac{\sin φ}{\cos ε}\right) + 2nπ
$$

for some $$n ∈ ℤ$$. If we take just the positive value for $$n = 0$$ then we have $$λ ∈ [0, π]$$, since this is the conventional range of $$\arccos$$.
This means our intercept point $$(x, y) = (\sin ε \cos λ, \sin λ)$$, shown by the highlighted dot, always falls in the upper half-plane:

<div id="fig3" class="fig"></div>

This is one of four possible intercepts, but it’s the one we want: when $$εφ > 0$$, the intercept is in the first quadrant, and when $$εφ < 0$$ it is in the second, which is consistent with out three-dimensional picture of Earth, where the intercept we want depends on which hemisphere we’re in.

We’re almost done, but the parameter value $$λ$$ isn’t the actual polar angle of the intercept point — we need that to find the arc length which lies in daylight.
The polar coordinate $$θ$$ of the intercept point $$(x, y)$$ is

$$
θ = \arctan\left(\frac{y}{x}\right) = \arctan\left(\frac{\sinλ}{\sin ε \cos λ}\right) = \arctan\left(\frac{1}{\sin ε} \tan λ\right)
.$$

The arc length is thus twice this angle, $$2θ$$, while the total circumference is $$2π$$. Therefore, written in full, the fraction of the day in daylight is

$$
L = \frac1π\arctan\left(\frac{1}{\sin ε} \tan \left[\arccos\left(\frac{\sin φ}{\cos ε}\right)\right]\right)
.$$


## Incorporating seasons

In reality, the Earth’s tilt is not exactly toward or away from the sun, because it orbits the sun while its axis of rotation remains fixed.

At the northern summer solstice, the north pole is tilted toward the sun. Let $$ω$$ be the angle of the Earth’s course around the sun from this point.

Looking down the axis the orbital plane, $$O$$, with the sun always to the right, we see the north pole trace out a circle as $$ω$$ varies over the course of a year.

<div id="fig4" class="fig"></div>

The Earth’s obliquity $$ε_0$$ remains fixed (the angle of the dashed green arc).
However, the true angle the north pole makes from the day–night boundary (the solid green arc which we called $$ε$$ before) varies with $$ω$$.
This is the seasonal dependence of day length.

Our task now is to find $$ε$$ in terms of $$ε_0$$ and $$ω$$.

The points $$O$$, $$N$$ and $$P$$ form a spherical triangle in which each side is an arc of a great circle.
To find $$ε$$, the angle of the arc $$\overline{PN}$$, we may use the spherical law of sines:

$$
\frac{\sin a}{\sin A} = \frac{\sin b}{\sin B} = \frac{\sin c}{\sin C}
$$

Specifically, this gives us

$$
\frac{\sin\overline{PN}}{\sin(\frac{π}{2} - ω)} = \frac{\sin\overline{ON}}{\sin\frac{π}{2}}
$$

which reduces to

$$
\frac{\sin ε}{\cos ω} = \sin ε_0
.$$

For completeness, the full expression for the fraction of the day in daylight is

$$
L = \frac1π\arctan\left(\frac{1}{\sin ε_0\cosω} \tan \left[\arccos\left(\frac{\sin φ}{\sqrt{1 - (\sin ε_0\cosω)^2}}\right)\right]\right)
$$

where $$ε_0 = 24.5^\circ$$ is the obliquity of the Earth, $$φ$$ is the latitude of the reference point and $$ω$$ is the season expressed as the arc angle along Earth’s orbit since the solstice.


<script>

function rad2deg(rad) {
	return rad/Math.PI*180
}

function formatAngle(θ) {
	return rad2deg(θ).toFixed(1).replace('-', '–') + '°'
}

const blankState = '{"version":9,"randomSeed":"b367d92c499065f3d4350285a27f66c5","graph":{"viewport":{"xmin":-2.0103521055964753,"ymin":-1.340234737064317,"xmax":2.0103521055964744,"ymax":1.3402347370643162},"showGrid":false,"showXAxis":false,"showYAxis":false,"xAxisNumbers":false,"yAxisNumbers":false,"polarNumbers":false},"expressions":{"list":[{"type":"expression","id":"6","color":"#c74440"}]}}'



let expressions = {
	view: [
		{
			id: "earth",
			latex: "x^{2}+y^{2}\\le1",
			color: "#2d70b380",
			lineWidth: 0,
		},
		{
			id: "view slider value",
			latex: "o_{s}=0",
			sliderBounds: {
				min: 1e-10,
				max: 1,
			},
		},
		{
			id: "view angle",
			latex: "o=\\frac{\\pi}{2}o_{s}",
		},
		{
			id: "view slider",
			latex: "\\left(-\\frac{3}{2},o_{s}\\right)",
			color: "#000000",
			showLabel: true,
			label: "View",
		},
		{
			id: "view slider line",
			latex: "\\left(-\\frac{3}{2},t\\right)",
			color: "#000000",
		},
		{
			id: "equator circle back",
			latex: "\\left(\\cos t, \\left(\\cos o\\right)\\sin t\\right)",
			color: "black",
			lineWidth: 0.5,
			lineOpacity: "(1 - \\sqrt{o_{s}}/2)^2",
			parametricDomain: { min: 0, max: "\\pi" },
		},
		{
			id: "equator circle front",
			latex: "\\left(\\cos t, \\left(\\cos o\\right)\\sin t\\right)",
			color: "black",
			lineWidth: 0.5,
			parametricDomain: { min: "\\pi", max: "2\\pi" },
		},
		{
			id: "rotation",
			latex: "R\\left(\\alpha,\\ A,\\ B\\right)=A\\cos\\alpha+B\\sin\\alpha",
		},
	],

	obliquity: [
		{
			id: "north pole",
			latex: "\\left(0,\\ \\sin o\\right)",
			color: "#c74440",
			showLabel: true,
			label: "N",
		},
		{
			id: "obliquity slider value",
			latex: "\\varepsilon_{s}=-0.5",
			sliderBounds: {
				min: "-1+10^{-10}",
				max: 1,
			},
		},
		{
			id: "obliquity angle",
			latex: "\\varepsilon=\\arcsin \\varepsilon_{s}",
		},
		{
			id: "obliquity slider",
			type: "expression",
			latex: "\\left(\\varepsilon_{s},\\ \\left(\\sin o\\right)\\left(\\cos \\varepsilon\\right)\\right)",
			dragMode: "NONE",
			color: "#388c46",
			showLabel: true,
		},
		{
			id: "solar system pole",
			latex: "\\left(\\varepsilon_{s},\\ \\left(\\sin o\\right)\\left(\\cos \\varepsilon\\right)\\right)",
			color: "black",
			label: "O",
			showLabel: true,
		},
		{
			id: "obliquity slider curve",
			type: "expression",
			latex: "\\left(\\sin t,\\ R\\left(o,0,\\cos t\\right)\\right)",
			color: "#388c46",
			// lineStyle: "DASHED",
			// lineWidth: 1,
			parametricDomain: {
				min: "\\min\\left(0,\\varepsilon\\right)",
				max: "\\max\\left(0,\\varepsilon\\right)",
			},
		},
	],

	shadow: [
		{
			id: "X",
			latex: "X=x\\left(\\csc \\varepsilon\\right)",
			hidden: true,
		},
		{
			id: "Y",
			latex: "Y=\\left(y-\\left(\\sin o\\right)\\left(\\cot \\varepsilon\\right)x\\right)\\left(\\sec o\\right)",
			hidden: true,
		},
		{
			id: "shadow outer",
			latex: "X^{2}+Y^{2}\\ge1\\ \\left\\{x<\\frac{y}{\\left(\\left(\\cot o\\right)\\left(\\cos o\\right)+\\left(\\sin o\\right)\\right)\\left(\\cot \\varepsilon\\right)}\\right\\}\\left\\{x^{2}+y^{2}\\le1\\right\\}",
			color: "#000000",
			lineWidth: 0,
		},
		{
			id: "shadow inner",
			latex: "X^{2}+Y^{2}\\le1",
			color: "#000000",
			lineWidth: 0,
			fillOpacity: "\\left\\{\\varepsilon<0:0.1,0.3\\right\\}",
		},
	],

	latitude: [
		{
			id: "latitude slider value",
			latex: `\\phi=${45/180*Math.PI}`,
			sliderBounds: {
				min: "-\\pi/2",
				max: "+\\pi/2",
			}
		},
		{
			id: "latitude slider",
			latex: "\\left(\\frac{3}{2},\\ \\frac{2\\phi}{\\pi}\\right)",
			color: "#6042a6",
			showLabel: true,
		},
		{
			id: "latitude slider line",
			latex: "\\left(\\frac{3}{2},t\\right)",
			color: "#6042a6",
			parametricDomain: {
				min: -1,
				max: +1,
			}
		},
		{
			id: "circle of latitude",
			latex: "\\left(\\left(\\cos\\phi\\right)\\cos t,R\\left(o,\\left(\\cos\\phi\\right)\\sin t,\\sin\\phi\\right)\\right)",
			color: "#6042a6",
			parametricDomain: {
				min: 0,
				max: "2\\pi",
			}
		},
	],

	daylight: [
		{
			id: "daylight function",
			latex: "C\\left(\\varepsilon_0,\\phi_0\\right)=\\left\\{\\left|\\phi_0-\\varepsilon_0\\right|>\\frac{\\pi}{2}:\\ \\pi,\\operatorname{mod}\\left(\\arctan\\left(\\frac{1}{\\sin\\varepsilon_0}\\tan\\left(\\arccos\\left(\\frac{\\sin\\phi_0}{\\cos\\varepsilon_0}\\right)\\right)\\right),\\ \\pi\\right)\\right\\}",
		},
		{
			id: "daylight curve",
			type: "expression",
			latex: "\\left(\\cos\\left(\\phi\\right)\\cos\\left(C\\left(\\varepsilon,\\phi\\right)t\\right),\\ R\\left(o,\\cos\\left(\\phi\\right)\\sin\\left(C\\left(\\varepsilon,\\phi\\right)t\\right),\\sin\\phi\\right)\\right)",
			color: "#fa7e19",
			parametricDomain: {
				min: -1,
				max: 1,
			}
		}
	],
}


function Figure(id, expressions, options={}) {
	var element = document.getElementById(id)
	var calculator = Desmos.GraphingCalculator(element, {
		expressions: false,
		settingsMenu: false,
		lockViewport: true,
		border: false,
		showGrid: false,
		showXAxis: false,
		showYAxis: false,
		...options,
	})
	let visibleRadius = 1.5
	let rect = calculator.graphpaperBounds.pixelCoordinates
	let aspect = rect.width/rect.height

	calculator.setMathBounds({
		left: -visibleRadius*aspect,
		right: visibleRadius*aspect,
		bottom: -visibleRadius,
		top: visibleRadius
	})

	window[id] = calculator

	expressions.forEach(e => calculator.setExpression(e))

	return calculator
}


function Figure1(id) {
	let exprs = [
		...expressions.view, 
		...expressions.obliquity, 
		...expressions.shadow,
	]

	let calc = Figure(id, exprs)

	let ε = calc.HelperExpression({ latex: "\\varepsilon" })
	ε.observe("numericValue.magnitude", () => {
		calc.setExpression({
			id: "obliquity slider",
			label: `ε = ${formatAngle(ε.numericValue)}`
		})
	})

	return calc
}

function Figure2(id) {
	let calc = Figure1(id, false)

	expressions.latitude.forEach(e => calc.setExpression(e))
	expressions.daylight.forEach(e => calc.setExpression(e))

	let φ = calc.HelperExpression({ latex: "\\phi" })
	φ.observe("numericValue.magnitude", () => {
		calc.setExpression({
			id: "latitude slider",
			label: `φ = ${formatAngle(φ.numericValue)}`
		})
	})
}

function Figure3(id) {
	let calc = Figure(id, [
		{
			id: "earth",
			latex: "r = 1",
			color: "black",
			lineWidth: 1,
		},
		{
			id: "view angle",
			latex: "o = 0",
		},
		{
			id: "rotation",
			latex: "R\\left(a, b, c\\right) = b",
		},
		...expressions.latitude,
		...expressions.obliquity,
		...expressions.daylight,
		{
			id: "shadow ellipse",
			latex: "\\left( \\left(\\sin \\varepsilon\\right) \\cos t, \\sin t \\right)",
			color: "black",
			parametricDomain: { min: 0, max: "2\\pi" },
		},
		{
			id: "intercept parameter",
			latex: "\\lambda = \\arccos\\left(\\frac{\\sin \\phi}{\\cos \\varepsilon}\\right)",
		},
		{
			id: "intercept points",
			latex: "\\left( \\left(\\sin \\varepsilon\\right) \\cos \\lambda, \\sin \\lambda \\right)",
			color: "#fa7e19",
			showLabel: true,
		}

	], {
		showGrid: true,
		showXAxis: true,
		showYAxis: true,
	})

	let ε = calc.HelperExpression({ latex: "\\varepsilon" })
	ε.observe("numericValue.magnitude", () => {
		calc.setExpression({
			id: "obliquity slider",
			label: `ε = ${formatAngle(ε.numericValue)}`
		})
	})

	let φ = calc.HelperExpression({ latex: "\\phi" })
	φ.observe("numericValue.magnitude", () => {
		calc.setExpression({
			id: "latitude slider",
			label: `φ = ${formatAngle(φ.numericValue)}`
		})
	})

}


function Figure4(id) {

	let exprs = [
		...expressions.view,
		{
			id: "solstice arc",
			latex: "\\left(\\cos t, \\left(\\sin o\\right)\\sin t\\right)",
			color: "black",
			lineWidth: 0.5,
			lineOpacity: 0.5,
			parametricDomain: { min: 0, max: "\\frac{\\pi}{2}" },
		},

		{
			id: "shadow",
			latex: "x^{2}+y^{2}\\le1\\left\\{x\\le0\\right\\}",
			color: "#0006",
			lineWidth: 0,
		},
		{
			id: "solar system pole",
			latex: "\\left(0,\\sin o\\right)",
			color: "black",
			label: "O",
			showLabel: true,
			dragMode: "NONE",
		},
		{
			id: "season slider value",
			latex: `\\omega = ${7/8*2*Math.PI}`,
			sliderBounds: {
				min: "0",
				max: "2\\pi - 10^{-10}",
			},
		},
		{
			id: "season slider",
			latex: "\\left(\\frac{3}{2},\\ \\frac{\\omega}{\\pi} - 1\\right)",
			color: "#6042a6",
			showLabel: true,
		},
		{
			id: "season slider line",
			latex: "\\left(\\frac{3}{2},t\\right)",
			color: "#6042a6",
			parametricDomain: {
				min: -1,
				max: +1,
			}
		},
		{
			id: "obliquity slider value",
			latex: "\\varepsilon_{s}=-0.5",
			sliderBounds: {
				min: "-1+10^{-10}",
				max: 1,
			},
		},
		{
			id: "obliquity angle",
			latex: "\\varepsilon=\\arcsin \\varepsilon_{s}",
		},
		{
			id: "north pole",
			latex: "\\left(-\\varepsilon_s\\cos\\omega,R\\left(o,-\\varepsilon_s\\sin\\omega,\\cos\\varepsilon\\right)\\right)",
			color: "#c74440",
			showLabel: true,
			label: "N",
		},
		{
			id: "north pole orbit",
			latex: "\\left(-\\varepsilon_s\\cos t,R\\left(o,-\\varepsilon_s\\sin t,\\cos\\varepsilon\\right)\\right)",
			color: "#c74440",
			lineWidth: "1",
			domain: {
				min: "0",
				max: "\\operatorname{mod}\\left(\\omega,\\ 2\\pi\\right)"
			},
		},
		{
			id: "north pole orbit outline",
			latex: "\\left(-\\varepsilon_s\\cos t,R\\left(o,-\\varepsilon_s\\sin t,\\cos\\varepsilon\\right)\\right)",
			color: "#c74440",
			lineOpacity: 0.2,
			lineWidth: "1",
			domain: {
				min: 0,
				max: "2\\pi",
			},
		},
		{
			id: "obliquity curve",
			latex: "\\left(\\sin\\left(-t\\varepsilon\\right)\\cos\\omega,R\\left(o,\\sin\\left(-t\\varepsilon\\right)\\sin\\omega,\\cos t\\varepsilon\\right)\\right)",
			color: "#388c46",
			lineStyle: "DASHED",
			lineWidth: 1,
		},
		{
			id: "seasonal obliquity curve",
			latex: "\\left(\\sin t,\\frac{R\\left(o,-\\varepsilon_s\\sin\\omega,\\cos \\varepsilon\\right)}{\\sqrt{1-\\left(\\varepsilon_s\\cos\\omega\\right)^2}}\\cos t\\right)",
			parametricDomain: {
				min: "\\min\\left(0,\\arcsin\\left(-\\varepsilon_s\\cos\\omega\\right)\\right)",
				max: "\\max\\left(0,\\arcsin\\left(-\\varepsilon_s\\cos\\omega\\right)\\right)",
			},
			color: "#388c46",
			// lineStyle: "DASHED",
			// lineWidth: 1,

		},
		{
			id: "seasonal obliquity curve outline",
			latex: "\\left(\\sin t,\\frac{R\\left(o,-\\varepsilon_s\\sin\\omega,\\cos \\varepsilon\\right)}{\\sqrt{1-\\left(\\varepsilon_s\\cos\\omega\\right)^2}}\\cos t\\right)",
			parametricDomain: {
				min: "\\max\\left(0,\\arcsin\\left(-\\varepsilon_s\\cos\\omega\\right)\\right)",
				max: "\\frac{\\pi}{2}",
			},
			color: "#0002",
			// lineStyle: "DASHED",
			// lineWidth: 1,

		},
		{
			id: "perpendicular point",
			latex: "\\left(0,\\frac{R\\left(o,-\\varepsilon_s\\sin\\omega,\\cos \\varepsilon\\right)}{\\sqrt{1-\\left(\\varepsilon_s\\cos\\omega\\right)^2}}\\right)",
			color: "#388c46",
			label: "P",
			showLabel: true,
		},
		
	]

	let calc = Figure(id, exprs, {
		expressions: false,
		lockViewport: true,
	})

	let ω = calc.HelperExpression({ latex: "\\omega" })
	ω.observe("numericValue.magnitude", () => {
		calc.setExpression({
			id: "season slider",
			label: `ω = ${formatAngle(ω.numericValue)}`
		})
	})

	let ε0 = calc.HelperExpression({ latex: "\\varepsilon" })
	ε0.observe("numericValue.magnitude", () => {
		calc.setExpression({
			id: "obliquity label",
			label: `ε₀ = ${formatAngle(ε0.numericValue)}`
		})
	})

	return calc
}




function init() {
	Figure1("fig1")
	Figure2("fig2")
	Figure3("fig3")
	Figure4("fig4")
}



</script>