"use client";

import { useEffect, useState } from "react";
import { MessageSquare, Mail } from "lucide-react";
import toast from "react-hot-toast";

export default function MessagesPage() {
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMessage, setSelectedMessage] = useState<any>(null);

  useEffect(() => {
    fetchMessages();
  }, []);

  const fetchMessages = async () => {
    try {
      const res = await fetch("/api/admin/messages");
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();
      setMessages(data);
    } catch (error) {
      toast.error("Could not load messages");
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (id: string) => {
    try {
      const res = await fetch("/api/admin/messages", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messageId: id, isRead: true }),
      });
      if (!res.ok) throw new Error("Failed to update status");
      
      // Update local state
      setMessages(prev => prev.map(m => m.id === id ? { ...m, isRead: true } : m));
      if (selectedMessage?.id === id) {
        setSelectedMessage({ ...selectedMessage, isRead: true });
      }
    } catch (error) {
      toast.error("Failed to update status");
    }
  };

  return (
    <div className="space-y-6 animate-fade-in-up h-[calc(100vh-120px)] flex flex-col">
      <div>
        <h1 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white flex items-center gap-3">
          <MessageSquare className="text-primary-500" />
          Messages
        </h1>
        <p className="text-slate-500 mt-1">View contact form submissions from customers.</p>
      </div>

      <div className="flex-1 card overflow-hidden bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm flex flex-col md:flex-row">
        {/* Sidebar List */}
        <div className={`w-full md:w-1/3 border-r border-slate-200 dark:border-slate-800 flex flex-col overflow-hidden ${selectedMessage ? 'hidden md:flex' : 'flex'}`}>
          <div className="p-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/50">
            <h2 className="font-bold">Inbox ({messages.filter(m => !m.isRead).length} unread)</h2>
          </div>
          
          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <div className="p-8 flex justify-center">
                <div className="w-6 h-6 border-2 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : messages.length === 0 ? (
              <div className="p-8 text-center text-slate-500">No messages found.</div>
            ) : (
              <div className="divide-y divide-slate-100 dark:divide-slate-800">
                {messages.map((msg) => (
                  <button
                    key={msg.id}
                    onClick={() => {
                      setSelectedMessage(msg);
                      if (!msg.isRead) handleMarkAsRead(msg.id);
                    }}
                    className={`w-full text-left p-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors ${
                      selectedMessage?.id === msg.id ? 'bg-primary-50 dark:bg-primary-900/10 border-l-4 border-primary-500' : 'border-l-4 border-transparent'
                    }`}
                  >
                    <div className="flex justify-between items-start mb-1">
                      <span className={`font-semibold text-sm ${!msg.isRead ? 'text-slate-900 dark:text-white' : 'text-slate-700 dark:text-slate-300'}`}>
                        {msg.name}
                      </span>
                      <span className="text-xs text-slate-400">
                        {new Date(msg.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <div className={`text-sm mb-1 ${!msg.isRead ? 'font-bold text-slate-900 dark:text-white' : 'text-slate-600 dark:text-slate-400'}`}>
                      {!msg.isRead && <span className="inline-block w-2 h-2 rounded-full bg-blue-500 mr-2"></span>}
                      {msg.subject}
                    </div>
                    <p className="text-xs text-slate-500 line-clamp-1">{msg.message}</p>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Message Detail View */}
        <div className={`flex-1 flex flex-col overflow-hidden ${!selectedMessage ? 'hidden md:flex' : 'flex'}`}>
          {selectedMessage ? (
            <>
              <div className="p-4 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center justify-between">
                <button 
                  onClick={() => setSelectedMessage(null)}
                  className="md:hidden p-2 -ml-2 text-slate-500 hover:bg-slate-100 rounded-lg"
                >
                  &larr; Back
                </button>
                <div className="flex gap-2">
                  {!selectedMessage.isRead && (
                    <button 
                      onClick={() => handleMarkAsRead(selectedMessage.id)}
                      className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-sm font-semibold rounded-lg transition-colors"
                    >
                      Mark as Read
                    </button>
                  )}
                  <a 
                    href={`mailto:${selectedMessage.email}`}
                    className="flex items-center gap-2 px-3 py-1.5 bg-primary-50 text-primary-600 hover:bg-primary-100 dark:bg-primary-500/10 dark:text-primary-400 rounded-lg text-sm font-semibold transition-colors"
                  >
                    <Mail size={16} /> Reply
                  </a>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-6 lg:p-8">
                <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-6">
                  {selectedMessage.subject}
                </h2>
                
                <div className="flex items-center gap-4 mb-8 pb-6 border-b border-slate-200 dark:border-slate-800">
                  <div className="w-12 h-12 bg-primary-100 text-primary-700 rounded-full flex items-center justify-center font-bold text-lg">
                    {selectedMessage.name[0].toUpperCase()}
                  </div>
                  <div>
                    <p className="font-bold text-slate-900 dark:text-white">{selectedMessage.name}</p>
                    <p className="text-sm text-slate-500">{selectedMessage.email}</p>
                  </div>
                  <div className="ml-auto text-sm text-slate-400">
                    {new Date(selectedMessage.createdAt).toLocaleString()}
                  </div>
                </div>

                <div className="prose dark:prose-invert max-w-none">
                  {selectedMessage.message.split('\n').map((para: string, idx: number) => (
                    <p key={idx} className="mb-4 text-slate-700 dark:text-slate-300 leading-relaxed">
                      {para}
                    </p>
                  ))}
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-slate-400 bg-slate-50 dark:bg-slate-950/20">
              <div className="text-center">
                <MessageSquare size={48} className="mx-auto mb-4 opacity-20" />
                <p>Select a message to read</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
