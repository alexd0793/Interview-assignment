import { test, expect } from '@playwright/test';

test('New pay-in webhook adds transaction and updates balance', async ({ page }) => {
  await page.goto('/');

  //Capture the current balance shown on screen
  const initialBalance = await page.locator('#balance').innerText();

  //Define what the backend would send via WebSocket when a new payment arrives
  const newTransaction = {
    id: 'txn_12345',
    amount: 200,
    status: 'PROCESSED',
  };

  //Simulate the WebSocket message being received in the browser
  await page.evaluate((txn) => {
    window.dispatchEvent(new MessageEvent('message', {
      data: JSON.stringify({
        type: 'NEW_TRANSACTION',   // frontend listens for this event type
        payload: txn,              // transaction details
      }),
    }));
  }, newTransaction);

  //Verify that the new transaction appeared in the UI
  await expect(page.locator(`[data-id="${newTransaction.id}"]`)).toBeVisible();
  await expect(page.locator(`[data-id="${newTransaction.id}"]`)).toContainText('PROCESSED');

// ✅ Verify exact math: new balance = old balance + transaction amount
const newBalance = await page.locator('#balance').innerText();

// Convert strings to pure integers (remove any non-digit characters like € or commas)
const oldValue = parseInt(initialBalance.replace(/[^\d-]/g, ''), 10);
const newValue = parseInt(newBalance.replace(/[^\d-]/g, ''), 10);
const addedAmount = newTransaction.amount;

// Assert exact match
expect(newValue).toBe(oldValue + addedAmount);
});

/*
Didn't work until now with WebSocket mock or Webhooks, i knew about them, so i used AI to help me with approach, 
and theoretical understainding.I am using AI when necessary to speed up learning and implementation.
So this is how i was thinking about it:

When the backend sends a WebSocket message announcing a new pay-in, the UI should instantly display that new transaction and 
recalculate the balance.
In Playwright, I simulate this by dispatching a MessageEvent directly in the browser using page.evaluate.
That triggers the same listener the real WebSocket uses, allowing me to verify that the DOM updates and that the balance 
increases accordingly.
 */