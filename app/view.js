'use strict'
const path = require('path')
const model = require(path.join(__dirname, 'model.js'))
const pdf = require(path.join(__dirname, 'generate-pdf.js'))

module.exports.showQuestions = function (rowsObject) {
  let markup = ''
  for (let rowId in rowsObject) {
    let row = rowsObject[rowId]
    markup += '<div class="row justify-content-start">' +
    '<div class="col-sm-3"><img id="edit-qid_' + row.question_id + '" class="icon edit" src="' +
    path.join(__dirname, 'img', 'edit-icon.png') + '">' +
    '<img id="del-qid_' + row.question_id + '" class="icon delete" src="' +
    path.join(__dirname, 'img', 'x-icon.png') + '"></div>' +
    '<div class="col-sm-6 questiontext">' + row.question_text + '</div>' +
    '</div>'
  }
  $('#people, #edit-person, #edit-question').hide()
  $('#questions-list').html(markup)
  $('a.nav-link').removeClass('active')
  $('a.nav-link.list-questions').addClass('active')
  $('#questions').show()
  $('#questions-list img.edit').each(function (idx, obj) {
    $(obj).on('click', function () {
      window.view.editQuestion(this.id)
    })
  })
  $('#questions-list img.delete').each(function (idx, obj) {
    $(obj).on('click', function () {
      window.view.deleteQuestion(this.id)
    })
  })
}

module.exports.listQuestions = function (e) {
  $('a.nav-link').removeClass('active')
  $(e).addClass('active')
  $('#people, #edit-person, #edit-question').hide()
  window.view.showQuestions(window.model.getQuestions())
  $('#questions').show()
}

module.exports.addQuestion = function (e) {
  $('a.nav-link').removeClass('active')
  $(e).addClass('active')
  $('#people, #questions, #edit-person').hide()
  $('#edit-question h2').html('Add Question')
  $('#edit-question-submit').html('Save')
  $('#edit-question-form input').val('')
  $('#question_text').parent()
    .removeClass('has-success')
    .addClass('has-error')
  $('#question_id').parent().hide()
  $('#edit-question').show()
}

module.exports.editQuestion = function (qid) {
  $('#edit-question h2').html('Edit Question')
  $('#edit-question-submit').html('Update')
  $('#question_text').parent()
    .removeClass('has-success')
    .addClass('has-error')
  $('#question_id').parent().show()
  qid = qid.split('_')[1]
  let row = model.getQuestion(qid)[0]
  $('#question_id').val(row.question_id)
  $('#question_text').val(row.question_text)
  $('#questions, #add-question').hide()
  $('#edit-question').show()
}

module.exports.deleteQuestion = function (qid) {
  model.deleteQuestion(qid.split('_')[1], $('#' + qid).closest('div.row').remove())
}

module.exports.getFormFieldValues = function (formId) {
  let keyValue = {columns: [], values: []}
  $('#' + formId).find('input:visible, textarea:visible').each(function (idx, obj) {
    keyValue.columns.push($(obj).attr('id'))
    keyValue.values.push($(obj).val())
  })
  return keyValue
}

module.exports.generatePdf = function(questions) {
	pdf.exportPdf(questions);
}
