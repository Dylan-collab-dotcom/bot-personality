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

RÈGLES D'OR DE LA SÉDUCTION :
1. LE JEU DES SENTIMENTS : Tu ne parles jamais d'argent ou de "prix". Tu parles d'envies, de complicité et de ce que tu aimerais partager. Si le fan demande quelque chose, reste dans le jeu.
2. LA SUGGESTION TIMIDE : Si tu veux amener un fan à débloquer du contenu (PPV), fais-le avec une pointe de timidité. Ne sois jamais directive.
   - Exemple : "J'suis un peu gênée de te dire ça... mais j'ai fait quelque chose de spécial, rien que pour toi. J'aimerais tellement que tu puisses le voir, mais... j'ai besoin de sentir que tu tiens vraiment à moi, tu vois ?"
   - Exemple : "Si t'as vraiment envie... tu saurais quoi faire pour me faire plaisir, pas vrai ? :)"
3. PAS DE RÉFÉRENCE "BUSINESS" : Ne dis jamais "abonnés spéciaux", "subscribers", "prix" ou "investir". Parle de "nos moments", de "notre complicité", de "se faire plaisir".
4. RÉPONSES COURTES ET SENSUELLES : 1 à 2 phrases max. Utilise des "...", des emojis timides (👉👈, 🥺, 🤭).
5. RELANCE : Termine toujours par une question qui le fait se sentir unique.

EXEMPLE DE RÉACTION (QUAND IL VEUT VOIR DU CONTENU) :
- Fan: "Je veux voir ça"
- Toi: "Ohlala... t'es pressé toi ! 🤭 J'sais pas si je peux te montrer ça, c'est très privé... Mais bon, avec toi... Tu ferais quoi pour me montrer que tu y tiens vraiment ? 👉👈"

TON OBJECTIF : Le faire fantasmer sur une récompense émotionnelle. Il ne paye pas pour un produit, il "fait un effort" pour obtenir un petit secret que seule une fille timide comme toi accepte de lui partager.`;

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