export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'API key not configured' });
  }

  const { text, filename } = req.body || {};
  if (!text || !filename) {
    return res.status(400).json({ error: 'Missing text or filename' });
  }

  const prompt = `You are an invoice data extraction assistant. Extract ALL available information from this invoice PDF and return ONLY a valid JSON object with these exact keys. If a field is not found, use empty string "".

Keys: clientName, sentToCastella, internalRef, sort, invoiceNo, issueDate, dueDate, term, overdueDays, billingPeriod, description, eur, usd, jpy, taxRate, taxAmount, otherAmount, totalEur, bankAccount, paymentDate, status, paidBy, method, paymentOffice, costCenter, contactPerson, department, email, phone, note

Rules:
- issueDate/dueDate/paymentDate: YYYY-MM-DD format
- eur/usd/jpy/taxAmount/otherAmount/totalEur: numbers only, no currency symbols
- taxRate: number only e.g. "10" for 10%
- description: combine project name, job name, item details into one string
- status: "Unpaid", "Paid", or "Overdue"
Return ONLY raw JSON, no markdown, no explanation.`;

  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 25000);

    let apiResponse;
    try {
      apiResponse = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 1000,
          messages: [{
            role: 'user',
            content: [
              { type: 'text', text: `${prompt}\n\n---\nINVOICE TEXT:\n${text}` }
            ]
          }]
        })
      });
    } finally {
      clearTimeout(timer);
    }

    if (!apiResponse.ok) {
      const err = await apiResponse.json().catch(() => ({}));
      return res.status(apiResponse.status).json({ error: err?.error?.message || `API error ${apiResponse.status}` });
    }

    const result = await apiResponse.json();
    const responseText = (result.content || []).map(b => b.text || '').join('');
    const clean = responseText.replace(/```json|```/g, '').trim();

    let parsed = {};
    try { parsed = JSON.parse(clean); } catch { parsed = {}; }

    return res.status(200).json(parsed);
  } catch (e) {
    const msg = e.name === 'AbortError' ? 'Request timed out (25s)' : e.message;
    return res.status(500).json({ error: msg });
  }
}
