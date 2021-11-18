browser.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'semaphoreci-notifier') {
    const creating = browser.notifications.create({
      type: 'basic',
      ...message.options,
    });

    creating.then((notificationId) => {
      console.log('Notification created ok: %s', notificationId);
      const senderTab = sender.tab;
      browser.notifications.onClicked.addListener((notificationId) => {
        console.log(
          'Notification ID=%s was clicked by the user - showing tab ID=%s',
          notificationId,
          senderTab.id
        );
        browser.tabs.update(senderTab.id, { active: true });
      });
    });
  }
});
