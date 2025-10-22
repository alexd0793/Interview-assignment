import { test, expect, request } from '@playwright/test';

test('Creating a payment triggers event and updates to PROCESSED after webhook', async ({ request }) => {
  const api = request.newContext({ baseURL: process.env.API_URL });

  //Create a new payment
  const response = await api.post('/payments', {
    data: { amount: 150, recipient: 'QA Test' },
  });
  expect(response.ok()).toBeTruthy();
  const payment = await response.json();
  expect(payment.status).toBe('PENDING');

  //Verify "Transaction Created" event in logs or mock listener
  const logs = await api.get(`/events?transactionId=${payment.id}`);
  const events = await logs.json();
  expect(events.some(e => e.type === 'TransactionCreated')).toBeTruthy();

  //Simulate webhook arrival
  await api.post('/webhook', {
    data: { id: payment.id, status: 'PROCESSED' },
  });

  //Verify status updated
  const updated = await api.get(`/payments/${payment.id}`);
  const updatedData = await updated.json();
  expect(updatedData.status).toBe('PROCESSED');
});

/*
This test validates the backend integration flow for payments.
I start by creating a new payment through the API, confirming that it’s stored as PENDING and that a ‘TransactionCreated’ event 
is emitted.
Then, I simulate the external webhook call that would arrive from the payment provider, and finally, I verify that the backend 
updates the payment’s status to PROCESSED.
*/
