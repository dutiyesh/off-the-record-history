var _gaq = _gaq || [];
_gaq.push(['_setAccount', 'UA-77917281-1']);
_gaq.push(['_trackPageview']);

(function () {
	var ga = document.createElement('script'); ga.type = 'text/javascript'; ga.async = true;
	ga.src = 'https://ssl.google-analytics.com/ga.js';
	var s = document.getElementsByTagName('script')[0]; s.parentNode.insertBefore(ga, s);
})();

function trackButtonClick(e) {
	_gaq.push(['_trackEvent', e.target.id, 'clicked']);
}

function trackLinkClick(e) {
	_gaq.push(['_trackEvent', e.target.className, 'clicked']);
}

// pre-wake bg
chrome.runtime.getBackgroundPage(function(){});

document.addEventListener('DOMContentLoaded', init);

function init() {
	var tabContent = document.getElementById('tabs-content'),
		recordList0 = document.getElementById('record-list-0'),
		recordList1 = document.getElementById('record-list-1'),
		deleteBtn = document.getElementById('delete-btn'),
		bg = chrome.extension.getBackgroundPage();

	// wake up bg page
	if (!bg) {
		chrome.runtime.getBackgroundPage(init);
		return;
	}

	if (chrome.extension.inIncognitoContext) {
		tabContent.style.display = 'block';
		recordList0.style.display = 'block';
		recordList1.style.display = 'none';
		deleteBtn.style.display = 'block';

		var recentlyClosed = bg.incRecent,
			allHistory = bg.incHist;

		if (recentlyClosed.length != 0) {
			notNullResponse();
		} else {
			nullResponse('No records found!');
		}

		showRecord(recentlyClosed, 'record-list-0');
		showRecord(allHistory, 'record-list-1');

		var targetTabList = document.getElementById('tabs-content').getElementsByTagName('span');

		for (var i = 0; i < targetTabList.length; i++) {
			targetTabList[i].addEventListener('click', function (event) {

				var tabIndex = this.getAttribute('data-tab-index');
				document.getElementById('tab-bottom-slider').style.left = 50 * tabIndex + '%';

				var tabsList = document.getElementsByClassName('tab-record-list'),
					tabsListLength = tabsList.length - 1;

				for (var i = 0; i <= tabsListLength; i++) {
					tabsList[i].style.display = 'none';
				}

				var currentTabList = document.getElementById('record-list-' + tabIndex);
				if (currentTabList.getElementsByTagName('li').length == 0) {
					nullResponse('No records found!');
				} else {
					notNullResponse();
					currentTabList.style.display = 'block';
					currentTabList.scrollTop = 0;
				}

				trackButtonClick(event);

			});
		}

		var recentLinkList = document.getElementsByClassName('recent-target-link');

		for (var i = 0; i < recentLinkList.length; i++) {
			recentLinkList[i].addEventListener('click', function (event) {
				chrome.tabs.create({
					'url': this.getAttribute('href')
				});
				trackLinkClick(event);
			});
		}

		var historyLinkList = document.getElementsByClassName('history-target-link');

		for (var i = 0; i < historyLinkList.length; i++) {
			historyLinkList[i].addEventListener('click', function (event) {
				chrome.tabs.create({
					'url': this.getAttribute('href')
				});
				trackLinkClick(event);
			});
		}

	} else {
		tabContent.style.display = 'none';
		recordList0.style.display = 'none';
		recordList1.style.display = 'none';
		deleteBtn.style.display = 'none';

		chrome.extension.isAllowedIncognitoAccess(function (response) {
			if (!response) {
				var message = '';

				message += 'This extension is for incognito mode only.';
				message += '<div class="instructions-container">';
					message += '<p class="instructions-title">To allow the extension to work in incognito:</p>'
					message += '<ol class="instructions-list">';
						message += '<li>Open <b>chrome://extensions/</b> window</li>';
						message += '<li>Find <b>Off The Record History</b> extension';
						message += '<li>Click on <b>Details</b> button</li>';
						message += '<li>Find and select the <b>Allow in incognito</b> switch</li>';
					message += '</ol>';
				message += '</div>';

				nullResponse(message);
			}
			else {
				nullResponse('This extension is for incognito mode only.');
			}
		});
	}


	document.getElementById('delete-btn').addEventListener('click', function (event) {
		bg.incRecent = [];
		bg.incHist = [];
		bg.tabs = {};

		recordList0.innerHTML = '';
		recordList1.innerHTML = '';
		nullResponse('All records were destroyed!');

		trackButtonClick(event);

	});

	function nullResponse(message) {
		document.getElementById('tab-response-content').style.display = 'block';
		document.getElementById('response-text').innerHTML = message;
	}

	function notNullResponse() {
		document.getElementById('tab-response-content').style.display = 'none';
		document.getElementById('response-text').innerHTML = '';
	}

}

function showRecord(result, list) {
	var i,
		ul = document.getElementById(list),
		record = result,
		recordLength = record.length - 1,
		ulType = parseInt(list.charAt(list.length - 1));

	for (i = recordLength; i >= 0; i--) {
		var li = document.createElement('li');
		var img = document.createElement('img');
		var favIconUrl = record[i].favIcon;
		if (favIconUrl != undefined) {
			img.setAttribute('src', favIconUrl);
		} else {
			img.setAttribute('src', 'file-icon.svg');
		}

		li.appendChild(img);

		var a = document.createElement('a');
		a.setAttribute('href', record[i].url);
		a.setAttribute('title', record[i].title);

		if (ulType) {
			a.setAttribute('class', 'history-target-link');
		} else {
			a.setAttribute('class', 'recent-target-link');
		}

		a.appendChild(document.createTextNode(record[i].title));
		li.appendChild(a);

		var span = document.createElement('span');
		var time = new Date(record[i].timestamp);
		var hour = time.getHours();
		var minutes = time.getMinutes();
		if (minutes > 9) {
			span.appendChild(document.createTextNode(hour + ":" + minutes));
		} else {
			span.appendChild(document.createTextNode(hour + ":0" + minutes));
		}

		li.appendChild(span);
		ul.appendChild(li);
	}
}
