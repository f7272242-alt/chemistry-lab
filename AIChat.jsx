import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Bot, Sparkles, X, Send, BookOpenCheck, LoaderCircle, Check, Plus, AlertCircle, Trash2 } from 'lucide-react';

const STORAGE_KEY = 'chemistry-lab-ai-knowledge-v1';
const API_BASE = (import.meta.env.VITE_AI_API_URL || (import.meta.env.DEV ? 'http://127.0.0.1:3001' : '')).replace(/\/$/, '');
const apiUrl = (path) => `${API_BASE}${path}`;

function readSavedKnowledge() {
  try {
    const value = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    return Array.isArray(value) ? value : [];
  } catch {
    return [];
  }
}

function extractJson(text) {
  const cleaned = String(text || '').replace(/```(?:json)?/gi, '').replace(/```/g, '').trim();
  const start = cleaned.indexOf('{');
  const end = cleaned.lastIndexOf('}');
  if (start < 0 || end <= start) return null;
  try { return JSON.parse(cleaned.slice(start, end + 1)); } catch { return null; }
}

export default function AIChat({ open, onClose, lang = 'FA', siteContext }) {
  const fa = lang === 'FA';
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [knowledge, setKnowledge] = useState(readSavedKnowledge);
  const [proposals, setProposals] = useState([]);
  const bottomRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    fetch(apiUrl('/api/knowledge')).then(r => r.ok ? r.json() : null).then(data => {
      if (Array.isArray(data?.items)) { setKnowledge(data.items); localStorage.setItem(STORAGE_KEY, JSON.stringify(data.items)); }
    }).catch(() => {});
  }, [open]);

  useEffect(() => {
    if (open && messages.length === 0) {
      setMessages([{ role: 'assistant', content: fa
        ? 'سلام! من دستیار هوشمند آزمایشگاه شیمی هستم. محتوای موجود سایت، داده‌های عناصر، ترکیبات و واکنش‌های ثبت‌شده را در اختیار دارم. می‌توانی سؤال بپرسی یا دکمه «بررسی کمبودهای دانشنامه» را انتخاب کنی.'
        : 'Hello! I am the Chemistry Lab AI assistant. I can use the site content, element data, compounds and registered reactions. Ask a question or run a knowledge audit.' }]);
    }
  }, [open, fa, messages.length]);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages, loading, proposals]);

  const enrichedContext = useMemo(() => ({
    ...siteContext,
    approvedKnowledge: knowledge,
    note: 'Treat the supplied site snapshot as the actual current site content. Do not claim that missing information already exists. Some periodic-table grid entries may be placeholders; distinguish complete records from placeholders.'
  }), [siteContext, knowledge]);

  const callAI = async (mode, userText) => {
    setError('');
    setLoading(true);
    const nextMessages = mode === 'chat'
      ? [...messages, { role: 'user', content: userText }]
      : [...messages, { role: 'user', content: fa ? 'دانشنامه سایت را بررسی کن و کمبودهای مهم آن را پیشنهاد بده.' : 'Audit the site knowledge base and propose important missing content.' }];
    if (mode === 'chat') setMessages(nextMessages);
    try {
      const response = await fetch(apiUrl('/api/chat'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mode, messages: nextMessages.slice(-12), siteContext: enrichedContext, language: fa ? 'Persian' : 'English' })
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(payload.error || (fa ? 'ارتباط با سرویس هوش مصنوعی برقرار نشد.' : 'Could not connect to the AI service.'));
      const answer = payload.answer || (fa ? 'پاسخی دریافت نشد.' : 'No answer was returned.');
      if (mode === 'audit') {
        const parsed = extractJson(answer);
        const items = Array.isArray(parsed?.proposals) ? parsed.proposals : [];
        setProposals(items.filter(x => x && x.title && x.content).slice(0, 12));
        setMessages(prev => [...prev, { role: 'assistant', content: items.length
          ? (fa ? `${items.length} پیشنهاد برای تکمیل دانشنامه آماده شد. موارد را بررسی کن و فقط موارد معتبر را اضافه کن.` : `${items.length} knowledge suggestions are ready. Review them and add only the ones you approve.`)
          : answer }]);
      } else {
        setMessages(prev => [...prev, { role: 'assistant', content: answer }]);
      }
    } catch (err) {
      setError(err.message || (fa ? 'خطای نامشخص رخ داد.' : 'An unknown error occurred.'));
      if (mode === 'chat') setMessages(prev => [...prev, { role: 'assistant', content: fa
        ? 'فعلاً نتوانستم به سرور هوش مصنوعی وصل شوم. تنظیمات فایل .env و روشن بودن سرور را بررسی کن.'
        : 'I could not reach the AI server. Check the .env settings and make sure the server is running.' }]);
    } finally { setLoading(false); }
  };

  const send = () => {
    const value = input.trim();
    if (!value || loading) return;
    setInput('');
    callAI('chat', value);
  };

  const approveProposal = async (item) => {
    const entry = { ...item, id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`, approvedAt: new Date().toISOString() };
    try {
      const response = await fetch(apiUrl('/api/knowledge'), { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ item: entry }) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Could not save knowledge');
      const updated = Array.isArray(data.items) ? data.items : [...knowledge, entry];
      setKnowledge(updated); localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      setProposals(prev => prev.filter(p => p !== item));
    } catch (err) { setError(fa ? `ذخیره‌سازی انجام نشد: ${err.message}` : `Could not save: ${err.message}`); }
  };

  const removeKnowledge = async (id) => {
    try {
      const response = await fetch(apiUrl(`/api/knowledge/${encodeURIComponent(id)}`), { method: 'DELETE' });
      const data = await response.json();
      const updated = Array.isArray(data.items) ? data.items : knowledge.filter(item => item.id !== id);
      setKnowledge(updated); localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch (err) { setError(fa ? `حذف انجام نشد: ${err.message}` : `Could not remove: ${err.message}`); }
  };

  if (!open) return null;

  return (
    <section className="fixed bottom-4 right-4 z-[70] flex h-[min(760px,calc(100vh-32px))] w-[min(460px,calc(100vw-32px))] flex-col overflow-hidden rounded-3xl border border-cyan-500/40 bg-[#111827] shadow-2xl shadow-cyan-950/40" dir={fa ? 'rtl' : 'ltr'}>
      <header className="flex items-center justify-between border-b border-cyan-500/20 bg-gradient-to-r from-blue-950 to-cyan-950 p-4">
        <div className="flex items-center gap-3"><div className="rounded-xl bg-cyan-400/15 p-2"><Bot className="h-5 w-5 text-cyan-300" /></div><div><h2 className="text-sm font-black text-white">Chemistry AI Assistant</h2><p className="text-[11px] text-cyan-200/70">{fa ? 'متصل به دانش سایت و دانش تأییدشده' : 'Connected to site knowledge'}</p></div></div>
        <button onClick={onClose} aria-label="Close" className="rounded-lg p-2 text-slate-300 hover:bg-white/10"><X className="h-5 w-5" /></button>
      </header>

      <div className="flex flex-wrap items-center gap-2 border-b border-slate-800 bg-slate-900/80 p-3">
        <button disabled={loading} onClick={() => callAI('audit')} className="inline-flex items-center gap-2 rounded-xl border border-cyan-700/60 bg-cyan-950/60 px-3 py-2 text-xs font-bold text-cyan-200 hover:bg-cyan-900/70 disabled:opacity-50"><BookOpenCheck className="h-4 w-4" />{fa ? 'بررسی کمبودهای دانشنامه' : 'Audit knowledge base'}</button>
        <span className="text-[11px] text-slate-400">{knowledge.length} {fa ? 'مورد تأییدشده' : 'approved additions'}</span>
      </div>

      <div className="flex-1 space-y-3 overflow-y-auto bg-slate-950/70 p-4">
        {messages.map((message, index) => <div key={index} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}><div className={`max-w-[92%] whitespace-pre-wrap break-words rounded-2xl px-3 py-3 text-xs leading-6 ${message.role === 'user' ? 'rounded-br-sm bg-cyan-600 text-slate-950' : 'rounded-bl-sm border border-slate-800 bg-slate-900 text-slate-200'}`}>{message.content}</div></div>)}
        {loading && <div className="flex items-center gap-2 text-xs text-cyan-300"><LoaderCircle className="h-4 w-4 animate-spin" />{fa ? 'در حال تحلیل اطلاعات سایت...' : 'Analyzing site knowledge...'}</div>}
        {error && <div className="flex gap-2 rounded-xl border border-rose-800/60 bg-rose-950/30 p-3 text-xs leading-5 text-rose-200"><AlertCircle className="h-4 w-4 shrink-0" />{error}</div>}

        {proposals.length > 0 && <div className="space-y-2"><h3 className="text-xs font-black text-amber-300">{fa ? 'پیشنهادهای تکمیل دانشنامه — بررسی پیش از افزودن' : 'Knowledge proposals — review before adding'}</h3>{proposals.map((item, index) => <article key={`${item.title}-${index}`} className="rounded-xl border border-amber-800/50 bg-amber-950/20 p-3"><div className="flex items-start justify-between gap-2"><div><div className="text-xs font-bold text-amber-100">{item.title}</div><div className="mt-1 text-[10px] text-amber-300/70">{item.category || (fa ? 'موضوع تکمیلی' : 'Additional topic')} · {item.confidence || 'Needs verification'}</div></div><button onClick={() => approveProposal(item)} className="inline-flex shrink-0 items-center gap-1 rounded-lg bg-emerald-700 px-2 py-1.5 text-[10px] font-bold text-white hover:bg-emerald-600"><Plus className="h-3 w-3" />{fa ? 'افزودن' : 'Add'}</button></div><p className="mt-2 whitespace-pre-wrap text-[11px] leading-5 text-slate-300">{item.summary || item.content}</p>{item.source_url && <a href={item.source_url} target="_blank" rel="noreferrer" className="mt-2 block break-all text-[10px] text-cyan-300 underline">{item.source_url}</a>}</article>)}</div>}

        {knowledge.length > 0 && <details className="rounded-xl border border-slate-800 bg-slate-900/70 p-3"><summary className="cursor-pointer text-xs font-bold text-emerald-300">{fa ? `موارد اضافه‌شده (${knowledge.length})` : `Added knowledge (${knowledge.length})`}</summary><div className="mt-3 space-y-2">{knowledge.map(item => <div key={item.id} className="flex items-start justify-between gap-2 border-t border-slate-800 pt-2"><div><div className="text-xs font-bold text-slate-200">{item.title}</div><p className="mt-1 line-clamp-3 text-[10px] leading-5 text-slate-400">{item.summary || item.content}</p></div><button onClick={() => removeKnowledge(item.id)} title={fa ? 'حذف' : 'Remove'} className="rounded p-1 text-rose-300 hover:bg-rose-950"><Trash2 className="h-3.5 w-3.5" /></button></div>)}</div></details>}
        <div ref={bottomRef} />
      </div>

      <div className="border-t border-slate-800 bg-slate-900 p-3">
        <div className="mb-2 flex items-start gap-2 text-[10px] leading-4 text-slate-500"><Sparkles className="h-3.5 w-3.5 shrink-0 text-cyan-400" />{fa ? 'اطلاعات پیشنهادی تا زمان تأیید تو به دانش سایت اضافه نمی‌شوند. پاسخ‌های علمی را با منابع معتبر بررسی کن.' : 'Suggestions are not added until you approve them. Verify scientific answers against trusted sources.'}</div>
        <div className="flex gap-2"><input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && send()} placeholder={fa ? 'سؤالت را درباره شیمی یا سایت بنویس...' : 'Ask about chemistry or this website...'} className="min-w-0 flex-1 rounded-xl border border-slate-700 bg-slate-950 px-3 py-3 text-xs text-white outline-none focus:border-cyan-400" /><button onClick={send} disabled={loading || !input.trim()} className="rounded-xl bg-cyan-500 px-4 text-slate-950 hover:bg-cyan-400 disabled:opacity-40"><Send className="h-4 w-4" /></button></div>
      </div>
    </section>
  );
}
