import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MessageCircle, Send, X, Sparkles, TrendingUp, Package, Users } from 'lucide-react'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

interface AIChatbotProps {
  locale?: string
  isRTL?: boolean
}

// BRAINSAIT: AI-powered chatbot for business insights
// AGENT: Natural language interface for analytics queries
export default function AIChatbot({ locale = 'ar', isRTL = true }: AIChatbotProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const t = {
    ar: {
      title: 'مساعد ذكي للأعمال',
      subtitle: 'اسألني أي شيء عن مبيعاتك وعملياتك',
      placeholder: 'اكتب سؤالك هنا...',
      send: 'إرسال',
      close: 'إغلاق',
      typing: 'يكتب...',
      suggestions: 'أسئلة مقترحة',
      welcome: 'مرحباً! أنا مساعدك الذكي. كيف يمكنني مساعدتك اليوم؟',
      suggestion1: 'ما هي المنطقة الأعلى مبيعاً هذا الشهر؟',
      suggestion2: 'أعطني توقعات المبيعات للأسبوع القادم',
      suggestion3: 'ما هي المنتجات التي تحتاج إعادة تخزين؟',
      suggestion4: 'كم عدد الطلبات النشطة الآن؟',
      // Responses
      topRegionResponse: 'المنطقة الأعلى مبيعاً هي **الرياض** بمبيعات 250,000 ريال (+15.5% نمو). تليها جدة بـ 180,000 ريال.',
      forecastResponse: 'توقعات الأسبوع القادم تشير إلى **زيادة 25%** في المبيعات بسبب اقتراب شهر رمضان المبارك. التوقعات: 580,000 ريال.',
      restockResponse: 'المنتجات التي تحتاج إعادة تخزين عاجلة:\n• كنافة بالجبن (50 وحدة متبقية)\n• بقلاوة بالفستق (120 وحدة)\n• معمول (85 وحدة)',
      activeOrdersResponse: 'لديك حالياً **89 طلب نشط**:\n• 45 قيد التحضير\n• 32 في الطريق\n• 12 في انتظار التأكيد'
    },
    en: {
      title: 'AI Business Assistant',
      subtitle: 'Ask me anything about your sales and operations',
      placeholder: 'Type your question here...',
      send: 'Send',
      close: 'Close',
      typing: 'Typing...',
      suggestions: 'Suggested Questions',
      welcome: 'Hello! I\'m your AI assistant. How can I help you today?',
      suggestion1: 'Which region has the highest sales this month?',
      suggestion2: 'Give me sales forecast for next week',
      suggestion3: 'Which products need restocking?',
      suggestion4: 'How many active orders do we have?',
      // Responses
      topRegionResponse: 'The top-selling region is **Riyadh** with 250,000 SAR in sales (+15.5% growth). Followed by Jeddah with 180,000 SAR.',
      forecastResponse: 'Next week\'s forecast indicates a **25% increase** in sales due to approaching Ramadan. Expected: 580,000 SAR.',
      restockResponse: 'Products requiring urgent restocking:\n• Cheese Kunafa (50 units left)\n• Pistachio Baklava (120 units)\n• Maamoul (85 units)',
      activeOrdersResponse: 'You currently have **89 active orders**:\n• 45 being prepared\n• 32 in transit\n• 12 awaiting confirmation'
    }
  }

  const text = t[locale as keyof typeof t] || t.ar

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      // Send welcome message
      setMessages([{
        id: '1',
        role: 'assistant',
        content: text.welcome,
        timestamp: new Date()
      }])
    }
  }, [isOpen, text.welcome, messages.length])

  useEffect(() => {
    scrollToBottom()
  }, [messages.length])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const handleSend = async () => {
    if (!input.trim()) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInput('')
    setIsTyping(true)

    // BRAINSAIT: Simulate AI response - in production, call NLP service
    setTimeout(() => {
      const response = generateResponse(input)
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response,
        timestamp: new Date()
      }
      setMessages(prev => [...prev, assistantMessage])
      setIsTyping(false)
    }, 1500)
  }

  const generateResponse = (query: string): string => {
    const lowerQuery = query.toLowerCase()
    
    // Simple pattern matching - in production, use NLP/LLM
    if (lowerQuery.includes('مبيع') || lowerQuery.includes('منطقة') || lowerQuery.includes('region') || lowerQuery.includes('sales')) {
      return text.topRegionResponse
    } else if (lowerQuery.includes('توقع') || lowerQuery.includes('forecast') || lowerQuery.includes('predict')) {
      return text.forecastResponse
    } else if (lowerQuery.includes('مخزون') || lowerQuery.includes('restock') || lowerQuery.includes('inventory')) {
      return text.restockResponse
    } else if (lowerQuery.includes('طلب') || lowerQuery.includes('order')) {
      return text.activeOrdersResponse
    } else {
      return locale === 'ar' 
        ? 'عذراً، لم أفهم سؤالك بشكل كامل. يمكنك تجربة أحد الأسئلة المقترحة أو صياغة السؤال بطريقة مختلفة.'
        : 'Sorry, I didn\'t quite understand your question. You can try one of the suggested questions or rephrase your query.'
    }
  }

  const suggestions = [
    { icon: TrendingUp, text: text.suggestion1 },
    { icon: Sparkles, text: text.suggestion2 },
    { icon: Package, text: text.suggestion3 },
    { icon: Users, text: text.suggestion4 }
  ]

  return (
    <>
      {/* Floating Button */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-gradient-to-br from-brand-orange to-orange-600 text-white shadow-lg hover:shadow-xl transition-shadow flex items-center justify-center"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        style={{ [isRTL ? 'left' : 'right']: '1.5rem' }}
      >
        {isOpen ? <X className="w-6 h-6" /> : <MessageCircle className="w-6 h-6" />}
      </motion.button>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-24 z-50 w-96 max-w-[calc(100vw-2rem)] rounded-3xl border border-white/10 bg-slate-900/95 backdrop-blur-xl shadow-2xl"
            style={{ [isRTL ? 'left' : 'right']: '1.5rem' }}
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-brand-orange to-orange-600 p-4 rounded-t-3xl">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-white">{text.title}</h3>
                  <p className="text-xs text-white/80">{text.subtitle}</p>
                </div>
              </div>
            </div>

            {/* Messages */}
            <div className="h-96 overflow-y-auto p-4 space-y-4" dir={isRTL ? 'rtl' : 'ltr'}>
              {messages.map((message) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                      message.role === 'user'
                        ? 'bg-brand-orange text-white'
                        : 'bg-white/10 text-white'
                    }`}
                  >
                    <p className="text-sm whitespace-pre-line">{message.content}</p>
                    <p className="text-xs opacity-60 mt-1">
                      {message.timestamp.toLocaleTimeString(locale === 'ar' ? 'ar-SA' : 'en-US', {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                </motion.div>
              ))}

              {isTyping && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex justify-start"
                >
                  <div className="bg-white/10 rounded-2xl px-4 py-3">
                    <div className="flex gap-2">
                      <div className="w-2 h-2 bg-white/60 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <div className="w-2 h-2 bg-white/60 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <div className="w-2 h-2 bg-white/60 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                  </div>
                </motion.div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Suggestions */}
            {messages.length <= 1 && (
              <div className="px-4 pb-4">
                <p className="text-xs text-white/60 mb-2">{text.suggestions}</p>
                <div className="grid grid-cols-2 gap-2">
                  {suggestions.map((suggestion, idx) => (
                    <button
                      key={idx}
                      onClick={() => setInput(suggestion.text)}
                      className="flex items-start gap-2 p-3 rounded-xl bg-white/10 hover:bg-white/20 transition-colors text-left"
                    >
                      <suggestion.icon className="w-4 h-4 text-brand-orange flex-shrink-0 mt-0.5" />
                      <span className="text-xs text-white/80 leading-tight">{suggestion.text}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Input */}
            <div className="p-4 border-t border-white/10">
              <div className="flex gap-2" dir={isRTL ? 'rtl' : 'ltr'}>
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                  placeholder={text.placeholder}
                  className="flex-1 bg-white/10 border border-white/10 rounded-xl px-4 py-2 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-brand-orange"
                  dir={isRTL ? 'rtl' : 'ltr'}
                />
                <button
                  onClick={handleSend}
                  disabled={!input.trim()}
                  className="w-10 h-10 rounded-xl bg-brand-orange text-white flex items-center justify-center hover:bg-orange-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Send className="w-5 h-5" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
