import { aiConfigured, generateWithAI } from './ai.js';
import { fallbackContent, galleryHeading } from './fallback.js';
import { renderSite } from './render.js';
import { validateBrief, validateContent, validateImages, validateTheme } from './validate.js';
import { HttpError } from './errors.js';
import { SCOPE } from './policy.js';

function buildResponse(content, theme) {
  const { pages } = renderSite(content, theme, { preview: true });
  return { content, theme, pages, scope: SCOPE };
}

export async function createWebsite(payload) {
  if (payload && typeof payload === 'object') {
    for (const key of Object.keys(payload)) {
      if (key !== 'brief' && key !== 'images') {
        throw new HttpError(400, 'unsupported_option', `"${key}" is not a supported field. Allowed fields: brief, images.`);
      }
    }
  }
  const brief = validateBrief(payload && payload.brief);
  const images = validateImages(payload && payload.images); // checked before any AI call
  let content = null;
  let source = 'ai';
  let notice = '';

  if (aiConfigured()) {
    try {
      content = await generateWithAI(brief);
    } catch (err) {
      console.error('[ai] website generation failed:', err.message);
    }
  }
  if (!content) {
    content = validateContent(fallbackContent(brief));
    source = 'template';
    notice = 'This draft was written from a ready-made template because the AI writer is unavailable right now. You can still edit everything.';
  }
  // Photos are shown on the page only. They are never sent to the AI.
  content.home.galleryHeading = galleryHeading(brief.type);
  content.images = images;
  const theme = validateTheme({ style: brief.style, accent: '#6C4DFF' });
  return { source, notice, ...buildResponse(content, theme) };
}

export function renderWebsite(payload) {
  const content = validateContent(payload && payload.content);
  const theme = validateTheme(payload && payload.theme);
  return buildResponse(content, theme);
}