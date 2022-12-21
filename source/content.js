import './sentry.js';

/*
 * Semaphore classic: watch for mutation of the title element
 */
// Constants
const PASSED_STRING = '[passed]';
const FAILED_STRING = '[failed]';

function handleTitleChanged(titleText) {
  console.log('Title changed to "%s"', titleText);
  if (titleText.includes(PASSED_STRING)) {
    console.log('Build OK!');
    browser.runtime.sendMessage({
      type: 'semaphoreci-notifier',
      options: {
        iconUrl: browser.extension.getURL('passed.png'),
        title: 'Build OK!',
        message: titleText,
      },
    });
    return;
  }

  if (titleText.includes(FAILED_STRING)) {
    console.log('Build Failed!');
    browser.runtime.sendMessage({
      type: 'semaphoreci-notifier',
      options: {
        iconUrl: browser.extension.getURL('failed.png'),
        title: 'Build Failed!',
        message: titleText,
      },
    });
    return;
  }

  console.log('Build Not Finished...');
}

const titleObserver = new MutationObserver((mutations) => {
  console.log(mutations);
  for (const mutation of mutations) {
    // The <title> is not updated in place, it's removed and then added
    // When the node is added back to the dom, check its content
    if (
      mutation.addedNodes.length > 0 &&
      mutation.target &&
      mutation.target.innerText
    ) {
      handleTitleChanged(mutation.target.innerText);
    }
  }
});

/*
 * Semaphore 2.0: watch for mutation of the favicon
 */
// Constants
const RUNNING_ICON = 'images/favicon-running.svg';
const PASSED_ICON = 'images/favicon-passed.svg';
const STOPPED_ICON = 'images/favicon-stopped.svg';
const FAILED_ICON = 'images/favicon-failed.svg';

const faviconObserver = new MutationObserver((mutations) => {
  console.log(mutations);
  for (const mutation of mutations) {
    if (
      mutation.type === 'attributes' &&
      mutation.attributeName === 'href' &&
      // Used to be running
      mutation.oldValue.includes(RUNNING_ICON) &&
      // Is no longer running
      !mutation.target.href.includes(RUNNING_ICON)
    ) {
      const titleText = document.querySelector('head > title').innerText;
      handleFaviconChanged(mutation.target.href, titleText);
    }
  }
});

function handleFaviconChanged(iconUrl, titleText) {
  console.log('Icon changed to "%s"', iconUrl);
  const jobType = titleText.startsWith('Deploy') ? 'Deploy' : 'Build';
  if (iconUrl.includes(PASSED_ICON)) {
    console.log('Build OK!');
    browser.runtime.sendMessage({
      type: 'semaphoreci-notifier',
      options: {
        iconUrl: browser.extension.getURL('passed-2.0.png'),
        title: `${jobType} OK!`,
        message: titleText,
      },
    });
    return;
  }

  if (iconUrl.includes(STOPPED_ICON) || iconUrl.includes(FAILED_ICON)) {
    console.log('Build Failed!');
    browser.runtime.sendMessage({
      type: 'semaphoreci-notifier',
      options: {
        iconUrl: browser.extension.getURL('failed-2.0.png'),
        title: `${jobType} Failed!`,
        message: titleText,
      },
    });
    return;
  }

  console.log('Build Not Finished...');
}

addEventListener('load', () => {
  titleObserver.observe(document.querySelector('head > title'), {
    attributes: true,
    childList: true,
    characterData: true,
    subtree: true,
    attributeOldValue: true,
    characterDataOldValue: true,
  });
  faviconObserver.observe(document.querySelector('head > link[rel="icon"]'), {
    attributes: true,
    childList: true,
    characterData: true,
    subtree: true,
    attributeOldValue: true,
    characterDataOldValue: true,
  });
  console.log('SemaphoreCI Notifier active!');
});

addEventListener('beforeunload', (event) => {
  titleObserver.disconnect();
  faviconObserver.disconnect();
  console.log('Deactivated SemaphoreCI Notifier');
});
