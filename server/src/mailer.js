import { esc } from './render.js';

const API_URL = 'https://api.resend.com/emails';
const inr = (n) => '\u20B9' + Number(n).toLocaleString('en-IN');

export const mailConfigured = () => Boolean(process.env.RESEND_API_KEY && process.env.NOTIFY_EMAIL);

function buildText(r) {
  return [
    `New enquiry from ${r.name}`, '',
    `Name: ${r.name}`,
    `Email: ${r.email}`,
    `Phone: ${r.phone || '-'}`,
    `Business: ${r.business || '-'}`, '',
    `Package: ${r.pkg}`,
    `Selected: ${r.totals.lines.join(', ') || 'none'}`,
    `Estimated one-time: ${inr(r.totals.oneTime)}`,
    `Estimated monthly: ${inr(r.totals.monthly)}`, '',
    'Requirements:',
    r.requirements || '-', '',
    `Received: ${r.receivedAt}`,
    'Reply to this email to answer the customer.',
  ].join('\n');
}

function buildHtml(r) {
  const row = (k, v) => `<tr><td style="padding:6px 14px 6px 0;color:#666">${esc(k)}</td><td style="padding:6px 0"><b>${esc(v)}</b></td></tr>`;
  return `<div style="font-family:system-ui,Segoe UI,sans-serif;font-size:15px;line-height:1.5;color:#111">
<h2 style="margin:0 0 12px">New enquiry from ${esc(r.name)}</h2>
<table style="border-collapse:collapse">
${row('Name', r.name)}${row('Email', r.email)}${row('Phone', r.phone || '-')}${row('Business', r.business || '-')}
${row('Package', r.pkg)}${row('Selected', r.totals.lines.join(', ') || 'none')}
${row('Estimated one-time', inr(r.totals.oneTime))}${row('Estimated monthly', inr(r.totals.monthly))}
</table>
<p style="margin:16px 0 4px;color:#666">Requirements</p>
<div style="white-space:pre-wrap;border:1px solid #ddd;border-radius:8px;padding:12px">${esc(r.requirements || '-')}</div>
<p style="color:#666;margin-top:16px">Reply to this email to answer the customer.</p>
</div>`;
}

// Sends the enquiry to the owner. Never throws: returns { sent, reason }.
export async function sendEnquiryEmail(record) {
  if (!mailConfigured()) return { sent: false, reason: 'not_configured' };
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 10000);
  try {
    const res = await fetch(API_URL, {
      method: 'POST',
      signal: controller.signal,
      headers: {
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
        'Content-Type': 'application/json',
        'Idempotency-Key': record.id,
      },
      body: JSON.stringify({
        from: process.env.MAIL_FROM || 'TheBytely <onboarding@resend.dev>',
        to: [process.env.NOTIFY_EMAIL],
        reply_to: record.email,
        subject: `New enquiry from ${record.name}`,
        text: buildText(record),
        html: buildHtml(record),
      }),
    });
    if (!res.ok) {
      const detail = await res.text().catch(() => '');
      console.error(`[mail] Resend ${res.status}: ${detail.slice(0, 300)}`);
      return { sent: false, reason: 'provider_error' };
    }
    return { sent: true };
  } catch (err) {
    console.error('[mail] failed:', err.message);
    return { sent: false, reason: 'network' };
  } finally {
    clearTimeout(timer);
  }
}