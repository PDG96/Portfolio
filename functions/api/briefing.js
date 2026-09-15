/**
 * POST /api/briefing
 * Receives the site briefing (briefing.html) and relays it to Pietra's inbox
 * through Resend, the same pipeline as /contact. The page builds the
 * briefing as plain text on the client; this only wraps it in an e-mail.
 *
 * Needs RESEND_API_KEY in the Pages environment, already set for /contact.
 */

const FROM_ADDRESS = 'Pietra Gottardo <contact@pietragottardo.com>';
const TO_ADDRESS   = 'pietragottardo@gmail.com';
const MAX_FILES    = 3;
const MAX_BYTES    = 10 * 1024 * 1024;

function toBase64(buffer) {
  const bytes = new Uint8Array(buffer);
  let bin = '';
  const step = 0x8000;
  for (let i = 0; i < bytes.length; i += step) {
    bin += String.fromCharCode.apply(null, bytes.subarray(i, i + step));
  }
  return btoa(bin);
}

function escapeHtml(str = '') {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export async function onRequestGet({ env }) {
  return json({ ok: true, function: 'briefing', resend_key_set: Boolean(env.RESEND_API_KEY) });
}

export async function onRequestPost({ request, env }) {
  try {
    if (!env.RESEND_API_KEY) {
      return json({ ok: false, error: 'missing_api_key' }, 500);
    }

    // JSON when there is nothing to attach, multipart when the client added files.
    let payload;
    let files = [];
    try {
      const contentType = request.headers.get('content-type') || '';
      if (contentType.includes('multipart/form-data')) {
        const form = await request.formData();
        payload = {};
        for (const [k, v] of form.entries()) {
          if (k === 'files') { if (v && typeof v === 'object' && v.size > 0) files.push(v); }
          else payload[k] = v;
        }
      } else {
        payload = await request.json();
      }
    } catch {
      return json({ ok: false, error: 'invalid_body' }, 400);
    }

    const nome     = (payload.nome    || '').toString().trim().slice(0, 120);
    const email    = (payload.email   || '').toString().trim().slice(0, 200);
    const empresa  = (payload.empresa || '').toString().trim().slice(0, 160);
    // A full briefing runs 3 to 6k characters; 20k leaves room for pasted links.
    const text     = (payload.text    || '').toString().trim().slice(0, 20000);
    const missing  = Number(payload.missing) || 0;
    const honeypot = (payload.website || '').toString().trim();

    if (honeypot) {
      return json({ ok: true });
    }
    if (!nome || !email || !text) {
      return json({ ok: false, error: 'missing_fields' }, 400);
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return json({ ok: false, error: 'invalid_email' }, 400);
    }

    // Same caps the page enforces: 3 files, 10 MB together. Resend takes
    // attachments as base64 and allows 40 MB per message, so this is safe.
    if (files.length > MAX_FILES) {
      return json({ ok: false, error: 'too_many_files' }, 400);
    }
    const totalBytes = files.reduce((a, f) => a + f.size, 0);
    if (totalBytes > MAX_BYTES) {
      return json({ ok: false, error: 'files_too_large' }, 400);
    }
    const attachments = [];
    for (const f of files) {
      attachments.push({
        filename: (f.name || 'anexo').slice(0, 120),
        content: toBase64(await f.arrayBuffer())
      });
    }

    const subject = `Briefing de site: ${empresa || nome}`
      + (missing ? ` (${missing} obrigatória${missing > 1 ? 's' : ''} em branco)` : '')
      + (attachments.length ? ` · ${attachments.length} anexo${attachments.length > 1 ? 's' : ''}` : '');
    const body = `${text}\n\n---\nDe: ${nome} <${email}>`;
    const html = `
      <div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;font-size:15px;line-height:1.6;color:#141414;">
        <pre style="white-space:pre-wrap;font:inherit;margin:0;">${escapeHtml(text)}</pre>
        <hr style="border:0;border-top:1px solid #e5e5e5;margin:24px 0;">
        <p style="color:#737373;font-size:13px;">
          De <strong style="color:#141414;">${escapeHtml(nome)}</strong> &lt;${escapeHtml(email)}&gt;
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
          text: body,
          html,
          attachments
        })
      });
    } catch (fetchErr) {
      return json({ ok: false, error: 'fetch_threw', detail: String(fetchErr && fetchErr.message || fetchErr) }, 502);
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
