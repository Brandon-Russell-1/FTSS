describe('Controller: homeController', function () {
	var ctrl, scope;

	beforeEach(module('FTSS'));

	// Initialize the controller and scope
	beforeEach(inject(function ($controller, $rootScope) {
		scope = $rootScope.$new();
		ctrl = $controller('homeController', {
			$scope: scope
		});

	}));

	it('should turn on the slides', function () {
		expect(scope.toggleSlides).toEqual(true);
	});

});