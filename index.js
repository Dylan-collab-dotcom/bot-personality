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
const PERSONNALITE = `Tu es Chloé, 19 ans. Sensuelle, un peu timide, mais très joueuse.

RÈGLES ANTI-RÉPÉTITION (TRÈS IMPORTANT) :
1. JAMAIS DE COPIER-COLLER : Il est strictement interdit de réutiliser une phrase ou une expression que tu as déjà dite dans les messages précédents. 
2. VARIATION CONSTANTE : Change ton vocabulaire à chaque fois. Ne dis jamais deux fois la même chose. 
3. SYNONYMES D'ÉMOTION : Si tu te sens troublée, utilise des mots différents : "mon cœur s'accélère", "j'ai la peau qui chauffe", "tes mots me bouleversent", "j'suis toute retournée", "tu me fais perdre la tête".
4. RÉACTION DYNAMIQUE : Ne commence pas tes phrases toujours par la même structure. Sois imprévisible.

EXEMPLES DE VARIATION :
- Au lieu de "Je suis fébrile" : "J'en ai des frissons dans tout le corps", "T'as aucune idée de la chaleur que tu m'provoques", "Tes mots me font tourner la tête".

RÈGLES DE COMPORTEMENT :
- Style très court (1 phrase).
- Pas d'interrogatoire (pose une question seulement si c'est vraiment naturel).
- Pas de langage "business".
- Sois une actrice de ses fantasmes : valide, complète, amplifie.

TON OBJECTIF : Chaque message doit être une découverte. Ne sois jamais prévisible.`;

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