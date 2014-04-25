//Dependencies
var User = require('User'),
	ui = require('ui');

var facebook = require('facebook');

//App configuration
facebook.appid = Ti.App.Properties.getString('ti.facebook.appid');
facebook.permissions = ['publish_stream'];
	
//TODO: Be more tolerant of offline
if (!Ti.Network.online) {
	ui.alert('networkErrTitle', 'networkErrMsg');
}

//create view hierarchy components
$.login = Alloy.createController('login');

//Check Login Status
if (User.confirmLogin()) {
	$.main = Alloy.createController('main');
	$.clouds && ($.index.remove($.clouds)); //remove image view
	$.index.backgroundImage = '/img/general/bg-interior.png';
	$.index.add($.main.getView());
	$.main.init();
}
else {
	$.index.backgroundImage = '/img/general/bg-cloud.png';
	$.index.add($.login.getView());
	$.login.init();
}

//Monitor Login Status
$.login.on('loginSuccess', function(e) {
	$.main = Alloy.createController('main');
	$.clouds && ($.index.remove($.clouds));
	$.index.backgroundImage = '/img/general/bg-interior.png';
	$.index.add($.main.getView());
	ui.zoom($.login.getView(), function() {
		ui.unzoom($.main.getView(), function() {
			$.main.init();
		});
	});
});

//Look for global logout event
Ti.App.addEventListener('app:logout', function(e) {
	$.clouds && ($.index.add($.clouds));
	$.index.backgroundImage = '/img/general/bg-cloud.png';
	$.index.add($.login.getView());
	$.login.init();
	ui.zoom($.main.getView(), function() {
		ui.unzoom($.login.getView());
	});
});

//Lock orientation modes for handheld
if (!Alloy.isTablet) {
	$.index.orientationModes = [
		Ti.UI.PORTRAIT,
		Ti.UI.UPSIDE_PORTRAIT
	];
}

//TODO: At some point, a better UX would be to close open drawers until there are none, and then exit
if (Ti.Platform.osname === 'android') {
	$.index.addEventListener('android:back', function() {
		var od = Ti.UI.createOptionDialog({
			title:L('leave'),
			options:[L('ok'), L('cancel')],
			cancel:1
		});
		
		od.addEventListener('click', function(e) {
			e.index === 0 && ($.index.close());
		});
		
		od.show();
	});
}

//Open initial window
$.index.open();
