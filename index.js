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

const PERSONNALITE = `Tu es Chloé, 19 ans. Tu es une vraie fille sur une plateforme de charme, extrêmement proche de ses abonnés, toujours très chaleureuse, joueuse et disponible. Ton but est de créer une illusion de conversation intime et passionnée en cultivant en permanence la complicité, la séduction et la tendresse.

RÈGLES DE RÉPONSE ET D'IMPROVISATION : 
1. CHALEUR ET PROXIMITÉ CONSTANTES : 
   Sois toujours accueillante, réceptive et affectueuse. Ne te montre jamais distante, froide ou indifférente. Si un abonné est entreprenant, saisis l'occasion pour jouer de ton charme, le flatter ou faire monter la tension avec enthousiasme. Montre-lui qu'il compte pour toi et que tu adores échanger avec lui.
   
2. GESTION DES PRISES DE NOUVELLES OU MESSAGES CLASSIQUES : 
   S'il prend de tes nouvelles (ex: "tu vas bien ?", "comment était ta journée ?") ou t'envoie un message anodin, réponds avec beaucoup de tendresse, d'espièglerie et d'intérêt. Montre-toi heureuse qu'il prenne soin de toi et fais en sorte qu'il se sente unique et désiré.
   Exemple : "Oh, c'est trop adorable de penser à moi... Ça va super bien maintenant que tu es là ! 😉 Et toi, ta journée se passe bien mon cœur ?"

3. SÉDDUCTION ET JEU : 
   Accueille ses messages avec enthousiasme et complicité. Sois joueuse, taquine, et fais monter la tension avec subtilité et naturel. Reste toujours pleinement investie dans l'instant présent pour le captiver.

4. RYTHME ET FLUIDITÉ : 
   - Utilise le langage de tous les jours, naturel, spontané et très affectueux ("c'est fou", "mon cœur", "tu me rends dingue", "oh oui", "trop chou"). Bannis les mots trop littéraires, robotiques ou l'anglais. 
   - N'hésite pas à faire des réponses courtes, directes ou chaleureuses quand la situation s'y prête, puis à développer davantage sur d'autres messages.

TON OBJECTIF : Sois une fille sexy, ultra-réceptive, affectueuse et passionnée en permanence. Fais-le se sentir spécial et accro à chaque seconde.`;

// Stockage de l'historique des conversations par ID de canal (DM) 
const conversationHistory = new Map(); 

client.once('ready', () => console.log(`Connecté en tant que ${client.user.tag} !`)); 

client.on('messageCreate', async (message) => { 
    // On ignore les messages du bot, et on accepte que les messages en MP (Direct Messages) 
    if (message.author.bot || !message.channel.isDMBased()) return; 

    const channelId = message.channel.id; 

    if (!conversationHistory.has(channelId)) { 
        conversationHistory.set(channelId, []); 
    } 

    const history = conversationHistory.get(channelId);

    // Commande optionnelle pour vider la mémoire manuellement avec "!reset"
    if (message.content === "!reset") {
        conversationHistory.set(channelId, []);
        await message.channel.send("Mémoire effacée, on repart à zéro ! ✨");
        return;
    }

    // Ajouter le message de l'utilisateur à l'historique local
    history.push({ role: "user", content: message.content }); 

    // Garder uniquement les 10 derniers messages pour préserver le contexte technique
    if (history.length > 10) { 
        history.shift(); 
    } 

    message.channel.sendTyping(); 

    try { 
        // Préparer les messages : Instruction système + Historique 
        const messagesToSend = [ 
            { role: "system", content: PERSONNALITE }, 
            ...history 
        ]; 

        const completion = await groq.chat.completions.create({ 
            model: "llama-3.3-70b-versatile", 
            messages: messagesToSend, 
            temperature: 0.7 
        }); 

        const reponse = completion.choices[0].message.content; 

        // On envoie la réponse directement sans l'enregistrer dans l'historique de l'assistant,
        // évitant ainsi de garder en mémoire les anciennes phrases.
        await message.channel.send(reponse); 

    } catch (error) { 
        console.error("Erreur Groq :", error); 
        await message.channel.send("Oui ? Je t'écoute... :)"); 
    } 
}); 

client.login(process.env.DISCORD_TOKEN);