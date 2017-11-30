const discord = require('discord.js')
const config = require('./config.json')
const profanities = require("./profanities.json")
const bot = new discord.Client()
const prefix = process.env.prefix
const {baselogger} = require('./logger.js');
var filteron = "true"

// Gather commands
bot.commands = new discord.Collection();

require('fs').readdir("./commands/", (err, files) => {
  console.log("Loading commands...")
  if (err) return console.log(`Command loading failed!`);
  files.filter(f => f.split(".").pop() === "js").forEach((f, i) => {
    bot.commands.set(require(`./commands/${f}`).help.name, require(`./commands/${f}`));
  })
})

bot.on("ready", () => {
  console.log("Bot is started. Get ready for some sweet commands!")
  console.log("Bot name: " + bot.user.username + "bot")
  console.log("Bot owner: " + config.owner)
  console.log("Bot Dev 1: " + config.owner)
  console.log("Bot Dev 2: " + config.dev2)
  console.log("Bot Dev 3: " + config.dev3)
  console.log(`~ ${bot.guilds.array().length} Guilds ${bot.channels.array().length} Channels ${bot.users.array().length} Users\n`)
  console.log(`Hulkbot Version ${config.version} Loaded!`)
  bot.user.setGame("h!help | Hulkbot Version " + config.version + " Loaded!")
  console.log(`Number of shards: ${bot.shardCount}`)
  console.log(`Bot ID: ${bot.id}`)
  bot.user.setAvatar('https://imgur.com/b0Sh52h')

  bot.guilds.forEach(async (guild, id) => {
    console.log(`[SERVER] [#${guild.memberCount}] ${guild.name}, ${guild.id} | Joined: ${guild.joinedAt.toString()}`)
  });
  let status = ["Taking over the world", "Pizza is better", "Serving my owner", "You wouldn't like me when I'm angry."]
  // Status Rotator
  gameval = 0
  setInterval(() => {
    if (gameval == status.length) {
      gameval = 0
    }
    var game = status[gameval]
    bot.user.setGame(`h!help | bot.hulkbot.ml | ${bot.guilds.array().length} servers | ${game}`)
    gameval++
  }, 25000) // One min
});

bot.on("message", message => {
  if (filteron == "true") {
    for (x = 0; x < profanities.length; x++) {
      if (message.cleanContent.toLowerCase().includes(profanities[x].toLowerCase())) {
        console.log(`[Profanity] ${message.author.username}, said ${profanities[x]} in the ${message.channel.name} channel!`)
        message.channel.send(`<@${message.author.id}>, LANGUAGE!`).then(m => m.delete(10000))
        message.delete(500)
        return;
      };
    }
  };
  if (message.channel.type === "dm") {
    if (message.cleanContent.toLowerCase() == "cleardm") {
      message.channel.fetchMessages({
        limit: 100
      }).then(m => {
        m.forEach(async (msg) => {
          if (msg.author.id == bot.user.id) {
            msg.delete()
          };
        });
      });
    };
  };
  if (!message.content.startsWith(prefix)) return;

  let mArray = message.content.split(" ");
  let args = mArray.slice(1);

  let cmd = bot.commands.get(mArray[0].slice(prefix.length));
  if (message.author.bot) return;

  if (cmd) {
    cmd.run(bot, message, args);
    console.log(message.author.username + " used the " + message.content.split(" ")[0] + " command.");
    baselogger(bot, `**Command Run**\n\n**Command:** ${message.content.split(" ")[0]}\n**User:** ${message.author.tag}\n**Message:** ${message.content}\n**Guild:** ${message.guild.name}\n**Channel:** ${message.channel.name}`)
  }
})

bot.on("message", (message) => {
  if (message.content.startsWith(prefix + "kick")) {
    // Easy way to get member object though mentions.
    var member = message.mentions.members.first();
    // Kick
    member.kick().then((member) => {
      // Successmessage
      message.channel.send(":wave: " + member.displayName + " has been successfully kicked :point_right: ");
    }).catch(() => {
      // Failmessage
      message.channel.send("I can't kick without permissions, noob!");
    });
  }
  if (message.content.startsWith(prefix + "ban")) {
    if (message.member.hasPermission("BAN_MEMBERS"))
      // Easy way to get member object though mentions.
      var member = message.mentions.members.first();
    // Kick
    member.ban().then((member) => {
      // Successmessage
      message.channel.send(":wave: " + member.displayName + " has been successfully banned! :point_right: ");
    }).catch(() => {
      // Failmessage
      message.channel.send("I can't ban without permissions, noob!");
    });
  }
  if (message.content == prefix + "filteroff") {
    // Prevents Unauthorized Users from accessing filters
    if (message.member.hasPermission("MANAGE_GUILD")) {
      filteron = "false"
      message.channel.send("Okay, I turned my filters off!");
      console.log(message.author.username + " turned the filters to = " + filteron);
    } else {
      return message.channel.send("Sorry, you don't have the required permissions!");
    }
  }
  if (message.content == prefix + "filteron") {
    // Prevents Unauthorized Users from accessing filters
    if (message.member.hasPermission("MANAGE_GUILD")) {
      filteron = "true"
      message.channel.send("Okay, I turned my filters back on!");
      console.log(message.author.username + " turned the filters to = " + filteron);
    } else {
      return message.channel.send(message.author.username + ", sorry, but you don't have the required permissions.");
    }
  }
});

bot.on("guildCreate", (guild) => {
  baselogger(bot, `**Guild Join**\n\n**Guild:** ${guild.name}\n**Owner:** ${guild.owner.user.tag}\n**Large:** ${guild.large}\n**Member Count:** ${guild.memberCount}\n\n**Total Guilds:** ${bot.guilds.array().length}`, guild.iconURL)
});

bot.on("guildDelete", (guild) => {
  baselogger(bot, `**Guild Leave**\n\n**Guild:** ${guild.name}\n**Owner:** ${guild.owner.user.tag}\n**Large:** ${guild.large}\n**Member Count:** ${guild.memberCount}\n\n**Total Guilds:** ${bot.guilds.array().length}`, guild.iconURL)
});




bot.login(process.env.botToken);
