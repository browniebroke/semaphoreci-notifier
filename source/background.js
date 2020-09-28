browser.runtime.onMessage.addListener((message) => {
  if (message.type === 'semaphoreci-notifier') {
    return browser.notifications.create({
      type: 'basic',
      ...message.options,
    });
  }
});
