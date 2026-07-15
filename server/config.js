// Single spot to change the default mentor-chat model.
const DEFAULT_MODEL = "claude-haiku-4-5-20251001";

// Models selectable from the RULES tab model picker.
const ALLOWED_MODELS = [
  { id: "claude-haiku-4-5-20251001", label: "Claude Haiku 4.5 (fast, cheap)" },
  { id: "claude-sonnet-5", label: "Claude Sonnet 5" },
  { id: "claude-opus-4-8", label: "Claude Opus 4.8" },
  { id: "claude-fable-5", label: "Claude Fable 5" },
];

module.exports = {
  DEFAULT_MODEL,
  ALLOWED_MODELS,
  ALLOWED_MODEL_IDS: ALLOWED_MODELS.map((m) => m.id),
};
