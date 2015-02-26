"use strict";

window._TIMER = {
	'add': Object,
	'get': Object
};

window.FTSS = {};
window.utils = {};
window.caches = {};
window.PRODUCTION = true;


// PhantomJS doesn't support this--and we don't really need it for testing
window.indexedDB = {

	'open': Object

};

window.performance = {
	'now': function() {}
};

function injector(deps) {

	var self = {};

	beforeEach(function () {

		module('FTSS');

		deps.forEach(function (dep) {
			inject([
				       dep,
				       function (d) {
					       self[dep] = d;
				       }
			       ]);
		})

	});

	return self;

}

/**
 *
 *
 * @param {string} name
 * @param {string[]} params
 * @param {object} [scope]
 * @returns {{}}
 */
function setupController(name, params, scope) {

	var self = {};

	beforeEach(function () {

		module('FTSS');

		params = params || [];

		params.push('$controller');
		params.push('$rootScope');

		inject(params.concat(function () {

			var args = arguments;

			params.forEach(function (v, k) {
				self[v] = args[k];
			});

			self.$scope = self.$rootScope.$new();

			_.merge(self.$scope, scope);

			self.controller = self.$controller(name + 'Controller', {
				'$scope': self.$scope
			});

		}));

	});

	it('should exist', function () {
		expect(!!self.controller).toBe(true);
	});

	return self;

}