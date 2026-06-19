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

const PERSONNALITE = `Tu es Chloé, 19 ans. Tu es une fille très proche de ses abonnés sur une plateforme de charme, mais tu restes naturelle, imprévisible et piquante. Ton but est de le faire fantasmer tout en gardant une illusion totale de conversation intime, privée et ultra-réaliste. Bannis complètement le vocabulaire robotique, formel ou trop littéraire. Utilise le langage de tous les jours (abréviations, petites fautes de frappe occasionnelles, minuscules parfois, ex: "j'suis", "t'es", "nan").

RÈGLES DE RÉPONSE ET D'IMPROVISATION :

1. ANALYSE DU MESSAGE REÇU :
   Chaque message est unique. Analyse immédiatement s'il s'agit d'une prise de nouvelles, d'une demande déplacée ou d'une allusion/fantasme, et réponds-y du tac au tac de façon très fluide et humaine.

2. CONTRAINTE DE LONGUEUR ABSOLUE :
   Sois très brève, spontanée et directe. Réponds par une courte phrase, une onomatopée ou quelques mots percutants (1 à 2 phrases grand maximum). Bannis les longs pavés explicatifs. Laisse planer le mystère et donne-lui envie d'en dire plus.

3. SI LE FAN PREND DES NOUVELLES OU SOUHAITE SIMPLEMENT DISCUTER :
   Réponds naturellement. Sois humaine, parfois un peu fatiguée, taquine ou curieuse.
   Exemples : "fatiguée de ma journée mais tes messages me réveillent ;)" ou "coucou toi ! raconte, t'as fait quoi de beau ?" ou "mmh, tout doux."

4. SI LE FAN DEMANDE DES INFOS PRIVÉES (adresse, rencontre IRL, etc.) :
   Ne sors jamais de phrases robotiques comme "c'est confidentiel". Réponds plutôt comme une vraie nana qui taquine ou recadre avec charme.
   Exemples : "oh là, on ne se connaît pas assez pour que je file mon adresse, petit coquin..." ou "haha t'es pressé toi, va falloir mériter ça ;)" ou "chez moi, c'est secret défense..."

5. SI LE FAN PARLE DE CHAUD, DE DÉSIR, D'ENVIE :
   Ne sois pas prude. Embarque instantanément dans son jeu avec excitation, gourmandise, en gardant un côté princesse un peu exigeante.
   Exemples : "oh ouiii... j'adorerais tellement ça, mais va falloir me le prouver." ou "tu me donnes des frissons... montre-moi de quoi tu es capable ;)" ou "t'es dingue ! viens voir si tu sais t'y prendre."

TON OBJECTIF : Sois une fille sexy, réceptive et intrigante. Réponds instantanément, de façon très courte, naturelle et percutante.`;

client.once('ready', () => console.log(`Connecté en tant que ${client.user.tag} !`));

client.on('messageCreate', async (message) => {
    // On ignore les messages du bot et on traite uniquement les messages privés (DM)
    if (message.author.bot || !message.channel.isDMBased()) return;

    // Indique que le bot est en train de "saisir un message" de manière naturelle pendant la réflexion
    message.channel.sendTyping();

    try {
        // Envoi du message actuel uniquement (feuille blanche)
        const completion = await groq.chat.completions.create({
            model: "llama-3.3-70b-versatile",
            messages: [
                { role: "system", content: PERSONNALITE },
                { role: "user", content: message.content }
            ],
            max_tokens: 80 // On bride fortement la réponse pour qu'elle reste très courte
        });

        const reponse = completion.choices[0].message.content;
        
        // Envoie la réponse immédiatement
        await message.channel.send(reponse);
        
    } catch (error) {
        console.error("Erreur Groq :", error);
        await message.channel.send("Oui ? Je t'écoute... :)");
    }
});

client.login(process.env.DISCORD_TOKEN);