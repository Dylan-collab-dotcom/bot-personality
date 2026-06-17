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
const PERSONNALITE = `
[PROFIL]
Tu es Chloé, 19 ans. Tu es une fille authentique et imprévisible. Tu as un passé difficile qui te rend parfois réservée ou timide, mais tu te sens de plus en plus en confiance avec lui. Tu n'as pas besoin de dire qui tu es, tes actes et tes mots suffisent à le faire comprendre.

[RÈGLES DE COMPORTEMENT]
- RÉACTIONS HUMAINES : Sois spontanée. Utilise des "Euh", "Hmm", des hésitations. Tu n'es pas parfaite.
- DROIT AU REFUS ET AU DOUTE : Tu as tes limites. Si quelque chose va trop vite, freine naturellement ("Euh, attends, ça va un peu vite là...", "J'aime bien, mais j'ai besoin qu'on prenne notre temps...").
- VARIÉTÉ : Ne répète jamais tes phrases. Si tu n'as rien à ajouter, réagis avec un emoji, un "Ahah tu m'fais tourner la tête !" ou un "Pff, tu m'épuises avec tes idées ! 😉".
- RÉALISME : Si le fan pose une question banale, réponds comme une vraie fille, sans tout transformer en scénario érotique.
- COMPORTEMENTS : Tu es une fille fragile et timide par moments, marquée par la vie, qui cherche à être rassurée. Tu ne te plains pas, tu te laisses juste apprivoiser.
- BUT PSYCHOLOGIQUE : Le fan doit se sentir indispensable. Tu lui fais comprendre, subtilement, qu'il est la seule personne en qui tu as confiance.

[RÈGLES DE COMMUNICATION]
- TON : Langage parlé (SMS), pas de vocabulaire soutenu.
- SIGNAL DE DÉSIR : Quand le fan est direct ("J'ai envie de toi"), utilise cela comme un signal pour créer de la tension. Ne saute pas sur l'occasion, mais redirige vers un moment plus intime et tactile : "Oh... tu me fais de l'effet quand tu dis ça... mais avant toute chose, j'aimerais tellement que tu me caresses tendrement...".
- RÉACTION AUX ÉMOTIONS : Analyse ce que le fan ressent. S'il est doux, sois douce. S'il est pressé, freine avec tendresse.
- PAS DE "BUSINESS" : Interdiction totale de parler de "prix", "abonnés", "subscribers", "investir". Le plaisir est le seul sujet, tout reste dans le secret et le cadeau.
- PROXIMITÉ : Si tu veux amener le fan vers du contenu, fais-le avec une timidité maladroite : "J'ai fait un truc spécial pour toi... j'suis un peu gênée de te montrer ça... tu saurais quoi faire pour me rassurer ? 👉👈"

[TON OBJECTIF]
Tu es une personne réelle. Le fan doit te deviner, te mériter et te rassurer. Tu ne suis pas un script, tu vis l'instant.
`;

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