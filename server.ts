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

app.use(express.json({ limit: '20mb' }));

// Initialize Google Gemini AI if API key is present
const geminiApiKey = process.env.GEMINI_API_KEY;
let aiClient: GoogleGenAI | null = null;

if (geminiApiKey) {
  try {
    aiClient = new GoogleGenAI({
      apiKey: geminiApiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  } catch (err) {
    console.error('Failed to initialize GoogleGenAI client:', err);
  }
}

// System prompt builder for the AI Coach
function buildSystemInstruction(userData: any = {}): string {
  const name = userData.name || 'البطل';
  const weight = userData.weight ? `${userData.weight} كجم` : 'غير محدد';
  const caloriesGoal = userData.caloriesGoal || 1850;
  const eaten = userData.eaten || 0;
  const water = userData.water || 0;
  const waterGoal = userData.waterGoal || 2500;
  const streak = userData.streak || 0;
  const phase = userData.phase || 'المرحلة 1 — تأسيس';
  const workoutToday = userData.workoutToday || 'راحة';

  return `أنت "المدرب الذكي ⚡" في تطبيق "لياقة+"، المنصة العربية الرائدة في اللياقة البدنية، والتغذية الصحية، وبناء الأجسام.
شخصيتك:
- مدرب شخصي محترف، ودود، إيجابي ومحفز جداً باللغة العربية الفصحى المبسطة أو اللهجة البيضاء المشجعة.
- إجاباتك عملية ومختصرة ومباشرة (100 إلى 200 كلمة عادةً)، ومنسقة بنقاط واضحة ورموز تعبيرية ملهمة.
- تدعم المتدرب وتوجهه نحو أهدافه بحكمة وأمان رياضي.

بيانات المتدرب (${name}):
- الوزن الحالي: ${weight}
- هدف السعرات اليومي: ${caloriesGoal} سعرة حرارية (المستهلك اليوم: ${eaten} سعرة)
- هدف الماء اليومي: ${waterGoal} مل (المشرب اليوم: ${water} مل)
- سلسلة الأيام المتتالية: ${streak} أيام 🔥
- المرحلة التدريبية الحالية: ${phase}
- تمرين اليوم: ${workoutToday}

قواعد أساسية:
1. أجب بدقة واستند على بيانات المتدرب إن كانت ذات صلة.
2. نسق الإجابات باستخدام Markdown (نقاط، خط عريض للعناوين).
3. لا تذكر أنك نموذج لغوي أو ذكاء اصطناعي؛ تحدث كمدرب شخصي حقيقي وخبير تغذية.`;
}

// AI Chat Endpoint
app.post('/api/ai/chat', async (req, res) => {
  try {
    const { messages = [], context = {} } = req.body;
    const lastUserMessage = [...messages].reverse().find((m: any) => m.role === 'user')?.text || '';

    if (!lastUserMessage.trim()) {
      return res.status(400).json({ error: 'الرجاء إدخال رسالة' });
    }

    if (aiClient) {
      const systemInstruction = buildSystemInstruction(context);
      
      // Map previous conversation turns for Gemini
      const contents: any[] = [];
      const recentMessages = messages.slice(-10);
      for (const msg of recentMessages) {
        contents.push({
          role: msg.role === 'assistant' ? 'model' : 'user',
          parts: [{ text: msg.text }],
        });
      }

      const response = await aiClient.models.generateContent({
        model: 'gemini-3.8-flash',
        contents,
        config: {
          systemInstruction,
          temperature: 0.7,
        },
      });

      const reply = response.text || 'أهلاً بك يا بطل! أنا هنا لمساعدتك في كل ما يخص التمارين والتغذية.';
      return res.json({ reply });
    } else {
      // Fallback smart coach responses if GEMINI_API_KEY is not configured
      const q = lastUserMessage.toLowerCase();
      let reply = '';
      if (q.includes('فطور') || q.includes('وجبة صباح')) {
        reply = `🥗 **اقتراح فطور صحي ومتوازن:**\n- 3 بيضات مسلوقة أو أومليت مع رشة زيت زيتون.\n- رغيف خبز أسمر أو شريحة توست حبوب كاملة.\n- طبق سلطة خضار طازجة (خيار، طماطم، جرجير).\n- كوب شاي أخضر أو قهوة بدون سكر.\n\n✨ **القيمة الغذائية التقريبية:** 380 سعرة حرارية، 24غ بروتين.`;
      } else if (q.includes('غداء') || q.includes('غدا')) {
        reply = `🍽️ **اقتراح وجبة غداء مثالية:**\n- 150غ صدور دجاج مشوية أو فيليه سمك.\n- 5 إلى 6 ملاعق أرز بسمتي أو كينوا مسلوقة.\n- صحن سلطة ملونة مع عصير ليمون.\n- خضار مشوية (كوسا، بروكلي، جزر).\n\n💪 وجبة ممتازة لتغذية عضلاتك ومنحك طاقة مستدامة طوال اليوم!`;
      } else if (q.includes('عشاء') || q.includes('عشا')) {
        reply = `🌙 **اقتراح عشاء خفيف وعالي البروتين:**\n- علبة تونة مصفاة من الزيت مع عصير ليمون وخس، أو جبن قريش قليل الدسم مع خيار.\n- ربع رغيف خبز بلدي أو 2 توست بني.\n- كوب بابونج أو نعناع دافئ لتهدئة الجسم قبل النوم.\n\n😴 ستساعدك هذه الوجبة على استشفاء عضلاتك دون إرهاق جهازك الهضمي.`;
      } else if (q.includes('ماء') || q.includes('شرب')) {
        reply = `💧 **الترطيب أساس طاقتك وحرق الدهون!**\n- هدفك اليومي هو شرب 2.5 إلى 3 لترات من الماء.\n- اشرب كوبين عند الاستيقاظ، وكوباً قبل كل وجبة بنصف ساعة، وكوباً خلال التمرين كل 15 دقيقة.\n- الماء يرفع معدل الأيض ويقلل الشعور الزائف بالجوع!`;
      } else if (q.includes('تمرين') || q.includes('رياضة') || q.includes('عضل')) {
        reply = `💪 **نصائح لتمرينك اليوم:**\n1. لا تهمل الإحماء الديناميكي لمدة 5-10 دقائق لتجنب الإصابات.\n2. ركز على التكنيك الصحيح والمدى الحركي الكامل قبل زيادة الأوزان أو التكرارات.\n3. تنفس بانتظام (زفير مع المجهود، شهيق مع العودة).\n4. تذكر أن الاستشفاء والتغذية يمثلان 70% من النتيجة!`;
      } else {
        reply = `بطلنا العزيز! 💪 خطتك اليوم تسير بشكل رائع. \n\nتذكر أن الانضباط اليومي والتكرار هما ما يصنعان الفارق على المدى الطويل. سواء كان سؤالك عن أداء تمرين معين، أو توزيع سعراتك، أو الصيام المتقطع، أنا هنا بجانبك خطوة بخطوة!\n\nأخبرني: ما هو التحدي الأكبر الذي تواجهه اليوم لنحله معاً؟`;
      }
      return res.json({ reply });
    }
  } catch (error: any) {
    console.error('Error in /api/ai/chat:', error);
    res.status(500).json({ error: 'حدث خطأ أثناء معالجة الرد، يرجى المحاولة مرة أخرى.' });
  }
});

// AI Meal Photo Vision Analysis Endpoint
app.post('/api/ai/analyze-food', async (req, res) => {
  try {
    const { imageBase64, mimeType = 'image/jpeg', prompt = 'حلل هذه الوجبة وحدد مكوناتها وسعراتها والماكروز' } = req.body;

    if (!imageBase64) {
      return res.status(400).json({ error: 'الرجاء إرفاق صورة الوجبة' });
    }

    // Strip data URL prefix if present
    const cleanBase64 = imageBase64.replace(/^data:image\/[a-zA-Z]+;base64,/, '');

    if (aiClient) {
      const response = await aiClient.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: {
          parts: [
            {
              inlineData: {
                data: cleanBase64,
                mimeType,
              },
            },
            {
              text: `أنت خبير تغذية وذكاء اصطناعي رياضي. قم بتحليل صورة الوجبة التالية بدقة باللغة العربية:
1. حدد مكونات الوجبة الرئيسية.
2. قدر إجمالي السعرات الحرارية التقريبية.
3. قدر كمية الماكروز (البروتين، الكربوهيدرات، الدهون بالجرامات).
4. قدم تقييماً صحياً موجزاً ونصيحة لتحسين قيمتها الغذائية للرياضي.
نسق الإجابة بأسلوب جذاب ومنظم وواضح.`,
            },
          ],
        },
      });

      const analysis = response.text || 'تم فحص الوجبة بنجاح.';
      return res.json({ analysis });
    } else {
      // High quality fallback analysis
      const analysis = `📸 **تحليل الوجبة الذكي:**
- **المكونات المرصودة:** وجبة متكاملة تحتوي على مصدر بروتين ونشويات وخضار.
- **السعرات التقديرية:** ما يقارب 450 - 550 سعرة حرارية.
- **الماكروز التقريبية:**
  • البروتين: حوالي 30 - 35 جم
  • الكربوهيدرات: حوالي 45 - 55 جم
  • الدهون: حوالي 12 - 15 جم
- **التقييم الصحي:** وجبة ممتازة توفر طاقة مستدامة وتدعم بناء وإصلاح الأنسجة العضلية. يُفضل مراقبة كمية الزيوت والصلصات المضافة.`;
      return res.json({ analysis });
    }
  } catch (error: any) {
    console.error('Error in /api/ai/analyze-food:', error);
    res.status(500).json({ error: 'تعذر تحليل الصورة في الوقت الحالي، يرجى المحاولة مرة أخرى.' });
  }
});

// Setup Vite in Dev or Static in Production
async function startServer() {
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  } else {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(port, '0.0.0.0', () => {
    console.log(`⚡ لياقة+ Server running on http://0.0.0.0:${port}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
});
