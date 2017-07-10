(function (countlyTimesOfDayPlugin, $) {

	var _data = {
		events: [],
		timesOfDay: []
	};

	/**
	 * This is for event list request
	 * @namespace timesOfDayPlugin
	 * @returns {func} ajax func to request data and store in _data.events
	 */
	countlyTimesOfDayPlugin.requestEvents = function () {
		return $.ajax({
			type: "GET",
			url: countlyCommon.API_URL + "/o",
			data: {
				"api_key": countlyGlobal.member.api_key,
				"app_id": countlyCommon.ACTIVE_APP_ID,
				"method": "get_events"
			},
			success: function (json) {
				var events = json.list.map(function (event) {
					return {
						name: event,
						key: event,
						is_active: false,
						active: false
					};
				});
				_data.events = [{
					name: jQuery.i18n.map['times.sessions'],
					key: 'begin_session',
					is_active: true,
					active: true
				}];
				_data.events = _data.events.concat(events);
			}
		});
	};

	/**
	 * This is for  times of day by event request
	 * @namespace timesOfDayPlugin
	 * @param isRefresh
	 * @param event
	 * @returns {func} ajax func to request data and store in _data.timesOfDay[event.key]
	 */
	countlyTimesOfDayPlugin.requestTimesOfDay = function (isRefresh, event) {
		return $.ajax({
			type: "GET",
			url: countlyCommon.API_URL + "/o",
			data: {
				api_key: countlyGlobal.member.api_key,
				app_id: countlyCommon.ACTIVE_APP_ID,
				method: 'get_times_of_day',
				display_loader: !isRefresh,
				event: event.key
			},
			success: function (json) {
				_data.timesOfDay[event.key] = json;
			}
		});
	};

	//return data that we have
	countlyTimesOfDayPlugin.getEvents = function () {
		return _data.events;
	};

	countlyTimesOfDayPlugin.getTimesOfDay = function (event) {
		return (_data.timesOfDay[event.key]) ? _data.timesOfDay[event.key] : [];
	};

}(window.countlyTimesOfDayPlugin = window.countlyTimesOfDayPlugin || {}, jQuery));