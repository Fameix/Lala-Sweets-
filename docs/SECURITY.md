# Security

- Never expose service-role keys or payment secrets to the browser
- Validate environment variables
- Enforce admin authorization server-side
- Keep missing prices as `null`
- Verify Razorpay signatures server-side
- Use RLS for customer-owned data
- Validate uploads by MIME type, extension, size, and count before storage
