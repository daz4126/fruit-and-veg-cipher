// imports
import { pickRandom } from "jog-list"
import { words } from "./words.js"
import surge from "@daz4126/surge"
import JSConfetti from "js-confetti"

const jsConfetti = new JSConfetti()

const keys = words.filter(word => word.length === new Set([...word]).size)
const alphabet = "ABCDEFGHIKLMNOPQRSTUVWXYZ"
const fruit = ["🍏","🍌","🍒","🍉","🍑"]
const veg =  ["🥦","🍆","🥔","🍄","🥕"]

const encrypt = (word,key) => [...word].map(letter => {
  const char = letter === "J" ? "I" : letter
  const cipher = key + [...alphabet].filter(x => !key.includes(x)).join``
  const n = cipher.indexOf(char)
  return fruit[Math.floor(n/5)] + veg[n%5] + "  "
 }).join``

const table = `
  <table>
    <thead>
      <td></td>
      <td>${veg[0]}</td>
      <td>${veg[1]}</td>
      <td>${veg[2]}</td>
      <td>${veg[3]}</td>
      <td>${veg[4]}</td>
    </thead>
    ${fruit.map(f => `<tr><td>${f}</td><td><input data-fruit=${f} data-veg=${veg[0]} data-action="updateSolution"></td><td><input data-fruit=${f} data-veg=${veg[1]} data-action="updateSolution"></td><td><input data-fruit=${f} data-veg=${veg[2]} data-action="updateSolution"></td><td><input data-fruit=${f} data-veg=${veg[3]} data-action="updateSolution"></td><td><input data-fruit=${f} data-veg=${veg[4]} data-action="updateSolution"></td></tr>`).join``}
  </table>
`

const gameOver = $ => {
  $.game.hidden = true
  $.gameOver.hidden = false
  $.answer.value = `The word was ${$._word}`
  $.share.hidden = !$._id
  $._id = null
  localStorage.setItem("fruit&veg-cipher:" + (new Date).toLocaleDateString(),true)
}

const win = $ => {
   jsConfetti.addConfetti()
   $.message.value = ($.score.value > 9 ? "Perfect! You're obviously a Cipher Genius!" :    $.score.value > 6 ? "Impressive effort! You're a cipher expert!" : $.score.value > 1 ? "Well done ... you've got some cipher skills!" : "Phew ... you only just did it!")
    $.finalScore.value = $.score.value
}

const lose = $ => {
  $.finalScore.value = 0
  $.message.value = "Hard luck, you didn't break the code..."
}

surge({
  start: $ => {
    $.instructions.hidden = true
    $.gameOver.hidden = true
    $.game.hidden = false
    Array.from($.solution.childNodes).forEach(cell => cell.value = "")
    Array.from($.table.querySelectorAll("input")).forEach(cell => cell.value = "")
    $.table.value = ""
    $.clues.value = ""
    $.score.value = 10
    $.correct.value = 0
    $.table.append(table)
    $.mode.value = $._id ? "Daily Challenge" : "Practice Mode"
    $._clues = 0
    $._key = ($._id !== null ? keys[($._id * 29 + 2029)%keys.length] : pickRandom(keys)).toUpperCase()
    $._word = ($._id !== null ? words[($._id * 2029 + 29)%words.length] : pickRandom(words)).toUpperCase()
    $._remainingWords = words.filter(w => w !== $._word)
    $.word.value = encrypt($._word,$._key)
  },
  clue: $ => {
    const word = ($._id !== null ? words[($._id * 6929 + $._clues * 69)%words.length] : pickRandom($._remainingWords)).toUpperCase()
    $.clues.append(`<h1>${word}:</h1><h1>${encrypt(word,$._key)}</h1>`)
    $._clues ++
    $.score.value -= 3
    if($.score.value <= 0){
      gameOver($)
      lose($)
    }
  },
  updateGrid: ($,e) => {
    const char = $._word[Number(e.target.id.split("-")[1])]
    const letter = char === "J" ? "I" : char
    const cipher = $._key + [...alphabet].filter(x => !$._key.includes(x)).join``
    const index = cipher.indexOf(letter)
    const cell = $.table.querySelectorAll("input")[index]
    cell.value = e.target.value
  },
  updateSolution: ($,e) => {
    const array = encrypt($._word,$._key).split("  ")
    const letter = e.target.value.toUpperCase()
    const fruit = e.target.dataset.fruit
    const veg = e.target.dataset.veg
    array.forEach((x,i) => {
      if(x === fruit+veg){
        $.solution.childNodes[i].value = (letter === "J" && $._word[i] === "I") ? "I" : (letter === "I" && $._word[i] === "J") ? "J" : letter
      }
    })
  },
    check: $ => {
     const correctLetters = Array.from($.solution.childNodes).reduce((sum,node,i) => sum + (node.value && node.value.trim()[0].toUpperCase() === $._word[i] ? 1 : 0),0)
     $.correct.value = correctLetters
     $.plural.value = correctLetters === 1 ? "" : "s"
     if(correctLetters === 5){
        gameOver($)
        win($)
     } else {
       $.score.value --
     }
     if($.score.value <= 0){
        gameOver($)
        lose($)
     }
  },
  clear: $ =>  Array.from($.table.querySelectorAll("input")).forEach(cell => cell.value = ""),
  share: $ => navigator.share({title:"I cracked the Fruit And Veg Cipher!",text:`I cracked the 🍏Fruit And Veg Cipher🥦!! My score was ${$.finalScore.value}!`}),
  connect: $ => {
    
    $._id = localStorage.getItem("fruit&veg-cipher:" + (new Date).toLocaleDateString()) ? null :Math.round((new Date().setHours(0,0,0,0) - new Date(2024,7,18))/3600000/24)
  }
})
