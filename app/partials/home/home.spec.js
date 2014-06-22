
describe('Controller: homeController', function () {
	var myCtrl, scope;

	// Initialize the controller and scope
	beforeEach(function () {

		// Load the controller's module
		module('FTSS');

		// Get the controller/scope for all tests
		inject(function ($controller, $rootScope) {
			scope = $rootScope.$new();
			myCtrl = $controller('homeController', {
				$scope: scope
			});
		});

	});

	it('should exist', function () {
		expect(!!myCtrl).toBe(true);
	});

	describe('when created', function () {
		// Add specs
	});

	describe('when destroyed', function () {
		// Add specs
	});
});