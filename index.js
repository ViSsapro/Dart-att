const express = require('express');
const { makeWASocket, useMultiFileAuthState, DisconnectReason, delay, Browsers } = require('@whiskeysockets/baileys');
const pino = require('pino');
const config = require('./config');

const app = express();
const PORT = config.PORT || 5000;

app.use(express.static('public'));

let sock;

async function startBot() {
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
            console.log('Connection closed. Reconnecting:', shouldReconnect);
            if (shouldReconnect) startBot();
        } 
        else if (connection === 'open') {
            console.log('✅ Bot Connected! WhatsApp Linked Successfully');
        }
    });
}

startBot();

// Pairing Code API
app.get('/code', async (req, res) => {
    try {
        let number = req.query.number;
        if (!number) return res.json({ code: "❗ Number එක දාන්න" });
        
        number = number.replace(/[^0-9]/g, '');
        if (number.length < 10) return res.json({ code: "❌ Invalid number" });

        if (!sock) return res.json({ code: "⏳ Bot loading... 5sec ඉන්න" });

        if (sock.authState.creds.registered) {
            return res.json({ code: "Already Linked ✅ Bot Active" });
        }

        await delay(3000);
        const code = await sock.requestPairingCode(number);
        const formattedCode = code?.match(/.{1,4}/g)?.join('-') || code;
        
        console.log(`📲 Code for ${number}: ${formattedCode}`);
        return res.json({ code: formattedCode });

    } catch (e) {
        console.error(e);
        return res.json({ code: "❌ Error: " + e.message });
    }
});

// Banner එක්ක server start වෙන ටික 👇
app.listen(PORT, '0.0.0.0', () => {
    console.log(`\n╔════════╗`);
    console.log(`║  thuhi-OFC Pairing Web Active  ║`);
    console.log(`╠════════╣`);
    console.log(`║  👉 http://localhost:${PORT}        ║`);
    console.log(`╚════════╝\n`);
});