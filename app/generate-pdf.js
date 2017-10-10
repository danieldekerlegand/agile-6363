PDFDocument = require('pdfkit');

module.exports.exportPdf = function(questions) {
	doc = new PDFDocument();
	doc.pipe(fs.createWriteStream('output.pdf'));

	console.log('generating pdf with questions', questions);

	let text = ''
	for (question in questions) {
		text += parseInt(question)+1 + ") " + questions[question].question_text + "\n\n";
	};

	doc.text(text)

	doc.end()
};
