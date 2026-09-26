import express from 'express';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = parseInt(process.env.PORT || '3000', 10);

app.use(express.json({ limit: '15mb' }));

const apiKey = process.env.GEMINI_API_KEY || '';
const ai = new GoogleGenAI({
  apiKey: apiKey,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

// Fallback responses in case API is unavailable or quota is exceeded
function getSmartFallback(prompt: string, lang: string): string {
  const p = prompt.toLowerCase();
  const isAr = lang === 'ar';
  
  if (p.includes('wudu') || p.includes('وضوء') || p.includes('abluzion')) {
    if (isAr) {
      return `**صفة الوضوء الصحيحة كما وردت عن النبي ﷺ:**\n\n1. **النية** ومحلها القلب، ثم قول **بسم الله**.\n2. **غسل الكفين** ثلاث مرات.\n3. **المضمضة والاستنشاق** ثلاث مرات.\n4. **غسل الوجه** كاملاً ثلاث مرات من منابت الشعر إلى أسفل الذقن، ومن الأذن إلى الأذن.\n5. **غسل اليدين إلى المرفقين** ثلاث مرات (البدء باليمنى ثم اليسرى).\n6. **مسح الرأس** مرة واحدة مع الأذنين.\n7. **غسل الرجلين إلى الكعبين** ثلاث مرات.\n\n*الذكر المستحب بعد الوضوء:* «أشهد أن لا إله إلا الله وحده لا شريك له، وأشهد أن محمداً عبده ورسوله، اللهم اجعلني من التوابين واجعلني من المتطهرين».`;
    }
    return `**Guida al Wudu (Abluzione) secondo la Sunnah del Profeta ﷺ:**\n\n1. **Intenzione (Niyyah)** nel cuore e pronunciare *«Bismillah»*.\n2. **Lavare le mani** fino ai polsi 3 volte.\n3. **Sciacquare la bocca (Madmadah)** e **il naso (Istinshaq)** 3 volte.\n4. **Lavare il viso** 3 volte (dall'attaccatura dei capelli al mento e da orecchio a orecchio).\n5. **Lavare le braccia fino ai gomiti** 3 volte, iniziando dal braccio destro poi il sinistro.\n6. **Passare le mani bagnate sul capo** 1 volta (dalla fronte alla nuca e ritorno) e pulire l'interno ed esterno delle orecchie.\n7. **Lavare i piedi fino ai malleoli** 3 volte (prima il destro, poi il sinistro).\n\n*Du'a conclusiva:* «Ash-hadu alla ilaha illallah wahdahu la sharika lah, wa ash-hadu anna Muhammadan 'abduhu wa rasuluh. Allahumma ij'alni minat-tawwabin waj'alni minal-mutatahhirin».`;
  }

  if (p.includes('zakat') || p.includes('زكاة')) {
    if (isAr) {
      return `**أحكام زكاة المال:**\n\n- **المقدار الواجب:** 2.5% (ربع العشر) من مجموع المال المدخر.\n- **شروط الوجوب:**\n  1. بلوغ **النصاب** (ما يعادل قيمة 85 غراماً من الذهب الخالص عيار 24).\n  2. مرور **الحول الكامل** (سنة قمرية كاملة) على امتلاك النصاب دون أن ينقص عنه.\n- **مصارف الزكاة:** للفقراء والمساكين والمحتاجين كما بينتها الآية 60 من سورة التوبة. ولا تجوز على الأصول (الوالدين) ولا الفروع (الأبناء).`;
    }
    return `**Regole per il Calcolo della Zakat Al-Mal:**\n\n- **Quota dovuta:** 2.5% del patrimonio liquido posseduto.\n- **Condizioni di obbligatorietà:**\n  1. Il raggiungimento del **Nisab** (valore di circa 85g di oro puro o 595g di argento).\n  2. Il possesso del patrimonio per un anno lunare intero (circa 354 giorni) al di sopra della soglia.\n- **Beni inclusi:** Denaro contante, conti correnti, risparmi, oro/argento da investimento, azioni e merci commerciali.\n- *Nota:* La casa di residenza, l'auto per uso personale e i beni di prima necessità sono esenti da Zakat.`;
  }

  if (p.includes('dua') || p.includes('دعاء') || p.includes('supplic') || p.includes('شفاء') || p.includes('أدعية')) {
    if (isAr) {
      return `**من أعظم الأدعية النبوية المستجابة لراحة البال والشفاء:**\n\n1. **دعاء الشفاء:** «اللَّهُمَّ رَبَّ النَّاسِ، أَذْهِبِ البَأْسَ، اشْفِ أَنْتَ الشَّافِي، لا شِفَاءَ إِلا شِفَاؤُكَ، شِفَاءً لا يُغَادِرُ سَقَمًا» (رواه البخاري ومسلم).\n2. **دعاء تفريج الهم والكرب:** «لا إِلَهَ إِلا أَنْتَ سُبْحَانَكَ إِنِّي كُنْتُ مِنَ الظَّالِمِينَ» (دعوة ذي النون - سورة الأنبياء).\n3. **دعاء الطمأنينة والعافية:** «اللَّهُمَّ إِنِّي أَسْأَلُكَ العَفْوَ وَالعَافِيَةَ فِي الدُّنْيَا وَالآخِرَةِ، اللَّهُمَّ إِنِّي أَسْأَلُكَ العَفْوَ وَالعَافِيَةَ فِي دِينِي وَدُنْيَايَ وَأَهْلِي وَمَالِي».`;
    }
    return `**Suppliche (Du'a) autentiche della Sunnah per salute e serenità:**\n\n1. **Per la guarigione (dalla raccolta di Bukhari e Muslim):**\n   «Allahumma Rabba-n-nas, adh-hibil-ba's, ishfi anta ash-Shafi, la shifa'a illa shifa'uk, shifa'an la yughadiru saqama».\n   *(O Allah, Signore delle genti, rimuovi il male, guarisci Tu che sei il Guaritore, non v'è altra cura se non la Tua, una cura che non lascia malattia)*.\n\n2. **Per superare ansia, tristezza e difficoltà (Du'a di Yunus):**\n   «La ilaha illa Anta, Subhanaka, inni kuntu mina-z-zalimin».\n   *(Non v'è divinità all'infuori di Te, Gloria a Te, in verità sono stato tra gli ingiusti - Sura Al-Anbiya 87)*.\n\n3. **Per la protezione e la pace interiore:**\n   «Hasbiyallahu la ilaha illa Huwa, 'alayhi tawakkaltu wa Huwa Rabbul-'arshil-'azim».`;
  }

  if (p.includes('hadith') || p.includes('حديث') || p.includes('nawawi') || p.includes('النووية')) {
    if (isAr) {
      return `**من الأربعين النووية - الحديث الأول (الأعمال بالنيات):**\n\nعن أمير المؤمنين أبي حفص عمر بن الخطاب رضي الله عنه قال: سمعت رسول الله ﷺ يقول:\n«إِنَّمَا الأَعْمَالُ بِالنِّيَّاتِ، وَإِنَّمَا لِكُلِّ امْرِئٍ مَا نَوَى، فَمَنْ كَانَتْ هِجْرَتُهُ إِلَى اللَّهِ وَرَسُولِهِ فَهِجْرَتُهُ إِلَى اللَّهِ وَرَسُولِهِ، وَمَنْ كَانَتْ هِجْرَتُهُ لِدُنْيَا يُصِيبُهَا أَوِ امْرَأَةٍ يَنْكِحُهَا فَهِجْرَتُهُ إِلَى مَا هَاجَرَ إِلَيْهِ» (متفق عليه).\n\n**الفوائد العملية:**\n- الإخلاص لله تعالى هو أساس قبول جميع العبادات والأعمال.\n- العادات اليومية تتحول إلى عبادات عظيمة بالنية الصالحة.`;
    }
    return `**Dai 40 Hadith di Imam An-Nawawi - Hadith n. 1 (L'importanza dell'Intenzione):**\n\nDa 'Umar ibn Al-Khattab (che Allah sia compiaciuto di lui), il Messaggero di Allah ﷺ disse:\n«In verità le azioni dipendono dalle intenzioni (Niyyah) e a ciascuno spetta ciò che ha inteso. Chi compie l'emigrazione per Allah e il Suo Messaggero, la sua emigrazione è per Allah e il Suo Messaggero...» *(Riferito da Al-Bukhari e Muslim)*.\n\n**Insegnamento spirituale:**\n- La sincerità del cuore (*Ikhlas*) verso Allah è il fondamento di ogni atto di adorazione.\n- Anche le azioni quotidiane diventano atti premiati da Allah quando sono accompagnate da una buona intenzione.`;
  }

  if (p.includes('aya') || p.includes('آية') || p.includes('versetto') || p.includes('tadabbur') || p.includes('تدبر')) {
    if (isAr) {
      return `**تدبر قرآني - قوله تعالى:**\n﴿ فَإِنَّ مَعَ الْعُسْرِ يُسْرًا • إِنَّ مَعَ الْعُسْرِ يُسْرًا ﴾ *(سورة الشرح: 5-6)*\n\n**المعنى الروحي والفوائد:**\n- وعدٌ إلهي قاطع بأن الفرج والتيسير يصاحبان كل ضيق أو شدة.\n- قال ابن عباس رضي الله عنهما: «لن يغلب عسرٌ يُسرين»، لأن العسر ذُكر معرّفاً (فهو واحد) واليسر ذُكر منكّراً مرتين (فهو متعدد).\n- تدعو الآية المؤمن إلى الثقة بالله وحسن الظن به والصبر الجميل.`;
    }
    return `**Tadabbur Coranico - Sura Ash-Sharh (94:5-6):**\n﴿ فَإِنَّ مَعَ الْعُسْرِ يُسْرًا • إِنَّ مَعَ الْعُسْرِ يُسْرًا ﴾\n*«In verità, con la difficoltà c'è la facilità. In verità, con la difficoltà c'è la facilità.»*\n\n**Significato e riflessione spirituale:**\n- Allah usa la preposizione *"ma'a"* (con) e non *"ba'da"* (dopo): il sollievo accompagna già la prova stessa.\n- Nella grammatica araba, *"al-'usr"* (la difficoltà) è determinata e singola, mentre *"yusran"* (una facilità) è indeterminata e ripetuta due volte: come insegnavano i Compagni del Profeta ﷺ, *«una sola difficoltà non potrà mai sopraffare due facilità»*.`;
  }

  if (p.includes('mosque') || p.includes('moschea') || p.includes('مسجد') || p.includes('preghiera') || p.includes('صلاة')) {
    if (isAr) {
      return `**فضل صلاة الجماعة وآداب المسجد:**\n\n- قال رسول الله ﷺ: «صَلاةُ الجَمَاعَةِ تَفْضُلُ صَلاةَ الفَذِّ بِسَبْعٍ وَعِشْرِينَ دَرَجَةً» (متفق عليه).\n- **من آداب المسجد:**\n  1. التطهر والتطيب ولبس الثياب الحسنة.\n  2. الدخول بالرجل اليمنى وقول: «اللهم افتح لي أبواب رحمتك».\n  3. أداء ركعتي **تحية المسجد** قبل الجلوس.\n  4. الخشوع والسكينة وإغلاق الهاتف المحمول.`;
    }
    return `**Meriti della Preghiera in Congregazione e Adab della Moschea:**\n\n- Il Profeta Muhammad ﷺ ha detto: *«La preghiera in congregazione supera di ventisette gradi la preghiera compiuta da soli»* (Bukhari e Muslim).\n- **Buone maniere (Adab) in Moschea:**\n  1. Raggiungere la moschea in stato di purezza rituale (Wudu) e con abiti puliti.\n  2. Entrare con il piede destro recitando: *«Allahumma iftah li abwaba rahmatik»* (O Allah, aprimi le porte della Tua misericordia).\n  3. Pregare 2 Rak'at di saluto alla moschea (*Tahiyyat al-Masjid*) prima di sedersi.\n  4. Mantenere il silenzio, la concentrazione e silenziare il telefono.`;
  }

  if (isAr) {
    return `وعليكم السلام ورحمة الله وبركاته. أهلاً بك في المساعد الإسلامي الذكي لمسلم برو باستيا (A.C.I.A). نسأل الله أن يرزقنا وإياكم العلم النافع والعمل الصالح. يمكنك سؤالي بالصوت أو الكتابة عن تفسير الآيات، الأحاديث النبوية، أحكام الوضوء والصلاة، الزكاة، والأدعية اليومية.`;
  }
  return `Wa 'alaykum as-salam wa rahmatullahi wa barakatuh! Benvenuto nell'Assistente Islamico di Muslim Pro Bastia (A.C.I.A). Puoi chiedermi a voce o per iscritto spiegazioni sui versetti del Corano, Hadith, regole di Wudu e Salah, calcolo della Zakat e suppliche (Du'a).`;
}

app.post('/api/ai-chat', async (req, res) => {
  const { prompt, lang, context, messages, audioData, mimeType } = req.body;
  if ((!prompt || typeof prompt !== 'string') && !audioData && (!Array.isArray(messages) || messages.length === 0)) {
    return res.status(400).json({ error: 'Prompt o audio non valido' });
  }

  const isArabic = lang === 'ar';
  const systemInstruction = `Sei Gemini, l'intelligenza artificiale conversazionale multimodale di Google, integrata nell'applicazione Muslim Pro Bastia (Associazione Culturale Islamica A.C.I.A).
Puoi dialogare a voce (Gemini Live) o per iscritto, rispondere alle domande dell'utente, ascoltare e parlare in un unico flusso conversazionale.

Linee guida del tuo stile:
1. Parla e scrivi fluentemente e con calore nella lingua dell'utente: ${isArabic ? 'العربية الفصحى مع التشكيل والوضوح التام للآيات والأحاديث' : 'Italiano (chiaro, empatico e ben formattato)'}.
2. Sei un vero Gemini: intelligente, versatile, empatico, accurato ed esaustivo.
3. Possiedi una profonda e autentica conoscenza della religione islamica: Sacro Corano, Sunnah del Profeta Muhammad ﷺ (Bukhari, Muslim, Nawawi), Fiqh pratico (scuola malichita e consenso sunnita), orari di preghiera, Du'a, suppliche, etica e spiritualità.
4. Puoi anche rispondere a qualsiasi domanda generale di studio, scienza, benessere, riflessione personale e vita quotidiana.
5. Quando citi versetti o hadith, fornisci sempre il testo in arabo, il riferimento (Sura o fonte) e la traduzione/spiegazione chiara.
6. Le risposte devono essere scorrevoli, adatte sia ad essere lette su schermo che ascoltate ad alta voce con la sintesi vocale.
${context ? `Contesto applicazione: ${context}` : ''}`;

  let contents: any[] = [];

  if (Array.isArray(messages) && messages.length > 0) {
    const rawTurns: { role: 'user' | 'model'; text: string }[] = [];
    for (const m of messages) {
      const role = (m.role === 'model' || m.role === 'assistant') ? 'model' : 'user';
      const text = (typeof m.content === 'string' ? m.content : (m.text || '')).trim();
      if (text) {
        if (rawTurns.length > 0 && rawTurns[rawTurns.length - 1].role === role) {
          rawTurns[rawTurns.length - 1].text += `\n${text}`;
        } else {
          rawTurns.push({ role, text });
        }
      }
    }

    const p = (typeof prompt === 'string' ? prompt : '').trim();
    if (p) {
      if (rawTurns.length > 0 && rawTurns[rawTurns.length - 1].role === 'user') {
        if (!rawTurns[rawTurns.length - 1].text.includes(p)) {
          rawTurns[rawTurns.length - 1].text = p;
        }
      } else {
        rawTurns.push({ role: 'user', text: p });
      }
    }

    // Ensure first turn is from user
    while (rawTurns.length > 0 && rawTurns[0].role !== 'user') {
      rawTurns.shift();
    }

    // Ensure strictly alternating user and model
    for (const turn of rawTurns) {
      if (contents.length === 0 || contents[contents.length - 1].role !== turn.role) {
        contents.push({ role: turn.role, parts: [{ text: turn.text }] });
      } else {
        contents[contents.length - 1].parts[0].text += `\n${turn.text}`;
      }
    }
  }

  if (contents.length === 0) {
    const p = (typeof prompt === 'string' ? prompt : '').trim();
    if (p) {
      contents = [{ role: 'user', parts: [{ text: p }] }];
    } else {
      contents = [{ role: 'user', parts: [{ text: isArabic ? 'السلام عليكم ورحمة الله' : 'Salam alaykum, ciao!' }] }];
    }
  }

  // Attach inline audio data if provided
  if (audioData && typeof audioData === 'string') {
    const base64Clean = audioData.includes(',') ? audioData.split(',')[1] : audioData;
    const cleanMime = (typeof mimeType === 'string' && mimeType.trim()) ? mimeType.split(';')[0].trim() : 'audio/webm';
    if (base64Clean) {
      if (contents.length === 0 || contents[contents.length - 1].role !== 'user') {
        contents.push({
          role: 'user',
          parts: [
            { inlineData: { data: base64Clean, mimeType: cleanMime } },
            { text: isArabic ? 'استمع إلى هذه الرسالة الصوتية وأجب عليها.' : 'Ascolta questo messaggio vocale e rispondi.' },
          ],
        });
      } else {
        contents[contents.length - 1].parts.push({
          inlineData: { data: base64Clean, mimeType: cleanMime },
        });
      }
    }
  }

  let reply = '';
  const modelsToTry = [
    { name: 'gemini-flash-latest', timeout: 18000 },
    { name: 'gemini-3.1-flash-lite', timeout: 15000 },
    { name: 'gemini-3.8-flash', timeout: 18000 },
  ];

  for (const m of modelsToTry) {
    let succeeded = false;
    for (let attempt = 1; attempt <= 2; attempt++) {
      try {
        const generatePromise = ai.models.generateContent({
          model: m.name,
          contents: contents,
          config: {
            systemInstruction,
            temperature: 0.7,
          },
        });

        const timeoutPromise = new Promise<never>((_, reject) => 
          setTimeout(() => reject(new Error(`Timeout ${m.name}`)), m.timeout)
        );

        const response = await Promise.race([generatePromise, timeoutPromise]) as any;
        reply = response.text || '';
        if (reply) {
          succeeded = true;
          break;
        }
      } catch (err: any) {
        const errMsg = err?.message || String(err);
        const isQuotaExceeded = errMsg.includes('resource_exhausted') || errMsg.includes('quota') || errMsg.includes('RESOURCE_EXHAUSTED') || errMsg.includes('429');
        const is503 = errMsg.includes('503') || errMsg.includes('high demand') || errMsg.includes('UNAVAILABLE') || errMsg.includes('overloaded');
        
        if (isQuotaExceeded) {
          break;
        }

        if (is503 && attempt === 1) {
          await new Promise((resolve) => setTimeout(resolve, 250));
          continue;
        }
        break;
      }
    }

    if (succeeded && reply) {
      break;
    }
  }

  // If external API didn't respond or timed out, provide the smart fallback
  if (!reply) {
    const fallbackPrompt = (typeof prompt === 'string' && prompt.trim()) ? prompt.trim() : (contents[contents.length - 1]?.parts?.[0]?.text || '');
    reply = getSmartFallback(fallbackPrompt, lang || 'it');
  }

  return res.json({ text: reply });
});

function pcm16ToWavBase64(pcmBuffer: Buffer, sampleRate = 24000, numChannels = 1): string {
  if (pcmBuffer.length > 4 && pcmBuffer.toString('ascii', 0, 4) === 'RIFF') {
    return pcmBuffer.toString('base64');
  }
  const bitsPerSample = 16;
  const byteRate = (sampleRate * numChannels * bitsPerSample) / 8;
  const blockAlign = (numChannels * bitsPerSample) / 8;
  const dataSize = pcmBuffer.length;
  const header = Buffer.alloc(44);

  header.write('RIFF', 0);
  header.writeUInt32LE(36 + dataSize, 4);
  header.write('WAVE', 8);
  header.write('fmt ', 12);
  header.writeUInt32LE(16, 16);
  header.writeUInt16LE(1, 20);
  header.writeUInt16LE(numChannels, 22);
  header.writeUInt32LE(sampleRate, 24);
  header.writeUInt32LE(byteRate, 28);
  header.writeUInt16LE(blockAlign, 32);
  header.writeUInt16LE(bitsPerSample, 34);
  header.write('data', 36);
  header.writeUInt32LE(dataSize, 40);

  return Buffer.concat([header, pcmBuffer]).toString('base64');
}

app.post('/api/ai-tts', async (req, res) => {
  const { text } = req.body;
  if (!text || typeof text !== 'string' || !text.trim()) {
    return res.status(400).json({ error: 'Testo mancante per TTS' });
  }

  const cleanText = text.trim().slice(0, 900);
  // Usa SEMPRE una sola voce maschile multilingue ('Charon') per tutte le lingue (Italiano, Arabo, ecc.)
  const SINGLE_MALE_VOICE = 'Charon';
  const ttsModels = [
    'gemini-3.8-flash-lite-tts',
    'gemini-3.8-flash-tts',
    'gemini-2.5-flash-preview-tts',
  ];

  for (const modelName of ttsModels) {
    try {
      const ttsPromise = ai.models.generateContent({
        model: modelName,
        contents: [
          {
            role: 'user',
            parts: [
              {
                text: cleanText,
              },
            ],
          },
        ],
        config: {
          responseModalities: ['AUDIO'],
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: {
                voiceName: SINGLE_MALE_VOICE,
              },
            },
          },
        },
      });

      const timeoutPromise = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error(`Timeout TTS ${modelName}`)), 12000)
      );

      const response = (await Promise.race([ttsPromise, timeoutPromise])) as any;
      const inlineData = response?.candidates?.[0]?.content?.parts?.[0]?.inlineData;
      const base64Audio = inlineData?.data;
      const rawMime = inlineData?.mimeType || 'audio/pcm;rate=24000';

      if (base64Audio) {
        const rateMatch = rawMime.match(/rate=(\d+)/i);
        const sampleRate = rateMatch ? parseInt(rateMatch[1], 10) : 24000;
        const rawBuf = Buffer.from(base64Audio, 'base64');
        const wavBase64 = pcm16ToWavBase64(rawBuf, sampleRate, 1);
        return res.json({
          audioBase64: wavBase64,
          mimeType: 'audio/wav',
          voice: SINGLE_MALE_VOICE,
        });
      }
    } catch (err: any) {
      // Try next TTS model silently
    }
  }

  return res.status(200).json({ audioBase64: null });
});

async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(port, '0.0.0.0', () => {
    console.log(`Muslim Pro Server attivo su http://0.0.0.0:${port}`);
  });
}

startServer();
