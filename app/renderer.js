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

angularApp.directive('customOnChange', function() {
  return {
    restrict: 'A',
    link: function (scope, element, attrs) {
      var onChangeHandler = scope.$eval(attrs.customOnChange);
      element.on('change', onChangeHandler);
      element.on('$destroy', function() {
        element.off();
      });

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
		.when('/question-sets/:course_id', {
			templateUrl: 'question-sets-for-course.html',
			controller: 'QuestionSetsForCourseCtrl'
		})
		/*.when('/add-question-set', {
			templateUrl: 'add-question-set.html',
			controller: 'AddQuestionSet'
		})*/
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
		if (!model.getCourses()) {
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
	$scope.questionSetName = "";

	let questionSet = new Set();
	$scope.questionSetArr = [];

	$scope.toggleSelection = function(qid){
		if (questionSet.has(qid)){
			questionSet.delete(qid);
		} else {
			questionSet.add(qid);
		}
		console.log('test1', questionSet)
		$scope.questionSetArr = Array.from(questionSet);
	}

	$scope.openQuestionSetNameModal = function() {
		$('#questionSetName').modal();
		$('#questionSetName').modal('open');
	}

	$scope.generateQuestionSet = function(){
		let formData = {columns: ['course_id', 'question_set_name'], values: [$routeParams.course_id, $scope.questionSetName]};
		model.saveFormData('question_sets', formData, function(questionSetId) {
			$scope.questionSetArr.forEach(function(questionId) {
				let questionFormData = {columns: ['question_set_id', 'question_id'], values: [questionSetId, questionId]};
				model.saveFormData('question_set_items', questionFormData);
			});
		});
	}

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
	$scope.images = [];
	$scope.submit = function() {
		let formData = {columns: ['question_text', 'question_type', 'question_point', 'course_id'], values: [$scope.question.text, $scope.question.type, $scope.question.point, $routeParams.course_id]};
		model.saveFormData('questions', formData, function(questionId) {
			$scope.options.forEach(function(option) {
				let optionFormData = {columns: ['context', 'question_id', 'is_correct'], values: [option.context, questionId, option.isCorrect]};
				model.saveFormData('options', optionFormData);
			});
			$scope.question = {};
			$scope.options = [{context: "", isCorrect: 0, question_id: null}];
		});
		$location.path('/questions/' + $routeParams.course_id);
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
	$scope.showImagePicker = function() {
		return $scope.question.type === 'image';
	}
	$scope.imagesSelected = function() {
		return $scope.images.length > 0;
	};
	$scope.uploadFile = function(event){
		$scope.$apply(function(){
			$scope.images = Array.from(event.target.files);
		});
	};
});


angularApp.controller('QuestionSetsCtrl', function($scope, $location) {
	$scope.questionSets = model.getQuestionSets();
	$scope.courses = model.getCourses();

	$scope.getCourse = function(course_id){
		return model.getCourse(course_id)[0];
	}

	$scope.openAddQuestionSetModal = function() {

		$('#AddquestionSet').modal();
		$('#AddquestionSet').modal('open');
	}
	$scope.goToQuestionBank = function(course_id) {

		$('#AddquestionSet').modal('close');
		$location.path('/questions/' + course_id);
	}

	$scope.deleteQuestionSet = function(qset_id) {
		model.deleteQuestionSet(qset_id);
		$scope.questionSets = model.getQuestionSets();
		if(!model.getQuestionSets()){
			$location.path('/add-question-set')
		}
	}

});

angularApp.controller('QuestionSetsForCourseCtrl', function($scope, $routeParams) {
	$scope.questionSetsForCourse = model.getQuestionSetsForCourse($routeParams.course_id);
	$scope.course = model.getCourse($routeParams.course_id)[0];


	$scope.deleteQuestionSet = function(qset_id) {
		model.deleteQuestionSet(qset_id);
		$scope.questionSetsForCourse = model.getQuestionSetsForCourse($routeParams.course_id);
	}

});

/*angularApp.controller('AddQuestionSetCtrl', function($scope, $routeParams) {
	$scope.questionSetsForCourse = model.getQuestionSetsForCourse($routeParams.course_id);
	$scope.course = model.getCourse($routeParams.course_id)[0];
});
*/
