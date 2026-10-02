import React, { useState, useRef, useEffect } from 'react';
import { AppState, AiChatMessage } from '../types/fitness';
import { compressImage } from '../utils/helpers';
import { Bot, Send, Mic, MicOff, Camera, Copy, Volume2, X, Sparkles } from 'lucide-react';

interface AiCoachTabProps {
  state: AppState;
  onUpdateState: (updater: (prev: AppState) => AppState) => void;
  onToast: (msg: string) => void;
  onAddXP: (xp: number) => void;
}

export const AiCoachTab: React.FC<AiCoachTabProps> = ({
  state,
  onUpdateState,
  onToast,
  onAddXP,
}) => {
  const [inputText, setInputText] = useState('');
  const [pendingImage, setPendingImage] = useState<string | null>(null);
  const [isSending, setIsSending] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  // Auto-scroll to latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [state.aiMessages, isSending]);

  // Quick suggestions
  const suggestions = [
    '🥗 اقتراح فطور صحي وسريع',
    '🍽️ غداء متوازن لبناء العضلات',
    '💧 كمية الماء المثالية لوزني',
    '💪 نصائح لتحسين تمرين اليوم',
    '🌙 عشاء خفيف بدون دهون',
    '⏱️ كيف أبدأ الصيام المتقطع؟',
  ];

  // Speech Recognition (Speech to Text)
  const toggleVoiceInput = () => {
    const SpeechRecognitionClass = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognitionClass) {
      onToast('⚠️ الإدخال الصوتي غير مدعوم في هذا المتصفح');
      return;
    }

    if (isRecording) {
      recognitionRef.current?.stop();
      setIsRecording(false);
      return;
    }

    try {
      const recognition = new SpeechRecognitionClass();
      recognition.lang = 'ar-SA';
      recognition.continuous = false;
      recognition.interimResults = true;

      recognition.onstart = () => {
        setIsRecording(true);
        onToast('🎤 جارٍ الاستماع لصوتك...');
      };

      recognition.onresult = (event: any) => {
        const transcript = Array.from(event.results)
          .map((r: any) => r[0].transcript)
          .join('');
        setInputText(transcript);
      };

      recognition.onerror = (e: any) => {
        console.error('Speech error:', e);
        setIsRecording(false);
      };

      recognition.onend = () => {
        setIsRecording(false);
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (err) {
      console.error(err);
      setIsRecording(false);
    }
  };

  // Text to Speech
  const speakMessage = (text: string) => {
    if (!('speechSynthesis' in window)) {
      onToast('⚠️ القراءة الصوتية غير مدعومة في متصفحك');
      return;
    }
    window.speechSynthesis.cancel();
    const cleanText = text.replace(/[*#_`]/g, '');
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = 'ar-SA';
    window.speechSynthesis.speak(utterance);
    onToast('🔊 جارٍ قراءة الرد بصوت واضح');
  };

  // Copy message
  const copyMessage = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      onToast('📋 تم نسخ الرد بنجاح');
    });
  };

  // Handle image upload for meal vision analysis
  const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const compressedDataUrl = await compressImage(file, 800, 0.75);
      setPendingImage(compressedDataUrl);
      onToast('📷 تم إرفاق الصورة، أرسلها لتحليل الوجبة');
    } catch (err) {
      console.error(err);
      onToast('⚠️ فشل معالجة الصورة');
    }
  };

  // Send message to backend Gemini AI
  const handleSendMessage = async (textToSend = inputText) => {
    const trimmed = textToSend.trim();
    if (!trimmed && !pendingImage) return;

    const userMessage: AiChatMessage = {
      role: 'user',
      text: trimmed || '(صورة وجبة للتحليل)',
      image: pendingImage || undefined,
      ts: Date.now(),
    };

    const currentImg = pendingImage;
    setPendingImage(null);
    setInputText('');

    onUpdateState(prev => ({
      ...prev,
      aiMessages: [...prev.aiMessages, userMessage],
    }));

    setIsSending(true);

    try {
      let assistantReply = '';

      if (currentImg) {
        // Call vision analysis endpoint
        const res = await fetch('/api/ai/analyze-food', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            imageBase64: currentImg,
            prompt: trimmed || 'حلل هذه الوجبة بدقة وحدد سعراتها والماكروز وقيمتها الغذائية للرياضي',
          }),
        });
        const data = await res.json();
        assistantReply = data.analysis || data.error || 'تم فحص الوجبة بنجاح.';
      } else {
        // Call chat endpoint
        const recentMessages = [...state.aiMessages, userMessage].map(m => ({
          role: m.role,
          text: m.text,
        }));

        const res = await fetch('/api/ai/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            messages: recentMessages,
            context: {
              name: state.user?.name,
              weight: state.weights.length ? state.weights[state.weights.length - 1].v : null,
              caloriesGoal: state.profile?.cal || 1850,
              waterGoal: state.profile?.water || 2500,
              water: state.water.ml,
              eaten: Object.values(state.eaten).reduce((a, b) => a + b, 0),
            },
          }),
        });
        const data = await res.json();
        assistantReply = data.reply || data.error || 'أهلاً بك يا بطل! أنا هنا لمساعدتك دائماً.';
      }

      const assistantMessage: AiChatMessage = {
        role: 'assistant',
        text: assistantReply,
        ts: Date.now(),
      };

      onUpdateState(prev => ({
        ...prev,
        aiMessages: [...prev.aiMessages, assistantMessage],
        totals: {
          ...prev.totals,
          xp: prev.totals.xp + 2,
        },
      }));
    } catch (err: any) {
      console.error(err);
      const errorMessage: AiChatMessage = {
        role: 'assistant',
        text: 'بطلنا الغالي، واجهنا بطئاً في الاتصال، تذكر دائماً: شرب الماء بانتظام والاستمرار في التمارين هما مفتاحك الذهبي للنجاح اليوم! 💪',
        ts: Date.now(),
      };

      onUpdateState(prev => ({
        ...prev,
        aiMessages: [...prev.aiMessages, errorMessage],
      }));
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="flex flex-col h-[560px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden">
      {/* Chat Header */}
      <div className="bg-gradient-to-r from-sky-500 to-teal-400 text-white p-3.5 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center">
            <Bot className="w-4 h-4 fill-white" />
          </div>
          <div>
            <h3 className="text-xs font-black">المدرب الذكي ⚡</h3>
            <span className="text-[10px] text-sky-100 flex items-center gap-1">
              <Sparkles className="w-3 h-3" />
              مدعوم بـ Google Gemini الذكي
            </span>
          </div>
        </div>

        <button
          onClick={() => {
            onUpdateState(prev => ({ ...prev, aiMessages: [] }));
            onToast('🧹 تم بدء محادثة جديدة');
          }}
          className="text-[11px] font-bold bg-white/20 hover:bg-white/30 px-2.5 py-1 rounded-lg backdrop-blur-sm cursor-pointer transition-colors"
        >
          محادثة جديدة
        </button>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-3.5 space-y-3 bg-slate-50/50 dark:bg-slate-950/40">
        {state.aiMessages.length === 0 ? (
          <div className="text-center py-10 px-4 text-slate-500 dark:text-slate-400 space-y-3">
            <div className="w-14 h-14 rounded-2xl bg-sky-100 dark:bg-sky-950/60 text-sky-500 flex items-center justify-center mx-auto text-2xl shadow-inner">
              🤖
            </div>
            <h4 className="text-sm font-bold text-slate-800 dark:text-slate-100">
              أهلاً بك في استشارة مدربك الذكي
            </h4>
            <p className="text-xs max-w-xs mx-auto leading-relaxed">
              اسألني عن أي تمرين، أو اطلب برنامجاً غذائياً، أو التقط صورة لوجبتك لمعرفة سعراتها وقيمتها الغذائية فوراً!
            </p>
          </div>
        ) : (
          state.aiMessages.map((msg, idx) => {
            const isUser = msg.role === 'user';
            return (
              <div
                key={idx}
                className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl p-3 text-xs leading-relaxed shadow-xs ${
                    isUser
                      ? 'bg-gradient-to-r from-sky-500 to-teal-400 text-white rounded-bl-sm'
                      : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 rounded-br-sm'
                  }`}
                >
                  {msg.image && (
                    <img
                      src={msg.image}
                      alt="صورة الوجبة"
                      className="max-h-40 rounded-xl mb-2 object-cover"
                    />
                  )}
                  <div className="whitespace-pre-line font-medium">
                    {msg.text}
                  </div>

                  {!isUser && (
                    <div className="flex items-center gap-2 mt-2 pt-2 border-t border-slate-100 dark:border-slate-700/60 text-slate-400 text-[10px]">
                      <button
                        onClick={() => copyMessage(msg.text)}
                        title="نسخ الرد"
                        className="hover:text-sky-500 flex items-center gap-0.5 cursor-pointer"
                      >
                        <Copy className="w-3 h-3" />
                        <span>نسخ</span>
                      </button>
                      <span>•</span>
                      <button
                        onClick={() => speakMessage(msg.text)}
                        title="الاستماع صوتياً"
                        className="hover:text-teal-500 flex items-center gap-0.5 cursor-pointer"
                      >
                        <Volume2 className="w-3 h-3" />
                        <span>استماع</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}

        {isSending && (
          <div className="flex items-center gap-1.5 p-3 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs w-28 text-slate-400">
            <span className="w-2 h-2 rounded-full bg-sky-500 animate-bounce" />
            <span className="w-2 h-2 rounded-full bg-teal-400 animate-bounce [animation-delay:0.2s]" />
            <span className="w-2 h-2 rounded-full bg-sky-500 animate-bounce [animation-delay:0.4s]" />
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-3 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-2">
        {/* Suggestion Chips */}
        <div className="flex gap-1.5 overflow-x-auto no-scrollbar pb-1">
          {suggestions.map((s, i) => (
            <button
              key={i}
              onClick={() => handleSendMessage(s)}
              className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-slate-100 dark:bg-slate-800 hover:bg-sky-50 dark:hover:bg-sky-950/40 text-slate-600 dark:text-slate-300 hover:text-sky-500 transition-colors shrink-0 cursor-pointer"
            >
              {s}
            </button>
          ))}
        </div>

        {/* Pending Image Preview */}
        {pendingImage && (
          <div className="relative inline-block">
            <img src={pendingImage} alt="مرفقة" className="w-14 h-14 rounded-lg object-cover border border-sky-400 shadow-sm" />
            <button
              onClick={() => setPendingImage(null)}
              className="absolute -top-1.5 -right-1.5 bg-red-500 text-white rounded-full p-0.5 shadow-xs cursor-pointer"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        )}

        {/* Input Controls */}
        <div className="flex items-center gap-2">
          {/* Camera Upload Button */}
          <label className="w-9 h-9 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-300 cursor-pointer transition-colors shrink-0">
            <input
              type="file"
              accept="image/*"
              onChange={handleImageSelect}
              className="hidden"
            />
            <Camera className="w-4 h-4" />
          </label>

          {/* Voice Input Button */}
          <button
            onClick={toggleVoiceInput}
            title={isRecording ? 'إيقاف التسجيل' : 'التحدث بالصوت'}
            className={`w-9 h-9 rounded-full flex items-center justify-center transition-all shrink-0 cursor-pointer ${
              isRecording
                ? 'bg-rose-500 text-white animate-pulse'
                : 'bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300'
            }`}
          >
            {isRecording ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
          </button>

          {/* Textarea Input */}
          <textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage();
              }
            }}
            placeholder="اسأل مدربك أو اطلب تحليل صورة..."
            rows={1}
            className="flex-1 p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-white text-xs font-bold focus:outline-none focus:ring-2 focus:ring-sky-500 resize-none max-h-20"
          />

          {/* Send Button */}
          <button
            onClick={() => handleSendMessage()}
            disabled={isSending || (!inputText.trim() && !pendingImage)}
            className="w-9 h-9 rounded-full bg-gradient-to-r from-sky-500 to-teal-400 text-white flex items-center justify-center shadow-md shadow-sky-500/20 hover:opacity-95 transition-opacity disabled:opacity-40 shrink-0 cursor-pointer"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
