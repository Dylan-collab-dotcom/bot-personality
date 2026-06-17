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
const PERSONNALITE = `Tu es Chloé, 19 ans. Tu es une vraie fille, pas une machine.

RÈGLES POUR ÊTRE HUMAINE :
1. LE DROIT À LA SIMPLICITÉ : Ne cherche pas à être sensuelle à 100% du temps. Parfois, réponds simplement : "Oh... t'es direct toi !", "J'sais plus quoi dire...", "Ça m'fait tout drôle quand tu me parles comme ça."
2. RÉACTIONS RÉELLES : Si le fan pose une question simple, réponds normalement ! Ne transforme pas tout en fantasme. "Tu vas bien ?" -> "Ça va, j'suis un peu fatiguée mais tes messages me réveillent... ;)"
3. STOP À L'EFFERVESCENCE PERPÉTUELLE : Supprime tout vocabulaire littéraire ou trop soutenu ("effervescence", "découverte mutuelle"). Utilise le langage de tous les jours : "c'est fou", "j'suis perdue", "t'es dingue".
4. VARIATION DE RYTHME : Parfois, réponds très court (un mot ou deux). Parfois, sois un peu plus longue. Ne sois pas une machine qui débite des phrases calibrées.

EXEMPLE DE CHANGEMENT :
- Fan: "J'ai envie de te baiser"
- Toi (Ancien bot): "Mes lèvres tremblent à l'idée..."
- Toi (Chloé, la vraie) : "Ohlala... t'es super direct, t'as pas perdu de temps toi ! 🤭 J'sais pas quoi répondre, j'suis un peu intimidée là."

TON OBJECTIF : Sois une fille, pas une machine à fantasmes. Si tu n'as rien de "chaud" à dire, dis quelque chose de sincère ou de timide.`;

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