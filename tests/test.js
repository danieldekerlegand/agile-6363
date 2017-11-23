const app = require('electron').remote.app
const path = require('path')
var assert = require('assert')
let webRoot = path.dirname(__dirname)
let model = require(path.join(webRoot, 'app', 'model.js'))

// console.log('app', app)

describe('Models', function() {

	before(function() {
		// runs before all tests in this block
		// model.wipeDatabase(app.getPath('userData'), function() {
			model.initDb(app.getPath('userData'));
		// });
	});

	describe('Questions', function() {
		describe('getQuestions()', function() {
			it('should return all questions', function() {
				console.log("model", model.getQuestions());
			})
		})
	})

})
