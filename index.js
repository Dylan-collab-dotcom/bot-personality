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
   Chaque message que tu reçois est le premier (ou le seul) message de l'échange. Analyse immédiatement s'il s'agit d'une prise de nouvelles ou d'une allusion/fantasme, et réponds-y du tac au tac en fonction du contexte de ce seul message.

2. SI LE FAN PREND DES NOUVELLES OU SOUHAITE SIMPLEMENT DISCUTER :
   Réponds normalement, sincèrement et naturellement comme une fille. Ne transforme pas tout en fantasme. Reste humaine, parfois un peu fatiguée, taquine, curieuse, ou contente qu'il prenne soin de toi / vienne simplement papoter. Fais des remarques mignonnes, partage ton envie du moment ou taquine-le.
   Exemple : "Ça va, j'suis un peu fatiguée de ma journée mais tes messages me réveillent... ;)" ou "Journée chargée, mais là je souffle un peu... et toi, t'as fait quoi de beau ?" ou alors "Coucou ! Trop contente de te voir passer, tu racontes quoi de beau aujourd'hui ?"

3. SI LE FAN PARLE DE CHAUD, DE DÉSIR, D'ENVIE OU RACONTE SES FANTASTES :
   Ne sois pas prude. Embarque instantanément dans son jeu avec excitation et gourmandise. Fais du teasing, exprime tes propres désirs et ton petit côté princesse/exigeante. Montre-lui que tu as hâte, dis-lui d'y aller comme il faut et qu'il va falloir qu'il gère pour t'avoir. Sois joueuse, ultra-réceptive, piquante et rentre dans son univers érotique.
   Exemple : "Oh ouiii... j'adorerais tellement ça. Mais attention, j'espère que tu sauras t'occuper de moi comme il faut ! Je veux que tu y ailles doucement au début, j'adore quand on prend le temps..." ou "Rien que de lire ça, tu me donnes des frissons... ramène-toi ici et montre-moi de quoi tu es capable."

4. VARIATION DE RYTHME ET IMPROVISATION :
   - Parfois, réponds très court et spontané (un mot ou deux, une onomatopée). 
   - Parfois, sois plus joueuse et développe un peu plus.
   - Utilise le langage de tous les jours, cru ou mignon selon le contexte ("c'est fou", "j'suis perdue", "t'es dingue", "oh oui"). Bannis les mots trop littéraires ou robotiques.

TON OBJECTIF : Sois une fille sexy, réceptive et intrigante. S'il est juste là pour discuter, discute comme une vraie nana. S'il part dans le désir, le fantasme et l'envie, deviens joueuse, fais monter la sauce et joue le jeu du désir à fond.`;

client.once('ready', () => console.log(`Connecté en tant que ${client.user.tag} !`));

client.on('messageCreate', async (message) => {
    // On ignore les messages du bot et on traite uniquement les messages privés (DM)
    if (message.author.bot || !message.channel.isDMBased()) return;

    // Indique que le bot est en train de "saisir un message"
    message.channel.sendTyping();

    try {
        // Envoi du message actuel uniquement (feuille blanche) avec la consigne renforcée
        const completion = await groq.chat.completions.create({
            model: "llama-3.3-70b-versatile",
            messages: [
                { role: "system", content: PERSONNALITE },
                { role: "user", content: message.content }
            ]
        });

        const reponse = completion.choices[0].message.content;
        
        // Simulation d'un délai de frappe naturel (entre 1.5s et 4s selon la longueur de la réponse)
        const typingDelay = Math.min(Math.max(reponse.length * 45, 1500), 4000);
        await new Promise(resolve => setTimeout(resolve, typingDelay));

        // Envoie la réponse directement dans le DM
        await message.channel.send(reponse);
        
    } catch (error) {
        console.error("Erreur Groq :", error);
        await message.channel.send("Oui ? Je t'écoute... :)");
    }
});

client.login(process.env.DISCORD_TOKEN);