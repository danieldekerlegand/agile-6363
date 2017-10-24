'use strict'

const fs = require('fs')
const path = require('path')
const app = require('electron').remote.app

let webRoot = path.dirname(__dirname)
window.model = require(path.join(webRoot, 'model.js'))
window.model.db = path.join(app.getPath('userData'), 'example.db')
window.angular = require('angular')

var angularApp = angular.module("questionBank", [require('angular-route')])

angularApp.config(function($routeProvider) {
  $routeProvider
		.when('/', {
	    templateUrl: 'questions.html',
	    controller: 'QuestionsCtrl'
	  })
		.when('/add', {
			templateUrl: 'add-question.html',
			controller: 'AddQuestionCtrl'
		})
		.when('/edit', {
			templateUrl: 'edit-question.html',
			controller: 'EditQuestionCtrl'
		})
})

angularApp.controller('MainCtrl', ['$route', '$routeParams', '$location',
  function($route, $routeParams, $location) {
    this.$route = $route;
    this.$location = $location;
    this.$routeParams = $routeParams;
	}])

angularApp.controller('QuestionsCtrl', function($scope) {
	$scope.questions = model.getQuestions();
	$scope.deleteQuestion = function(qid) {
		model.deleteQuestion(qid);
		$scope.questions = model.getQuestions();
	}
});

angularApp.controller('AddQuestionCtrl', function($scope) {
	$scope.question = {};
	$scope.submit = function() {
		let formData = {columns: ['question_text', 'question_type', 'course_id'], values: [$scope.question.text, "default", 1]};
		model.saveFormData('questions', formData);
	};
});

angularApp.controller('EditQuestionCtrl', function($scope) {

});
