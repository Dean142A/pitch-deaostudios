// backend/controllers/template.controller.js
const templateService = require('../services/template.service');

function listTemplates(req, res) {
  try {
    const templates = templateService.listTemplates();
    res.json(templates);
  } catch (err) {
    console.error('[templateController.listTemplates]', err);
    res.status(500).json({ error: 'Failed to fetch templates' });
  }
}

function getTemplate(req, res) {
  try {
    const template = templateService.getTemplateById(req.params.templateId);
    if (!template) {
      return res.status(404).json({ error: 'Template not found' });
    }
    res.json(template);
  } catch (err) {
    console.error('[templateController.getTemplate]', err);
    res.status(500).json({ error: 'Failed to fetch template details' });
  }
}

async function useTemplate(req, res) {
  try {
    const { templateId } = req.params;
    const customInput = req.body || {};

    const result = await templateService.useTemplate(req.user.userId, templateId, customInput);
    res.status(201).json(result);
  } catch (err) {
    console.error('[templateController.useTemplate]', err);
    res.status(500).json({ error: err.message || 'Failed to create deck from template' });
  }
}

module.exports = {
  listTemplates,
  getTemplate,
  useTemplate,
};
