// Rate Bot Handler
// Only works in channel: 1475524445173977118
// Usage: !rate <thing>

const { EmbedBuilder } = require('discord.js');

const RATE_CHANNEL_ID = '1475524445173977118';

module.exports = async function rateBot(message) {
  // ── Channel gate ──────────────────────────────────────────────
  if (message.channel.id !== RATE_CHANNEL_ID) return;

  // ── Attachment check ──────────────────────────────────────────
  if (message.attachments.size === 0) {
    return message.reply('no attachment connected. Try again!');
  }

  // ── Parse subject ─────────────────────────────────────────────
  const subject = message.content.slice('!rate'.length).trim() || 'this';

  // ── Generate rating ───────────────────────────────────────────
  const rating = Math.floor(Math.random() * 10) + 1; // 1–10
  const bar = buildRatingBar(rating);
  const verdict = getVerdict(rating);
  const color = getRatingColor(rating);

  // Use the attached image in the embed
  const attachment = message.attachments.first();

  const embed = new EmbedBuilder()
    .setTitle(`Rating: ${subject}`)
    .setDescription(`${bar}\n**${rating} / 10** — ${verdict}`)
    .setImage(attachment.url)
    .setColor(color)
    .setFooter({ text: `Rated by ${message.author.username}`, iconURL: message.author.displayAvatarURL() })
    .setTimestamp();

  await message.reply({ embeds: [embed] });
};

// ── Helpers ───────────────────────────────────────────────────────

function buildRatingBar(rating) {
  const filled = rating;
  const empty = 10 - filled;
  return '🟩'.repeat(filled) + '⬛'.repeat(empty);
}

function getVerdict(rating) {
  if (rating === 10) return 'Absolutely goated 🔥';
  if (rating >= 8)  return 'Pretty solid ngl 👍';
  if (rating >= 6)  return 'Not bad, could be worse';
  if (rating >= 4)  return 'Mid. Just mid. 😐';
  if (rating >= 2)  return 'Yikes... 💀';
  return 'Bro what is this 💀💀';
}

function getRatingColor(rating) {
  if (rating >= 8) return 0x2ecc71;  // green
  if (rating >= 5) return 0xf39c12;  // orange
  return 0xe74c3c;                    // red
}
