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
			templateUrl: 'courses.html',
			controller: 'CoursesCtrl'
		})
		.when('/add-course', {
			templateUrl: 'add-course.html',
			controller: 'AddCourseCtrl'
		})
		.when('/questions', {
	    templateUrl: 'questions.html',
	    controller: 'QuestionsCtrl'
	  })
		.when('/add-question', {
			templateUrl: 'add-question.html',
			controller: 'AddQuestionCtrl'
		})
		.when('/edit-question', {
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
	$scope.options = [{context: "", isCorrect: 0, question_id: null}];
	$scope.submit = function() {
		let formData = {columns: ['question_text', 'question_type', 'course_id'], values: [$scope.question.text, $scope.question.type, 1]};
		model.saveFormData('questions', formData, function() {
			let questionId = model.getLastQuestionId();
			$scope.options.forEach(function(option) {
				let optionFormData = {columns: ['context', 'question_id', 'is_correct'], values: [option.context, questionId, option.isCorrect]};
				model.saveFormData('options', optionFormData);
			});
		});
	};
	$scope.addOption = function() {
		$scope.options.push({context: "", isCorrect: 0, question_id: null});
	};
	$scope.deleteOption = function(index) {
		$scope.options.splice(index, 1);
	};
	$scope.showOptions = function() {
		return $scope.question.type === 'multiple';
	};
});

angularApp.controller('EditQuestionCtrl', function($scope) {

});
