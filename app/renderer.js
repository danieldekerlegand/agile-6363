'use strict'

const fs = require('fs')
const path = require('path')
const app = require('electron').remote.app
const cheerio = require('cheerio')

window.$ = window.jQuery = require('jquery')
window.Tether = require('tether')
window.Popper = require('popper.js')
window.Bootstrap = require('bootstrap')

let webRoot = path.dirname(__dirname)
window.view = require(path.join(webRoot, 'view.js'))
window.model = require(path.join(webRoot, 'model.js'))
window.model.db = path.join(app.getPath('userData'), 'example.db')

// Compose the DOM from separate HTML concerns; each from its own file.
let htmlPath = path.join(app.getAppPath(), 'app', 'html')
let body = fs.readFileSync(path.join(htmlPath, 'body.html'), 'utf8')
let navBar = fs.readFileSync(path.join(htmlPath, 'nav-bar.html'), 'utf8')
let menu = fs.readFileSync(path.join(htmlPath, 'menu.html'), 'utf8')
let questions = fs.readFileSync(path.join(htmlPath, 'questions.html'), 'utf8')
let editQuestion = fs.readFileSync(path.join(htmlPath, 'edit-question.html'), 'utf8')

let O = cheerio.load(body)
O('#nav-bar').append(navBar)
O('#menu').append(menu)
O('#questions').append(questions)
O('#edit-question').append(editQuestion)

// Pass the DOM from Cheerio to jQuery.
let dom = O.html()
$('body').html(dom)

$('document').ready(function () {
	let questions = window.model.getQuestions()
  window.view.showQuestions(questions)

	$('#edit-question-submit').click(function (e) {
    e.preventDefault()
    let ok = true
    $('#question_text').each(function (idx, obj) {
      if ($(obj).val() === '') {
        $(obj).parent().removeClass('has-success').addClass('has-error')
        ok = false
      } else {
        $(obj).parent().addClass('has-success').removeClass('has-error')
      }
    })
    if (ok) {
      let formId = $(e.target).parents('form').attr('id')
      let keyValue = window.view.getFormFieldValues(formId)
      window.model.saveFormData('questions', keyValue, function () {
        window.model.getQuestions()
      })
    }
  })

	$('#generate-pdf').click(function() {
		console.log('calling generatePdf with questions', questions)
		window.view.generatePdf(questions)
	});
})
