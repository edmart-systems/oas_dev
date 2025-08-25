# Remove Test Job After Testing

After testing, remove this code from scheduler.ts:

```typescript
// Test push tasks every 30 seconds (remove after testing)
const testPushJob = schedule.scheduleJob("*/30 * * * * *", async () => {
  console.log("Test push job running at:", new Date().toISOString());
  try {
    const pushRes = await pushPendingTasksJob();
    console.log("Push test result:", pushRes.message);
  } catch (err) {
    console.error("Push test failed:", err);
  }
});
```