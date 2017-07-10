window.TimesOfDayView = countlyView.extend({
	currentEvent: null,
	punchCardChart: null,
	initialize: function () {
		this.templateData = {
			"page-title": jQuery.i18n.map["times.menu-title"],
			events: {}
		};
	},
	beforeRender: function () {
		var self = this;
		return $.when(
			$.get(countlyGlobal.path + '/times-of-day/templates/report.html'),
			countlyTimesOfDayPlugin.requestEvents()
		).done(function (result) {
			self.template = Handlebars.compile(result[0]);
			self.templateData.events = countlyTimesOfDayPlugin.getEvents();
			self.currentEvent = self.templateData.events[0];
		});
	},
	updateViews: function (isRefresh) {
		var self = this;

		if (this.currentEvent) {
			$.when(
				countlyTimesOfDayPlugin.requestTimesOfDay(isRefresh, self.currentEvent)
			).done(function () {
				var timesOfDay = countlyTimesOfDayPlugin.getTimesOfDay(self.currentEvent);
				timesOfDay = timesOfDay.map(function (data) {
					data.label = jQuery.i18n.map[data.label];
					return data;
				});
				self.punchCardChart.update(timesOfDay);
			});
		}
	},
	renderCommon: function (isRefresh) {
		var self = this;
		if (!isRefresh) {
			$(this.el).html(this.template(this.templateData));
			self.punchCardChart = PunchCard('#tod-chart');

			$(".tod-segment").on("click", function () {
				var key = $(this).data("key");
				self.templateData.events.forEach(function (event) {
					if (event.key === key) {
						self.currentEvent = event;
					}
				});
				if (self.currentEvent) {
					$(".tod-segment").removeClass("active");
					$(this).addClass("active");
					self.updateViews();
				}
			});
		}

		this.updateViews();
	},
	refresh: function () {
		this.updateViews();
	}
});

//register views
app.timesOfDayView = new TimesOfDayView();

app.route("/analytics/times-of-day", 'times', function () {
	this.renderWhenReady(this.timesOfDayView);
});

$(document).ready(function () {
	if (!production) {
		CountlyHelpers.loadJS("times-of-day/javascripts/d3.punchcard.js");
	}
	var menu = '<a href="#/analytics/times-of-day" class="item">' +
		'<div class="logo-icon fa fa-envelope"></div>' +
		'<div class="text" data-localize="times.menu-title"></div>' +
		'</a>';
	$('#mobile-type #analytics-submenu').append(menu);
	$('#web-type #analytics-submenu').append(menu);
});