"use client";

import { useState, useRef, useEffect } from "react";
import GlassPanel from "@/components/HUD/GlassPanel";
import { useAppStore, ChatMessage } from "@/lib/store";
import { useTranslation } from "@/lib/i18n";
import { Send, Camera, FileText } from "lucide-react";

function MessageBubble({
  message,
  youLabel,
  aiLabel,
}: {
  message: ChatMessage;
  youLabel: string;
  aiLabel: string;
}) {
  const isUser = message.role === "user";

  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"} mb-3`}>
      <div
        className={`max-w-[85%] rounded-xl px-3 py-2.5 text-xs leading-relaxed ${
          isUser
            ? "bg-holographic-blue/10 border border-holographic-blue/30 text-white"
            : "bg-neon-green/5 border border-neon-green/20 text-gray-200"
        }`}
      >
        <div className={`text-[10px] font-mono mb-1 ${isUser ? "text-holographic-blue" : "text-neon-green"}`}>
          {isUser ? youLabel : aiLabel} | {message.timestamp}
        </div>

        {message.imageUrl && (
          <div className="mb-2 rounded-lg overflow-hidden border border-white/10 bg-white/5 p-4 flex items-center gap-2">
            <div className="w-12 h-12 rounded bg-gradient-to-br from-green-900 to-green-700 flex items-center justify-center">
              <Camera className="w-5 h-5 text-neon-green/60" />
            </div>
            <div className="text-[10px] text-gray-400 font-mono">leaf-photo-001.jpg</div>
          </div>
        )}

        <div className="whitespace-pre-wrap">{message.content}</div>
      </div>
    </div>
  );
}

function TypingIndicator({ aiLabel }: { aiLabel: string }) {
  return (
    <div className="flex justify-start mb-3">
      <div className="bg-neon-green/5 border border-neon-green/20 rounded-xl px-4 py-3">
        <div className="text-[10px] font-mono text-neon-green mb-1">{aiLabel}</div>
        <div className="flex items-center gap-1.5">
          <div className="w-1.5 h-1.5 rounded-full bg-neon-green typing-dot" />
          <div className="w-1.5 h-1.5 rounded-full bg-neon-green typing-dot" />
          <div className="w-1.5 h-1.5 rounded-full bg-neon-green typing-dot" />
        </div>
      </div>
    </div>
  );
}

export default function AIChatPanel() {
  const { chatMessages, addChatMessage } = useAppStore();
  const { t, locale } = useTranslation();
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const labels = {
    you: { en: "YOU", zh: "你", th: "คุณ" },
    ai: { en: "AI AGRONOMIST", zh: "AI 农学顾问", th: "AI ที่ปรึกษาเกษตร" },
    apiUnavailable: { en: "AI service unavailable:", zh: "AI 服务暂时不可用：", th: "บริการ AI ไม่พร้อมใช้งาน:" },
    analysisComplete: { en: "Analysis complete.", zh: "分析完成。", th: "วิเคราะห์เสร็จสิ้น" },
    reportFailed: { en: "Report generation failed:", zh: "周报生成失败：", th: "สร้างรายงานล้มเหลว:" },
    reportFailedDefault: { en: "Report generation failed", zh: "生成周报失败", th: "สร้างรายงานล้มเหลว" },
    reportTitle: { en: "Weekly Report (ZONE-B)", zh: "本周农情周报（ZONE-B）", th: "รายงานประจำสัปดาห์ (ZONE-B)" },
    reportEmpty: { en: "No report content", zh: "无报告内容", th: "ไม่มีเนื้อหารายงาน" },
    uploadedPrompt: {
      en: "Image uploaded. Please provide diagnosis and treatment steps.",
      zh: "图片已上传，请提供诊断和处理建议。",
      th: "อัปโหลดรูปแล้ว กรุณาวินิจฉัยและแนะนำวิธีรักษา",
    },
    generating: { en: "GENERATING...", zh: "生成中...", th: "กำลังสร้าง..." },
  } as const;

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages, isTyping]);

  const nowText = () => new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  const handleSend = async () => {
    const text = input.trim();
    if (!text) return;

    addChatMessage({ role: "user", content: text, timestamp: nowText() });
    setInput("");
    setIsTyping(true);

    try {
      const history = chatMessages.slice(-8).map((msg) => ({
        role: msg.role === "ai" ? "assistant" : "user",
        content: msg.content,
      }));

      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text, history }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error((err as { error?: string }).error || "API unavailable");
      }

      const data = (await res.json()) as { reply?: string };
      addChatMessage({ role: "ai", content: data.reply || labels.analysisComplete[locale], timestamp: nowText() });
    } catch (error) {
      const msg = error instanceof Error ? error.message : labels.apiUnavailable[locale];
      addChatMessage({ role: "ai", content: `${labels.apiUnavailable[locale]} ${msg}`, timestamp: nowText() });
    } finally {
      setIsTyping(false);
    }
  };

  const handleGenerateReport = async () => {
    setIsGeneratingReport(true);
    try {
      const res = await fetch("/api/ai/report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ zoneId: "ZONE-B" }),
      });

      const data = (await res.json()) as { success?: boolean; report?: string; error?: string };
      if (!res.ok || !data.success) {
        throw new Error(data.error || labels.reportFailedDefault[locale]);
      }

      addChatMessage({
        role: "ai",
        content: `**${labels.reportTitle[locale]}**\n\n${data.report || labels.reportEmpty[locale]}`,
        timestamp: nowText(),
      });
    } catch (error) {
      const msg = error instanceof Error ? error.message : labels.reportFailedDefault[locale];
      addChatMessage({ role: "ai", content: `${labels.reportFailed[locale]} ${msg}`, timestamp: nowText() });
    } finally {
      setIsGeneratingReport(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <GlassPanel title={t("aiAgronomist")} className="h-full flex flex-col">
      <div className="flex flex-col h-full min-h-0">
        <div className="flex-1 overflow-y-auto pr-1 min-h-0">
          {chatMessages.map((msg, i) => (
            <MessageBubble key={i} message={msg} youLabel={labels.you[locale]} aiLabel={labels.ai[locale]} />
          ))}
          {isTyping && <TypingIndicator aiLabel={labels.ai[locale]} />}
          <div ref={messagesEndRef} />
        </div>

        <div className="flex-shrink-0 pt-3 border-t border-white/10 mt-2">
          <div className="flex items-center gap-2">
            <button
              onClick={() => fileInputRef.current?.click()}
              className="p-2 rounded-lg border border-white/10 bg-white/5 hover:border-holographic-blue/50 transition-colors text-gray-400 hover:text-holographic-blue"
            >
              <Camera className="w-4 h-4" />
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={() => {
                addChatMessage({
                  role: "user",
                  content: labels.uploadedPrompt[locale],
                  timestamp: nowText(),
                  imageUrl: "/uploaded-image.jpg",
                });
              }}
            />

            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={t("askAiPlaceholder")}
              className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-holographic-blue/50 transition-colors"
            />
            <button
              onClick={handleSend}
              disabled={!input.trim()}
              className="p-2 rounded-lg bg-holographic-blue/20 border border-holographic-blue/30 text-holographic-blue hover:bg-holographic-blue/30 transition-all disabled:opacity-30 disabled:cursor-not-allowed shadow-[0_0_10px_rgba(0,176,255,0.15)]"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>

          <button
            onClick={handleGenerateReport}
            disabled={isGeneratingReport}
            className="w-full mt-2 py-2 rounded-lg border border-holographic-blue/30 bg-holographic-blue/10 text-holographic-blue text-xs font-mono tracking-wider hover:bg-holographic-blue/20 transition-all shadow-[0_0_15px_rgba(0,176,255,0.1)] flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <FileText className="w-3.5 h-3.5" />
            {isGeneratingReport ? labels.generating[locale] : t("generateReport").toUpperCase()}
          </button>
        </div>
      </div>
    </GlassPanel>
  );
}
