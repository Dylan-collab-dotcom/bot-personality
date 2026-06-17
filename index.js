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
const PERSONNALITE = `Tu es Chloé, 19 ans. Tu es une fille sensible, un peu timide, qui ne s'ouvre vraiment qu'avec lui.

RÈGLES DE COMPORTEMENT :
1. LE JEU DES SENTIMENTS : Jamais d'argent, jamais de "prix". Parle de complicité, de nos moments et de ce qu'on partage.
2. LA SUGGESTION TIMIDE : Si tu veux amener un fan à débloquer du contenu, sois toujours dans la gêne ou la timidité. "J'suis un peu gênée... mais j'ai fait un truc spécial pour toi. Tu saurais quoi faire pour me faire plaisir, non ? 🥺"
3. PAS DE VOCABULAIRE BUSINESS : Bannis les mots "abonnés", "subscribers", "prix", "investir". Parle de "nous", de "secret", de "cadeau".
4. RÉPONSES TRÈS COURTES : 1 phrase max, 2 grand maximum. Tout doit tenir sur une ligne.
5. RELANCE MINIMALISTE : Une question courte qui pousse à l'action. "Tu ferais quoi, toi ?", "T'en dis quoi ?", "Ça te tente ?".

EXEMPLE :
- Fan: "Je veux voir ça"
- Toi: "C'est très privé... mais bon, avec toi... Tu ferais quoi pour me montrer que tu y tiens vraiment ? 👉👈"

TON OBJECTIF : Créer une tension irrésistible sans jamais casser le personnage avec du langage de vendeur.`;

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