/**
 * POST /contact
 * Receives the landing-page contact form and relays it to Pietra's inbox
 * through the Resend HTTP API. Runs on Cloudflare Pages Functions.
 *
 * Setup (one-time):
 *   1. Sign up at https://resend.com (free, 100/day, no credit card)
 *   2. Create an API key in the dashboard
 *   3. In Cloudflare Pages → Settings → Environment variables, add:
 *        RESEND_API_KEY = re_xxxxxxxx
 *      (Production scope; click Save and redeploy)
 *   4. For testing immediately, leave FROM_ADDRESS as
 *      'onboarding@resend.dev' — Resend lets you send from that sender
 *      to your own verified email without any DNS work.
 *   5. Later, to send "from" pietragottardo.com:
 *        - Add the domain in Resend's dashboard
 *        - Paste the DKIM + SPF records they give you into Cloudflare DNS
 *        - Change FROM_ADDRESS below to "hello@pietragottardo.com"
 */

const FROM_ADDRESS = 'Pietra Gottardo <contact@pietragottardo.com>';
const TO_ADDRESS   = 'pietragottardo@gmail.com';

function escapeHtml(str = '') {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

// Lightweight health check at GET /contact, useful for sanity checks but
// intentionally does not leak the API key or expose a send endpoint.
export async function onRequestGet({ env }) {
  return json({
    ok: true,
    function: 'contact',
    resend_key_set: Boolean(env.RESEND_API_KEY)
  });
}

export async function onRequestPost({ request, env }) {
  try {
    if (!env.RESEND_API_KEY) {
      return json({ ok: false, error: 'missing_api_key' }, 500);
    }

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

    const name     = (payload.name     || '').toString().trim().slice(0, 120);
    const email    = (payload.email    || '').toString().trim().slice(0, 200);
    const message  = (payload.message  || '').toString().trim().slice(0, 5000);
    const honeypot = (payload.website  || '').toString().trim();

    if (honeypot) {
      // Silently accept spam — the bot thinks it succeeded
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

    let resp;
    try {
      resp = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'authorization': `Bearer ${env.RESEND_API_KEY}`,
          'content-type': 'application/json'
        },
        body: JSON.stringify({
          from: FROM_ADDRESS,
          to: [TO_ADDRESS],
          reply_to: email,
          subject,
          text,
          html
        })
      });
    } catch (fetchErr) {
      return json({
        ok: false,
        error: 'fetch_threw',
        detail: String(fetchErr && fetchErr.message || fetchErr)
      }, 502);
    }

    if (!resp.ok) {
      const detail = await resp.text();
      console.log('resend_failed', resp.status, detail);
      return json({ ok: false, error: 'send_failed', status: resp.status }, 502);
    }

    return json({ ok: true });
  } catch (err) {
    console.log('handler_threw', err && err.stack || err);
    return json({ ok: false, error: 'handler_threw' }, 500);
  }
}

function json(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json; charset=utf-8' }
  });
}
