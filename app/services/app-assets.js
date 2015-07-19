FTSS.ng.service('appAssets', [

	'SharePoint',

	function (SharePoint) {

		"use strict";

		// Internal reference
		var _self = this,

		// collection of actions to perform after load
			workSet = [];

		/**
		 * Adds callback once assets are loaded
		 *
		 * @name appAssets#process
		 * @param work function the action to perform
		 */
		this.process = function (work) {
			workSet.push(work)
		};

		SharePoint.read({

			'cache' : true,
			'source': 'AppAssets',
			'params': {
				'$select': [
					'DataType',
					'Data_JSON'
				]
			}

		}).then(function (data) {

			_self.assets = {};

			_.each(data, function (row) {
				_self.assets[row.DataType] = row.Data_JSON;
			});

			_.each(workSet, function (work) {
				work(_self.assets);
			});

		});

	}

]);