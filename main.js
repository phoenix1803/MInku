const { Client } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const client = new Client();

client.once('ready', () => {
    console.log('Client is ready!');
});

client.on('qr', (qr) => {
    qrcode.generate(qr, { small: true });
});

client.on('auth_failure', (message) => {
    console.error('Authentication failed:', message);
});

client.on('disconnected', (reason) => {
    console.log('Client was logged out:', reason);
});

async function getMentions(chat) {
    let mentions = [];
    let text = '';

    for (let participant of chat.participants) {
        try {
            const contact = await client.getContactById(participant.id._serialized);
            mentions.push(contact); 
            text += `@${contact.id.user} `; 
        } catch (error) {
            console.error(`Failed to fetch contact for participant: ${participant.id._serialized}`, error);
        }
    }

    return { mentions, text };
}

function isAdmin(participants, senderId) {
    const normalizedSenderId = senderId.includes('@g.us') ? senderId.split('@')[0] : senderId;

    const senderParticipant = participants.find(participant => 
        participant.id._serialized.split('@')[0] === normalizedSenderId.split('@')[0]
    );
    console.log("Participant details:", senderParticipant);
    return senderParticipant && senderParticipant.isAdmin;
}

client.on('message', async (message) => {
    console.log('Received message:', message.body);

    try {
        const msg = message.body.toLowerCase();
        const senderId = message.author || message.from; 

        if (msg === '@all') {
            const chat = await message.getChat();

            if (chat.isGroup) {
                const participants = chat.participants;
                console.log('Group participants:', participants);

                const isSenderAdmin = isAdmin(participants, senderId);

                if (isSenderAdmin) {
                    const { mentions, text } = await getMentions(chat);

                    if (mentions.length > 0) {
                        await chat.sendMessage(text, { mentions });
                    } else {
                        await message.reply('No valid participants found to tag.');
                    }
                } else {
                    await message.reply('Aura kam hai teri lol');
                }
            } else {
                await message.reply('This is not a group chat.');
            }
        } 
        else if (msg === 'hello') {
            await message.reply('Ping-Pong!');
        } else if (msg === 'hamara cr kaun?') {
            await message.reply('pta nahi');
        } else if (msg === 'hi') {
            await message.reply('Chin Tapak Dam Dam!');
        } else if (msg === 'namaste') {
            await message.reply('namaste!');
        } else if (msg === 'cr') {
            await message.reply('pta nahi');
        } else if (msg === 'minku') {
            await message.reply('bol!');
        } else if (msg === '@minku') {
            await message.reply('bol!');
        } else if (msg === 'lol') {
            await message.reply('🤣');
        } else if (msg === '!stop!') {
            client.destroy();
        } else if (msg === 'who are you?') {
            await message.reply('Minku');
        } else if (msg === 'haha') {
            await message.reply('😂');
        } else if (msg === 'tu kha hai?') {
            await message.reply('pichhe');
        } else if (msg === 'konsi class?') {
            await message.reply('407');
        } else if (msg === 'piche kaha?') {
            await message.reply('piche!');
        } else if (msg === 'minku how are you') {
            await message.reply('fully charged up!');
        } else if (msg === 'captain') {
            await message.reply('Shankul!');
        }
        else if (msg === '!dictatorship') {
            const chat = await message.getChat();

            if (chat.isGroup) {
                const participants = chat.participants;
                const isSenderAdmin = isAdmin(participants, senderId);

                if (isSenderAdmin) {
                    await chat.setMessagesAdminsOnly(true);
                    await message.reply('Aye aye captain');
                } else {
                    await message.reply('Bas bhai rehene de');
                }
            }
        } else if (msg === '!democracy') {
            const chat = await message.getChat();

            if (chat.isGroup) {
                const participants = chat.participants;
                const isSenderAdmin = isAdmin(participants, senderId);

                if (isSenderAdmin) {
                    await chat.setMessagesAdminsOnly(false);
                    await message.reply('Aye aye captain');
                } else {
                    await message.reply('Bas bhai rehene de.');
                }
            }
        }

    } catch (error) {
        console.error('Error in message processing:', error.message);
    }
});

client.initialize();

