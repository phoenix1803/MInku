const { Client } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');

const client = new Client();

client.on('ready', () => {
    console.log('Client is ready!');
});

client.on('qr', qr => {
    qrcode.generate(qr, { small: true });
});

client.initialize();

// Function to handle participant mentions using IDs
async function getMentions(chat) {
    let mentions = [];

    // Iterate through all participants in the group chat
    for (let participant of chat.participants) {
        try {
            const contact = await client.getContactById(participant.id._serialized);
            if (typeof contact.id._serialized === 'string') {
                mentions.push(contact.id._serialized);  // Use the ID string instead of Contact object
            } else {
                console.warn(`Skipping invalid participant ID: ${participant.id._serialized}`);
            }
        } catch (error) {
            console.error(`Failed to fetch contact for participant: ${participant.id._serialized}`, error);
        }
    }
    return mentions;
}

// Listening to all incoming messages
client.on('message_create', async (message) => {
    try {
        if (message.body && typeof message.body === 'string') {
            console.log(message.body);

            // Check if the message is from a group
            const chat = await message.getChat();
            if (chat.isGroup) {
                const sender = await message.getContact();
                const isAdmin = chat.participants.some(participant => 
                    participant.id._serialized === sender.id._serialized && participant.isAdmin);

                // Tag all participants when "!tagall" is sent
                if (message.body.toLowerCase() === '!tagall') {
                    if (isAdmin) {
                        const mentions = await getMentions(chat);

                        if (mentions.length > 0) {
                            // Send message tagging all participants using their ID strings
                            await chat.sendMessage('Tagging everyone!', { mentions });
                        } else {
                            message.reply('No valid participants found to tag.');
                        }
                    } else {
                        message.reply('bas bhai rehene de');
                    }
                }

                // Handle the dictatorship command (admin-only mode)
                if (message.body === '!dictatorship') {
                    if (isAdmin) {
                        await chat.setMessagesAdminsOnly(true);
                        message.reply('Aye aye captain');
                    } else {
                        message.reply('Aura kam hai teri lol');
                    }
                }

                // Handle the democracy command (allow all messages)
                if (message.body === '!democracy') {
                    if (isAdmin) {
                        await chat.setMessagesAdminsOnly(false);
                        message.reply('Aye aye captain');
                    } else {
                        message.reply('Aura kam hai teri lol');
                    }
                }
            } else {
                message.reply(' ');
            }
        }
    } catch (error) {
        console.error('Error in message processing:', error.message);
    }
});
