#metadata((
  date: datetime(year: 2022, month: 03, day: 06),
  categories: ("interactive",),
  blurb: [
    A game to teach you world flags. 🇨🇳🇮🇳🇺🇸🇮🇩🇵🇰🇧🇷🇳🇬🇧🇩⋯
  ]
))

#title[World Flags Quizzer]

Learn world flags by getting quizzed!

Flags are chosen randomly weighted by the country’s population.
Flags you get right in one try are _memorized_ and won’t be shown again.

You can type `enter` to submit your xanswer, and type `?` to show the flag’s country name.

#link("/flag-quizzer")[_Fullscreen version_]

#let assets = {
  glob("index.html")
  glob("**/*.js")
  glob("**/*.css")
  glob("flags/*.svg")
  glob("*.jpg")
}
#for path in assets {
  metadata(asset("flag-quizzer/" + path, read(path, encoding: none)))
}
#html.iframe(src: "/flag-quizzer/index.html", style: ```css
  width: 100%;
  height: 900px;
  background: white;
  border-radius: 25px;
  border: none;
```.text)
