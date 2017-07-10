var request = require('supertest');
var should = require('should');
var testUtils = require("../../test/testUtils");
request = request(testUtils.url);

var API_KEY_ADMIN = "";
var APP_ID = "";
var APP_KEY = "";
var EVENT_KEY = "testEvent";
var DEVICE_ID = "1234567890";
var DOW = 6;
var HOUR = 16;
describe('Testing Times Of Day plugin', function () {

	describe('Creating event', function () {
		it('should success', function (done) {
			API_KEY_ADMIN = testUtils.get("API_KEY_ADMIN");
			APP_ID = testUtils.get("APP_ID");
			APP_KEY = testUtils.get("APP_KEY");
			var events = [{
				"key": EVENT_KEY,
				"count": 1,
				"timestamp": this.ts,
				"hour": HOUR,
				"dow": DOW
			}];

			request
				.get('/i?app_key=' + APP_KEY + '&device_id=' + DEVICE_ID + "&events=" + JSON.stringify(events))
				.expect(200)
				.end(function (err, res) {
					if (err) return done(err);
					var ob = JSON.parse(res.text);
					ob.should.have.property('result', 'Success');
					setTimeout(done, 100);
				});
		});
	});
	describe('Verify times of day', function () {
		it('should return 200 for request times of day', function (done) {
			APP_ID = testUtils.get("APP_ID") || APP_ID;
			var data;
			request.get('/o?method=get_times_of_day&event=' + EVENT_KEY + '&api_key=' + API_KEY_ADMIN + '&app_id=' + APP_ID)
				.end(function (err, res) {
					res.statusCode.should.equal(200);
					data = JSON.parse(res.text);
					data.should.have.length(7);
					data.forEach(function (day) {
						day.values.should.have.length(24);
					});
					should(data[6].values[16] >= 0).equal(true);
					done();
				});
		});
	});

});
function getRandomInt(min, max) {
	return Math.floor(Math.random() * (max - min + 1)) + min;
}