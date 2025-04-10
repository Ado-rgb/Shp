import fetch from 'node-fetch'

var handler = async (m, { conn, args, usedPrefix, command }) => {
    if (!args[0]) {
        throw m.reply(`*[ 🔗 ] ¡Por favor, ingresa un link de TikTok!* \n\n*[ 💡 ] Ejemplo:* ${usedPrefix + command} https://vm.tiktok.com/ZMkcuXwJv/`);
    }

    try {  
        await conn.reply(m.chat, "*[ ⏳ ] ¡Un momento! Estoy procesando tu video...*", m);  

        const tiktokData = await tiktokdl(args[0]);  

        if (!tiktokData) {  
            throw m.reply("¡Error en la API!");  
        }  

        const videoURL = tiktokData.data.play;  
        const videoURLWatermark = tiktokData.data.wmplay;  
        const infonya_gan = `*📖 Descripción:*

> ${tiktokData.data.title}
╭───❝⭒⭒⭒⭒⭒⭒⭒⭒⭒⭒⭒⭒❞───
┊ ✧ _Likes:_ ${tiktokData.data.digg_count}
┊ ✧ _Comentarios:_ ${tiktokData.data.comment_count}
┊ ✧ _Compartidas:_ ${tiktokData.data.share_count}
┊ ✧ _Vistas:_ ${tiktokData.data.play_count}
┊ ✧ _Descargas:_ ${tiktokData.data.download_count}
╰───❝⭒⭒⭒⭒⭒⭒⭒⭒⭒⭒⭒⭒❞───

👤 *Usuario:* 
⭑ ˚₊· ͟͟͞͞꒰➳ ${tiktokData.data.author.nickname || "Sin información"}
(https://www.tiktok.com/@${tiktokData.data.author.unique_id})

🎧 *Sonido:*  
⭑ ${tiktokData.data.music}`;

        const buttons = [
            {
                buttonId: `${usedPrefix}tiktokmp3 ${args[0]}`, // Este es el comando para descargar el audio
                buttonText: { displayText: "🔈 Enviar Audio 🎧" },
                type: 1
            }
        ];

        if (videoURL || videoURLWatermark) {  
            await conn.sendMessage(
                m.chat,
                {
                    video: { url: videoURL || videoURLWatermark },
                    caption: "*\`¡DESCARGADO DESDE TIKTOK!\`*" + `\n\n${infonya_gan}`,
                    buttons: buttons,
                    viewOnce: true
                },
                { quoted: m }
            );
        } else {  
            throw m.reply("*No se pudo descargar el video.*");  
        }  
    } catch (error1) {  
        conn.reply(m.chat, `Error: ${error1}`, m);  
    }
};

handler.help = ['tiktok']
handler.tags = ['descargas']
handler.command = /^(tiktok|tt|ttdl)$/i;

export default handler;

async function tiktokdl(url) {
    let tikwm = `https://www.tikwm.com/api/?url=${url}?hd=1`
    let response = await (await fetch(tikwm)).json()
    return response
}
