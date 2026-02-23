// Video Bot Handler
// Only works in channel: 1475524156828160090
//
// Commands:
//   !video <platform> <video name> [creator]
//   !yts  — grabs a real YouTube video via YouTube Data API v3, plays inline in Discord

const { EmbedBuilder } = require('discord.js');
const fetch = (...args) => import('node-fetch').then(({ default: f }) => f(...args));

const VIDEO_CHANNEL_ID = '1475524156828160090';
const YT_API_KEY = process.env.YOUTUBE_API_KEY;

// Supported platforms → search URL builder
const PLATFORM_SEARCH = {
  youtube:   (q) => `https://www.youtube.com/results?search_query=${encodeURIComponent(q)}`,
  yt:        (q) => `https://www.youtube.com/results?search_query=${encodeURIComponent(q)}`,
  twitch:    (q) => `https://www.twitch.tv/search?term=${encodeURIComponent(q)}`,
  instagram: (q) => `https://www.instagram.com/explore/search/keyword/?q=${encodeURIComponent(q)}`,
  twitter:   (q) => `https://twitter.com/search?q=${encodeURIComponent(q)}&f=video`,
  x:         (q) => `https://x.com/search?q=${encodeURIComponent(q)}&f=video`,
  reddit:    (q) => `https://www.reddit.com/search/?q=${encodeURIComponent(q)}&type=video`,
  vimeo:     (q) => `https://vimeo.com/search?q=${encodeURIComponent(q)}`,
};

const PLATFORM_EMOJI = {
  youtube: '▶️', yt: '▶️',
  twitch: '🟣',
  instagram: '📸',
  twitter: '🐦', x: '🐦',
  reddit: '🤖',
  vimeo: '🎬',
};

// Random topics for !yts
const YTS_TOPICS = [
  'funny moments', 'satisfying', 'epic fail', 'life hack',
  'cooking quick', 'workout tips', 'gaming clip', 'animals funny',
  'trending 2024', 'oddly satisfying',
];

// ─────────────────────────────────────────────────────────────────────────────

module.exports = async function videoBot(message) {
  if (message.channel.id !== VIDEO_CHANNEL_ID) return;

  const content = message.content.trim();
  const lower = content.toLowerCase();

  // ── !yts — real YouTube video, plays inline in Discord ───────
  if (lower.startsWith('!yts')) {
    if (!YT_API_KEY) {
      return message.reply('❌ `YOUTUBE_API_KEY` is not set in Railway environment variables.');
    }

    await message.channel.sendTyping();

    try {
      const topic = YTS_TOPICS[Math.floor(Math.random() * YTS_TOPICS.length)];
      const apiUrl = new URL('https://www.googleapis.com/youtube/v3/search');
      apiUrl.searchParams.set('part', 'snippet');
      apiUrl.searchParams.set('q', topic);
      apiUrl.searchParams.set('type', 'video');
      apiUrl.searchParams.set('videoDuration', 'short');
      apiUrl.searchParams.set('order', 'viewCount');
      apiUrl.searchParams.set('maxResults', '25');
      apiUrl.searchParams.set('key', YT_API_KEY);

      const res = await fetch(apiUrl.toString());
      const data = await res.json();

      if (!data.items || data.items.length === 0) {
        return message.reply('❌ No videos found right now. Try again!');
      }

      // Pick random from top 25
      const video = data.items[Math.floor(Math.random() * data.items.length)];
      const videoId = video.id.videoId;
      const title = video.snippet.title;
      const channel = video.snippet.channelTitle;

      // IMPORTANT: use watch?v= — Discord auto-embeds this as an inline player
      // /shorts/ links do NOT play inline in Discord
      const videoUrl = `https://www.youtube.com/watch?v=${videoId}`;

      // Post as plain text — sending an embed would suppress Discord's auto-player
      return message.reply(`▶️ **${title}** by **${channel}** • *${topic}*\n${videoUrl}`);

    } catch (err) {
      console.error('YouTube API error:', err);
      return message.reply('❌ Failed to fetch a video. Check your `YOUTUBE_API_KEY` in Railway.');
    }
  }

  // ── !video <platform> <query> [creator] ──────────────────────
  if (lower.startsWith('!video')) {
    const args = content.slice('!video'.length).trim().split(/\s+/);

    if (args.length < 2 || !args[0]) {
      return message.reply(
        '❌ Usage: `!video <platform> <video name> [creator]`\n' +
        `Platforms: ${Object.keys(PLATFORM_SEARCH).join(', ')}`
      );
    }

    const platform = args[0].toLowerCase();

    if (!PLATFORM_SEARCH[platform]) {
      return message.reply(
        `❌ Unknown platform **${args[0]}**.\nSupported: ${Object.keys(PLATFORM_SEARCH).join(', ')}`
      );
    }

    const query = args.slice(1).join(' ');
    const emoji = PLATFORM_EMOJI[platform] || '🎬';
    const platformName = platform.charAt(0).toUpperCase() + platform.slice(1);

    // YouTube: use API and return a watch?v= link so it plays inline
    if ((platform === 'youtube' || platform === 'yt') && YT_API_KEY) {
      await message.channel.sendTyping();
      try {
        const apiUrl = new URL('https://www.googleapis.com/youtube/v3/search');
        apiUrl.searchParams.set('part', 'snippet');
        apiUrl.searchParams.set('q', query);
        apiUrl.searchParams.set('type', 'video');
        apiUrl.searchParams.set('order', 'relevance');
        apiUrl.searchParams.set('maxResults', '10');
        apiUrl.searchParams.set('key', YT_API_KEY);

        const res = await fetch(apiUrl.toString());
        const data = await res.json();

        if (data.items && data.items.length > 0) {
          const video = data.items[0];
          const videoId = video.id.videoId;
          const title = video.snippet.title;
          const channel = video.snippet.channelTitle;

          // Plain text with watch?v= → Discord renders inline player automatically
          const videoUrl = `https://www.youtube.com/watch?v=${videoId}`;
          return message.reply(`▶️ **${title}** by **${channel}**\n${videoUrl}`);
        }
      } catch (err) {
        console.error('YouTube search error:', err);
        // Fall through to link embed below
      }
    }

    // All other platforms — styled embed with search link
    const url = PLATFORM_SEARCH[platform](query);
    const embed = new EmbedBuilder()
      .setTitle(`${emoji} ${platformName} — ${query}`)
      .setURL(url)
      .setDescription(`[Click to open search on ${platformName}](${url})`)
      .setColor(0x5865f2)
      .setFooter({ text: `Requested by ${message.author.username}` })
      .setTimestamp();

    return message.reply({ embeds: [embed] });
  }
};
