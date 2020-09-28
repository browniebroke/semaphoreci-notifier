// Constants
const PASSED_STRING = '[passed]';
const FAILED_STRING = '[failed]';

function handleTitleChanged(mutation) {
  const oldValue = mutation.oldValue;
  if (oldValue.includes(PASSED_STRING) || oldValue.includes(FAILED_STRING)) {
    console.log('Build was already finished...');
    return;
  }
  const newValue = mutation.target.nodeValue;
  console.log(newValue);
  if (newValue.includes(PASSED_STRING)) {
    console.log('Build OK!');
    browser.runtime.sendMessage({
      type: 'semaphoreci-notifier',
      options: {
        iconUrl: browser.extension.getURL('passed.png'),
        title: 'Build OK!',
        message: newValue,
      },
    });
    return;
  }
  if (newValue.includes(FAILED_STRING)) {
    console.log('Build Failed!');
    browser.runtime.sendMessage({
      type: 'semaphoreci-notifier',
      options: {
        iconUrl: browser.extension.getURL('failed.png'),
        title: 'Build Failed!',
        message: newValue,
      },
    });
    return;
  }
  console.log('Build Not Finished...');
}

const observer = new MutationObserver((mutations) => {
  console.log(mutations);
  mutations.forEach((mutation) => {
    handleTitleChanged(mutation);
  });
});

observer.observe(document.querySelector('head > title'), {
  attributes: true,
  childList: true,
  characterData: true,
  subtree: true,
  attributeOldValue: true,
  characterDataOldValue: true,
});

console.log('SemaphoreCI Notifier active!');
