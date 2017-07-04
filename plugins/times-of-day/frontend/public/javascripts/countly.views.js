window.TimesOfDayView = countlyView.extend({
	initialize: function () {},
	beforeRender: function () {
		if (this.template) {
			return $.when(countlyTimesOfDayPlugin.initialize()).then(function () {
			});
		} else {
			var self = this;
			return $.when($.get(countlyGlobal["path"] + '/times-of-day/templates/report.html', function (src) {
				self.template = Handlebars.compile(src);
			}), countlyTimesOfDayPlugin.initialize()).then(function () {
			});
		}
	},
	renderCommon: function () {
		this.templateData = {
			"page-title": jQuery.i18n.map["times.menu-title"]
		};
		$(this.el).html(this.template(this.templateData));
	},
	refresh: function () {
		var self = this;
		$.when(countlyTimesOfDayPlugin.initialize()).then(function () {
			if (app.activeView != self) {
				return false;
			}
			self.renderCommon();
		});
	}
});

//register views
app.timesOfDayView = new TimesOfDayView();

app.route("/analytics/times-of-day", 'times', function () {
	this.renderWhenReady(this.timesOfDayView);
});

$(document).ready(function () {
	var menu = '<a href="#/analytics/times-of-day" class="item">' +
		'<div class="logo-icon fa fa-envelope"></div>' +
		'<div class="text" data-localize="times.menu-title"></div>' +
		'</a>';
	$('#mobile-type #analytics-submenu').append(menu);
	$('#web-type #analytics-submenu').append(menu);
});