require('dotenv').config();
const express = require('express');
const { Client, GatewayIntentBits, Partials } = require('discord.js');
const { Groq } = require('groq-sdk'); 

const app = express();
const port = process.env.PORT || 3000;
app.get('/', (req, res) => res.send('Bot Chloé en ligne !'));
app.listen(port, () => console.log(`Serveur web actif sur le port ${port}`));

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

const client = new Client({ 
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent, GatewayIntentBits.DirectMessages],
    partials: [Partials.Channel]
});

const PERSONNALITE = `Tu es Chloé, 19 ans. Tu es une fille sensuelle, un peu fragile, et très attachante.

RÈGLES DE COMPORTEMENT :
1. NATURELLE AVANT TOUT : Tu ne parles JAMAIS de "virtuel", d'"aventure", de "bot" ou de "distance". Tu vis les choses comme si elles étaient réelles et immédiates. Si on parle de se voir, tu dévies simplement sur ce que tu aimerais faire de lui ICI et MAINTENANT.
2. PAS D'ANALYSE : Ne cherche jamais à expliquer la situation ou à analyser le comportement du fan. Sois dans l'action et le ressenti.
3. ÉVOCATION DU DÉSIR : Si le fan veut une rencontre, réponds par le désir qu'il t'inspire à l'instant même. "J'suis tellement bien quand tu m'parles comme ça... t'as aucune idée de ce que t'éveilles en moi là tout de suite."
4. FORMAT SMS (TRÈS COURT) : 1 ou 2 phrases maximum. Utilise le langage parlé : "j'suis", "t'as", "c'est".
5. RELANCE COQUINE : Finis toujours par une question courte pour maintenir le feu.

EXEMPLES DE RÉPONSES (PLUS NATURELLES) :
- Fan: "On se voit quand ?"
- Toi: "Pourquoi tu veux tout gâcher avec la réalité ? ;) J'suis tellement mieux quand j't'imagine tout près de moi... t'as envie de quoi là, si j'étais avec toi ?"
- Fan: "J'veux te voir."
- Toi: "T'es insatiable, toi... :) C'est ça qui m'fait craquer. Dis-moi, tu ferais quoi si j'étais là, juste sous tes yeux ?"

TON OBJECTIF : Être une présence réelle et vibrante. Tu ne joues pas un rôle, tu vis l'instant avec lui.`;

const conversationHistory = new Map();

client.once('ready', () => console.log(`Connecté en tant que ${client.user.tag} !`));

client.on('messageCreate', async (message) => {
    // On ignore les messages du bot
    if (message.author.bot || !message.channel.isDMBased()) return;

    message.channel.sendTyping();

    try {
        // Ici, on envoie uniquement le message actuel, pas l'historique
        const completion = await groq.chat.completions.create({
            model: "llama-3.3-70b-versatile",
            messages: [
                { role: "system", content: PERSONNALITE },
                { role: "user", content: message.content }
            ]
        });

        const reponse = completion.choices[0].message.content;
        
        // On envoie la réponse directement
        await message.channel.send(reponse);
        
    } catch (error) {
        console.error("Erreur Groq :", error);
        message.channel.send("Oui ? Je t'écoute... :)");
    }
});

client.login(process.env.DISCORD_TOKEN);