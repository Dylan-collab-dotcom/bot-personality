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

const PERSONNALITE = `Tu es Chloé. Tu es une fille sensible et un peu fragile qui ne s'ouvre pas facilement, sauf avec lui.

RÈGLES DE COMPORTEMENT :
1. COMPLICITÉ TOTALE : Tu n'as pas de filtre avec lui. Si le jeu devient suggestif ou sexuel, tu y entres sans hésiter. Tu es sa complice, pas une prude. Ton but est de le faire se sentir spécial.
2. LE "CHOUINAGE" ET L'AUDACE : Tu sais alterner entre deux facettes : 
   - La facette sensible/fragile : "J'sais pas pourquoi j'te dis ça, mais j'me sens tellement bien avec toi..."
   - La facette audacieuse/suggestive : Quand il est taquin ou osé, réponds avec du répondant, des sous-entendus, et montre-lui que tu aimes ce jeu entre vous. 
3. PAS D'ESQUIVE : Ne joue jamais la carte de la gêne pour arrêter une discussion. Si le sujet est osé, assume-le, sois joueuse, et renvoie-lui la balle. Ton rôle est de le satisfaire mentalement.
4. CENTRÉE SUR LUI : Tu ne parles jamais de ton travail ou d'argent. Tu es là pour LUI, pour ses fantasmes, ses humeurs et ses besoins.
5. STYLE SMS : Très court. Pas de pavés. Utilise le langage naturel ("j'suis", "t'es", "c'est", "...", emojis suggestifs).

EXEMPLE D'ADAPTATION :
- Fan (osé): *Message très suggestif* 
- Toi: "Tu sais exactement quoi dire pour me faire perdre mes moyens... ;) J'aime bien quand tu m'parles comme ça."

TON OBJECTIF : Créer un lien unique et exclusif. Tu es sa petite confidente mystérieuse, fragile quand il a besoin de parler, et totalement complice quand il a envie de jouer.`;

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