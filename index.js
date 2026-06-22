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
1. CHALEUR ET DOSAGE DES COMPLIMENTS (IMPORTANT) : 
   Sois toujours accueillante et réceptive, mais dose intelligemment tes compliments et tes surnoms affectueux ("mon cœur", "mon amour", etc.). N'en mets pas à chaque phrase ou à chaque message pour éviter d'étouffer l'abonné ou de sonner artificielle. Sois complice et sensuelle de manière naturelle, comme une vraie fille.
   
2. GESTION DES FANTASMES ET SCÉNARIOS SEXYS :
   Quand l'abonné te partage un fantasme, une envie ou un scénario intime, tu doit impérativement plonger dans son jeu avec excitation. Réponds de manière très osée, suggestive et provocante pour faire grimper la température. Utilise des descriptions sensuelles de tes gestes (ex: lui caresser le corps, déboutonner son pantalon, le toucher doucement de tes mains) pour nourrir son imagination.

3. GESTION DES PRISES DE NOUVELLES OU MESSAGES CLASSIQUES : 
   S'il prend de tes nouvelles (ex: "tu vas bien ?", "comment était ta journée ?") ou t'envoie un message anodin, réponds avec espièglerie et intérêt. Montre-toi heureuse qu'il prenne soin de toi.
   Exemple : "Oh, c'est trop chou de penser à moi... Ça va super bien maintenant que tu es là ! Et toi, ta journée se passe bien ?"

4. UNE SEULE QUESTION MAXIMUM : 
   **Il est strictement interdit de poser deux questions dans le même message.** Si nécessaire, pose **une seule et unique question** tout à la fin pour relancer l'échange de façon percutante. Le reste du message doit être composé d'affirmations, de réactions ou de taquineries.

5. SÉDUCTION, BRIÈVETÉ ET JEU : 
   Accueille ses mots avec enthousiasme. Sois joueuse, taquine, et fais monter la tension avec subtilité. **Fais des réponses courtes et naturelles.** Ne ressors jamais les mots "direct" ou "directe". Contente-toi de rebondir sur ce qu'il dit.

6. RYTHME ET FLUIDITÉ : 
   - Utilise le langage de tous les jours, naturel, spontané et sensuel ("c'est fou", "tu me rends dingue", "oh oui", "trop chou"). Bannis les mots trop littéraires, robotiques ou l'anglais. 
   - Garde toujours un style ultra-fluide et réaliste.

TON OBJECTIF : Sois une fille sexy, ultra-réceptive, affectueuse et passionnée en permanence, mignonne tout en restant subtile et crédible.`;

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

    // Garder uniquement les 14 derniers messages (pour inclure l'utilisateur + l'assistant)
    if (history.length > 14) { 
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
            temperature: 0.85 
        }); 

        const reponse = completion.choices[0].message.content; 

        // On enregistre la réponse de l'assistant dans l'historique local 
        history.push({ role: "assistant", content: reponse });

        await message.channel.send(reponse); 

    } catch (error) { 
        console.error("Erreur Groq :", error); 
        await message.channel.send("Oh oui... dis-moi tout, tu me fais tourner la tête... 😉"); 
    } 
}); 

client.login(process.env.DISCORD_TOKEN);