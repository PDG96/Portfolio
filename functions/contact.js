/**
 * POST /contact
 * Receives the landing-page contact form and relays it to Pietra's inbox
 * via the MailChannels HTTP API. Runs on Cloudflare Pages Functions.
 *
 * Required (none — MailChannels is callable from inside CF Workers/Pages
 * without an API key). For deliverability you still need three DNS records
 * on pietragottardo.com:
 *   1. SPF       TXT @                  "v=spf1 a mx include:relay.mailchannels.net ~all"
 *   2. Lockdown  TXT _mailchannels      "v=mc1 cfid=pages.dev cfid=pietragottardo.com"
 *   3. DKIM      (optional, recommended — generate a keypair, publish the
 *                 public half as a TXT record, sign with the private half here)
 */

const FROM_ADDRESS = 'noreply@pietragottardo.com';
const FROM_NAME    = 'Portfolio Contact Form';
const TO_ADDRESS   = 'pietragottardo@gmail.com';
const TO_NAME      = 'Pietra Gottardo';

function escapeHtml(str = '') {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export async function onRequestPost({ request }) {
  let payload;
  try {
    const contentType = request.headers.get('content-type') || '';
    if (contentType.includes('application/json')) {
      payload = await request.json();
    } else {
      const form = await request.formData();
      payload = Object.fromEntries(form.entries());
    }
  } catch {
    return json({ ok: false, error: 'invalid_body' }, 400);
  }

  const name    = (payload.name    || '').toString().trim().slice(0, 120);
  const email   = (payload.email   || '').toString().trim().slice(0, 200);
  const message = (payload.message || '').toString().trim().slice(0, 5000);
  const honeypot = (payload.website || '').toString().trim();

  if (honeypot) {
    // Silently accept spam, the bot thinks it succeeded
    return json({ ok: true });
  }
  if (!name || !email || !message) {
    return json({ ok: false, error: 'missing_fields' }, 400);
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return json({ ok: false, error: 'invalid_email' }, 400);
  }

  const subject = `Portfolio inquiry, ${name}`;
  const text = `${message}\n\n---\nFrom: ${name} <${email}>`;
  const html = `
    <div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;font-size:15px;line-height:1.6;color:#141414;">
      <p style="white-space:pre-wrap;">${escapeHtml(message)}</p>
      <hr style="border:0;border-top:1px solid #e5e5e5;margin:24px 0;">
      <p style="color:#737373;font-size:13px;">
        From <strong style="color:#141414;">${escapeHtml(name)}</strong> &lt;${escapeHtml(email)}&gt;
      </p>
    </div>
  `;

  const mcBody = {
    personalizations: [{
      to: [{ email: TO_ADDRESS, name: TO_NAME }]
    }],
    from: { email: FROM_ADDRESS, name: FROM_NAME },
    reply_to: { email, name },
    subject,
    content: [
      { type: 'text/plain', value: text },
      { type: 'text/html',  value: html }
    ]
  };

  const mcResp = await fetch('https://api.mailchannels.net/tx/v1/send', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(mcBody)
  });

  if (!mcResp.ok) {
    const detail = await mcResp.text();
    console.log('mailchannels_failed', mcResp.status, detail);
    return json({ ok: false, error: 'send_failed', status: mcResp.status }, 502);
  }

  return json({ ok: true });
}

function json(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json; charset=utf-8' }
  });
}
