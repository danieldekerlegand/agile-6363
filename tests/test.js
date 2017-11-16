const path = require('path')
var assert = require('assert')
let webRoot = path.dirname(__dirname)
var model = require(path.join(webRoot, 'app', 'model.js'))

describe('Questions', function() {
  describe('getQuestions()', function() {
    it('should return all questions', function() {
			console.log(model.getQuestions())
      // assert.equal(-1, [1,2,3].indexOf(4));
    })
  })
})
