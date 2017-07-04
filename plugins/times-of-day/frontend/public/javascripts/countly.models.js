(function (countlyTimesOfDayPlugin, $) {

	var _data = {};

	//Initializing model
	countlyTimesOfDayPlugin.initialize = function () {

	};

	//return data that we have
	countlyTimesOfDayPlugin.getData = function () {
		return _data;
	};

}(window.countlyTimesOfDayPlugin = window.countlyTimesOfDayPlugin || {}, jQuery));