PDFDocument = require('pdfkit');
const os = require('os');
const path = require('path');

const dialog = require('electron').remote.dialog;

module.exports.exportPdf = function(questions, question_set_name, showAnswers) {
	dialog.showSaveDialog(function(fileName) {
		if (fileName === undefined) return;
		doc = new PDFDocument();
		doc.pipe(fs.createWriteStream(fileName));
		console.log('generating pdf with questions', questions);
		console.log(showAnswers);
		let text = ''
		questions.forEach(function(question, qIndex) {

			text += qIndex+1 + ") " + question.question_text + "\n\n";
			question.options.forEach(function(option, oIndex) {
				if (question.question_type === "text") {
					if (showAnswers) {
						text += oIndex+1 + ") " + option.context + "\n\n";
					} else {
						text += "\n\n\n\n";
					}
				} else if (question.question_type === "multiple") {
					text += oIndex+1 + ") " + option.context + "\n\n";
					if (showAnswers && option.is_correct) {
						text += "Is Correct";
					}
				}
			});
		});

		doc.text(text)

		doc.end()
	});
};
