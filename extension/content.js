var spa = ['www.youtube.com'],
	spaLength = spa.length,
	currentHostname = window.location.hostname,
	count = 0,
	oldURL;

function checkForIncognito() {
	tab.active();
	tab.spa();
}

var tab = {
	active: function () {
		if (window.location.host != 'newtab')
			chrome.runtime.sendMessage({ query: 'activeTabInfo' });
	},

	spa: function () {
		for (var i = 0; i < spaLength; i++) {
			if (currentHostname == spa[i]) {
				oldURL = window.location.href;
				setInterval(function () {
					checkForURLchange(window.location.href);
				}, 30000);
			}
		}
	}
}

function checkForURLchange(currentURL) {
	if (currentURL != oldURL) {
		tab.active();
		oldURL = currentURL;
	}
}

checkForIncognito();
