
describe('Controller: mainController', function () {

	var myCtrl;

	// Initialize the controller and scope
	beforeEach(function () {

		// Load the controller's module
		module('FTSS');

		// Get the controller/scope for all tests
		inject(function ($controller, $rootScope) {

			_MAIN_ = $rootScope.$new();

			myCtrl = $controller('mainController', {
				$scope: _MAIN_
			});
		});

	});

	it('should exist', function () {
		expect(!!myCtrl).toBe(true);
	});

});