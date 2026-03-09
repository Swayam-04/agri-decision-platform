"use client";

import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CROP_LIST, REGION_LIST, SEASON_LIST } from "@/lib/types";
import type { ChatMessage } from "@/lib/types";
import { Bot, User, Send, Loader2, Sparkles } from "lucide-react";

export default function ChatbotPage() {
  const [cropType, setCropType] = useState("Rice");
  const [region, setRegion] = useState("Punjab");
  const [season, setSeason] = useState("Kharif");
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: "assistant",
      content: "Namaste! I'm your CropIntel AI assistant. I can help you with disease risk, profit estimates, market advice, irrigation guidance, and pest alerts.\n\nWhat would you like to know about your farm?",
      timestamp: new Date().toISOString(),
    },
  ]);
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([
    "What diseases affect my crop?",
    "How much profit can I expect?",
    "Should I sell or store?",
    "Is pest risk high right now?",
  ]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function sendMessage(text?: string) {
    const message = text || input;
    if (!message.trim()) return;

    const userMsg: ChatMessage = { role: "user", content: message, timestamp: new Date().toISOString() };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/chatbot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message, cropType, region, season, history: messages }),
      });
      const data = await res.json();
      const botMsg: ChatMessage = { role: "assistant", content: data.reply, timestamp: new Date().toISOString() };
      setMessages((prev) => [...prev, botMsg]);
      setSuggestions(data.suggestions || []);
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Sorry, I had trouble understanding that. Please try again.", timestamp: new Date().toISOString() },
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-4">
      <div>
        <h1 className="text-2xl font-bold text-foreground">AI Farm Assistant</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Ask questions about diseases, profit, irrigation, market advice, and more in simple language.
        </p>
      </div>

      {/* Context Bar */}
      <Card>
        <CardContent className="pt-4 pb-4">
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-xs text-muted-foreground">Context:</span>
            <Select value={cropType} onValueChange={setCropType}>
              <SelectTrigger className="w-[130px] h-8 text-xs"><SelectValue /></SelectTrigger>
              <SelectContent>{CROP_LIST.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
            </Select>
            <Select value={region} onValueChange={setRegion}>
              <SelectTrigger className="w-[160px] h-8 text-xs"><SelectValue /></SelectTrigger>
              <SelectContent>{REGION_LIST.map((r) => <SelectItem key={r} value={r}>{r}</SelectItem>)}</SelectContent>
            </Select>
            <Select value={season} onValueChange={setSeason}>
              <SelectTrigger className="w-[110px] h-8 text-xs"><SelectValue /></SelectTrigger>
              <SelectContent>{SEASON_LIST.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Chat Area */}
      <Card className="h-[500px] flex flex-col">
        <CardHeader className="pb-2 border-b">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Bot className="h-4 w-4 text-emerald-500" />
            CropIntel AI Chat
            <Sparkles className="h-3 w-3 text-yellow-500" />
          </CardTitle>
        </CardHeader>
        <CardContent className="flex-1 overflow-y-auto py-4 space-y-4">
          {messages.map((msg, i) => (
            <div key={i} className={`flex gap-3 ${msg.role === "user" ? "justify-end" : ""}`}>
              {msg.role === "assistant" && (
                <div className="h-7 w-7 rounded-full bg-emerald-100 flex items-center justify-center shrink-0 mt-0.5">
                  <Bot className="h-4 w-4 text-emerald-600" />
                </div>
              )}
              <div className={`rounded-xl px-4 py-3 max-w-[80%] ${
                msg.role === "user"
                  ? "bg-emerald-600 text-white"
                  : "bg-muted"
              }`}>
                <p className="text-sm whitespace-pre-line">{msg.content}</p>
                <p className={`text-[10px] mt-1.5 ${msg.role === "user" ? "text-emerald-100" : "text-muted-foreground"}`}>
                  {new Date(msg.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </p>
              </div>
              {msg.role === "user" && (
                <div className="h-7 w-7 rounded-full bg-emerald-600 flex items-center justify-center shrink-0 mt-0.5">
                  <User className="h-4 w-4 text-white" />
                </div>
              )}
            </div>
          ))}
          {loading && (
            <div className="flex gap-3">
              <div className="h-7 w-7 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
                <Bot className="h-4 w-4 text-emerald-600" />
              </div>
              <div className="bg-muted rounded-xl px-4 py-3">
                <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </CardContent>

        {/* Suggestions */}
        {suggestions.length > 0 && !loading && (
          <div className="px-4 pb-2 flex flex-wrap gap-1.5">
            {suggestions.map((s, i) => (
              <button
                key={i}
                onClick={() => sendMessage(s)}
                className="text-[11px] px-2.5 py-1 rounded-full border border-emerald-200 text-emerald-700 hover:bg-emerald-50 transition-colors"
              >
                {s}
              </button>
            ))}
          </div>
        )}

        {/* Input */}
        <div className="p-4 border-t">
          <form
            onSubmit={(e) => { e.preventDefault(); sendMessage(); }}
            className="flex gap-2"
          >
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about your crop, disease, profit, market..."
              className="flex-1"
              disabled={loading}
            />
            <Button type="submit" disabled={loading || !input.trim()} className="bg-emerald-600 hover:bg-emerald-700 text-white">
              <Send className="h-4 w-4" />
            </Button>
          </form>
        </div>
      </Card>
    </div>
  );
}
