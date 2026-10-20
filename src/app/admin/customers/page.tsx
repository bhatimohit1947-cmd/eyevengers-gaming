'use client';

import React, { useState, useEffect } from 'react';
import { UserProfile } from '@/lib/types';
import { 
  Users, 
  Search, 
  RefreshCw, 
  MessageCircle, 
  Send, 
  Check, 
  Copy, 
  Sparkles, 
  Globe, 
  ChevronDown, 
  ChevronUp, 
  CheckSquare, 
  Square, 
  ExternalLink, 
  X,
  PhoneCall
} from 'lucide-react';

interface TemplateOption {
  id: string;
  title: string;
  lang: 'hi' | 'en';
  text: string;
}

const TEMPLATES: TemplateOption[] = [
  // HINDI TEMPLATES
  {
    id: 'hi-spin',
    title: '🎡 लकी स्पिन गेम खेलें (त्यौहारी बधाई)',
    lang: 'hi',
    text: `नमस्ते {name} जी! 🙏✨\n\nEYEVENGERS जोधपुर की तरफ से आपको त्यौहारों की हार्दिक शुभकामनाएं! 🎆\n\nहमारे फेस्टिव Spin & Win गेम में भाग लें और जीतें फ्लैट ₹500 तक का डिस्काउंट वाउचर और फ्री फ्रेम! 🎁\n\nअभी अपना लक आजमाएं 👉 {link}\n\n📍 पधारें: EYEVENGERS, भादू मार्केट, जोधपुर\n📞 संपर्क: +91 7414890248`
  },
  {
    id: 'hi-offer',
    title: '👓 शोरूम स्पेशल फेस्टिव ऑफर',
    lang: 'hi',
    text: `नमस्ते {name} जी! 👓✨\n\nEYEVENGERS जोधपुर आपके लिए लाया है स्पेशल फेस्टिव ऑफर! नए चश्मों और प्रीमियम सनग्लासेस के लेटेस्ट कलेक्शन पर पाएं भारी छूट।\n\nआज ही हमारे भादू मार्केट शोरूम पधारें और अपना फेस्टिव सरप्राइज पाएं! 🎁\n\n📍 EYEVENGERS, Bhadu Market, Jodhpur\n📞 +91 7414890248`
  },
  {
    id: 'hi-voucher',
    title: '🎟️ वाउचर क्लेम रिमाइंडर (25 Oct तक)',
    lang: 'hi',
    text: `नमस्ते {name} जी! 🎟️\n\nआपका फेस्टिव गेमिंग वाउचर रिडीम के लिए उपलब्ध है। यह ऑफर केवल 25 अक्टूबर तक मान्य है।\n\nकृपया जल्द से जल्द EYEVENGERS शोरूम पधारकर अपना वाउचर क्लेम करें और डिस्काउंट का लाभ उठाएं!\n\n📍 भादू मार्केट, जोधपुर\n📞 +91 7414890248`
  },

  // ENGLISH TEMPLATES
  {
    id: 'en-spin',
    title: '🎡 Festive Spin & Win Game',
    lang: 'en',
    text: `Hello {name}! ✨\n\nFestive Greetings from EYEVENGERS Jodhpur! 🎆\n\nPlay our Festive Spin & Win game right now to win up to ₹500 OFF discount vouchers & free eyewear frames! 🎁\n\nSpin the Wheel now 👉 {link}\n\n📍 Visit: EYEVENGERS, Bhadu Market, Jodhpur\n📞 Contact: +91 7414890248`
  },
  {
    id: 'en-offer',
    title: '👓 Exclusive Showroom Eyewear Offer',
    lang: 'en',
    text: `Dear {name}! 👓✨\n\nUpgrade your festive look with EYEVENGERS Jodhpur! Enjoy exclusive discounts on our brand new designer frames and UV sunglasses collection.\n\nVisit us today at Bhadu Market, Jodhpur!\n📞 +91 7414890248`
  },
  {
    id: 'en-voucher',
    title: '🎟️ Voucher Claim Reminder',
    lang: 'en',
    text: `Hello {name}! 🎟️\n\nA friendly reminder that your EYEVENGERS festive reward voucher is waiting to be claimed. Valid until 25th October!\n\nVisit our showroom desk to redeem.\n📍 Bhadu Market, Jodhpur\n📞 +91 7414890248`
  }
];

export default function AdminCustomersPage() {
  const [customers, setCustomers] = useState<UserProfile[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // WhatsApp Campaign Studio State
  const [showStudio, setShowStudio] = useState(true);
  const [selectedLang, setSelectedLang] = useState<'hi' | 'en'>('hi');
  const [customMessage, setCustomMessage] = useState(TEMPLATES[0].text);
  const [activeTemplateId, setActiveTemplateId] = useState(TEMPLATES[0].id);

  // Customer Selection & Broadcast Queue
  const [selectedCustomerIds, setSelectedCustomerIds] = useState<Set<string>>(new Set());
  const [showBroadcastModal, setShowBroadcastModal] = useState(false);
  const [currentBroadcastIndex, setCurrentBroadcastIndex] = useState(0);
  const [sentMap, setSentMap] = useState<Record<string, boolean>>({});
  const [copiedNumbers, setCopiedNumbers] = useState(false);

  const fetchCustomers = (term?: string) => {
    let url = '/api/admin/customers';
    if (term) url += `?search=${encodeURIComponent(term)}`;

    fetch(url)
      .then(res => res.json())
      .then(data => {
        if (data.customers) setCustomers(data.customers);
        setLoading(false);
        setIsRefreshing(false);
      })
      .catch(() => {
        setLoading(false);
        setIsRefreshing(false);
      });
  };

  useEffect(() => {
    fetchCustomers();
    // Load saved message if available
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('eyevengers_whatsapp_custom_msg');
      if (saved) setCustomMessage(saved);
    }
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchCustomers(search);
  };

  const handleMessageChange = (val: string) => {
    setCustomMessage(val);
    if (typeof window !== 'undefined') {
      localStorage.setItem('eyevengers_whatsapp_custom_msg', val);
    }
  };

  const selectTemplate = (template: TemplateOption) => {
    setActiveTemplateId(template.id);
    handleMessageChange(template.text);
  };

  const insertPlaceholder = (tag: string) => {
    handleMessageChange(customMessage + ' ' + tag);
  };

  const cleanPhoneNumber = (phone: string): string => {
    const digits = phone.replace(/\D/g, '');
    if (digits.length === 10) return `91${digits}`;
    if (digits.length === 12 && digits.startsWith('91')) return digits;
    return digits;
  };

  const buildCustomerMessage = (customerName: string): string => {
    const appUrl = typeof window !== 'undefined' ? window.location.origin : 'https://eyevengers-gaming.vercel.app';
    return customMessage
      .replace(/{name}/g, customerName || 'Valued Customer')
      .replace(/{link}/g, appUrl)
      .replace(/{store}/g, 'EYEVENGERS Bhadu Market Jodhpur');
  };

  const sendSingleWhatsApp = (customer: UserProfile) => {
    const formattedNum = cleanPhoneNumber(customer.mobile);
    const text = buildCustomerMessage(customer.fullName);
    const url = `https://wa.me/${formattedNum}?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
    setSentMap(prev => ({ ...prev, [customer.id]: true }));
  };

  // Toggle selection
  const toggleSelectCustomer = (id: string) => {
    setSelectedCustomerIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selectedCustomerIds.size === customers.length) {
      setSelectedCustomerIds(new Set());
    } else {
      setSelectedCustomerIds(new Set(customers.map(c => c.id)));
    }
  };

  const selectedCustomersList = customers.filter(c => selectedCustomerIds.has(c.id));

  const copyAllNumbers = () => {
    const target = selectedCustomersList.length > 0 ? selectedCustomersList : customers;
    const nums = target.map(c => c.mobile).join(', ');
    navigator.clipboard.writeText(nums);
    setCopiedNumbers(true);
    setTimeout(() => setCopiedNumbers(false), 2000);
  };

  const openBroadcastModal = () => {
    if (selectedCustomerIds.size === 0) {
      // Default to select all customers if none selected
      setSelectedCustomerIds(new Set(customers.map(c => c.id)));
    }
    setCurrentBroadcastIndex(0);
    setShowBroadcastModal(true);
  };

  const currentBroadcastCustomer = selectedCustomersList[currentBroadcastIndex] || null;

  return (
    <div className="space-y-6">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E8C477]/20">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-black text-[#FFF4E3]">Customer Base & Outreach</h1>
            <span className="px-2.5 py-0.5 rounded-full bg-[#E8C477]/15 border border-[#E8C477]/40 text-xs font-bold text-[#E8C477]">
              {customers.length} registered
            </span>
          </div>
          <p className="text-xs text-gray-400 mt-0.5">
            Engage customers directly on WhatsApp with festive templates in Hindi & English.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowStudio(!showStudio)}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl border text-xs font-bold shadow-md transition-all ${
              showStudio 
                ? 'bg-[#25D366]/20 border-[#25D366]/60 text-[#25D366]' 
                : 'bg-[#25D366] text-white hover:brightness-110 border-[#25D366]'
            }`}
          >
            <MessageCircle className="w-4 h-4" />
            <span>{showStudio ? 'Hide WhatsApp Studio' : 'WhatsApp Campaign Studio'}</span>
            {showStudio ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>

          <button
            onClick={() => {
              setIsRefreshing(true);
              fetchCustomers(search);
            }}
            disabled={isRefreshing}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#681F2B] hover:bg-[#8C1D40] border border-[#E8C477]/40 text-xs font-bold text-[#FFF1CF] transition-colors shadow-sm disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-[#E8C477] ${isRefreshing ? 'animate-spin' : ''}`} />
            <span>{isRefreshing ? 'Refreshing...' : 'Refresh List'}</span>
          </button>
        </div>
      </div>

      {/* WHATSAPP CAMPAIGN STUDIO (CUSTOMIZER & TEMPLATES) */}
      {showStudio && (
        <div className="p-5 sm:p-6 rounded-3xl bg-gradient-to-br from-[#2A171D] via-[#21171A] to-[#1A1013] border-2 border-[#25D366]/40 shadow-2xl space-y-5">
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#E8C477]/20 pb-4">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-[#25D366]/20 border border-[#25D366]/40 text-[#25D366]">
                <MessageCircle className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-black text-[#FFF4E3] flex items-center gap-2">
                  <span>Custom WhatsApp Broadcast Studio</span>
                  <span className="px-2 py-0.5 rounded-full bg-[#25D366]/20 border border-[#25D366]/40 text-[#25D366] text-[10px] font-mono">
                    1-Click Dispatch
                  </span>
                </h2>
                <p className="text-[11px] text-gray-400">
                  Select a Hindi/English template or customize your own message with auto-replacing customer names.
                </p>
              </div>
            </div>

            {/* Language Toggle */}
            <div className="flex items-center bg-[#21171A] border border-[#E8C477]/30 rounded-xl p-1 self-start sm:self-auto">
              <button
                type="button"
                onClick={() => setSelectedLang('hi')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                  selectedLang === 'hi' 
                    ? 'bg-[#E8C477] text-[#21171A] shadow-md' 
                    : 'text-gray-400 hover:text-[#FFF4E3]'
                }`}
              >
                <span>🇮🇳</span>
                <span>हिंदी (Hindi)</span>
              </button>
              <button
                type="button"
                onClick={() => setSelectedLang('en')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                  selectedLang === 'en' 
                    ? 'bg-[#E8C477] text-[#21171A] shadow-md' 
                    : 'text-gray-400 hover:text-[#FFF4E3]'
                }`}
              >
                <span>🇬🇧</span>
                <span>English</span>
              </button>
            </div>
          </div>

          {/* Quick Preset Buttons */}
          <div>
            <div className="text-[11px] uppercase tracking-wider text-[#E8C477] font-bold mb-2 flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-[#E8C477]" />
              <span>Choose High-Converting {selectedLang === 'hi' ? 'Hindi' : 'English'} Preset:</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5">
              {TEMPLATES.filter(t => t.lang === selectedLang).map(tpl => (
                <button
                  key={tpl.id}
                  type="button"
                  onClick={() => selectTemplate(tpl)}
                  className={`p-3 rounded-xl text-left border text-xs transition-all flex flex-col justify-between gap-2 ${
                    activeTemplateId === tpl.id
                      ? 'bg-[#681F2B]/60 border-[#E8C477] text-[#FFF4E3] shadow-lg ring-1 ring-[#E8C477]'
                      : 'bg-[#21171A]/70 border-[#E8C477]/20 text-gray-300 hover:border-[#E8C477]/50 hover:bg-[#21171A]'
                  }`}
                >
                  <span className="font-bold text-[#E8C477]">{tpl.title}</span>
                  <span className="text-[11px] text-gray-400 line-clamp-2 leading-relaxed">
                    {tpl.text.substring(0, 75)}...
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Dynamic Placeholder Tag Badges */}
          <div>
            <div className="text-[11px] uppercase tracking-wider text-gray-400 font-bold mb-1.5">
              Insert Dynamic Customer Placeholders (Tap to add):
            </div>
            <div className="flex flex-wrap gap-2 text-xs">
              <button
                type="button"
                onClick={() => insertPlaceholder('{name}')}
                className="px-2.5 py-1 rounded-lg bg-[#21171A] hover:bg-[#681F2B] border border-[#E8C477]/30 text-[#FFF1CF] font-mono text-[11px] flex items-center gap-1 transition-colors"
              >
                <span>+</span>
                <span className="font-bold text-[#E8C477]">{'{name}'}</span>
                <span className="text-gray-400 text-[10px]">(Customer Name)</span>
              </button>
              <button
                type="button"
                onClick={() => insertPlaceholder('{link}')}
                className="px-2.5 py-1 rounded-lg bg-[#21171A] hover:bg-[#681F2B] border border-[#E8C477]/30 text-[#FFF1CF] font-mono text-[11px] flex items-center gap-1 transition-colors"
              >
                <span>+</span>
                <span className="font-bold text-[#E8C477]">{'{link}'}</span>
                <span className="text-gray-400 text-[10px]">(Game Link)</span>
              </button>
              <button
                type="button"
                onClick={() => insertPlaceholder('{store}')}
                className="px-2.5 py-1 rounded-lg bg-[#21171A] hover:bg-[#681F2B] border border-[#E8C477]/30 text-[#FFF1CF] font-mono text-[11px] flex items-center gap-1 transition-colors"
              >
                <span>+</span>
                <span className="font-bold text-[#E8C477]">{'{store}'}</span>
                <span className="text-gray-400 text-[10px]">(Eyevengers Jodhpur)</span>
              </button>
            </div>
          </div>

          {/* Grid: Editor & WhatsApp Live Preview */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            
            {/* Editor Column */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <label className="font-bold text-[#E8C477] uppercase text-[10px] tracking-wider">
                  Edit WhatsApp Message Text:
                </label>
                <span className="text-[10px] text-gray-400 font-mono">
                  {customMessage.length} characters
                </span>
              </div>
              <textarea
                rows={8}
                value={customMessage}
                onChange={(e) => handleMessageChange(e.target.value)}
                placeholder="Type or paste your customized message here..."
                className="w-full p-4 rounded-2xl bg-[#1A1013] border border-[#E8C477]/40 text-xs sm:text-sm text-[#FFF4E3] placeholder-gray-500 focus:outline-none focus:border-[#25D366] leading-relaxed resize-y font-sans"
              />
            </div>

            {/* Live WhatsApp Preview */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <label className="font-bold text-[#25D366] uppercase text-[10px] tracking-wider flex items-center gap-1">
                  <Check className="w-3.5 h-3.5" />
                  <span>Live WhatsApp Message Preview (as customer sees it):</span>
                </label>
                <span className="text-[10px] text-gray-500">Preview with sample: "Jashoda Bhati"</span>
              </div>

              <div className="p-4 sm:p-5 rounded-2xl bg-[#0B141A] border border-[#25D366]/30 flex flex-col justify-between min-h-[195px] relative overflow-hidden">
                <div className="flex items-center gap-2 mb-3 pb-2 border-b border-gray-800 text-xs text-gray-400">
                  <div className="w-2.5 h-2.5 rounded-full bg-[#25D366]" />
                  <span className="font-bold text-gray-300">EYEVENGERS Jodhpur Verified Business</span>
                </div>

                <div className="max-w-[90%] self-end bg-[#005C4B] text-[#E9EDEF] rounded-2xl rounded-tr-none p-3.5 text-xs shadow-md space-y-1.5 leading-relaxed whitespace-pre-wrap font-sans">
                  {buildCustomerMessage('Jashoda Bhati')}
                  <div className="flex items-center justify-end gap-1 text-[10px] text-[#8696A0] pt-1">
                    <span>11:58 AM</span>
                    <span className="text-[#53BDEB] font-bold">✓✓</span>
                  </div>
                </div>

                <div className="text-[10px] text-gray-500 mt-2 text-center">
                  💡 When you click "WhatsApp", this exact message opens instantly for that customer.
                </div>
              </div>
            </div>

          </div>

          {/* Quick Actions Footer inside Studio */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-[#E8C477]/20">
            <div className="text-xs text-gray-400">
              Targeting: <span className="font-bold text-[#FFF4E3]">{selectedCustomerIds.size > 0 ? selectedCustomerIds.size : customers.length} customers</span>
            </div>

            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={copyAllNumbers}
                className="px-4 py-2 rounded-xl bg-[#21171A] hover:bg-[#2A171D] border border-[#E8C477]/30 text-xs font-bold text-[#FFF1CF] flex items-center gap-1.5"
              >
                {copiedNumbers ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-[#E8C477]" />}
                <span>{copiedNumbers ? 'Numbers Copied!' : 'Copy Numbers'}</span>
              </button>

              <button
                type="button"
                onClick={openBroadcastModal}
                disabled={customers.length === 0}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#25D366] to-[#128C7E] text-white font-black text-xs sm:text-sm hover:brightness-110 shadow-lg flex items-center gap-2 disabled:opacity-50"
              >
                <Send className="w-4 h-4" />
                <span>Launch 1-Click WhatsApp Broadcast ({selectedCustomerIds.size > 0 ? selectedCustomerIds.size : customers.length})</span>
              </button>
            </div>
          </div>

        </div>
      )}

      {/* FILTER & BATCH ACTION BAR */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
        <form onSubmit={handleSearch} className="max-w-md flex-1 flex gap-2">
          <input
            type="text"
            placeholder="Search by customer name or mobile..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 px-4 py-2.5 rounded-xl bg-[#21171A] border border-[#E8C477]/30 text-xs text-[#FFF4E3] placeholder-gray-500 focus:outline-none focus:border-[#E8C477]"
          />
          <button
            type="submit"
            className="px-4 py-2.5 rounded-xl bg-[#E8C477] text-[#21171A] font-bold text-xs hover:bg-[#FFF1CF] flex items-center gap-1.5"
          >
            <Search className="w-4 h-4" />
            <span>Filter</span>
          </button>
        </form>

        {/* Selected count and batch trigger */}
        {selectedCustomerIds.size > 0 && (
          <div className="flex items-center gap-2 bg-[#681F2B]/70 border border-[#E8C477]/40 px-3.5 py-1.5 rounded-xl text-xs">
            <span className="font-bold text-[#FFF1CF]">{selectedCustomerIds.size} Selected</span>
            <button
              onClick={openBroadcastModal}
              className="px-3 py-1 rounded-lg bg-[#25D366] hover:bg-[#1ebd59] text-white font-bold text-xs flex items-center gap-1 shadow"
            >
              <MessageCircle className="w-3.5 h-3.5" />
              <span>Broadcast Now</span>
            </button>
            <button
              onClick={() => setSelectedCustomerIds(new Set())}
              className="text-gray-400 hover:text-white p-1"
              title="Clear selection"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>

      {/* CUSTOMER TABLE */}
      <div className="p-6 rounded-2xl bg-[#21171A] border border-[#E8C477]/25 shadow-xl">
        {loading ? (
          <div className="py-12 flex flex-col items-center justify-center gap-3 text-gray-400">
            <RefreshCw className="w-6 h-6 text-[#E8C477] animate-spin" />
            <p className="text-xs">Loading customer records from cloud & local database...</p>
          </div>
        ) : customers.length === 0 ? (
          <div className="py-12 flex flex-col items-center justify-center gap-2 text-center">
            <Users className="w-10 h-10 text-gray-600 mb-1" />
            <p className="text-sm font-bold text-[#FFF4E3]">No Customers Found</p>
            <p className="text-xs text-gray-400 max-w-sm">
              {search ? 'No registered customers match your search query.' : 'No customer accounts registered yet. New customer registrations will appear here immediately.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-gray-300">
              <thead className="bg-[#2A171D] text-[#E8C477] uppercase text-[10px] font-bold">
                <tr>
                  <th className="p-3 w-8">
                    <button
                      type="button"
                      onClick={toggleSelectAll}
                      className="text-[#E8C477] hover:brightness-125 focus:outline-none"
                    >
                      {selectedCustomerIds.size === customers.length && customers.length > 0 ? (
                        <CheckSquare className="w-4 h-4 text-[#25D366]" />
                      ) : (
                        <Square className="w-4 h-4 text-gray-500" />
                      )}
                    </button>
                  </th>
                  <th className="p-3">Customer Name</th>
                  <th className="p-3">Verified Mobile</th>
                  <th className="p-3">Role</th>
                  <th className="p-3">Joined Date</th>
                  <th className="p-3">Status</th>
                  <th className="p-3 text-right">1-Click WhatsApp Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E8C477]/10">
                {customers.map((c) => {
                  const isSelected = selectedCustomerIds.has(c.id);
                  const isSent = sentMap[c.id];

                  return (
                    <tr 
                      key={c.id} 
                      className={`hover:bg-[#2A171D]/60 transition-colors ${isSelected ? 'bg-[#681F2B]/20' : ''}`}
                    >
                      <td className="p-3">
                        <button
                          type="button"
                          onClick={() => toggleSelectCustomer(c.id)}
                          className="focus:outline-none"
                        >
                          {isSelected ? (
                            <CheckSquare className="w-4 h-4 text-[#25D366]" />
                          ) : (
                            <Square className="w-4 h-4 text-gray-600 hover:text-gray-400" />
                          )}
                        </button>
                      </td>
                      <td className="p-3">
                        <div className="font-bold text-[#FFF4E3]">{c.fullName}</div>
                        <div className="text-[10px] text-gray-500 font-mono">{c.id.substring(0, 13)}...</div>
                      </td>
                      <td className="p-3 font-mono text-[#E8C477] font-bold">{c.mobile}</td>
                      <td className="p-3 capitalize text-gray-400">{c.role}</td>
                      <td className="p-3 text-gray-400">{new Date(c.createdAt).toLocaleDateString('en-IN')}</td>
                      <td className="p-3">
                        <span className="px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-500/40 text-[10px] font-bold">
                          {c.status}
                        </span>
                      </td>
                      <td className="p-3 text-right">
                        <button
                          type="button"
                          onClick={() => sendSingleWhatsApp(c)}
                          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold text-xs transition-all shadow-md ${
                            isSent
                              ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/50 hover:bg-emerald-900'
                              : 'bg-[#25D366] hover:bg-[#1ebd59] text-white hover:brightness-110'
                          }`}
                          title={`Send customized message to ${c.fullName}`}
                        >
                          <MessageCircle className="w-3.5 h-3.5" />
                          <span>{isSent ? 'Sent ✓ (Send Again)' : 'Send WhatsApp'}</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* 1-CLICK BROADCAST DISPATCHER MODAL */}
      {showBroadcastModal && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="max-w-xl w-full rounded-3xl bg-[#21171A] border-2 border-[#25D366]/50 p-6 sm:p-7 shadow-2xl space-y-6">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-4 border-b border-[#E8C477]/20">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-[#25D366]/20 border border-[#25D366]/40 text-[#25D366]">
                  <MessageCircle className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-[#FFF4E3]">1-Click WhatsApp Dispatcher</h3>
                  <p className="text-[11px] text-gray-400">
                    Queue: {currentBroadcastIndex + 1} of {selectedCustomersList.length} customers
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowBroadcastModal(false)}
                className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-[#2A171D]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {currentBroadcastCustomer ? (
              <div className="space-y-4">
                
                {/* Active Customer Card */}
                <div className="p-4 rounded-2xl bg-[#2A171D] border border-[#E8C477]/30 space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-gray-400 block">Current Recipient</span>
                      <span className="text-base font-black text-[#FFF4E3]">{currentBroadcastCustomer.fullName}</span>
                    </div>
                    <span className="px-3 py-1 rounded-full bg-[#E8C477]/20 text-[#E8C477] font-mono font-bold text-xs border border-[#E8C477]/30">
                      {currentBroadcastCustomer.mobile}
                    </span>
                  </div>

                  <div className="pt-2 border-t border-[#E8C477]/10 text-xs text-gray-300">
                    <span className="text-gray-400 text-[10px] uppercase block mb-1">Message Preview for this customer:</span>
                    <p className="bg-[#1A1013] p-3 rounded-xl border border-[#E8C477]/20 text-[11px] text-[#FFF1CF] whitespace-pre-wrap max-h-36 overflow-y-auto leading-relaxed">
                      {buildCustomerMessage(currentBroadcastCustomer.fullName)}
                    </p>
                  </div>
                </div>

                {/* Primary Action Button */}
                <div className="space-y-2 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      sendSingleWhatsApp(currentBroadcastCustomer);
                      if (currentBroadcastIndex < selectedCustomersList.length - 1) {
                        setCurrentBroadcastIndex(prev => prev + 1);
                      }
                    }}
                    className="w-full py-4 rounded-2xl bg-gradient-to-r from-[#25D366] to-[#128C7E] text-white font-black text-sm hover:brightness-110 shadow-xl flex items-center justify-center gap-2"
                  >
                    <Send className="w-4 h-4" />
                    <span>Open WhatsApp for {currentBroadcastCustomer.fullName} & Advance Next →</span>
                  </button>

                  <div className="flex items-center justify-between gap-2 pt-2 text-xs">
                    <button
                      type="button"
                      disabled={currentBroadcastIndex === 0}
                      onClick={() => setCurrentBroadcastIndex(prev => Math.max(0, prev - 1))}
                      className="px-3 py-1.5 rounded-lg bg-[#2A171D] text-gray-300 hover:text-white disabled:opacity-40"
                    >
                      ← Previous
                    </button>

                    <span className="text-gray-400 text-[11px]">
                      {Object.keys(sentMap).length} of {selectedCustomersList.length} contacted
                    </span>

                    <button
                      type="button"
                      disabled={currentBroadcastIndex >= selectedCustomersList.length - 1}
                      onClick={() => setCurrentBroadcastIndex(prev => Math.min(selectedCustomersList.length - 1, prev + 1))}
                      className="px-3 py-1.5 rounded-lg bg-[#2A171D] text-gray-300 hover:text-white disabled:opacity-40"
                    >
                      Skip / Next →
                    </button>
                  </div>
                </div>

                {/* Quick Customer Mini-Navigator */}
                <div className="pt-2">
                  <span className="text-[10px] text-gray-400 uppercase font-bold block mb-1.5">
                    Jump to Customer:
                  </span>
                  <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto p-1 bg-[#1A1013] rounded-xl border border-[#E8C477]/15">
                    {selectedCustomersList.map((cust, idx) => (
                      <button
                        key={cust.id}
                        type="button"
                        onClick={() => setCurrentBroadcastIndex(idx)}
                        className={`px-2 py-1 rounded-md text-[10px] font-bold transition-all ${
                          idx === currentBroadcastIndex
                            ? 'bg-[#E8C477] text-[#21171A]'
                            : sentMap[cust.id]
                            ? 'bg-emerald-950 text-emerald-400 border border-emerald-500/30'
                            : 'bg-[#2A171D] text-gray-400 hover:text-white'
                        }`}
                      >
                        {idx + 1}. {cust.fullName.split(' ')[0]} {sentMap[cust.id] ? '✓' : ''}
                      </button>
                    ))}
                  </div>
                </div>

              </div>
            ) : (
              <div className="py-8 text-center text-gray-400 text-xs">
                No customers selected for broadcast.
              </div>
            )}

          </div>
        </div>
      )}

    </div>
  );
}

