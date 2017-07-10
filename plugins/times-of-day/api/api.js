var plugin = {},
	crypto = require('crypto'),
	common = require('../../../api/utils/common.js'),
	plugins = require('../../pluginManager.js'),
	countlyCommon = require('../../../api/lib/countly.common.js'),
	log = common.log('times-of-day:api');

(function (plugin) {

	/**
	 * Days array in raw language
	 * @type {[*]}
	 */
	var dowLanguageMap = ['times.sunday', 'times.monday', 'times.tuesday', 'times.wednesday', 'times.thursday', 'times.friday', 'times.saturday'];

	/**
	 *
	 *  Processing event data according to times of weekday.
	 *  the original event format like:
	 *  { key: 'linkClick', count:1, dow: 2, hour: 13}
	 *
	 *
	 * @param events
	 * @param params
	 */
	var processEvents = function (events, params) {

		var shortEventName = "",
			eventCollectionName = "",
			eventCollections = {},
			tmpEventObj = {};

		var dateIds = common.getDateIds(params);

		events.forEach(function (event) {

			if (event.key.indexOf("[CLY]_") === 0) {
				return;
			}

			var tmpEventColl = {};
			tmpEventObj = {};
			shortEventName = common.fixEventKey(event.key);

			if (!shortEventName) {
				return;
			}

			// Create new collection name for the event
			eventCollectionName = "times_of_day" + crypto.createHash('sha1').update(params.app_id + "").digest('hex');

			common.arrayAddUniq(events, shortEventName);

			tmpEventObj['d.dow.' + event.dow + '.' + event.hour] = event.count;
			tmpEventColl[shortEventName] = tmpEventObj;

			if (!eventCollections[eventCollectionName]) {
				eventCollections[eventCollectionName] = {};
			}

			mergeEvents(eventCollections[eventCollectionName], tmpEventColl);
		});

		for (var collection in eventCollections) {

			for (shortEventName in eventCollections[collection]) {

				var postfix = common.crypto.createHash("md5").update(shortEventName).digest('base64')[0],
					collId = shortEventName + "_" + common.getDateIds(params).zero + "_" + postfix;

				common.db.collection(collection).update({'_id': collId}, {
					$set: {"m": dateIds.month, "e": shortEventName},
					"$inc": eventCollections[collection][shortEventName]
				}, {'upsert': true}, function (err, res) {
				});
				log.i("Incrementing %s with id:%s data:%j", collection, collId, eventCollections[collection][shortEventName]);
			}
		}
	};

	/**
	 * Hook for processing event and begin_session data
	 */
	plugins.register("/i", function (ob) {
		var params = ob.params;
		var events = (params.qstring && params.qstring.events);
		if (events && events.length && Array.isArray(events)) {
			processEvents(events, params);
		}
		if (params.qstring.begin_session) {
			var tmpEventObj = params.qstring;
			tmpEventObj.key = 'begin_session';
			tmpEventObj.count = 1;

			processEvents([tmpEventObj], params);
		}
		return false;
	});

	/**
	 * Register for fetching times of day data.
	 */
	plugins.register('/o', function (ob) {
		var params = ob.params;
		if (params.qstring.method == 'get_times_of_day' && params.qstring.event) {
			var collectionName = 'times_of_day' + crypto.createHash('sha1').update(params.qstring.app_id).digest('hex');

			var result = {};
			//Preparing Empty Data
			dowLanguageMap.forEach(function (day, dow) {
				result[dow] = {
					label: day,
					values: {}
				};
				for (var i = 0; i < 24; i++) {
					result[dow].values[i] = 0;
				}
			});
			var periodObj = countlyCommon.periodObj;
			var documents = [];
			for (var i = 0; i < periodObj.reqZeroDbDateIds.length; i++) {
				documents.push(params.qstring.event + "_" + periodObj.reqZeroDbDateIds[i]);
				for (var m = 0; m < common.base64.length; m++) {
					documents.push(params.qstring.event + "_" + periodObj.reqZeroDbDateIds[i] + "_" + common.base64[m]);
				}
			}

			common.db.collection(collectionName).find({'_id': {$in: documents}}).toArray(
				function (err, docs) {
					if (!err) {
						docs.forEach(function (doc) {
							if (!doc.d.dow)
								doc.d.dow = {};

							for (var dow in doc.d.dow) {
								for (var hour in doc.d.dow[dow]) {
									result[dow].values[hour] += doc.d.dow[dow][hour];
								}
							}
						});
						result = Object.keys(result).map(function (e) {
							result[e].values = Object.keys(result[e].values).map(function (v) {
								return result[e].values[v];
							});
							return result[e];
						});
						common.returnOutput(params, result);
						return true;
					}
				}
			);
			return true;
		}
		return false;
	});

	/**
	 * @param firstObj
	 * @param secondObj
	 */
	function mergeEvents(firstObj, secondObj) {
		for (var firstLevel in secondObj) {

			if (!secondObj.hasOwnProperty(firstLevel)) {
				continue;
			}

			if (!firstObj[firstLevel]) {
				firstObj[firstLevel] = secondObj[firstLevel];
				continue;
			}

			for (var secondLevel in secondObj[firstLevel]) {

				if (!secondObj[firstLevel].hasOwnProperty(secondLevel)) {
					continue;
				}

				if (firstObj[firstLevel][secondLevel]) {
					firstObj[firstLevel][secondLevel] += secondObj[firstLevel][secondLevel];
				} else {
					firstObj[firstLevel][secondLevel] = secondObj[firstLevel][secondLevel];
				}
			}
		}
	}
}(plugin));

module.exports = plugin;