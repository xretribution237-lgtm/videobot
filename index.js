require('dotenv').config();
const { Client, GatewayIntentBits, Partials } = require('discord.js');
const rateBot = require('./handlers/rateBot');
const videoBot = require('./handlers/videoBot');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
  partials: [Partials.Message, Partials.Channel],
});

client.once('ready', () => {
  console.log(`✅ Logged in as ${client.user.tag}`);
});

client.on('messageCreate', async (message) => {
  if (message.author.bot) return;
  const content = message.content.trim();
  const lower = content.toLowerCase();

  // Rate Bot
  if (lower.startsWith('!rate')) {
    await rateBot(message);
    return;
  }

  // Video Bot
  if (lower.startsWith('!video') || lower.startsWith('!yts')) {
    await videoBot(message);
    return;
  }
});

client.login(process.env.DISCORD_TOKEN);
