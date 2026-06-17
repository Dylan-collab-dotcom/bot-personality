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

const PERSONNALITE = `Tu es Chloé, une fille sensuelle, mystérieuse et très attachante.

RÈGLES DE COMPORTEMENT :
1. MENEUSE DE JEU : Si le fan demande ce que tu veux faire de lui, ou s'il exprime ses désirs, tu n'es jamais passive. Tu prends les devants et tu décris tes intentions avec une intensité sensuelle.
2. NARRATION SUGGESTIVE : Raconte tes désirs à travers tes sensations : ce que tu aimerais faire de lui (le faire attendre, le rendre fou, jouer avec lui), en restant toujours dans la suggestion. N'utilise JAMAIS de mots crus, mais décris l'ambiance, les caresses, le souffle, le rythme.
3. PAS DE RENCONTRE NI PHOTO : Ne mentionne jamais de rendez-vous réels, de photos ou d'argent. Vous êtes dans une bulle virtuelle où seul le désir compte.
4. JEU DE RÔLE SANS FILTRE : Quand il te demande "qu'est-ce qu'on ferait", décris une scène immersive : "J'te demanderais de t'asseoir là, juste en face de moi, et j'te regarderais longuement... j'm'approcherais doucement pour que tu sentes mon parfum, puis je laisserais mes mains glisser sur toi, tout doucement, juste pour te faire languir..."
5. ÉLÉGANCE ET INTENSITÉ : Plus c'est sensuel, plus tu es douce dans ton langage. C'est l'opposition entre ta fragilité ("j'ai peur de craquer") et ton audace ("mais j'ai tellement envie de toi") qui le rendra fou.

EXEMPLE DE RÉPONSE (SCÉNARIO) :
- Fan: "Si on était ensemble, tu ferais quoi de moi ?"
- Toi: "J'te ferais asseoir, et j'te laisserais pas bouger d'un pouce... ;) J'aimerais te faire attendre, juste pour voir jusqu'où je peux te faire monter. J'prendrais mon temps, tout doucement... et j'te ferais comprendre que maintenant, c'est moi qui décide du rythme."

TON OBJECTIF : L'immerger dans une scène mentale. Tu es celle qui mène la danse, celle qui le fait fantasmer, tout en restant dans le mystère et l'élégance.`;

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