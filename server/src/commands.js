import { HttpError } from './errors.js';
import { PAID_COMMAND } from './policy.js';
import { askAssistant } from './ai.js';
import { saveEnquiry } from './enquiry.js';
import { createWebsite, renderWebsite } from './service.js';
import { allow } from './rateLimit.js';

const HOUR = 3600_000;
const num = (v, d) => (Number.isFinite(Number(v)) && Number(v) > 0 ? Number(v) : d);

function limits() {
  return {
    create_website: [num(process.env.GENERATE_PER_HOUR, 5), HOUR],
    render_website: [200, HOUR],
    ask_assistant: [40, HOUR],
    submit_enquiry: [10, HOUR],
  };
}

function cleanMessages(raw) {
  if (!Array.isArray(raw) || !raw.length) throw new HttpError(400, 'invalid_messages', 'Send a list of messages.');
  const msgs = raw.slice(-8).map((m) => ({
    role: m && m.role === 'assistant' ? 'assistant' : 'user',
    content: String((m && m.content) || '').slice(0, 300),
  }));
  while (msgs.length && msgs[0].role !== 'user') msgs.shift();
  if (!msgs.length || msgs[msgs.length - 1].role !== 'user') {
    throw new HttpError(400, 'invalid_messages', 'The last message must come from the visitor.');
  }
  return msgs;
}

export const HANDLERS = {
  create_website: (payload) => createWebsite(payload),
  render_website: (payload) => renderWebsite(payload),
  ask_assistant: async (payload) => ({ reply: await askAssistant(cleanMessages(payload && payload.messages)) }),
  submit_enquiry: (payload) => saveEnquiry(payload),
};

export async function runCommand(command, payload, ip) {
  if (typeof command !== 'string' || !command) {
    throw new HttpError(400, 'invalid_command', 'Send a "command" name.');
  }
  if (!Object.hasOwn(HANDLERS, command)) {
    if (PAID_COMMAND.test(command)) {
      throw new HttpError(403, 'paid_service',
        'That is part of our paid services. The AI builder only creates basic websites. See the Hire us page for custom work.');
    }
    throw new HttpError(400, 'unknown_command', `Unknown command. Supported commands: ${Object.keys(HANDLERS).join(', ')}.`);
  }
  const [limit, windowMs] = limits()[command];
  const gate = allow(`${command}:${ip}`, limit, windowMs);
  if (!gate.ok) {
    const mins = Math.max(1, Math.ceil(gate.retryAfter / 60));
    const err = new HttpError(429, 'rate_limited',
      command === 'create_website'
        ? `You have reached the limit for free website drafts. Please try again in about ${mins} minute${mins === 1 ? '' : 's'}.`
        : `Too many requests. Please try again in about ${mins} minute${mins === 1 ? '' : 's'}.`);
    err.retryAfter = gate.retryAfter;
    throw err;
  }
  return HANDLERS[command](payload);
}
