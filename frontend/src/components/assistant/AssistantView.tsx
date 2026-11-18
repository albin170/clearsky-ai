import React, { useState, useEffect, useRef } from 'react';
import { 
  Bot, Send, Mic, MicOff, Volume2, VolumeX, Download, 
  Sparkles, CheckCircle2, ShieldAlert, BookOpen, AlertTriangle 
} from 'lucide-react';
import { api } from '../../services/api';
import { useLocation } from '../../context/LocationContext';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import jsPDF from 'jspdf';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  structuredAdvice?: any;
  sourcesCited?: string[];
  disclaimer?: string;
  timestamp: string;
}

export const AssistantView: React.FC = () => {
  const { currentCity, currentLat, currentLon, airQuality } = useLocation();
  const { language, setLanguage } = useLanguage();
  const { user } = useAuth();

  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: language === 'ml'
        ? `നമസ്കാരം! ഞാൻ ക്ലിയർസ്കൈ എഐ (ClearSky AI). ${currentCity}-ലെ നിലവിലെ വായുമലിനീകരണം (AQI ${airQuality?.current.aqi_in || 160}) കണക്കിലെടുത്ത്, നിങ്ങളുടെ കുടുംബത്തിന് ആവശ്യമായ ആരോഗ്യ സംരക്ഷണ നിർദ്ദേശങ്ങളും വായുസഞ്ചാര മാർഗ്ഗങ്ങളും നൽകാൻ ഞാൻ തയ്യാറാണ്. എന്താണ് അറിയേണ്ടത്?`
        : `Hello! I am ClearSky AI. Grounded in live sensors from ${currentCity} (AQI ${airQuality?.current.aqi_in || 160}, ${airQuality?.current.category_in || 'Moderate'}), I can help you evaluate outdoor exercise safety, indoor ventilation, mask requirements, or generate custom family action routines. What would you like to explore today?`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [conversationId, setConversationId] = useState<number | undefined>(undefined);
  const [isListening, setIsListening] = useState(false);
  const [suggestedQuestions, setSuggestedQuestions] = useState<string[]>([]);
  const [activeSpeechId, setActiveSpeechId] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  useEffect(() => {
    async function loadQuestions() {
      try {
        const res = await api.getSuggestedQuestions(language);
        setSuggestedQuestions(res.questions);
      } catch (e) {
        console.error(e);
      }
    }
    loadQuestions();
  }, [language]);

  // Voice Input (Web Speech Recognition API)
  const handleToggleVoice = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('Speech Recognition is not supported by this browser. Please use Chrome or Edge.');
      return;
    }

    if (isListening) {
      setIsListening(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = language === 'ml' ? 'ml-IN' : 'en-US';
      recognition.interimResults = false;
      recognition.maxAlternatives = 1;

      recognition.onstart = () => setIsListening(true);
      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInputText(transcript);
        setIsListening(false);
      };
      recognition.onerror = () => setIsListening(false);
      recognition.onend = () => setIsListening(false);

      recognition.start();
    } catch (e) {
      setIsListening(false);
    }
  };

  // Text to Speech
  const handleTTS = (text: string, msgId: string) => {
    if (!('speechSynthesis' in window)) return;

    if (activeSpeechId === msgId) {
      window.speechSynthesis.cancel();
      setActiveSpeechId(null);
      return;
    }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text.replace(/#/g, '').replace(/\*/g, ''));
    utterance.rate = 0.95;
    utterance.onend = () => setActiveSpeechId(null);
    utterance.onerror = () => setActiveSpeechId(null);
    window.speechSynthesis.speak(utterance);
    setActiveSpeechId(msgId);
  };

  const handleSend = async (textToSend?: string) => {
    const query = textToSend || inputText;
    if (!query.trim() || isLoading) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText('');
    setIsLoading(true);

    try {
      const res = await api.sendChatMessage(
        query,
        conversationId,
        language,
        currentLat,
        currentLon,
        currentCity
      );

      if (res.conversation_id) {
        setConversationId(res.conversation_id);
      }

      const botMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: res.content,
        structuredAdvice: res.structured_advice,
        sourcesCited: res.sources_cited,
        disclaimer: res.disclaimer,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, botMsg]);
    } catch (e) {
      const errorMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'I encountered an error contacting the environmental reasoning engine. Please try again.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  // Download Action Plan PDF
  const handleDownloadPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(20);
    doc.setTextColor(16, 185, 129);
    doc.text('ClearSky AI - Daily Environmental Action Plan', 15, 20);

    doc.setFontSize(11);
    doc.setTextColor(100, 100, 100);
    doc.text(`Location: ${currentCity} | Date: ${new Date().toLocaleDateString()}`, 15, 28);
    doc.text(`Current AQI: ${airQuality?.current.aqi_in || 160} (${airQuality?.current.category_in || 'Moderate'})`, 15, 34);

    let y = 46;
    doc.setTextColor(40, 40, 40);

    messages.forEach((m) => {
      if (m.role === 'assistant') {
        doc.setFont('helvetica', 'bold');
        doc.text('ClearSky Assistant Guidance:', 15, y);
        y += 6;
        doc.setFont('helvetica', 'normal');
        const lines = doc.splitTextToSize(m.content.replace(/#/g, '').replace(/\*/g, ''), 180);
        doc.text(lines, 15, y);
        y += lines.length * 6 + 6;

        if (y > 260) {
          doc.addPage();
          y = 20;
        }
      }
    });

    doc.setFontSize(9);
    doc.setTextColor(180, 50, 50);
    const disclaimerLines = doc.splitTextToSize(
      'Medical Disclaimer: ClearSky AI recommendations are for exposure reduction and not medical diagnosis. Consult healthcare professionals for severe respiratory symptoms.',
      180
    );
    doc.text(disclaimerLines, 15, y + 4);

    doc.save(`ClearSky-Action-Plan-${currentCity.replace(/\s+/g, '_')}.pdf`);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] rounded-2xl bg-neutral-900/90 border border-neutral-800 shadow-2xl overflow-hidden animate-in fade-in duration-300">
      {/* Top Header */}
      <div className="p-4 px-6 border-b border-neutral-800 bg-neutral-950/80 flex items-center justify-between shrink-0">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 rounded-xl bg-teal-600/20 text-teal-300 border border-teal-500/30">
            <Bot className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="font-extrabold text-base text-white">ClearSky AI Assistant</h2>
              <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-teal-500/20 text-teal-300 border border-teal-500/30">
                Grounded Environmental RAG
              </span>
            </div>
            <p className="text-xs text-neutral-400">
              Live Context: {currentCity} • AQI {airQuality?.current.aqi_in} ({airQuality?.current.category_in})
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={handleDownloadPDF}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-xs font-bold text-neutral-200 border border-neutral-700 transition"
            title="Download conversation & daily action plan as PDF"
          >
            <Download className="w-3.5 h-3.5 text-teal-400" />
            <span className="hidden sm:inline">Export PDF</span>
          </button>
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">
        {messages.map((msg) => {
          const isUser = msg.role === 'user';
          return (
            <div
              key={msg.id}
              className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} space-y-1 max-w-3xl ${
                isUser ? 'ml-auto' : 'mr-auto'
              }`}
            >
              <div
                className={`p-4 rounded-2xl text-sm leading-relaxed ${
                  isUser
                    ? 'bg-teal-600 text-white rounded-br-none shadow-md shadow-teal-900/30'
                    : 'bg-neutral-950 border border-neutral-800 text-neutral-100 rounded-bl-none shadow-lg'
                }`}
              >
                {!isUser && (
                  <div className="flex items-center justify-between pb-2 mb-2 border-b border-neutral-800/80 text-xs text-teal-400 font-semibold">
                    <span className="flex items-center space-x-1.5">
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Environmental Intelligence Guidance</span>
                    </span>
                    <button
                      onClick={() => handleTTS(msg.content, msg.id)}
                      className="text-neutral-400 hover:text-white transition flex items-center space-x-1"
                      title="Read aloud"
                    >
                      {activeSpeechId === msg.id ? (
                        <VolumeX className="w-3.5 h-3.5 text-rose-400" />
                      ) : (
                        <Volume2 className="w-3.5 h-3.5 text-teal-400" />
                      )}
                    </button>
                  </div>
                )}

                <div className="whitespace-pre-line">{msg.content}</div>

                {/* Sources & Citations */}
                {!isUser && msg.sourcesCited && msg.sourcesCited.length > 0 && (
                  <div className="mt-3 pt-2.5 border-t border-neutral-800/80 text-[11px] text-neutral-400">
                    <span className="font-bold text-neutral-300 block mb-1">Citations & Authorities:</span>
                    <ul className="list-disc pl-4 space-y-0.5">
                      {msg.sourcesCited.map((s, idx) => (
                        <li key={idx}>{s}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Medical Disclaimer */}
                {!isUser && (
                  <div className="mt-2 text-[10px] text-neutral-500 italic flex items-center space-x-1">
                    <ShieldAlert className="w-3 h-3 text-neutral-500 shrink-0" />
                    <span>Non-medical advice. In acute respiratory emergencies, seek professional medical care.</span>
                  </div>
                )}
              </div>

              <span className="text-[10px] text-neutral-500 px-1">{msg.timestamp}</span>
            </div>
          );
        })}

        {isLoading && (
          <div className="flex items-center space-x-3 p-4 rounded-2xl bg-neutral-950 border border-neutral-800 max-w-md">
            <div className="w-4 h-4 rounded-full border-2 border-teal-500/20 border-t-teal-500 animate-spin" />
            <span className="text-xs text-neutral-400">Synthesizing meteorological physics and sensor data...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Questions Pills */}
      {suggestedQuestions.length > 0 && (
        <div className="px-4 py-2 border-t border-neutral-800 bg-neutral-950/60 flex items-center space-x-2 overflow-x-auto shrink-0">
          <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-500 shrink-0">
            Suggested:
          </span>
          {suggestedQuestions.slice(0, 3).map((q, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(q)}
              className="text-xs px-3 py-1 rounded-full bg-neutral-800 hover:bg-neutral-700 text-neutral-300 border border-neutral-700/80 shrink-0 transition"
            >
              {q}
            </button>
          ))}
        </div>
      )}

      {/* Input bar */}
      <div className="p-3 bg-neutral-950 border-t border-neutral-800 shrink-0">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="flex items-center space-x-2"
        >
          <button
            type="button"
            onClick={handleToggleVoice}
            className={`p-2.5 rounded-xl border transition ${
              isListening
                ? 'bg-red-600/20 border-red-500 text-red-400 animate-pulse'
                : 'bg-neutral-900 border-neutral-700 text-neutral-300 hover:text-white'
            }`}
            title="Toggle Voice Input (Speech Recognition)"
          >
            {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4 text-teal-400" />}
          </button>

          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder={
              language === 'ml'
                ? 'വായുമലിനീകരണ സുരക്ഷയെക്കുറിച്ച് ഇവിടെ ചോദിക്കുക...'
                : 'Ask about outdoor safety, window ventilation, air purifiers, or family routines...'
            }
            className="flex-1 px-4 py-2.5 rounded-xl bg-neutral-900 border border-neutral-700 text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-teal-500"
          />

          <button
            type="submit"
            disabled={!inputText.trim() || isLoading}
            className="p-2.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold transition shadow-md shadow-teal-900/30 disabled:opacity-40"
            title="Send Message"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
