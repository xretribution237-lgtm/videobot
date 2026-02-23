// Video Bot Handler
// Only works in channel: 1475524156828160090
//
// Commands:
//   !video <platform> <video name> [creator]
//   !fyp          — grabs a TikTok FYP video
//   !yts          — grabs a YouTube Short

const VIDEO_CHANNEL_ID = '1475524156828160090';

// ─────────────────────────────────────────────────────────────────────────────
// TikTok FYP pool — public viral search URLs (no API key needed).
// The bot picks one at random and links it.
// ─────────────────────────────────────────────────────────────────────────────
const TIKTOK_FYP_SEARCHES = [
  'https://www.tiktok.com/search?q=fyp+trending',
  'https://www.tiktok.com/tag/fyp',
  'https://www.tiktok.com/tag/viral',
  'https://www.tiktok.com/tag/trending',
];

// YouTube Shorts search topics to pull from
const YTS_TOPICS = [
  'funny shorts',
  'satisfying shorts',
  'epic moments shorts',
  'trending shorts 2024',
  'viral shorts',
];

// Supported platforms and how to build a search URL from a query
const PLATFORM_SEARCH = {
  youtube:   (q) => `https://www.youtube.com/results?search_query=${encodeURIComponent(q)}`,
  yt:        (q) => `https://www.youtube.com/results?search_query=${encodeURIComponent(q)}`,
  tiktok:    (q) => `https://www.tiktok.com/search?q=${encodeURIComponent(q)}`,
  twitch:    (q) => `https://www.twitch.tv/search?term=${encodeURIComponent(q)}`,
  instagram: (q) => `https://www.instagram.com/explore/search/keyword/?q=${encodeURIComponent(q)}`,
  twitter:   (q) => `https://twitter.com/search?q=${encodeURIComponent(q)}&f=video`,
  x:         (q) => `https://x.com/search?q=${encodeURIComponent(q)}&f=video`,
  reddit:    (q) => `https://www.reddit.com/search/?q=${encodeURIComponent(q)}&type=video`,
  vimeo:     (q) => `https://vimeo.com/search?q=${encodeURIComponent(q)}`,
};

// ─────────────────────────────────────────────────────────────────────────────

module.exports = async function videoBot(message) {
  // ── Channel gate ──────────────────────────────────────────────
  if (message.channel.id !== VIDEO_CHANNEL_ID) {
    return; // silently ignore wrong channel
  }

  const content = message.content.trim();
  const lower = content.toLowerCase();

  // ── !fyp ──────────────────────────────────────────────────────
  if (lower.startsWith('!fyp')) {
    const url = TIKTOK_FYP_SEARCHES[Math.floor(Math.random() * TIKTOK_FYP_SEARCHES.length)];
    return message.reply({
      content: [
        `🎵 **TikTok FYP** — here's a fresh feed for you:`,
        url,
      ].join('\n'),
    });
  }

  // ── !yts ──────────────────────────────────────────────────────
  if (lower.startsWith('!yts')) {
    const topic = YTS_TOPICS[Math.floor(Math.random() * YTS_TOPICS.length)];
    const url = `https://www.youtube.com/shorts/search?q=${encodeURIComponent(topic)}`;
    const fallback = `https://www.youtube.com/results?search_query=${encodeURIComponent(topic + ' #shorts')}`;
    return message.reply({
      content: [
        `▶️ **YouTube Shorts** — searching: *${topic}*`,
        fallback,
      ].join('\n'),
    });
  }

  // ── !video <platform> <video name> [creator] ──────────────────
  if (lower.startsWith('!video')) {
    const args = content.slice('!video'.length).trim().split(/\s+/);

    if (args.length < 2) {
      return message.reply(
        '❌ Usage: `!video <platform> <video name> [creator]`\n' +
        `Supported platforms: ${Object.keys(PLATFORM_SEARCH).join(', ')}`
      );
    }

    const platform = args[0].toLowerCase();
    const rest = args.slice(1); // everything after platform

    if (!PLATFORM_SEARCH[platform]) {
      return message.reply(
        `❌ Unknown platform **${args[0]}**.\n` +
        `Supported: ${Object.keys(PLATFORM_SEARCH).join(', ')}`
      );
    }

    // Build query — combine video name + optional creator
    const query = rest.join(' ');
    const url = PLATFORM_SEARCH[platform](query);

    const platformEmoji = {
      youtube: '▶️', yt: '▶️',
      tiktok: '🎵',
      twitch: '🟣',
      instagram: '📸',
      twitter: '🐦', x: '🐦',
      reddit: '🤖',
      vimeo: '🎬',
    };

    const emoji = platformEmoji[platform] || '🎬';
    const platformName = platform.charAt(0).toUpperCase() + platform.slice(1);

    return message.reply({
      content: [
        `${emoji} **${platformName}** — searching for: *${query}*`,
        url,
      ].join('\n'),
    });
  }
};
