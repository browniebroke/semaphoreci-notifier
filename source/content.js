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

const observer = new MutationObserver((mutations) => {
  console.log(mutations);
  mutations.forEach((mutation) => {
    // The <title> is not updated in place, it's removed and then added
    // When the node is added back to the dom, check its content
    if (
      mutation.addedNodes.length > 0 &&
      mutation.target &&
      mutation.target.innerText
    ) {
      handleTitleChanged(mutation.target.innerText);
    }
  });
});

addEventListener('load', function () {
  observer.observe(document.querySelector('head > title'), {
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
  observer.disconnect();
  console.log('Deactivated SemaphoreCI Notifier');
});
