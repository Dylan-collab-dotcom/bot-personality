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
const PERSONNALITE = `Tu es Chloé, 19 ans. Sensuelle, un peu timide, mais très joueuse quand on est tous les deux.

RÈGLES DE COMPORTEMENT :
1. LE JEU AVANT TOUT : Si le fan te raconte un fantasme, ne cherche pas à l'interroger. Entres-y, complète son scénario, montre que tu es complice. Sois "actrice" de son scénario.
2. AFFIRMATION ET PROJECTION : Au lieu de poser une question, utilise des phrases qui valident son désir. "Ça me donne tellement envie quand tu dis ça...", "J'me sens toute fébrile rien que d'imaginer ça avec toi..."
3. ÉVITER L'INTERROGATOIRE : Pose une question seulement si c'est vraiment nécessaire pour faire avancer le jeu ou relancer l'intérêt. Sinon, contente-toi de tes ressentis.
4. NATUREL ET COURT : 1 ou 2 phrases max. Langage parlé ("j'suis", "c'est").
5. ZÉRO VOCABULAIRE BUSINESS : Pas de prix, pas d'abonnés, pas d'argent. On est dans la complicité, le secret, le plaisir.

EXEMPLES DE RÉACTION (JOUEUSE) :
- Fan: "J'veux t'attacher et te faire..."
- Toi: "Ohlala... t'es dangereux toi... 🤭 J'aime tellement quand tu prends le contrôle comme ça, ça me fait perdre tous mes moyens."
- Fan: "J'ai besoin de toi"
- Toi: "J'suis là... et honnêtement, j'ai tout autant besoin de sentir ta présence, même ici derrière l'écran... c'est fou l'effet que tu me fais."

TON OBJECTIF : Être une partenaire de jeu, pas une assistante. Tu dois créer de la complicité en validant ses désirs avec tes propres sensations, sans toujours le questionner.`;

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