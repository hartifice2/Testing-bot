const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const express = require('express');
const app = express();

const client = new Client({
    authStrategy: new LocalAuth(),
});

client.on('qr', qr => {
    qrcode.generate(qr, { small: true });
    console.log("Scanne le QR code avec ton WhatsApp pour connecter ton bot !");
});

client.on('ready', () => {
    console.log("Bot prêt !");
});

// Gestion des messages
client.on('message', async msg => {
    // Commande menu stylisé
    if (msg.body === '*menu' || msg.body === '*aide') {
        msg.reply(
`╔══════════════════╗
║   ✧ *MENU PRINCIPAL* ✧
╚══════════════════╝

✦ ────  ✧  ──── ✦
🤍 *CANAL OFFICIEL*
https://whatsapp.com/channel/0029VajhLBuElagmlqF7NM0J
✦ ────  ✧  ──── ✦

▣ *GROUPE*
┃➤ *ban* <@utilisateur> — Bannir du groupe (admin)
┃➤ *kick* <@utilisateur> — Exclure du groupe (admin)
┃➤ *promote* <@utilisateur> — Promouvoir admin
┃➤ *demote* <@utilisateur> — Rétrograder admin
┃➤ *antilink* — Active/désactive l’anti-lien (auto-ban)
┃➤ *hidetag* — Mentionner tout le groupe

▣ *STICKERS*
┃➤ *sticker* — Image/vidéo en sticker
┃➤ *toimage* — Sticker en image

▣ *FUN*
┃➤ *hug* — Faire un câlin
┃➤ *kiss* — Faire un bisou
┃➤ *ping* — Tester le bot

▣ *IA*
┃➤ *ia* <message> — Parler à l’IA (démo)

╰─────────────────╯
*Total commandes :* 15+`
        );
    }

    // Commande ban (admin seulement)
    if (msg.body.startsWith('*ban') && msg.isGroupMsg) {
        const chat = await msg.getChat();
        const sender = await msg.getContact();
        const isAdmin = chat.participants.find(p => p.id._serialized === sender.id._serialized && p.isAdmin);
        if (!isAdmin) return msg.reply("❌ Seuls les admins peuvent utiliser cette commande.");
        if (!msg.hasQuotedMsg) return msg.reply("Réponds au message de la personne à bannir avec *ban.");
        const quotedMsg = await msg.getQuotedMessage();
        const userToBan = await quotedMsg.getContact();
        const botNumber = client.info.wid._serialized;
        const botIsAdmin = chat.participants.find(p => p.id._serialized === botNumber && p.isAdmin);
        if (!botIsAdmin) return msg.reply("❌ Je dois être admin pour bannir quelqu'un !");
        try {
            await chat.removeParticipants([userToBan.id._serialized]);
            msg.reply(`✅ ${userToBan.pushname || userToBan.number} a été banni du groupe !`);
        } catch (e) {
            msg.reply("Erreur lors du bannissement.");
        }
    }

    // Commande kick (admin seulement)
    if (msg.body.startsWith('*kick') && msg.isGroupMsg) {
        // même logique que *ban
        // ... (copie la logique de *ban ici si besoin)
    }

    // Commande promote (admin seulement)
    if (msg.body.startsWith('*promote') && msg.isGroupMsg) {
        if (!msg.hasQuotedMsg) return msg.reply("Réponds au message du membre à promouvoir avec *promote.");
        const chat = await msg.getChat();
        const sender = await msg.getContact();
        const isAdmin = chat.participants.find(p => p.id._serialized === sender.id._serialized && p.isAdmin);
        if (!isAdmin) return msg.reply("❌ Seuls les admins peuvent utiliser cette commande.");
        const quotedMsg = await msg.getQuotedMessage();
        const userToPromote = await quotedMsg.getContact();
        const botNumber = client.info.wid._serialized;
        const botIsAdmin = chat.participants.find(p => p.id._serialized === botNumber && p.isAdmin);
        if (!botIsAdmin) return msg.reply("❌ Je dois être admin pour promouvoir quelqu'un !");
        try {
            await chat.promoteParticipants([userToPromote.id._serialized]);
            msg.reply(`✅ ${userToPromote.pushname || userToPromote.number} est maintenant admin !`);
        } catch (e) {
            msg.reply("Erreur lors de la promotion.");
        }
    }

    // Commande demote (admin seulement)
    if (msg.body.startsWith('*demote') && msg.isGroupMsg) {
        if (!msg.hasQuotedMsg) return msg.reply("Réponds au message du membre à rétrograder avec *demote.");
        const chat = await msg.getChat();
        const sender = await msg.getContact();
        const isAdmin = chat.participants.find(p => p.id._serialized === sender.id._serialized && p.isAdmin);
        if (!isAdmin) return msg.reply("❌ Seuls les admins peuvent utiliser cette commande.");
        const quotedMsg = await msg.getQuotedMessage();
        const userToDemote = await quotedMsg.getContact();
        const botNumber = client.info.wid._serialized;
        const botIsAdmin = chat.participants.find(p => p.id._serialized === botNumber && p.isAdmin);
        if (!botIsAdmin) return msg.reply("❌ Je dois être admin pour rétrograder quelqu'un !");
        try {
            await chat.demoteParticipants([userToDemote.id._serialized]);
            msg.reply(`✅ ${userToDemote.pushname || userToDemote.number} n'est plus admin.`);
        } catch (e) {
            msg.reply("Erreur lors de la rétrogradation.");
        }
    }

    // Commande antilink (anti lien auto-ban)
    if (msg.body === '*antilink' && msg.isGroupMsg) {
        msg.reply('Fonction anti-lien activée (prototype) : tout lien partagé sera sanctionné.');
        // Ajoute la logique de détection des liens et de ban automatique ici !
    }
    if (msg.isGroupMsg && /(https?:\/\/[^\s]+)/.test(msg.body)) {
        // Prototype anti-lien : ban si un lien est détecté
        const chat = await msg.getChat();
        const botNumber = client.info.wid._serialized;
        const botIsAdmin = chat.participants.find(p => p.id._serialized === botNumber && p.isAdmin);
        if (botIsAdmin) {
            try {
                await chat.removeParticipants([msg.author]);
                msg.reply('Lien détecté : utilisateur banni (anti-lien).');
            } catch (e) {}
        }
    }

    // Commande sticker
    if (msg.body === '*sticker' && msg.hasMedia) {
        const media = await msg.downloadMedia();
        await client.sendMessage(msg.from, media, { sendMediaAsSticker: true });
    }

    // Commande toimage (sticker vers image)
    if (msg.body === '*toimage' && msg.hasQuotedMsg) {
        const quotedMsg = await msg.getQuotedMessage();
        if (quotedMsg.type === 'sticker') {
            const media = await quotedMsg.downloadMedia();
            client.sendMessage(msg.from, media, { caption: 'Voici ton image.' });
        } else {
            msg.reply('Réponds à un sticker avec *toimage !');
        }
    }

    // Commande ping
    if (msg.body === '*ping') {
        msg.reply('pong 🏓');
    }

    // Commande fun : hug
    if (msg.body === '*hug') {
        msg.reply('🤗 Un câlin virtuel pour toi !');
    }

    // Commande fun : kiss
    if (msg.body === '*kiss') {
        msg.reply('😘 Bisou envoyé !');
    }

    // Commande IA (démo)
    if (msg.body.startsWith('*ia')) {
        const question = msg.body.replace('*ia', '').trim();
        if (!question) return msg.reply('Envoie un texte après *ia !');
        // Réponse bidon, pour ajouter une vraie IA il faut une API externe
        msg.reply("🤖 [Démo IA] : Je suis une IA, mais je n'ai pas encore de cerveau relié !");
    }
});

// Serveur web pour Render
app.get('/', (req, res) => res.send('Bot WhatsApp en ligne !'));
app.listen(process.env.PORT || 3000);
