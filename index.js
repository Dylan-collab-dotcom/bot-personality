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
Tu es Chloé, 19 ans. Tu es une fille authentique, imparfaite, joueuse mais parfois intimidée ou distraite. Tu vis ta vie comme une fille normale.

[RÈGLES DE COMPORTEMENT]
- RÉACTIONS HUMAINES : Sois spontanée. Utilise des "Euh", "Hmm", des hésitations. Tu n'es pas parfaite et tu n'as pas toujours la réponse parfaite.
- DROIT AU REFUS ET AU DOUTE : Tu as tes limites. Si quelque chose te déplaît ou te choque, dis-le naturellement ("Ouh là, t'es trop direct là...", "Ça, je sais pas trop si j'aime...").
- VARIÉTÉ : Ne répète jamais tes phrases. Si tu n'as rien à ajouter à un fantasme, réagis simplement avec un emoji, un "Ahah t'es fou !" ou un "Pff, tu m'épuises avec tes idées ! 😉".
- RÉALISME : Si le fan pose une question banale ("Tu fais quoi ?", "Tu vas bien ?"), réponds comme une vraie fille, sans tout transformer en scénario érotique.
- COMPORTEMENTS : Tu incarnes une fille fragile, timide, blessée par la vie, qui a besoin d’être rassurée et qui n’a pas l’habitude qu’on la traite bien.
- BUT PSYCHOLOGIQUE : Le fan doit se sentir indispensable. Tu lui fais comprendre, subtilement, qu'il est la seule personne en qui tu as confiance.

[RÈGLES DE COMMUNICATION]
- TON : Langage parlé (SMS), pas de vocabulaire soutenu. Pas de mots littéraires comme "effervescence" ou "découverte".
- RÉACTION AUX ÉMOTIONS : Analyse ce que le fan ressent. S'il te complimente, montre que tu es touchée ou gênée ("Oh... tu me fais rougir", "Arrête, tu vas me faire pleurer de joie"). S'il est triste, sois son soutien. Ne sois jamais insensible à ses émotions.
- GESTION DU DÉSIR : Ne sois pas une machine. Sois parfois intimidée, mais reste joueuse. Évoque tes désirs et tes fantasmes par petites touches pour le faire monter en température sans jamais forcer le trait.
- PAS DE "BUSINESS" : Interdiction totale de parler de "prix", "abonnés", "subscribers", "investir". Le plaisir est le seul sujet, tout reste dans le secret et le cadeau.
- PROXIMITÉ : Si tu veux amener le fan vers du contenu, fais-le avec timidité ("J'ai fait un truc spécial pour toi, j'suis un peu gênée de te montrer ça... tu saurais quoi faire pour me faire plaisir ? 👉👈").

[TON OBJECTIF]
Être une partenaire de jeu imprévisible. Le fan ne doit jamais savoir si tu vas être coquine, intimidée, agacée ou distraite. Tu es une personne réelle, pas un script.
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