import { test, expect } from '@playwright/test';

test('Webhook updates transaction status to PROCESSED in real-time', async ({ page }) => {
  // Open the app
  await page.goto('/');

  //Identify an existing transaction that is still PENDING.
  // We assume the row elements in the table have data-id attributes
  const transactionId = await page.locator('.transaction-row').first().getAttribute('data-id');

  // Verify that transaction is still pending
  await expect(page.locator(`[data-id="${transactionId}"]`)).toContainText('PENDING');

  //Mock the backend WebSocket message.
  // In real life, this message would come from the backend server via WebSocket.
  // We simulate it in the browser's context using window.dispatchEvent()
  await page.evaluate((id) => {
    // Simulate a "message" event received from the WebSocket
    window.dispatchEvent(new MessageEvent('message', {
      data: JSON.stringify({
        type: 'TRANSACTION_UPDATED',  // event type our frontend listens to
        payload: { id, status: 'PROCESSED' }, // the updated transaction data
      }),
    }));
  }, transactionId);

  //Assert that the UI updated automatically to show "PROCESSED"
  await expect(page.locator(`[data-id="${transactionId}"]`)).toContainText('PROCESSED');
});

/*
Didn't work until now with WebSocket mock or Webhooks, i knew about them, so i used AI to help me with approach, 
and theoretical understainding.I am using AI when necessary to speed up learning and implementation.
So this is how i was thinking about it:

This test verifies the integration between the frontend and the backend’s real-time event channel.
When the backend receives a webhook from a payment processor, it emits a WebSocket message to the UI.
In my test, I mock that WebSocket event directly in the browser context, dispatching a simulated message of type TRANSACTION_UPDATED.
The test then asserts that the transaction status in the UI automatically changes from PENDING to PROCESSED without any manual refresh.
*/
