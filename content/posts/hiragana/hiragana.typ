#metadata((
  date: datetime(year: 2026, month: 06, day: 14),
  categories: ("interactive",),
  blurb: [
    Ultra-minimal Hiragana memory trainer.
  ]
))


#title[Simple Hiragana trainer]

This is a _very_ simple Japanese Hiragana recall trainer. Type the Romaji for the current character (there is no typing feedback and you do not need to press backspace). If the correct sequence is pressed, a new character is chosen, weighted by empirical frequency. If too many keys are pressed, you will get an alert showing you the answer.

Pressing `space` will use a random local text-to-speech service to utter the character.

#link(<hiragana-quiz>)[Fullscreen version.]

#metadata[#asset("/hiragana-quiz.html", read("hiragana-quiz.html")) <hiragana-quiz>]

#context html.iframe(src: query(<hiragana-quiz>).first().path, style: ```css
  width: 100%;
  height: 40vh;
  border: none;
  border-radius: 1em;
```.text)


#html.style(```css
iframe:focused {
  outline: 4pt solid blue;
}
```.text)
