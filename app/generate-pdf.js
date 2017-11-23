PDFDocument = require('pdfkit');
const os = require('os');
const path = require('path');

const dialog = require('electron').remote.dialog;

module.exports.exportPdf = function(questions, question_set_name) {
	dialog.showSaveDialog(function(fileName) {
		if (fileName === undefined) return;

		doc = new PDFDocument();
		doc.pipe(fs.createWriteStream(fileName));

		console.log('generating pdf with questions', questions);

		let text = ''
		questions.forEach(function(question, qIndex) {
			text += qIndex+1 + ") " + question.question_text + "\n\n";
			question.options.forEach(function(option, oIndex) {
				text += oIndex+1 + ") " + option.context + "\n\n";
			});
		});

		doc.text(text)

		doc.end()
	});
};
