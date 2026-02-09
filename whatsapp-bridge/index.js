const {
    default: makeWASocket,
    useMultiFileAuthState,
    DisconnectReason,
    fetchLatestBaileysVersion
} = require('@whiskeysockets/baileys');
const express = require('express');
const pino = require('pino');
const path = require('path');
const fs = require('fs');

const app = express();
app.use(express.json());

const PORT = 8001;
const logger = pino({ level: 'info' });

let sock;
let qrCodeData = null;
let connectionStatus = 'DISCONNECTED';

async function connectToWhatsApp() {
    const authPath = path.join(__dirname, 'auth_info_baileys');
    const { state, saveCreds } = await useMultiFileAuthState(authPath);
    const { version } = await fetchLatestBaileysVersion();

    sock = makeWASocket({
        version,
        logger,
        auth: state,
        printQRInTerminal: true
    });

    sock.ev.on('creds.update', saveCreds);

    sock.ev.on('connection.update', (update) => {
        const { connection, lastDisconnect, qr } = update;

        if (qr) {
            qrCodeData = qr;
            connectionStatus = 'AWAITING_SCAN';
        }

        if (connection === 'close') {
            const shouldReconnect = lastDisconnect.error?.output?.statusCode !== DisconnectReason.loggedOut;
            connectionStatus = 'DISCONNECTED';
            qrCodeData = null;
            console.log('Connection closed. Reconnecting:', shouldReconnect);
            if (shouldReconnect) {
                connectToWhatsApp();
            }
        } else if (connection === 'open') {
            connectionStatus = 'CONNECTED';
            qrCodeData = null;
            console.log('WhatsApp connected!');
        }
    });
}

app.get('/api/whatsapp/status', (req, res) => {
    res.json({ status: connectionStatus });
});

app.get('/api/whatsapp/qr', (req, res) => {
    if (qrCodeData) {
        res.json({ qr: qrCodeData });
    } else {
        res.status(404).json({ error: 'QR code not available' });
    }
});

app.get('/api/whatsapp/groups', async (req, res) => {
    if (!sock || connectionStatus !== 'CONNECTED') {
        return res.status(400).json({ error: 'WhatsApp not connected' });
    }
    try {
        console.log('Fetching all participating groups...');
        const groups = await sock.groupFetchAllParticipating();
        const list = Object.values(groups).map(g => ({
            id: g.id,
            subject: g.subject,
            participants: g.participants?.length || 0,
            isCommunity: !!g.isCommunity,
            isAnnouncement: !!g.isCommunityAnnouncement
        }));

        console.log(`Found ${list.length} groups:`);
        list.forEach(g => console.log(` - ${g.subject} (${g.id}) [Participants: ${g.participants}]`));

        res.json({ groups: list });
    } catch (error) {
        console.error('Failed to fetch groups:', error);
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/whatsapp/send', async (req, res) => {
    const { jid, message } = req.body;
    if (!sock || connectionStatus !== 'CONNECTED') {
        return res.status(400).json({ error: 'WhatsApp not connected' });
    }

    // Ensure jid has @g.us or @s.whatsapp.net
    let targetJid = jid;
    if (!targetJid.includes('@')) {
        targetJid = `${targetJid}@g.us`; // Default to group if no suffix
    }

    try {
        await sock.sendMessage(targetJid, { text: message });
        res.json({ success: true });
    } catch (error) {
        console.error('Failed to send message:', error);
        res.status(500).json({ error: error.message });
    }
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`WhatsApp Bridge listening on port ${PORT}`);
    connectToWhatsApp();
});
