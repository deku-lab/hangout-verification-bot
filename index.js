const http = require("http");

const PORT = process.env.PORT || 3000;

http.createServer((req, res) => {
    res.writeHead(200);
    res.end("The Hangout Spot Bot is online!");
}).listen(PORT, () => {
    console.log(`Web server running on port ${PORT}`);
});
const {
    Client,
    GatewayIntentBits,
    EmbedBuilder
} = require("discord.js");

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildMessageReactions,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ]
});

const CHANNEL_ID = "1555123526590136410";
const ROLE_ID = "1552816091020009562";

const LOGO_URL = "https://cdn.discordapp.com/attachments/1191118980535029882/1554943008481222696/file_000000008c688211af23ccb02d40546e.png?backend=b2&ex=6ac00a86&is=6abeb906&hm=7df79104f52e23aff2be02c45757b940807aa667be64a01c196d9bebc04644e9&";

const TOKEN = process.env.TOKEN;

client.once("ready", async () => {
    console.log(`Bot is online as ${client.user.tag}`);

    try {
        const channel = await client.channels.fetch(CHANNEL_ID);

        const messages = await channel.messages.fetch({ limit: 50 });

        const existingMessage = messages.find(
            msg =>
                msg.author.id === client.user.id &&
                msg.embeds.length > 0 &&
                msg.embeds[0].title === "🔐 Server Verification"
        );

        if (existingMessage) {
            console.log("Verification message already exists.");
            return;
        }

        const embed = new EmbedBuilder()
            .setTitle("🔐 Server Verification")
            .setDescription(
                "Welcome to **The Hangout Spot!**\n\n" +
                "Please react with **✅** below to verify yourself and access the server.\n\n" +
                "Once verified, you will receive the **Verified** role."
            )
            .setThumbnail(LOGO_URL);

        const message = await channel.send({
            embeds: [embed]
        });

        await message.react("✅");

        console.log("Verification message sent successfully!");

    } catch (error) {
        console.error("Verification setup error:", error);
    }
});

client.on("messageReactionAdd", async (reaction, user) => {
    try {
        if (user.bot) return;
        if (reaction.emoji.name !== "✅") return;
        if (reaction.message.channel.id !== CHANNEL_ID) return;

        const guild = reaction.message.guild;
        if (!guild) return;

        const member = await guild.members.fetch(user.id);
        const role = guild.roles.cache.get(ROLE_ID);

        if (!role) {
            console.log("Verified role not found!");
            return;
        }

        if (!member.roles.cache.has(ROLE_ID)) {
            await member.roles.add(role);
            console.log(`${user.tag} has been verified!`);
        }
    } catch (error) {
        console.error("Verification error:", error);
    }
});

client.on("messageCreate", async (message) => {
    if (message.author.bot) return;
    if (!message.content.startsWith(".send ")) return;

    const text = message.content.slice(6).trim();
    if (!text) return;

    // await message.delete();
    await message.channel.send(text);
});
client.on("guildMemberAdd", async (member) => {
    try {
        const channel = await member.guild.channels.fetch("1552826169374679161");

        if (!channel) return;

        const embed = new EmbedBuilder()
            .setDescription(
                `🏠 **NEW PERSON JUST PULLED UP!**\n\n` +
                `Welcome **${member}** to **The Hangout Spot**!\n\n` +
                `Grab a seat, join the conversation and enjoy the vibes.\n\n` +
                `**Glad to have you here.** 🤍`
            )
            .setColor(0xFFFFFF)
            .setThumbnail(
                member.user.displayAvatarURL({ dynamic: true })
            )
            .setImage("https://cdn.discordapp.com/attachments/862414113376174081/1555466190447448064/bb641d7a-3725-4d5d-8f84-b9a6055e31c8.gif?backend=b2&ex=6ac0a046&is=6abf4ec6&hm=4d5cb16f66e03b68e172aa6b37a4f29e0cdeceb32dbe51929acc19ed79812559&");

        await channel.send({
            embeds: [embed]
        });

    } catch (error) {
        console.error("Welcome message error:", error);
    }
});

client.login(TOKEN);
