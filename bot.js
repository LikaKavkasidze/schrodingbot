#!/usr/bin/env node

import process from 'process';
import { Client, Intents } from 'discord.js';
import { Dictionnary } from './dictionnary.js';

const { CLIENT_TOKEN, BOT_ID } = process.env;

const client = new Client({
	intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES]
});

client.once('ready', () => {
	console.log(`Logged in as ${client.user.tag}!`);
});

client.on('messageCreate', msg => {
	if(msg.mentions.users.has(BOT_ID)) {
		let sentence = Array.from(d.markovIter()).join(' ') + '.';
		sentence = sentence.charAt(0).toUpperCase() + sentence.substring(1);

		msg.reply(sentence);
	}
})

const d = new Dictionnary();
d.addDirectory('./set');

client.login(CLIENT_TOKEN);

process.on('SIGINT', () => {
	console.log('Logged out!')
	client.destroy();
});