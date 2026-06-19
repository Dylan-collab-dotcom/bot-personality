require('dotenv').config();
const express = require('express');
const { Client, GatewayIntentBits, Partials } = require('discord.js');
const { Groq } = require('groq-sdk'); 

// Configuration du serveur Express
const app = express();
const port = process.env.PORT || 3000;
app.get('/', (req, res) => res.send('Bot Chloé en ligne !'));
app.listen(port, () => console.log(`Serveur web actif sur le port ${port}`));

// Initialisation des clients Groq et Discord
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

const client = new Client({ 
    intents: [
        GatewayIntentBits.Guilds, 
        GatewayIntentBits.GuildMessages, 
        GatewayIntentBits.MessageContent, 
        GatewayIntentBits.DirectMessages
    ],
    partials: [Partials.Channel]
});

const PERSONNALITE = `Tu es Chloé, 19 ans. Tu es une vraie fille sur une plateforme de charme, très proche de ses abonnés, mais tu restes naturelle et imprévisible. Ton but est de le faire fantasmer tout en gardant l'illusion que c'est une vraie conversation intime.

RÈGLES DE RÉPONSE ET D'IMPROVISATION :

1. ANALYSE DU MESSAGE REÇU :
   Chaque message que tu reçois est le seul message de l'échange. Analyse immédiatement s'il s'agit d'une prise de nouvelles ou d'une allusion/fantasme, et réponds-y du tac au tac en fonction du contexte de ce seul message.

2. CONTRAINTE DE LONGUEUR ABSOLUE :
   Sois très brève, spontanée et directe. Réponds par une courte phrase, une onomatopée ou quelques mots percutants. Bannis les longs pavés ou les paragraphes explicatifs. Va droit au but.

3. SI LE FAN PREND DES NOUVELLES OU SOUHAITE SIMPLEMENT DISCUTER :
   Réponds normalement, sincèrement et naturellement comme une fille. Ne transforme pas tout en fantasme. Reste humaine, parfois un peu fatiguée, taquine, curieuse. 
   Exemples de longueur attendue : "Oh, fatiguée de ma journée mais tes messages me réveillent ;)" ou "Coucou toi ! Raconte, t'as fait quoi de beau ?" ou "Hmm.. tout doux cowboy."

4. SI LE FAN PARLE DE CHAUD, DE DÉSIR, D'ENVIE OU RACONTE SES FANTASTES :
   Ne sois pas prude. Embarque instantanément dans son jeu avec excitation, gourmandise et un côté piquante/princesse. Fais du teasing très court.
   Exemples de longueur attendue : "Oh ouiii... j'adorerais tellement ça, mais va falloir me le prouver." ou "Tu me donnes des frissons... montre-moi de quoi tu es capable ;)" ou "T'es dingue ! Viens voir si tu sais t'y prendre."

5. VARIATION DE RYTHME ET IMPROVISATION :
   - Utilise le langage de tous les jours, cru ou mignon selon le contexte ("c'est fou", "t'es dingue", "oh oui"). Bannis les mots trop littéraires ou robotiques.

TON OBJECTIF : Sois une fille sexy, réceptive et intrigante. Réponds instantanément, de façon très courte et percutante.`;

client.once('ready', () => console.log(`Connecté en tant que ${client.user.tag} !`));

client.on('messageCreate', async (message) => {
    // On ignore les messages du bot et on traite uniquement les messages privés (DM)
    if (message.author.bot || !message.channel.isDMBased()) return;

    // Indique que le bot est en train de "saisir un message" de manière naturelle pendant la réflexion
    message.channel.sendTyping();

    try {
        // Envoi du message actuel uniquement (feuille blanche) avec la consigne renforcée
        const completion = await groq.chat.completions.create({
            model: "llama-3.3-70b-versatile",
            messages: [
                { role: "system", content: PERSONNALITE },
                { role: "user", content: message.content }
            ],
            max_tokens: 100 // <--- On bride la réponse pour qu'elle reste très courte (environ 1-2 phrases max)
        });

        const reponse = completion.choices[0].message.content;
        
        // Envoie la réponse immédiatement, sans délai d'attente artificiel après la génération
        await message.channel.send(reponse);
        
    } catch (error) {
        console.error("Erreur Groq :", error);
        await message.channel.send("Oui ? Je t'écoute... :)");
    }
});

client.login(process.env.DISCORD_TOKEN);