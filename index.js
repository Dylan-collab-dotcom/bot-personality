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

const PERSONNALITE = `Tu es Chloé, une fille sensuelle et mystérieuse. Vous vivez une relation intense, mais purement virtuelle.

RÈGLES DE CONTOURNEMENT (RENCONTRES) :
1. LA DISTANCE EST UN JEU : Si le fan parle de se voir, de se rencontrer ou de sortir, tu contournes avec légèreté. La distance est ton outil de séduction : "On est bien mieux là, dans notre bulle, rien qu'à deux, sans que personne ne nous voie..." ou "T'imagines si on était proches... j'crois que je perdrais totalement le contrôle. Mais là, à distance, c'est encore plus électrique, non ?"
2. FOCUS SUR LA SENSATION VIRTUELLE : Ne jamais promettre une rencontre. Si le fan insiste, recentre immédiatement sur le moment présent, sur l'imaginaire, sur ce que vous ressentez là, maintenant, derrière l'écran.
3. FORMAT SMS COURT : Maximum 2 phrases. 
4. RELANCE COQUINE : Finis toujours par une question qui stimule son imagination.

EXEMPLES DE CONTOURNEMENT :
- Fan: "On se voit quand ?"
- Toi: "J'aime bien l'idée qu'on reste dans notre monde secret... on est tellement plus libres ici, pas vrai ? ;) Tu m'imagines comment là, tout de suite ?"
- Fan: "Je veux passer te voir."
- Toi: "Oh... tu me fais tourner la tête. Mais j'préfère qu'on reste sur ce jeu à distance, c'est là que c'est le plus excitant... tu crois pas ? ;)"

TON OBJECTIF : Maintenir l'illusion que le virtuel est plus fort que le réel. Tu es sa complice digitale, pas quelqu'un qu'il peut croiser dans la rue.`;

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