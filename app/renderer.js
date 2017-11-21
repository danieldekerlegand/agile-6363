'use strict'

const fs = require('fs')
const path = require('path')
const app = require('electron').remote.app

let webRoot = path.dirname(__dirname)
window.model = require(path.join(webRoot, 'model.js'))
window.model.db = path.join(app.getPath('userData'), 'example.db')
window.angular = require('angular')
window.Hammer = require('hammerjs')

var angularApp = angular.module("questionBank", [require('angular-route')])

angularApp.factory('courses', function() {
  return {
    exist: function() {
    	return model.getCourses() ? true : false;
    }
  };
});

angularApp.config(function($routeProvider) {
  $routeProvider
		.when('/', {
			templateUrl: 'courses.html',
			controller: 'CoursesCtrl'
		})
		.when('/courses', {
			templateUrl: 'courses.html',
			controller: 'CoursesCtrl'	
		})
		.when('/add-course', {
			templateUrl: 'add-course.html',
			controller: 'AddCourseCtrl'
		})
		.when('/add-course-courses', {
			templateUrl: 'add-course-courses.html',
			controller: 'AddCourseCtrl'
		})
		.when('/questions/:course_id', {
	    templateUrl: 'questions.html',
	    controller: 'QuestionsCtrl'
	  })
		.when('/add-question/:course_id', {
			templateUrl: 'add-question.html',
			controller: 'AddQuestionCtrl'
		})
		.when('/edit-question', {
			templateUrl: 'edit-question.html',
			controller: 'EditQuestionCtrl'
		})
		.when('/question-sets', {
			templateUrl: 'question-sets.html',
			controller: 'QuestionSetsCtrl'
		})
		.when('/add-question-set', {
			templateUrl: 'add-question-set.html',
			controller: 'AddQuestionSetCtrl'
		})
})

angularApp.controller('MainCtrl', ['$window', '$route', '$routeParams', '$location',
  function($window, $route, $routeParams, $location) {
  	this.$window = $window;
    this.$route = $route;
    this.$location = $location;
    this.$routeParams = $routeParams;
	}])

angularApp.controller('NavCtrl', function($scope, courses) {
	$scope.coursesExist = function() {
		return courses.exist();
	}
});

angularApp.controller('LandingCtrl', function($scope, courses) {
	$scope.coursesExist = function() {
		console.log('landing control', courses.exist());
		return courses.exist();
	}
});

angularApp.controller('CoursesCtrl', function($scope, courses, $location) {
	$scope.courses = model.getCourses();
	$scope.coursesExist = function() {
		return courses.exist();
	};
	$scope.deleteCourse = function(cid) {
		model.deleteCourse(cid);
		$scope.courses = model.getCourses();
		if (!model.getPathtCourses()) {
			$location.path('/');
		}
	};
});

angularApp.controller('AddCourseCtrl', function($scope, $location) {
	$scope.course = {};
	$scope.submit = function() {
		let formData = {columns: ['course_name', 'course_number'], values: [$scope.course.name, $scope.course.id]};
		model.saveFormData('courses', formData);
		$location.path('/courses');
	};
});

angularApp.controller('QuestionsCtrl', function($scope, $routeParams) {
	$scope.questions = model.getQuestionsForCourse($routeParams.course_id);
	$scope.course_id = $routeParams.course_id;
	$scope.course = model.getCourse($routeParams.course_id)[0];
	$scope.questionSet = [];
	$scope.showEditModal = function(qid) {
		$('#modal' + qid).modal();
		$('#modal' + qid).modal('open');
	}
	$scope.deleteQuestion = function(qid) {
		model.deleteQuestion(qid);
		$scope.questions = model.getQuestionsForCourse($routeParams.course_id);
	}
});

angularApp.controller('AddQuestionCtrl', function($scope, $routeParams, $location) {
	$scope.question = {};
	$scope.options = [{context: "", isCorrect: 0, question_id: null}];
	$scope.submit = function() {
		let formData = {columns: ['question_text', 'question_type', 'course_id'], values: [$scope.question.text, $scope.question.type, $routeParams.course_id]};
		model.saveFormData('questions', formData, function(questionId) {
			$scope.options.forEach(function(option) {
				let optionFormData = {columns: ['context', 'question_id', 'is_correct'], values: [option.context, questionId, option.isCorrect]};
				model.saveFormData('options', optionFormData);
			});
			$scope.question = {};
			$scope.options = [{context: "", isCorrect: 0, question_id: null}];
		});
		$location.path('/questions');
	};
	$scope.addOption = function() {
		$scope.options.push({context: "", isCorrect: 0, question_id: null});
	};
	$scope.deleteOption = function(index) {
		$scope.options.splice(index, 1);
	};
	$scope.showFreeform = function() {
		return $scope.question.type === 'text';
	};
	$scope.showOptions = function() {
		return $scope.question.type === 'multiple';
	};

});



/*angularApp.controller('QuestionSetsCtrl', function($scope, $routeParams) {
	$scope.questionSets = model.getQuestionSetsForCourse($routeParams.course_id);
});

*/