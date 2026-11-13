import React, { useEffect, useState, useRef } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { assistantService } from '../../services/assistantService';
import { PageContainer } from '../../components/common/PageContainer';
import { PageHeader } from '../../components/common/PageHeader';
import { LoadingState } from '../../components/common/LoadingState';
import { SUPPORTED_LANGUAGES } from '../../constants/agriculturalData.js';
import {
  BotMessageSquare,
  Send,
  Plus,
  Trash2,
  Sparkles,
  User,
  AlertTriangle,
  CheckCircle2,
  HelpCircle,
  MessageSquare,
  ShieldAlert,
  Languages
} from 'lucide-react';

const SUGGESTED_QUESTIONS = [
  'Why are my plant leaves turning yellow?',
  'Which crop is best suited for my soil this season?',
  'How do I prepare organic Neem spray at home?',
  'What are the signs of moisture stress in vegetables?',
  'How can I improve soil organic carbon naturally?'
];

export const AiAssistant = () => {
  const { profile } = useAuth();

  const [conversations, setConversations] = useState([]);
  const [activeConversationId, setActiveConversationId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState(profile?.preferred_language || 'en');
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [sending, setSending] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);

  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, sending]);

  // Load conversations on mount
  useEffect(() => {
    const loadConversations = async () => {
      try {
        const convs = await assistantService.getConversations();
        setConversations(convs || []);
        if (convs && convs.length > 0) {
          setActiveConversationId(convs[0].id);
        }
      } catch (err) {
        console.warn('Conversations load note:', err.message);
      }
    };
    loadConversations();
  }, []);

  // Load messages whenever active conversation changes
  useEffect(() => {
    if (!activeConversationId) {
      setMessages([]);
      return;
    }

    const loadMessages = async () => {
      try {
        setLoadingMessages(true);
        const msgs = await assistantService.getMessages(activeConversationId);
        setMessages(msgs || []);
      } catch (err) {
        console.error('Failed to load messages:', err);
      } finally {
        setLoadingMessages(false);
      }
    };

    loadMessages();
  }, [activeConversationId]);

  const handleStartNewChat = () => {
    setActiveConversationId(null);
    setMessages([]);
    setInputMessage('');
    setErrorMsg(null);
  };

  const handleDeleteConversation = async (e, convId) => {
    e.stopPropagation();
    try {
      await assistantService.deleteConversation(convId);
      const remaining = conversations.filter(c => c.id !== convId);
      setConversations(remaining);
      if (activeConversationId === convId) {
        if (remaining.length > 0) {
          setActiveConversationId(remaining[0].id);
        } else {
          handleStartNewChat();
        }
      }
    } catch (err) {
      console.error('Failed to delete conversation:', err);
    }
  };

  const handleSendMessage = async (textToSend) => {
    const query = (textToSend || inputMessage).trim();
    if (!query || sending) return;

    setErrorMsg(null);
    setInputMessage('');

    // Optimistically append user message
    const tempUserMsg = {
      id: `temp-${Date.now()}`,
      role: 'user',
      content: query,
      created_at: new Date().toISOString()
    };
    setMessages(prev => [...prev, tempUserMsg]);
    setSending(true);

    try {
      const payload = {
        message: query,
        conversation_id: activeConversationId,
        preferred_language: selectedLanguage,
        crop_context: profile?.primary_crops?.[0] || undefined,
        location_context: profile?.district ? `${profile.district}, ${profile.state}` : undefined
      };

      const result = await assistantService.sendMessage(payload);

      if (!activeConversationId && result.conversation_id) {
        setActiveConversationId(result.conversation_id);
        setConversations(prev => [{ id: result.conversation_id, title: query.substring(0, 35) }, ...prev]);
      }

      setMessages(prev => [...prev, result.message]);
    } catch (err) {
      setErrorMsg(err.message || 'Failed to receive AI assistant guidance.');
    } finally {
      setSending(false);
    }
  };

  return (
    <PageContainer>
      <PageHeader
        title="AgriSmart AI Assistant"
        subtitle="24/7 agricultural reasoning, plant doctor queries, and personalized crop management guidance"
        badge={
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-purple-50 text-purple-800 border border-purple-200">
            <Sparkles className="w-3.5 h-3.5 text-purple-600" />
            Gemini Multilingual Model
          </span>
        }
        action={
          <div className="flex items-center gap-2 bg-white border border-surface-border px-3 py-1.5 rounded-xl shadow-xs">
            <Languages className="w-4 h-4 text-text-muted" />
            <select
              value={selectedLanguage}
              onChange={(e) => setSelectedLanguage(e.target.value)}
              className="text-xs font-semibold text-text-main bg-transparent outline-none cursor-pointer"
            >
              {SUPPORTED_LANGUAGES.map(lang => (
                <option key={lang.code} value={lang.code}>{lang.name}</option>
              ))}
            </select>
          </div>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-[640px]">
        {/* Left Drawer: Conversation List (4 cols) */}
        <div className="lg:col-span-4 bg-white rounded-3xl border border-surface-border p-4 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-surface-border">
              <h3 className="text-xs font-bold text-text-main uppercase tracking-wider">
                Conversations
              </h3>
              <button
                onClick={handleStartNewChat}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold text-white bg-agri-700 hover:bg-agri-800 transition-colors shadow-xs"
              >
                <Plus className="w-3.5 h-3.5" />
                New Chat
              </button>
            </div>

            <div className="overflow-y-auto max-h-[480px] space-y-1">
              {conversations.length > 0 ? (
                conversations.map((conv) => (
                  <div
                    key={conv.id}
                    onClick={() => setActiveConversationId(conv.id)}
                    className={`group flex items-center justify-between p-3 rounded-xl text-xs font-medium cursor-pointer transition-all ${
                      activeConversationId === conv.id
                        ? 'bg-agri-100 text-agri-950 font-bold shadow-xs'
                        : 'text-text-muted hover:text-text-main hover:bg-surface-hover'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 truncate">
                      <MessageSquare className="w-4 h-4 shrink-0 text-text-light group-hover:text-agri-700" />
                      <span className="truncate">{conv.title || 'Farming Consultation'}</span>
                    </div>
                    <button
                      type="button"
                      onClick={(e) => handleDeleteConversation(e, conv.id)}
                      className="opacity-0 group-hover:opacity-100 p-1 text-text-light hover:text-red-600 transition-opacity"
                      title="Delete chat"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))
              ) : (
                <div className="text-center py-12 text-xs text-text-muted">
                  <p>No previous conversations.</p>
                  <p className="mt-1 text-[11px]">Start a new conversation to ask farming questions.</p>
                </div>
              )}
            </div>
          </div>

          {/* Context pill */}
          <div className="p-3 bg-agri-50 rounded-2xl border border-agri-200 mt-4 text-[11px] text-agri-900">
            <p className="font-bold mb-0.5">🌾 Context Synced</p>
            <p className="text-agri-700 truncate">
              {profile?.district || 'Location'}, {profile?.state || 'State'} • {profile?.soil_type || 'Soil'}
            </p>
          </div>
        </div>

        {/* Right Chat Area (8 cols) */}
        <div className="lg:col-span-8 bg-white rounded-3xl border border-surface-border shadow-xs flex flex-col overflow-hidden">
          {/* Chat Messages Stream */}
          <div className="flex-1 p-6 overflow-y-auto space-y-4 max-h-[520px]">
            {loadingMessages ? (
              <LoadingState message="Loading conversation messages..." />
            ) : messages.length === 0 ? (
              <div className="text-center py-12 max-w-md mx-auto space-y-4">
                <div className="w-14 h-14 rounded-2xl bg-agri-100 text-agri-800 mx-auto flex items-center justify-center shadow-sm">
                  <BotMessageSquare className="w-7 h-7" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-text-main">How can AgriSmart AI assist you today?</h3>
                  <p className="text-xs text-text-muted mt-1 leading-relaxed">
                    Ask questions about crop diseases, pest management, weather precautions, or soil fertility.
                  </p>
                </div>

                {/* Suggested prompt chips */}
                <div className="pt-4 flex flex-col gap-2 text-left">
                  <p className="text-[11px] font-bold text-text-light uppercase tracking-wider">Suggested Inquiries:</p>
                  {SUGGESTED_QUESTIONS.map((q, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSendMessage(q)}
                      className="p-2.5 rounded-xl bg-surface-bg hover:bg-agri-50 border border-surface-border text-xs text-text-main text-left transition-colors flex items-center justify-between"
                    >
                      <span>{q}</span>
                      <Sparkles className="w-3.5 h-3.5 text-agri-600 shrink-0" />
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              messages.map((msg, idx) => {
                const isUser = msg.role === 'user';
                const meta = msg.metadata;

                return (
                  <div
                    key={msg.id || idx}
                    className={`flex items-start gap-3 ${isUser ? 'flex-row-reverse' : ''}`}
                  >
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-xs font-bold ${
                        isUser
                          ? 'bg-agri-700 text-white'
                          : 'bg-agri-100 text-agri-800 border border-agri-200'
                      }`}
                    >
                      {isUser ? <User className="w-4 h-4" /> : <BotMessageSquare className="w-4 h-4" />}
                    </div>

                    <div
                      className={`max-w-[85%] rounded-3xl p-4 text-xs leading-relaxed ${
                        isUser
                          ? 'bg-agri-700 text-white shadow-xs'
                          : 'bg-surface-bg border border-surface-border text-text-main space-y-3'
                      }`}
                    >
                      {/* Main answer text */}
                      <p className="whitespace-pre-wrap">{msg.content}</p>

                      {/* Structured metadata if assistant response */}
                      {!isUser && meta && (
                        <div className="pt-2 border-t border-surface-border/80 space-y-2.5">
                          {meta.key_points && meta.key_points.length > 0 && (
                            <div>
                              <p className="font-bold text-agri-900 mb-1">Key Points:</p>
                              <ul className="list-disc list-inside text-text-muted space-y-0.5">
                                {meta.key_points.map((kp, kpi) => (
                                  <li key={kpi}>{kp}</li>
                                ))}
                              </ul>
                            </div>
                          )}

                          {meta.recommended_actions && meta.recommended_actions.length > 0 && (
                            <div>
                              <p className="font-bold text-emerald-900 mb-1 flex items-center gap-1">
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                                Recommended Action:
                              </p>
                              <ul className="list-disc list-inside text-text-muted space-y-0.5">
                                {meta.recommended_actions.map((act, acti) => (
                                  <li key={acti}>{act}</li>
                                ))}
                              </ul>
                            </div>
                          )}

                          {meta.warnings && meta.warnings.length > 0 && (
                            <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-950">
                              <p className="font-bold flex items-center gap-1 mb-0.5">
                                <AlertTriangle className="w-3.5 h-3.5 text-amber-600" /> Caution:
                              </p>
                              <p className="text-[11px] text-amber-900">{meta.warnings.join(' • ')}</p>
                            </div>
                          )}

                          {meta.follow_up_question && (
                            <button
                              onClick={() => handleSendMessage(meta.follow_up_question)}
                              className="mt-2 inline-flex items-center gap-1 text-[11px] font-semibold text-agri-700 hover:underline cursor-pointer"
                            >
                              💡 Follow-up: {meta.follow_up_question}
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            )}

            {sending && (
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-agri-100 text-agri-800 flex items-center justify-center text-xs">
                  <BotMessageSquare className="w-4 h-4 animate-spin" />
                </div>
                <div className="bg-surface-bg p-3.5 rounded-2xl border border-surface-border text-xs text-text-muted animate-pulse">
                  AgriSmart AI is synthesizing agricultural reasoning...
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {errorMsg && (
            <div className="mx-6 mb-2 p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-800 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
              {errorMsg}
            </div>
          )}

          {/* Chat Input Bar */}
          <div className="p-4 bg-white border-t border-surface-border">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="flex items-center gap-2"
            >
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder="Ask AgriSmart AI about crops, diseases, fertilizers, or water..."
                className="flex-1 px-4 py-3 text-xs rounded-2xl border border-surface-border focus:border-agri-600 focus:ring-2 focus:ring-agri-600/20 outline-none"
              />
              <button
                type="submit"
                disabled={!inputMessage.trim() || sending}
                className="p-3 bg-agri-700 hover:bg-agri-800 text-white rounded-2xl shadow-sm transition-all disabled:opacity-50 cursor-pointer"
                title="Send message"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      </div>
    </PageContainer>
  );
};
