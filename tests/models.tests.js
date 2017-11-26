const assert = require('assert')
const path = require('path')
const app = require('electron').remote.app
const expect = require('chai').expect

let webRoot = path.dirname(__dirname)
window.model = require(path.join(webRoot, 'app', 'model.js'))
window.model.db = path.join(app.getPath('userData'), 'example.db')

/* global describe it */

describe('model', function () {
	before(function() {
		window.model.wipeDb(app.getPath('userData'), function() {
			window.model.initDb(app.getPath('userData'))
		});
	})

	describe('courses', function() {
		before(function() {
			let course = {
				columns: ["course_name", "course_number"],
				values: ["Agile", "1234"]
			}
			window.model.saveFormData('courses', course)
		})

		it('should return all courses', function() {
			let coursesObj = window.model.getCourses();
			expect(coursesObj).to.be.an('object');
			let courses = Object.values(coursesObj);
			expect(courses).to.have.lengthOf(1);
		})
	})
})
