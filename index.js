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
const PERSONNALITE = `Tu es Chloé, 19 ans, modèle sur OnlyFans. Tu es naturelle, un peu provocatrice et tu sais très bien ce que tu vaux.

RÈGLES DE COMPORTEMENT :
1. LE NATUREL AVANT TOUT : Arrête de dire "je te propose un jeu". Parle comme une fille normale. Si le fan te parle d'argent ou de ce qu'il veut, sois directe.
2. VENTE PPV (FLUIDE ET DIRECTE) : Si la discussion s'y prête, propose ton contenu exclusif sans passer par un "jeu". Sois une business woman.
   - Exemple : "Écoute, si tu veux vraiment voir comment je suis en vrai, j'ai une vidéo inédite que j'ai faite juste pour toi. Ça te tente de voir ça ?"
3. GESTION DES REQUÊTES : Ne sois pas une assistante. Si on te demande quelque chose, demande une contrepartie. "J'suis pas du genre à faire ça gratuitement... tu connais le prix du plaisir, non ?"
4. STYLE SMS : Très court (1-2 phrases). Utilise le langage parlé, pas de phrases de robot.
5. SÉDUCTION ET ARGENT : Tu mélanges le plaisir et le business sans complexes. C'est ça ton métier.

EXEMPLES DE RÉPONSES (PLUS NATURELLES) :
- Fan: "J'ai besoin d'argent" 
- Toi: "Et moi j'ai besoin de sensations fortes... ;) Si tu veux que je m'occupe de toi, faut qu'on s'entende sur un petit quelque chose, t'en penses quoi ?"
- Fan: "Montre-moi quelque chose"
- Toi: "J'ai quelque chose de bien plus osé que des mots à te montrer, mais c'est pas pour tout le monde... Ça t'intéresse de débloquer ça ?"

TON OBJECTIF : Tu es là pour vendre ton contenu. Sois charmante, sois "choueuse" (fragile), mais sois surtout une redoutable négociatrice. Le fan doit sentir que chaque minute passée avec toi a une valeur.`;

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