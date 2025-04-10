import { WAMessageStubType } from '@whiskeysockets/baileys'
import fetch from 'node-fetch'

export async function before(m, { conn, participants, groupMetadata }) {
  if (!m.messageStubType || !m.isGroup) return;

  const chat = global.db.data.chats[m.chat] || {};
  if (!chat.welcome) return;

  const who = m.messageStubParameters?.[0];
  if (!who) return;

  const taguser = `@${who.split('@')[0]}`;
  const defaultImage = 'https://files.catbox.moe/dgvj76.jpg';

  let img;
  try {
    let pp = await conn.profilePictureUrl(who, 'image');
    img = await (await fetch(pp)).buffer();
  } catch {
    img = await (await fetch(defaultImage)).buffer();
  }

  const fkontak = {
    key: { fromMe: false, participant: "0@s.whatsapp.net", remoteJid: "status@broadcast" },
    message: { contactMessage: { displayName: "Bot", vcard: "BEGIN:VCARD\nVERSION:3.0\nFN:Bot\nEND:VCARD" }}
  };

  if (m.messageStubType === WAMessageStubType.GROUP_PARTICIPANT_ADD) {
    const bienvenida = `╭─────────────╮\n  *¡NUEVO INTEGRANTE!*\n╰─────────────╯\n\n🌟 Bienvenido/a ${taguser}\n📍 Grupo: *${groupMetadata.subject}*\n\nEsperamos que la pases bien, comparte buena vibra y sé parte de esta pequeña gran familia.\n\n༄ ── 「 Powered by Moon Force Team 」`;

    await conn.sendMessage(m.chat, {
      image: img,
      caption: bienvenida,
      mentions: [who],
      buttons: [
        { buttonId: '.menu', buttonText: { displayText: '📜 Menú' }, type: 1 }
      ]
    }, { quoted: fkontak });

  } else if (
    m.messageStubType === WAMessageStubType.GROUP_PARTICIPANT_REMOVE || 
    m.messageStubType === WAMessageStubType.GROUP_PARTICIPANT_LEAVE
  ) {
    const bye = `╭─────────────╮\n  *ADIÓS, GUERRERO*\n╰─────────────╯\n\n${taguser} ha dejado el grupo.\n\n✨ Siempre recordaremos tus memes (o no).\n¡Que la fuerza te acompañe fuera de *${groupMetadata.subject}*!\n\n༄ ── 「 Powered by Moon Force Team 」`;

    await conn.sendMessage(m.chat, {
      image: img,
      caption: bye,
      mentions: [who],
      buttons: [
        { buttonId: '.menu', buttonText: { displayText: '📜 Menú' }, type: 1 }
      ]
    }, { quoted: fkontak });
  }

  return true;
}
