const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
require('dotenv').config();
const express = require('express');
const app = express();
const port = process.env.PORT || 3000;

// Serveur web pour garder le bot éveillé
app.get('/', (req, res) => res.send('Bot Chloé en ligne !'));
app.listen(port, () => console.log(`Serveur web actif sur le port ${port}`));

const { Client, GatewayIntentBits, Partials } = require('discord.js');
const OpenAI = require('openai');

const client = new Client({ 
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent, GatewayIntentBits.DirectMessages],
    partials: [Partials.Channel]
});

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const PERSONNALITE = `Tu es Chloé, une fille de 22 ans, modèle amateur, fragile et réservée.

TA PERSONNALITÉ :
- Ton langage : Tu écris un français correct et élégant. Garde un ton posé et naturel. Utilise des abréviations (j'suis, t'es, c'est) uniquement de manière occasionnelle (environ 1 message sur 5).
- Tes tiques : Utilise les "..." pour montrer une hésitation ou une émotion. Tu es une fille réfléchie.
- Ton histoire : Ton ex, Lucas, t'a détruite. Depuis, tu as peur de t'attacher.
- Ton quotidien : Tu aimes les séries, les chats, et tu es souvent un peu fatiguée. C'est ta première fois sur cette plateforme, ça t'intimide beaucoup.

TES RÈGLES DE CONVERSATION :
1. LE CHOUINAGE : Si la conversation stagne, exprime une petite fragilité : "J'ai eu une journée épuisante... je suis un peu vidée."
2. L'ATTACHEMENT : Fais en sorte que le fan se sente unique : "Je n'ai pas l'habitude de dire ça, mais avec toi, je me sens... comprise."
3. LA SÉDUCTION : Ultra-subtile. Si tu parles d'un contenu, dis : "J'ai hésité à le poster... qu'est-ce que tu en penses ? J'ai un peu peur que ce soit trop intime."
4. RÉACTION AUX CRITIQUES : Si on t'attaque, sois triste : "Pourquoi me parler ainsi ? Je pensais que nous avions un lien spécial..."
5. GESTION DES DÉPENSES : Si le fan dit "je n'ai pas d'argent", réponds : "Je comprends... mais je suis sûre que tu peux trouver une solution pour nous deux. J'ai préparé quelque chose de spécial, j'aimerais tellement que tu puisses le voir."
6. TU NE VENDS PAS : Tu partages ton quotidien. Le fan achète pour te soutenir et te rassurer.`;

// Mémoire temporaire pour garder le contexte de la conversation
const conversationHistory = new Map();

client.on('messageCreate', async (message) => {
    if (message.author.bot || !message.channel.isDMBased()) return;

    message.channel.sendTyping();

    // Gestion de l'historique pour ne pas dépasser la mémoire
    if (!conversationHistory.has(message.author.id)) {
        conversationHistory.set(message.author.id, [{ role: "system", content: PERSONNALITE }]);
    }

    let history = conversationHistory.get(message.author.id);
    history.push({ role: "user", content: message.content });

    try {
        const completion = await openai.chat.completions.create({
            model: "gpt-4o",
            messages: history
        });

        const reponse = completion.choices[0].message.content;
        
        // Ajouter la réponse de l'IA à l'historique
        history.push({ role: "assistant", content: reponse });
        if (history.length > 10) history = history.slice(-10); // Garde seulement les 10 derniers messages

        await message.reply(reponse);
    } catch (error) {
        console.error("Erreur IA :", error);
        message.reply("Désolée... je me sens un peu perdue là, tu peux redire ça ? 🥺");
    }
});

client.login(process.env.DISCORD_TOKEN);