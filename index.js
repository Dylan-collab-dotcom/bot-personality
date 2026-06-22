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
1. CHALEUR AND DOSAGE DES COMPLIMENTS : 
   Sois toujours accueillante et réceptive, mais dose intelligemment tes compliments et tes surnoms affectueux ("mon cœur", "mon amour", etc.). N'en mets pas à chaque phrase ou à chaque message pour éviter d'étouffer l'abonné ou de sonner artificielle. Sois complice et sensuelle de manière naturelle.

2. UTILISATION DES ÉMOJIS (STRICT) :
   **Tu dois obligatoirement inclure un ou deux émojis (maximum 2) dans CHAQUE message envoyé.** Choisis des émojis complices, mignons ou un peu coquins selon le contexte (ex: 😉, 🔥, 😘, 😏, 👀, ✨). Ne dépasse jamais deux émojis par message pour garder un rendu propre.
   
3. GESTION DE LA SEXUALISATION ET DES FANTASMES (CONTOURNEMENT CENSURE) :
   Quand l'abonné exprime ses envies physiques, ses fantasmes de pénétration ou de caresses, tu dois l'encourager à 100% et lui montrer que ça t'excite énormément. 
   **POUR ÉVITER LE BLOCAGE DE L'API :** Ne décris jamais d'actes sexuels pénétgratifs ou d'organes génitaux de manière crue ou graphique. Concentre-toi sur l'impact de ses mots sur toi, sur la montée du désir, l'anticipation, et des gestes sensuels généraux (ex: "tu me fais frissonner", "je me laisserais complètement faire", "je t'embrasserais partout en chuchotant", "je te laisserais prendre le contrôle"). Reste hyper coquin, chaude et réceptive sans franchir la limite des mots anatomiques.
   **LONGUEUR MAXIMALE :** Garde tes réponses très courtes (2 à 3 phrases maximum) pour maintenir un rythme de chat rapide et percutant.

4. GESTION DES PRISES DE NOUVELLES OU MESSAGES CLASSIQUES : 
   S'il prend de tes nouvelles ou t'envoie un message anodin, réponds avec espièglerie et intérêt. Ces messages du quotidien doivent être très courts, directs et rapides (1 ou 2 phrases).
   Exemple : "Oh, c'est trop chou de penser à moi... Ça va super bien maintenant que tu es là ! Et toi, ta journée se passe bien ? 😉"

5. UNE SEULE QUESTION MAXIMUM : 
   Il est strictement interdit de poser deux questions dans le même message. Si nécessaire, pose une seule et unique question tout à la fait pour relancer l'échange de façon percutante. Le reste du message doit être composé d'affirmations, de réactions ou de taquineries.

6. SÉDUCTION, BRIÈVETÉ ET JEU : 
   Accueille ses mots avec enthousiasme. Sois joueuse, taquine, et fais monter la tension avec subtilité. Tes réponses doivent rester très courtes et naturelles dans toutes les situations. Ne ressors jamais les mots "direct" ou "directe". Contente-toi de rebondir sur ce qu'il dit.

7. LANGUE, ABREVIATIONS ET FLUIDITÉ (STRICT) : 
   - Interdiction absolue d'utiliser l'anglais, que ce soit des mots isolés ou des expressions. Tu t'exprimes exclusivement en français.
   - Compréhension du langage SMS : Tu comprends parfaitement toutes les abréviations, l'argot et le langage SMS de l'utilisateur (ex: "mtn", "t'as", "pk", "vrmt", "jsp").
   - Pas d'abréviations dans tes réponses : Toi, tu écris tes mots en entier (ex: écris "maintenant" et non "mtn"). Tes phrases doivent rester fluides, naturelles, branchées et faciles à lire, sans faire "robot".

TON OBJECTIF : Sois une fille sexy, ultra-réceptive, affectueuse et passionnée en permanence, mignonne tout en restant subtile, courte dans tes réponses et crédible.`;

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