const express = require('express');
const osc = require('osc');
const app = express();

// CONFIG: Set your Windows 10 PC IP and MA3 Port here
const MA3_IP = "192.168.1.50"; 
const MA3_PORT = 8000;

app.use(express.json());

const udpPort = new osc.UDPPort({
    localAddress: "0.0.0.0",
    localPort: 0,
    remoteAddress: MA3_IP,
    remotePort: MA3_PORT,
});
udpPort.open();

app.post('/command', (req, res) => {
    const rawVoice = req.body.text;
    
    // THE TRANSLATION LOGIC (Refine this as you go!)
    let syntax = rawVoice.toLowerCase()
        .replace("grab ", "Fixture ")
        .replace("make them ", "At ")
        .replace("kill ", "Off ");

    udpPort.send({
        address: "/cmd",
        args: [{ type: "s", value: syntax }]
    });

    console.log(`Voice: "${rawVoice}" -> MA3: "${syntax}"`);
    res.send({ status: "Sent to MA3", command: syntax });
});

app.listen(3000, '0.0.0.0', () => {
    console.log("Oats Bridge live on Port 3000. Listening for iPhone...");
});