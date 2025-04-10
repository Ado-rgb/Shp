import { WAMessageStubType } from '@whiskeysockets/baileys';
import fetch from 'node-fetch';
import { prepareWAMessageMedia, generateWAMessageFromContent } from '@whiskeysockets/baileys';

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
    const pp = await conn.profilePictureUrl(who, 'image');
    img = await (await fetch(pp)).buffer();
  } catch {
    img = await (await fetch(defaultImage)).buffer();
  }

  const fkontak = {
    key: { fromMe: false, participant: '0@s.whatsapp.net', remoteJid: 'status@broadcast' },
    message: {
      contactMessage: {
        displayName: 'Bot',
        vcard: 'BEGIN:VCARD\nVERSION:3.0\nFN:Bot\nEND:VCARD'
      }
    }
  };

  let caption = '';
  if (m.messageStubType === WAMessageStubType.GROUP_PARTICIPANT_ADD) {
    caption = `╭─────────────╮\n  *¡NUEVO INTEGRANTE!*\n╰─────────────╯\n\n🌟 Bienvenido/a ${taguser}\n📍 Grupo: *${groupMetadata.subject}*\n\nEsperamos que la pases bien, comparte buena vibra y sé parte de esta pequeña gran familia.\n\n༄ ── 「 Powered by Moon Force Team 」`;
  } else if (
    m.messageStubType === WAMessageStubType.GROUP_PARTICIPANT_REMOVE || 
    m.messageStubType === WAMessageStubType.GROUP_PARTICIPANT_LEAVE
  ) {
    caption = `╭─────────────╮\n  *ADIÓS, GUERRERO*\n╰─────────────╯\n\n${taguser} ha dejado el grupo.\n\n✨ Siempre recordaremos tus memes (o no).\n¡Que la fuerza te acompañe fuera de *${groupMetadata.subject}*!\n\n༄ ── 「 Powered by Moon Force Team 」`;
  } else return;

  const message = await prepareWAMessageMedia({
    image: img,
    caption: caption,
    footer: 'Moon Force Team',
  }, { upload: conn.waUploadToServer });

  const buttons = [
    {
      buttonId: '.menu',
      buttonText: { displayText: '📜 Menú' },
      type: 1
    }
  ];

  const templateMessage = generateWAMessageFromContent(m.chat, {
    templateMessage: {
      hydratedTemplate: {
        imageMessage: message.imageMessage,
        hydratedFooterText: 'Moon Force Team',
        hydratedButtons: buttons
      }
    }
  }, { quoted: fkontak });

  await conn.relayWAMessage(templateMessage);
}
