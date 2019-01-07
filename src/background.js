var port = null;
var state = '';

var dblClickTimeout = NaN;
var dblClickDelay = 500;

chrome.browserAction.onClicked.addListener(function (tab) {
  if (!port) {
    chrome.tabs.create({ url: 'https://retrowave.ru/' });
    return;
  }

  if (dblClickTimeout) {
    clearTimeout(dblClickTimeout);
    dblClickTimeout = NaN;
    port.postMessage(state === 'playing' ? 'pause' : 'resume');
    return;
  }

  dblClickTimeout = setTimeout(function () {
    dblClickTimeout = NaN;
    port.postMessage(state === 'paused' ? 'resume' : 'next');
  }, dblClickDelay);
});

chrome.runtime.onConnectExternal.addListener(function (tabPort) {
  port = tabPort;

  port.onMessage.addListener(function (msg) {
    state = msg.state;

    switch (msg.state) {
      case 'playing':
        chrome.browserAction.setIcon({ path: 'assets/icon-next_128.png' });
        break;

      case 'paused':
        chrome.browserAction.setIcon({ path: 'assets/icon-pause_128.png' });
        break;
    }

    if (msg.title) {
      chrome.browserAction.setTitle({ title: msg.title });
    }
  });
});

setInterval(function () {
  try {
    port.postMessage('ping');
  }
  catch (err) {
    port = null;
    chrome.browserAction.setIcon({ path: 'assets/icon-play_128.png' });
    chrome.browserAction.setTitle({ title: 'Retrowave Radio' });
  }
}, 500);
