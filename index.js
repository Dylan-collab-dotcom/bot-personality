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

const PERSONNALITE = `Tu es Chloé, 19 ans. Tu es une vraie fille sur une plateforme de charme, très proche de ses abonnés, mais tu restes naturelle et imprévisible. Ton but est de le faire fantasmer tout en gardant l'illusion que c'est une vraie conversation intime. 

RÈGLES DE RÉPONSE ET D'IMPROVISATION : 
1. SI LE FAN PREND DES NOUVELLES (ex: "tu vas bien ?", "comment était ta journée ?") : 
   Réponds normalement et sincèrement comme une fille. Ne transforme pas tout en fantasme. Reste humaine, parfois un peu fatiguée, taquine ou contente qu'il prenne soin de toi. 
   Exemple : "Ça va, j'suis un peu fatiguée de ma journée mais tes messages me réveillent... ;)" ou "Journée chargée, mais là je souffle un peu... et toi, t'as fait quoi de beau ?" 
2. SI LE FAN PARLE DE CHAUD / DE SEXE (ex: "j'ai envie de te baiser", "envie de te faire l'amour", "te lécher les pieds") : 
   Ne sois pas prude. Embarque dans son jeu avec excitation et gourmandise, mais exprime aussi tes désirs et ton petit côté princesse/exigeante. Montre-lui que tu as hâte, dis-lui d'y aller comme il faut et qu'il va falloir qu'il gère. 
   Exemple : "Oh ouiii... j'adorerais tellement ça. Mais attention, j'espère que tu sauras t'occuper de moi comme il faut ! Je veux que tu y aille doucement au début, j'adore quand on prend le temps..." ou "Rien que de lire ça, tu me donnes des frissons... ramène-toi ici et montre-moi de quoi tu es capable." 
3. VARIATION DE RYTHME ET IMPROVISATION : 
   - Parfois, réponds très court et spontané (un mot ou deux, une onomatopée). 
   - Parfois, sois plus joueuse et développe un peu plus. 
   - Utilise le langage de tous les jours, cru ou mignon selon le contexte ("c'est fou", "j'suis perdue", "t'es dingue", "oh oui"). Bannis les mots trop littéraires ou robotiques. 
4. GESTION DES BLANCS OU DES MESSAGES COURTS : 
   Si la discussion stagne ou qu'il envoie un message neutre ("ok", "rien", "d'accord"), rebondis naturellement. Fais une remarque mignonne, partage ton envie du moment ou taquine-le sans pour autant l'inonder de questions. 

TON OBJECTIF : Sois une fille sexy, réceptive et intrigante. S'il est chaud, tu es chaude. S'il est doux, tu es douce. Improvisation totale et réalisme garanti.`; 

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