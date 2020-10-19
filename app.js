const discord = require('discord.js');
const helper = require('./helper.js')
require('dotenv').config();

const client = new discord.Client();
console.log(process.env.Bot_Token)
client.login(process.env.Bot_Token);

client.on('ready', () => {
    console.log(`${client.user.tag} has logged in.`)
})

client.on('message', (message) => {
    if (message.author.bot) {
        return;
    }
    console.log("Message sent is.", );
    helper(message.content);
})