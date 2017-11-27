PDFDocument = require('pdfkit');
const os = require('os');
const path = require('path');

const dialog = require('electron').remote.dialog;

module.exports.exportPdf = function(questions, question_set_name, showAnswers) {
	dialog.showSaveDialog(function(fileName) {
		if (fileName === undefined) return;
		doc = new PDFDocument();
		doc.pipe(fs.createWriteStream(fileName));

		let text = ''
		questions.forEach(function(question, qIndex) {
			text += `Q-${qIndex+1} [${question.question_point} pts] ${question.question_text}\n\n`;
			question.options.forEach(function(option, oIndex) {
				if (question.question_type === "text") {
					if (showAnswers) {
						text += `Answer:\n${option.context}`;
					} else {
						text += "\n\n\n\n\n\n";
					}
				} else if (question.question_type === "multiple") {
					text += `${String.fromCharCode(97 + oIndex)}) ${option.context} \n`;
				}
			});

			if (showAnswers && question.question_type === "multiple") {
				text += "\nAnswer: \n";
				question.options.forEach(function(option, oIndex) {
					if (option.is_correct) {
						if (oIndex === question.options.length - 2) {
							text += `${String.fromCharCode(97 + oIndex)}) and `;
						} else {
							text += `${String.fromCharCode(97 + oIndex)})  `;
						}
					}
				});
			}
			text += "\n\n"
		});

		doc.text(text)

		doc.end()
	});
};
