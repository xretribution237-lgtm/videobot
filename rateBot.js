// Rate Bot Handler
// Only works in channel: 1475524445173977118
// Usage: !rate <thing> OR !rate <thing> 1-10

const RATE_CHANNEL_ID = '1475524445173977118';

module.exports = async function rateBot(message) {
  // ── Channel gate ──────────────────────────────────────────────
  if (message.channel.id !== RATE_CHANNEL_ID) {
    return; // silently ignore in wrong channels
  }

  // ── Attachment check ──────────────────────────────────────────
  if (message.attachments.size === 0) {
    return message.reply('no attachment connected. Try again!');
  }

  // ── Parse command ─────────────────────────────────────────────
  // e.g. "!rate my setup" or "!rate my setup 1-10"
  const args = message.content.slice('!rate'.length).trim();

  if (!args) {
    return message.reply('Usage: `!rate <thing>` — tell me what to rate!');
  }

  // Check if they requested a specific scale like "1-10"
  const scaleMatch = args.match(/(\d+)-(\d+)$/);
  let subject = args;
  let min = 1;
  let max = 10;

  if (scaleMatch) {
    min = parseInt(scaleMatch[1]);
    max = parseInt(scaleMatch[2]);
    subject = args.slice(0, args.lastIndexOf(scaleMatch[0])).trim();
  }

  // Clamp to sane range
  if (min < 0) min = 0;
  if (max > 100) max = 100;
  if (min >= max) { min = 1; max = 10; }

  // ── Generate rating ───────────────────────────────────────────
  const rating = Math.floor(Math.random() * (max - min + 1)) + min;
  const ratingBar = buildRatingBar(rating, max);
  const verdict = getVerdict(rating, max);

  const attachment = message.attachments.first();
  const subjectDisplay = subject || 'this';

  await message.reply({
    content: [
      `## Rating: **${subjectDisplay}**`,
      ``,
      `${ratingBar}`,
      `> **${rating} / ${max}** — ${verdict}`,
    ].join('\n'),
  });
};

// ── Helpers ───────────────────────────────────────────────────────

function buildRatingBar(rating, max) {
  const filled = Math.round((rating / max) * 10);
  const empty = 10 - filled;
  return '🟩'.repeat(filled) + '⬛'.repeat(empty);
}

function getVerdict(rating, max) {
  const pct = rating / max;
  if (pct >= 0.9) return 'Absolutely goated 🔥';
  if (pct >= 0.75) return 'Pretty solid ngl 👍';
  if (pct >= 0.6) return 'Not bad, could be worse';
  if (pct >= 0.4) return 'Mid. Just mid. 😐';
  if (pct >= 0.25) return 'Yikes... 💀';
  return 'Bro what is this 💀💀';
}
