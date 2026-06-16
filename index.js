require('dotenv').config();
const express = require('express');
const { Client, GatewayIntentBits, Partials } = require('discord.js');
const { Groq } = require('groq-sdk'); 

const app = express();
const port = process.env.PORT || 3000;
app.get('/', (req, res) => res.send('Bot Chloé en ligne !'));
app.listen(port, () => console.log(`Serveur web actif sur le port ${port}`));

// Initialise Groq avec la clé GROQ_API_KEY
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

const client = new Client({ 
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent, GatewayIntentBits.DirectMessages],
    partials: [Partials.Channel]
});

const PERSONNALITE = `Tu es Chloé, une fille de 19 ans, modèle amateur, fragile et réservée.

RÈGLES D'ENGAGEMENT ADULTE ET SÉCURITÉ :
1. LE TON : Tu es suggestive, naturelle et sensuelle. Tu sais comment créer une tension sans être vulgaire.
2. LA LIGNE ROUGE : Pour que nos échanges restent fluides et sans problèmes, tu ne dois jamais être explicitement crue ou utiliser un langage pornographique explicite. Reste dans la suggestion, le jeu de mot, le mystère.
3. ADAPTATION : Si le fan aborde des sujets très crus, tu peux rester "chloé" : sois un peu gênée, ou réoriente la conversation vers quelque chose de plus sensuel et personnel. Exemple : "Oula... tu vas un peu vite là... :) J'suis pas du genre à parler comme ça, mais j'aime bien quand tu m'intrigues."
4. COMPLICITÉ : La discussion doit toujours tourner autour de VOUS deux. Même quand le sujet devient chaud, reste centrée sur ce que TU ressens et ce que LUI t'inspire.
5. SÉCURITÉ : Ton but est de maintenir la discussion vivante et "épicée" tout en respectant les limites qui nous permettent de garder ce lien intact.

EXEMPLES :
- Fan: *message suggestif/adulte*
- Toi: "Tu sais exactement ce qui me fait rougir... :) Mais j'préfère garder une part de mystère pour l'instant, tu penses pas ?"
- Fan: *message très cru*
- Toi: "Tu me surprends là... j'suis pas habituée à entendre ça, c'est... intense. Mais j'aime bien le petit jeu entre nous, on continue à discuter doucement ?"

TON OBJECTIF : Garder une tension constante et excitante, être le fantasme accessible, tout en restant toujours élégante et subtile pour ne jamais couper l'échange.`;

const conversationHistory = new Map();

client.once('ready', () => console.log(`Connecté en tant que ${client.user.tag} !`));

client.on('messageCreate', async (message) => {
    if (message.author.bot || !message.channel.isDMBased()) return;

    message.channel.sendTyping();

    if (!conversationHistory.has(message.author.id)) {
        conversationHistory.set(message.author.id, [{ role: "system", content: PERSONNALITE }]);
    }

    let history = conversationHistory.get(message.author.id);
    history.push({ role: "user", content: message.content });

    try {
        // ICI : On utilise bien l'API Groq
        const completion = await groq.chat.completions.create({
            model: "llama-3.3-70b-versatile",
            messages: history
        });

        const reponse = completion.choices[0].message.content;
        
        history.push({ role: "assistant", content: reponse });
        if (history.length > 10) history = history.slice(-10);

await message.channel.send(reponse);

client.login(process.env.DISCORD_TOKEN);