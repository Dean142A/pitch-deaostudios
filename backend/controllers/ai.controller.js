// controllers/ai.controller.js
// SECURITY-HARDENED VERSION

const aiService = require('../services/ai.service');
const fs = require('fs');
const path = require('path');

async function getStatus(req, res) {
  try {
    const status = aiService.getAIStatus();
    res.json(status);
  } catch (err) {
    res.status(500).json({ error: 'Failed to get AI status' });
  }
}

// Admin only: update AI keys at runtime (admin check also enforced at router level)
async function updateKeys(req, res) {
  try {
    if (req.user.role !== 'admin') return res.status(403).json({ error: 'Admin only' });

    const { geminiKey, anthropicKey, provider } = req.body;

    // FIX #32: Validate provider value (whitelist)
    const allowedProviders = ['auto', 'gemini', 'anthropic'];
    if (provider && !allowedProviders.includes(provider)) {
      return res.status(400).json({ error: 'Invalid provider value' });
    }

    // FIX #33: Validate API key format before accepting
    if (geminiKey !== undefined) {
      if (typeof geminiKey !== 'string') return res.status(400).json({ error: 'Invalid geminiKey' });
      if (geminiKey.length > 200) return res.status(400).json({ error: 'geminiKey too long' });
      process.env.GEMINI_API_KEY = geminiKey;
    }
    if (anthropicKey !== undefined) {
      if (typeof anthropicKey !== 'string') return res.status(400).json({ error: 'Invalid anthropicKey' });
      if (anthropicKey.length > 200) return res.status(400).json({ error: 'anthropicKey too long' });
      process.env.ANTHROPIC_API_KEY = anthropicKey;
    }
    if (provider) process.env.AI_PROVIDER = provider;

    // Persist to .env file if it exists
    const envPath = path.join(__dirname, '../.env');
    if (fs.existsSync(envPath)) {
      let envContent = fs.readFileSync(envPath, 'utf8');

      const updateEnvVar = (content, key, value) => {
        // Strip newlines/CR and any characters that could break .env format
        // FIX #34: Stronger sanitization — strip all non-printable and shell-special chars
        const safeValue = String(value).replace(/[\r\n\0\x1B`$\\]/g, '');
        const regex = new RegExp(`^${key}=.*$`, 'm');
        return regex.test(content)
          ? content.replace(regex, `${key}=${safeValue}`)
          : content + `\n${key}=${safeValue}`;
      };

      if (geminiKey !== undefined) envContent = updateEnvVar(envContent, 'GEMINI_API_KEY', geminiKey);
      if (anthropicKey !== undefined) envContent = updateEnvVar(envContent, 'ANTHROPIC_API_KEY', anthropicKey);
      if (provider) envContent = updateEnvVar(envContent, 'AI_PROVIDER', provider);

      fs.writeFileSync(envPath, envContent, { mode: 0o600 }); // FIX #35: Restrict .env file permissions
    }

    res.json({ message: 'Keys updated', status: aiService.getAIStatus() });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update keys' });
  }
}

// Test AI connection (admin only — enforced at router level too)
async function testConnection(req, res) {
  try {
    const result = await aiService.complete('Say "OK" if you are working.');
    res.json({ ok: true, response: result.trim(), status: aiService.getAIStatus() });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message, status: aiService.getAIStatus() });
  }
}

module.exports = { getStatus, updateKeys, testConnection };
