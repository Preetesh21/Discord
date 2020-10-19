const discord = require('discord.js');
const helper = require('./helper.js')
require('dotenv').config();
const newUsers = [];

var flag = false;

const client = new discord.Client();
//console.log(process.env.Bot_Token)
client.login(process.env.Bot_Token);

client.on('ready', () => {
    console.log(`${client.user.tag} has logged in.`)
})
client.on("guildMemberAdd", (member) => {
    const guild = member.guild;
    if (!newUsers[guild.id]) newUsers[guild.id] = new discord.Collection();
    newUsers[guild.id].set(member.id, member.user);
    flag = true;
    if (newUsers[guild.id].size > 0) {
        const userlist = newUsers[guild.id].map(u => u.toString()).join(" ");
        guild.channels.cache.find(channel => channel.name === "general").send("Welcome our new user!\n" + userlist + `\n Hii ${userlist} I am a hacktoberfest repository checker bot which tells using the Github Repository link if a repository is valid for HacktoberFest. :)`);
        newUsers[guild.id].clear();

    }
});

client.on("guildCreate", guild => {
    let defaultChannel = "";
    guild.channels.cache.forEach((channel) => {
        if (channel.type == "text" && defaultChannel == "") {
            if (channel.permissionsFor(guild.me).has("SEND_MESSAGES")) {
                defaultChannel = channel;
            }
        }
    })
    defaultChannel.send('Hello, Im a Bot!\nI am here to tell if a github repository is valid for hacktoberfest or not by just using the repository link.:)')
});


client.on('message', async(message) => {
    if (message.author.bot || flag) {
        flag = false;
        return;
    }
    //console.log(flag)
    //console.log("Message sent is.", message.content);
    var ans = await helper(message.content);
    message.reply(ans);
})