import React, { useState, useEffect, useRef } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { 
  Sparkles, 
  Send, 
  Trash2, 
  Plus, 
  ShieldAlert, 
  Loader2, 
  AlertCircle, 
  MessageSquare,
  HeartHandshake,
  Bot,
  User,
  ArrowRight
} from 'lucide-react';

const SUGGESTED_STARTERS = [
  "I've been feeling stressed.",
  "I want to talk about my day.",
  "Help me relax.",
  "I need some study-life balance tips."
];

export const ChatPage = () => {
  const { user } = useAuth();
  const [sessions, setSessions] = useState([]);
  const [activeSessionId, setActiveSessionId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [error, setError] = useState('');

  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  // Load chat starters and past sessions on mount
  useEffect(() => {
    const initializeChat = async () => {
      try {
        setLoadingHistory(true);
        const sessionsRes = await api.getChatSessions();
        setSessions(sessionsRes || []);

        if (sessionsRes && sessionsRes.length > 0) {
          const latestId = sessionsRes[0].id;
          setActiveSessionId(latestId);
          loadSession(latestId);
        }
      } catch (err) {
        console.warn('Chat init notice:', err.message);
      } finally {
        setLoadingHistory(false);
      }
    };
    initializeChat();
  }, []);

  const loadSession = async (sessionId) => {
    try {
      setActiveSessionId(sessionId);
      const sessionData = await api.getChatSession(sessionId);
      setMessages(sessionData.messages || []);
    } catch (err) {
      setError('Failed to load conversation history.');
    }
  };

  const handleNewChat = () => {
    setActiveSessionId(null);
    setMessages([]);
    setError('');
  };

  const handleDeleteSession = async (e, sessionId) => {
    e.stopPropagation();
    if (!window.confirm('Delete this conversation? This action cannot be undone.')) {
      return;
    }
    try {
      await api.deleteChatSession(sessionId);
      setSessions((prev) => prev.filter((s) => s.id !== sessionId));
      if (activeSessionId === sessionId) {
        handleNewChat();
      }
    } catch (err) {
      alert(err.message || 'Error deleting session.');
    }
  };

  const handleSend = async (textToSend) => {
    const msg = textToSend || inputMessage;
    if (!msg.trim() || loading) return;

    setError('');
    setInputMessage('');

    // Optimistically append user message to UI
    const tempUserMsg = {
      id: Date.now(),
      role: 'user',
      content: msg.trim(),
      created_at: new Date().toISOString()
    };
    setMessages((prev) => [...prev, tempUserMsg]);
    setLoading(true);

    try {
      const response = await api.sendMessage(msg.trim(), activeSessionId);
      
      // If new session was created on backend, update active session and sidebar list
      if (!activeSessionId) {
        setActiveSessionId(response.session_id);
        const updatedSessions = await api.getChatSessions();
        setSessions(updatedSessions);
      }

      setMessages((prev) => [...prev, response]);
    } catch (err) {
      setError(err.message || 'Unable to connect to MindBridge Assistant. Please ensure backend services are active.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-[calc(100vh-140px)] flex bg-[#FBFAF6] rounded-3xl border border-[#E5E8DF] shadow-[0_2px_12px_rgba(41,59,56,0.03)] overflow-hidden font-sans text-[#293B38]">
      
      {/* LEFT: SESSIONS SIDEBAR */}
      <div className="w-64 bg-[#F7F8F3] border-r border-[#E5E8DF] p-4 hidden md:flex md:flex-col shrink-0">
        <button
          onClick={handleNewChat}
          className="w-full py-2.5 px-4 rounded-full bg-[#294A40] hover:bg-[#1F3831] text-[#FBFAF6] font-medium text-xs flex items-center justify-center gap-2 shadow-sm transition-all mb-4"
        >
          <Plus className="w-4 h-4" />
          <span>New Conversation</span>
        </button>

        <div className="text-[10px] font-semibold text-[#78817D] uppercase tracking-wider px-2 mb-2">
          Past Reflections
        </div>

        <div className="flex-1 overflow-y-auto space-y-1 pr-1">
          {sessions.length > 0 ? (
            sessions.map((s) => (
              <div
                key={s.id}
                onClick={() => loadSession(s.id)}
                className={`group flex items-center justify-between p-2.5 rounded-2xl text-xs cursor-pointer transition-all ${
                  activeSessionId === s.id
                    ? 'bg-[#E9EDE2] text-[#294A40] font-semibold border border-[#DCE5D5]'
                    : 'text-[#78817D] hover:bg-[#E9EDE2]/50 hover:text-[#293B38]'
                }`}
              >
                <div className="flex items-center gap-2 min-w-0">
                  <MessageSquare className="w-3.5 h-3.5 shrink-0 text-[#294A40]" />
                  <span className="truncate">{s.title}</span>
                </div>
                <button
                  onClick={(e) => handleDeleteSession(e, s.id)}
                  title="Delete reflection"
                  className="opacity-0 group-hover:opacity-100 p-1 text-[#78817D] hover:text-rose-700 rounded-full transition-opacity"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))
          ) : (
            <div className="p-4 text-center text-xs text-[#969D97]">
              No previous chats recorded.
            </div>
          )}
        </div>

        {/* Safety Disclaimer in Sidebar */}
        <div className="pt-3 border-t border-[#E5E8DF] text-[10px] text-[#78817D] leading-tight">
          🔒 Private & Confidential. Your reflections remain isolated to your account.
        </div>
      </div>

      {/* RIGHT: CHAT INTERFACE */}
      <div className="flex-1 flex flex-col min-w-0 bg-[#FBFAF6]">
        
        {/* Top Chat Header */}
        <div className="px-6 py-3 border-b border-[#E5E8DF] flex items-center justify-between bg-[#FBFAF6]/80 backdrop-blur-sm">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-2xl bg-[#E9EDE2] border border-[#DCE5D5] text-[#294A40] flex items-center justify-center">
              <HeartHandshake className="w-4 h-4 text-[#294A40]" />
            </div>
            <div>
              <div className="font-semibold text-sm text-[#293B38] flex items-center gap-2">
                <span>MindBridge Companion</span>
                <span className="text-[10px] bg-[#E9EDE2] text-[#294A40] px-2 py-0.2 rounded-full font-medium border border-[#DCE5D5]">
                  AI Support
                </span>
              </div>
              <div className="text-[11px] text-[#78817D]">
                A quiet, supportive space to explore thoughts and grounding
              </div>
            </div>
          </div>

          <button
            onClick={handleNewChat}
            className="md:hidden px-3 py-1.5 rounded-full bg-[#E9EDE2] text-[#294A40] text-xs font-semibold"
          >
            New Chat
          </button>
        </div>

        {/* Messages Stream */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          
          {/* Welcome Card if no messages */}
          {messages.length === 0 && !loading && (
            <div className="max-w-lg mx-auto py-10 text-center space-y-6">
              <div className="w-12 h-12 rounded-3xl bg-[#E9EDE2] text-[#294A40] border border-[#DCE5D5] mx-auto flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-[#294A40]" />
              </div>
              
              <div className="space-y-1.5">
                <h3 className="font-semibold text-lg text-[#293B38]">
                  Hi, I'm here to listen. How are you feeling today?
                </h3>
                <p className="text-xs text-[#78817D] max-w-sm mx-auto leading-relaxed">
                  Feel free to share anything on your mind. Here are a few gentle ways we can begin:
                </p>
              </div>

              {/* Suggested conversation starters */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-left pt-2">
                {SUGGESTED_STARTERS.map((starter, i) => (
                  <button
                    key={i}
                    onClick={() => handleSend(starter)}
                    className="p-3 rounded-2xl bg-[#E9EDE2]/60 hover:bg-[#E9EDE2] border border-[#DCE5D5] text-xs text-[#293B38] hover:text-[#294A40] font-medium transition-all text-left flex items-center justify-between"
                  >
                    <span>{starter}</span>
                    <ArrowRight className="w-3.5 h-3.5 text-[#294A40] shrink-0 ml-1" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Render Messages */}
          {messages.map((m, idx) => {
            const isUser = m.role === 'user';
            const isCrisis = m.is_crisis || m.crisis_flag;

            return (
              <div
                key={m.id || idx}
                className={`flex gap-3 max-w-2xl ${isUser ? 'ml-auto flex-row-reverse' : 'mr-auto'}`}
              >
                {/* Avatar Icon */}
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 text-xs ${
                    isUser
                      ? 'bg-[#E9EDE2] text-[#294A40] border border-[#DCE5D5]'
                      : 'bg-[#DCE5D5] text-[#294A40]'
                  }`}
                >
                  {isUser ? <User className="w-3.5 h-3.5" /> : <Bot className="w-3.5 h-3.5" />}
                </div>

                {/* Message Content Bubble */}
                <div className="space-y-1.5 max-w-[85%]">
                  <div
                    className={`p-4 rounded-3xl text-xs sm:text-sm leading-relaxed ${
                      isUser
                        ? 'bg-[#FBFAF6] border border-[#E5E8DF] text-[#293B38] rounded-tr-none shadow-sm'
                        : isCrisis
                        ? 'bg-[#FBF4EE] border border-[#F3D8C8] text-[#293B38] rounded-tl-none'
                        : 'bg-[#E9EDE2] border border-[#DCE5D5] text-[#293B38] rounded-tl-none'
                    }`}
                  >
                    {isCrisis && (
                      <div className="flex items-center gap-1.5 font-semibold text-rose-800 text-xs mb-2 pb-2 border-b border-[#F3D8C8]">
                        <ShieldAlert className="w-4 h-4 text-rose-700" />
                        <span>Immediate Crisis Support Resources</span>
                      </div>
                    )}

                    <div className="whitespace-pre-wrap">{m.content}</div>

                    {/* Crisis Contact Links */}
                    {isCrisis && (
                      <div className="mt-3 pt-2 border-t border-[#F3D8C8] text-xs font-semibold text-[#294A40] flex flex-wrap gap-2">
                        <a href="tel:14416" className="underline">Tele-MANAS: 14416</a>
                        <span>•</span>
                        <a href="tel:988" className="underline">Lifeline: 988</a>
                      </div>
                    )}
                  </div>

                  {/* RAG Knowledge Source Attribution (if available) */}
                  {m.sources && m.sources.length > 0 && (
                    <div className="text-[10px] text-[#78817D] flex items-center gap-1 px-2">
                      <span>Referenced: {m.sources.map((s) => s.title || s).join(', ')}</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {/* Typing Indicator */}
          {loading && (
            <div className="flex gap-2.5 max-w-md mr-auto items-center">
              <div className="w-7 h-7 rounded-full bg-[#E9EDE2] text-[#294A40] flex items-center justify-center shrink-0">
                <Bot className="w-3.5 h-3.5" />
              </div>
              <div className="p-3.5 rounded-3xl bg-[#E9EDE2] border border-[#DCE5D5] text-xs text-[#78817D] flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#294A40] animate-bounce" />
                <span className="w-1.5 h-1.5 rounded-full bg-[#294A40] animate-bounce [animation-delay:0.2s]" />
                <span className="w-1.5 h-1.5 rounded-full bg-[#294A40] animate-bounce [animation-delay:0.4s]" />
                <span className="text-[11px] text-[#78817D] ml-1">Reflecting...</span>
              </div>
            </div>
          )}

          {error && (
            <div className="p-3 rounded-2xl bg-rose-50/60 border border-rose-200 text-rose-800 text-xs">
              {error}
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Minimal Chat Input Area */}
        <div className="p-3 sm:p-4 border-t border-[#E5E8DF] bg-[#FBFAF6]">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex items-center gap-2 max-w-3xl mx-auto"
          >
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="Type a thought or question..."
              disabled={loading}
              className="flex-1 px-4 py-2.5 text-xs sm:text-sm rounded-full bg-[#FBFAF6] border border-[#E5E8DF] text-[#293B38] placeholder:text-[#969D97] focus:outline-none focus:border-[#294A40] focus:ring-1 focus:ring-[#294A40]/20 transition-all"
            />
            <button
              type="submit"
              disabled={loading || !inputMessage.trim()}
              className="w-9 h-9 rounded-full bg-[#294A40] hover:bg-[#1F3831] text-[#FBFAF6] flex items-center justify-center shrink-0 disabled:opacity-40 transition-colors shadow-sm"
              aria-label="Send message"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>

          {/* Discreet Healthcare Note */}
          <div className="text-[10px] text-center text-[#969D97] mt-2">
            MindBridge AI Assistant offers supportive psychoeducation and is not a replacement for professional mental healthcare.
          </div>
        </div>

      </div>

    </div>
  );
};
