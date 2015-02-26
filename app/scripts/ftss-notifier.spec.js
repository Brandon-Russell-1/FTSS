describe('Service: Notifier', function () {

	var self = injector(['notifier']);


	it('should send an email', function () {

		self.notifier.generic(
			{
				'to'     : 'test1',
				'subject': 'test2',
				'body'   : 'test3'
			});

	})

	
});
