const { default: makeWASocket, useMultiFileAuthState } = require('@whiskeysockets/baileys');

const GROQ_API_KEY = 'Gsk_ij3YOmm5nrqxfjNzVFgwWGdyb3FYXtVa9WKVgXjtkXXVGix4eRVT';

async function getAIResponse(prompt) {
    try {
        const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${GROQ_API_KEY}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: 'llama3-70b-8192',
                messages: [
                    { role: 'system', content: 'أنت مساعد ذكي وودود على واتساب، أجب على المستخدم باختصار وبأسلوب طبيعي باللغة العربية.' },
                    { role: 'user', content: prompt }
                ]
            })
        });
        const data = await response.json();
        if (data.choices && data.choices.length > 0) {
            return data.choices[0].message.content;
        } else {
            return 'عذراً، لم أستطع توليد رد في الوقت الحالي.';
        }
    } catch (error) {
        console.error('خطأ في الاتصال بالذكاء الاصطناعي:', error);
        return 'حدث خطأ تقني أثناء محاولة التحدث مع الذكاء الاصطناعي.';
    }
}

async function startBot() {
    const { state, saveCreds } = await useMultiFileAuthState('auth_info');

    const sock = makeWASocket({
        auth: state,
        printQRInTerminal: false
    });

    sock.ev.on('creds.update', saveCreds);

    sock.ev.on('messages.upsert', async ({ messages }) => {
        const m = messages[0];
        if (!m.message || m.key.fromMe) return;

        const sender = m.key.remoteJid;
        const text = m.message.conversation || m.message.extendedTextMessage?.text;

        if (text) {
            console.log(`رسالة واردة: ${text}`);
            const aiReply = await getAIResponse(text);
            await sock.sendMessage(sender, { text: aiReply });
            console.log('تم إرسال الرد بنجاح.');
        }
    });

    console.log('جاري تشغيل بوت الذكاء الاصطناعي...');
}

startBot();
