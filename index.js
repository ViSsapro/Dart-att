const express = require('express');
const { makeWASocket, useMultiFileAuthState, DisconnectReason, delay, Browsers } = require('@whiskeysockets/baileys');
const pino = require('pino');
const config = require('./config');

const app = express();
const PORT = config.PORT || 5000;

app.use(express.static('public'));

let sock;

async function startBot() {
    // සටහන: Render හි './session' ෆෝල්ඩරය ඇති බවට සහතික කරගන්න
    const { state, saveCreds } = await useMultiFileAuthState('./session');
    
    sock = makeWASocket({
        auth: state,
        logger: pino({ level: 'silent' }),
        printQRInTerminal: false,
        browser: Browsers.macOS('Firefox')
    });

    sock.ev.on('creds.update', saveCreds);

    sock.ev.on('connection.update', (update) => {
        const { connection, lastDisconnect } = update;
        if (connection === 'close') {
            const shouldReconnect = lastDisconnect.error?.output?.statusCode !== DisconnectReason.loggedOut;
            if (shouldReconnect) startBot();
        } else if (connection === 'open') {
            console.log('✅ Bot Connected!');
        }
    });
}

// Pairing Code API
app.get('/code', async (req, res) => {
    try {
        let number = req.query.number;
        if (!number) return res.json({ code: "❗ Number එක ඇතුලත් කරන්න" });
        
        number = number.replace(/[^0-9]/g, '');
        if (!sock) return res.json({ code: "⏳ බොට් පටන් ගනිමින් පවතී, තත්පර කිහිපයකින් උත්සාහ කරන්න." });

        const code = await sock.requestPairingCode(number);
        return res.json({ code: code });
    } catch (e) {
        return res.json({ code: "❌ Error: " + e.message });
    }
});

// සර්වර් එක පටන් ගැනීම
app.listen(PORT, '0.0.0.0', async () => {
    console.log(`Server started on port ${PORT}`);
    await startBot();
});
