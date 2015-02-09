describe('Controller: homeController', function () {

	var __ = setupController('home', null, {
		'fn': {
			'addAsync': function(callback) {
				callback();
			},
			'setLoaded': function() {
				__.$scope.loaded = true;
			}
		}
	});

	it('should turn on the slides', function () {
		expect(__.$scope.toggleSlides).toBe(true);
	});

	it('should finish loading the page', function () {
		expect(__.$scope.loaded).toBe(true);
	});

});