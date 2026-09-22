// services/ai.service.js
// Primary: Google Gemini | Optional: Anthropic Claude

const { GoogleGenerativeAI } = require('@google/generative-ai');
let Anthropic;
try { Anthropic = require('@anthropic-ai/sdk'); } catch {}

require('dotenv').config();

// ─── Provider Selection ────────────────────────────────────────────────────────
function getActiveProvider() {
  const pref = process.env.AI_PROVIDER || 'auto';
  const hasAnthropic = !!process.env.ANTHROPIC_API_KEY;
  const hasGemini = !!process.env.GEMINI_API_KEY;

  // Explicit preference — use it if key available, otherwise fall through
  if (pref === 'anthropic') {
    if (hasAnthropic) return 'anthropic';
    if (hasGemini) return 'gemini'; // fallback
  }
  if (pref === 'gemini') {
    if (hasGemini) return 'gemini';
    if (hasAnthropic) return 'anthropic'; // fallback
  }
  // Auto: prefer anthropic, then gemini
  if (hasAnthropic) return 'anthropic';
  if (hasGemini) return 'gemini';

  throw new Error('No AI provider configured. Please add GEMINI_API_KEY or ANTHROPIC_API_KEY to your .env file.');
}

// ─── Gemini Client ─────────────────────────────────────────────────────────────
function getGeminiClient(modelName = process.env.GEMINI_MODEL || 'gemini-1.5-flash') {
  if (!process.env.GEMINI_API_KEY) throw new Error('GEMINI_API_KEY not set');
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  return genAI.getGenerativeModel({ model: modelName });
}

// ─── Anthropic Client ──────────────────────────────────────────────────────────
function getAnthropicClient() {
  if (!Anthropic) throw new Error('@anthropic-ai/sdk not installed');
  if (!process.env.ANTHROPIC_API_KEY) throw new Error('ANTHROPIC_API_KEY not set');
  // Handle both `require` styles: module.default (ESM compat) or module directly
  const AnthropicClass = Anthropic.default || Anthropic;
  return new AnthropicClass({ apiKey: process.env.ANTHROPIC_API_KEY });
}

// ─── Core Completion ───────────────────────────────────────────────────────────
async function complete(prompt, options = {}) {
  const provider = getActiveProvider();

  if (provider === 'gemini') {
    const primaryModel = process.env.GEMINI_MODEL || 'gemini-1.5-flash';
    try {
      const model = getGeminiClient(primaryModel);
      const result = await model.generateContent(prompt);
      return result.response.text();
    } catch (err) {
      if (err.message?.includes('not found') || err.message?.includes('404')) {
        const fallbackModel = getGeminiClient('gemini-1.5-pro');
        const result = await fallbackModel.generateContent(prompt);
        return result.response.text();
      }
      throw err;
    }
  }

  if (provider === 'anthropic') {
    const client = getAnthropicClient();
    const msg = await client.messages.create({
      model: 'claude-opus-4-5',
      max_tokens: options.maxTokens || 4096,
      messages: [{ role: 'user', content: prompt }],
    });
    return msg.content[0].text;
  }

  throw new Error(`Unknown AI provider: ${provider}`);
}

// ─── Slide Content Generation ──────────────────────────────────────────────────
async function generateSlideContent(deckInput, slideType, existingSlides = []) {
  const prompt = `
You are an expert pitch deck consultant. Generate compelling content for a "${slideType}" slide.

Company Information:
- Company Name: ${deckInput.companyName}
- Industry: ${deckInput.industry}
- Product/Service: ${deckInput.productDescription}
- Target Market: ${deckInput.targetMarket}
- Funding Goal: ${deckInput.fundingGoal}
- Key Achievements: ${deckInput.keyAchievements}
${deckInput.teamMembers ? `- Team: ${deckInput.teamMembers}` : ''}

Slide type: ${slideType}

Return a JSON object with:
{
  "headline": "short powerful headline",
  "subheadline": "supporting line (optional)",
  "bullets": ["point 1", "point 2", "point 3"],
  "body": "optional paragraph text",
  "chartSuggestion": {
    "type": "bar|line|pie|none",
    "title": "chart title",
    "labels": ["label1", "label2"],
    "data": [10, 20]
  },
  "speakerNotes": "notes for presenter"
}

Only return valid JSON, no markdown.`;

  const raw = await complete(prompt);
  try {
    return JSON.parse(raw.replace(/```json|```/g, '').trim());
  } catch {
    return { headline: slideType, bullets: [raw.slice(0, 200)], body: '', speakerNotes: '' };
  }
}

// ─── Brainstorm Multiple Options ───────────────────────────────────────────────
async function brainstormSlides(deckInput) {
  const prompt = `
You are a pitch deck strategist. Based on the following company info, suggest the BEST slide order for a ${deckInput.numSlides || 15}-slide pitch deck.

Company: ${deckInput.companyName}
Industry: ${deckInput.industry}
Product: ${deckInput.productDescription}
Target Market: ${deckInput.targetMarket}
Funding Goal: ${deckInput.fundingGoal}
Achievements: ${deckInput.keyAchievements}

Return a JSON array of slide types from this list:
["title", "problem", "solution", "product_demo", "market_size", "business_model", "traction", "competitive_landscape", "go_to_market", "team", "financials", "funding_ask", "roadmap", "testimonials", "risk_mitigation", "closing"]

Include exactly ${deckInput.numSlides || 15} slides. Always start with "title" and end with "closing" or "funding_ask".
Add "market_size", "competitive_landscape" and "risk_mitigation" if relevant.

Return only a JSON array, no markdown.`;

  const raw = await complete(prompt);
  try {
    return JSON.parse(raw.replace(/```json|```/g, '').trim());
  } catch {
    return ['title','problem','solution','market_size','business_model','traction','competitive_landscape','team','financials','funding_ask','roadmap','closing'].slice(0, deckInput.numSlides || 12);
  }
}

// ─── Refine Text ───────────────────────────────────────────────────────────────
async function refineSlideText(slideContent, style = 'professional') {
  const prompt = `
Refine the following pitch deck slide content to be more persuasive, clear, and investor-ready.
Style: ${style} (options: professional, bold, minimalist, storytelling)

Content: ${JSON.stringify(slideContent)}

Return improved JSON with the same structure. Keep bullets concise (max 10 words each).
Only return valid JSON, no markdown.`;

  const raw = await complete(prompt);
  try {
    return JSON.parse(raw.replace(/```json|```/g, '').trim());
  } catch {
    return slideContent;
  }
}

// ─── Layout Suggestions ────────────────────────────────────────────────────────
async function suggestLayout(slideContent, currentLayout) {
  const wordCount = JSON.stringify(slideContent).length;
  if (wordCount < 300) return { layout: currentLayout, suggestion: '', trimmedBullets: slideContent.bullets };

  const prompt = `
This pitch deck slide has a lot of content. Suggest layout improvements.

Content length: ${wordCount} chars
Current layout: ${currentLayout}
Content preview: ${JSON.stringify(slideContent).slice(0, 500)}

Return a JSON object:
{
  "layout": "two_column|single_column|hero|chart_focus|team_grid",
  "suggestion": "Brief explanation of why",
  "trimmedBullets": ["only keep top 3-4 most impactful bullets"]
}

Only return valid JSON.`;

  const raw = await complete(prompt);
  try {
    return JSON.parse(raw.replace(/```json|```/g, '').trim());
  } catch {
    return { layout: currentLayout, suggestion: '', trimmedBullets: slideContent.bullets };
  }
}

// ─── Status Check ──────────────────────────────────────────────────────────────
function getAIStatus() {
  return {
    activeProvider: (() => { try { return getActiveProvider(); } catch (e) { return 'none'; } })(),
    geminiConfigured: !!process.env.GEMINI_API_KEY,
    anthropicConfigured: !!process.env.ANTHROPIC_API_KEY,
    preference: process.env.AI_PROVIDER || 'auto',
  };
}

module.exports = {
  complete,
  generateSlideContent,
  brainstormSlides,
  refineSlideText,
  suggestLayout,
  getAIStatus,
};
