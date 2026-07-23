import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Bot, User } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import PageLayout from '../components/layout/PageLayout';
import Button from '../components/ui/Button';
import { aiAPI } from '../services/api';
import { ChatMessage } from '../types';

const SUGGESTIONS = [
  'How do I create a food donation?',
  'How does volunteer assignment work?',
  'What is OTP verification?',
  'How are NGOs matched to donations?',
  'When do I get my donation certificate?',
  'How to update my profile?',
];

export default function AIChatPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: uuidv4(),
      role: 'assistant',
      content: 'Hello! I am FoodLink AI Assistant 🤖\n\nI can help you with:\n• Understanding how to use the platform\n• Tracking your donations\n• Volunteer assignment process\n• Certificate generation\n• Food safety guidance\n\nHow can I help you today?',
      timestamp: new Date(),
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const send = async (message: string) => {
    if (!message.trim() || loading) return;

    const userMsg: ChatMessage = {
      id: uuidv4(),
      role: 'user',
      content: message,
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const res = await aiAPI.chat(message);
      const aiMsg: ChatMessage = {
        id: uuidv4(),
        role: 'assistant',
        content: res.data.response,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, aiMsg]);
    } catch {
      const errMsg: ChatMessage = {
        id: uuidv4(),
        role: 'assistant',
        content: 'Sorry, I am having trouble connecting right now. Please check that the backend is running and try again.',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errMsg]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageLayout title="AI Assistant" subtitle="Ask me anything about the FoodLink AI platform.">
      <div className="max-w-3xl mx-auto flex flex-col" style={{ height: 'calc(100vh - 220px)' }}>
        {/* Messages */}
        <div className="glass-card flex-1 overflow-y-auto p-6 space-y-4 mb-4">
          <AnimatePresence initial={false}>
            {messages.map(msg => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
              >
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 ${
                  msg.role === 'assistant'
                    ? 'bg-green-500/20 border border-green-500/30'
                    : 'bg-blue-500/20 border border-blue-500/30'
                }`}>
                  {msg.role === 'assistant'
                    ? <Bot className="w-4 h-4 text-green-400" />
                    : <User className="w-4 h-4 text-blue-400" />
                  }
                </div>
                <div className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap ${
                  msg.role === 'assistant'
                    ? 'bg-white/5 border border-white/10 text-slate-200'
                    : 'bg-green-500/20 border border-green-500/30 text-white'
                }`}>
                  {msg.content}
                </div>
              </motion.div>
            ))}

            {loading && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-3">
                <div className="w-8 h-8 rounded-xl bg-green-500/20 border border-green-500/30 flex items-center justify-center">
                  <Bot className="w-4 h-4 text-green-400" />
                </div>
                <div className="bg-white/5 border border-white/10 rounded-2xl px-4 py-3">
                  <div className="flex gap-1">
                    {[0, 1, 2].map(i => (
                      <div
                        key={i}
                        className="w-2 h-2 bg-green-400 rounded-full animate-bounce"
                        style={{ animationDelay: `${i * 0.15}s` }}
                      />
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          <div ref={messagesEndRef} />
        </div>

        {/* Suggestions */}
        {messages.length <= 1 && (
          <div className="flex gap-2 flex-wrap mb-3">
            {SUGGESTIONS.map(s => (
              <button
                key={s}
                onClick={() => send(s)}
                className="px-3 py-1.5 text-xs rounded-full glass border border-white/10 text-slate-300 hover:text-white hover:border-green-500/30 transition-all"
              >
                {s}
              </button>
            ))}
          </div>
        )}

        {/* Input */}
        <div className="flex gap-3">
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                send(input);
              }
            }}
            placeholder="Ask anything about FoodLink AI..."
            className="input-dark flex-1"
            disabled={loading}
          />
          <Button
            onClick={() => send(input)}
            loading={loading}
            disabled={!input.trim()}
            className="px-4"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </PageLayout>
  );
}
