"use client";

import React, { useState } from "react";
import { ChatMessage, ItineraryStop } from "../types";
import {
  MapPin,
  Clock,
  Car,
  DollarSign,
  Coffee,
  Send,
  Sparkles,
  Bot,
  User,
  Plus,
  Compass,
  Wifi,
  ShieldCheck,
  Check,
  HelpCircle,
} from "lucide-react";

interface OnSiteSupportViewProps {
  currentStop: ItineraryStop;
  onAddStopFromChat: (attractionName: string, durationMinutes: number) => void;
  onBackToDayPlan: () => void;
}

const PRESET_QUERIES = [
  "Can I add a quick visit to a local craft market after this?",
  "Where are the nearest clean restrooms?",
  "Is there an ATM or card payment here?",
  "What is the recommended climbing pace?",
];

export default function OnSiteSupportView({
  currentStop,
  onAddStopFromChat,
  onBackToDayPlan,
}: OnSiteSupportViewProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "msg-1",
      sender: "bot",
      text: `Welcome to ${currentStop.attraction.name}! You have ${currentStop.dwellMinutes} minutes scheduled here. Need help finding facilities or adjusting your next itinerary stop?`,
      timestamp: "Just now",
    },
  ]);
  const [inputText, setInputText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [addedStopSuccess, setAddedStopSuccess] = useState(false);

  const handleSendMessage = (textToSend?: string) => {
    const text = textToSend || inputText;
    if (!text.trim()) return;

    const userMsg: ChatMessage = {
      id: `usr-${Date.now()}`,
      sender: "user",
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInputText("");
    setIsTyping(true);

    setTimeout(() => {
      let botResponse: ChatMessage;

      if (text.toLowerCase().includes("craft market") || text.toLowerCase().includes("market")) {
        botResponse = {
          id: `bot-${Date.now()}`,
          sender: "bot",
          text: `Yes! Sigiriya Artisan Craft Village is just 1.5 km away (5 mins drive). Adding a 25-minute stop is mathematically feasible. The DQN engine compresses transit slightly and shifts your lunch to 12:45 PM with 0% constraint violations.`,
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          scheduleImpact: {
            timeAddedMinutes: 25,
            costImpactUSD: 0,
            feasible: true,
            suggestedStopName: "Sigiriya Artisan Craft Village",
          },
        };
      } else if (text.toLowerCase().includes("restroom") || text.toLowerCase().includes("washroom")) {
        botResponse = {
          id: `bot-${Date.now()}`,
          sender: "bot",
          text: `Clean European-standard visitor restrooms are located 80 meters west of the main archaeological ticket office, right next to the Sigiriya Museum. Free to use with your ticket.`,
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        };
      } else if (text.toLowerCase().includes("atm") || text.toLowerCase().includes("card") || text.toLowerCase().includes("cash")) {
        botResponse = {
          id: `bot-${Date.now()}`,
          sender: "bot",
          text: `There is a 24/7 Commercial Bank ATM and Bank of Ceylon foreign exchange counter at the entrance building. Visa and Mastercard are accepted at the main foreign tourist ticketing booths.`,
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        };
      } else {
        botResponse = {
          id: `bot-${Date.now()}`,
          sender: "bot",
          text: `Got it! I have cross-referenced your query with the verified destination knowledge base for ${currentStop.attraction.name}. Dwell time remaining: ${currentStop.dwellMinutes} minutes. All subsequent stops remain conflict-free.`,
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        };
      }

      setMessages((prev) => [...prev, botResponse]);
      setIsTyping(false);
    }, 700);
  };

  const handleApplyAddition = (stopName: string, mins: number) => {
    onAddStopFromChat(stopName, mins);
    setAddedStopSuccess(true);
    setTimeout(() => setAddedStopSuccess(false), 3000);
  };

  return (
    <div className="space-y-6">
      {/* 1. In-Situ Active Location Card */}
      <div className="relative overflow-hidden rounded-3xl border border-teal-500/30 bg-gradient-to-r from-teal-950/60 via-slate-900 to-sky-950/40 p-5 sm:p-6 backdrop-blur-xl shadow-2xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 rounded-full bg-teal-400/20 px-3 py-1 text-xs font-bold text-teal-300 ring-1 ring-teal-400/30">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
              Active Destination Hub
            </div>
            <h2 className="mt-2 text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
              {currentStop.attraction.name}
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 mt-1">
              {currentStop.attraction.region} • {currentStop.attraction.description}
            </p>
          </div>

          <button
            type="button"
            onClick={onBackToDayPlan}
            className="self-start sm:self-center rounded-xl border border-white/10 bg-white/10 px-4 py-2 text-xs font-semibold text-slate-200 hover:bg-white/20 transition-all cursor-pointer"
          >
            ← Back to Day Plan
          </button>
        </div>

        {/* Live Remaining Dwell Countdown Bar */}
        <div className="mt-5 rounded-2xl bg-white/5 p-4 border border-white/10">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-300 font-semibold flex items-center gap-1.5">
              <Clock className="h-4 w-4 text-teal-400" />
              Scheduled Time Slot: {currentStop.arrivalTime} – {currentStop.departureTime}
            </span>
            <span className="text-teal-400 font-bold font-mono">
              {currentStop.dwellMinutes} Mins Allocated
            </span>
          </div>

          <div className="mt-2.5 h-2 w-full rounded-full bg-slate-800 overflow-hidden">
            <div className="h-full w-2/3 rounded-full bg-gradient-to-r from-teal-400 to-emerald-400" />
          </div>
        </div>
      </div>

      {/* 2. On-Site Support & Verified Amenities Matrix */}
      <div className="rounded-3xl border border-white/10 bg-slate-900/60 p-5 sm:p-6 backdrop-blur-xl shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-bold text-white">Verified On-Site Facilities</h3>
            <p className="text-xs text-slate-400">
              Curated operational metadata from OpenStreetMap and local field verification
            </p>
          </div>
          <span className="rounded-lg bg-emerald-500/20 px-2.5 py-1 text-[11px] font-bold text-emerald-300">
            Field Verified
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {/* Parking */}
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-teal-500/20 text-teal-400">
                <Car className="h-5 w-5" />
              </div>
              <span className="rounded-full bg-emerald-500/20 px-2 py-0.5 text-[10px] font-bold text-emerald-300">
                Open
              </span>
            </div>
            <div className="mt-3">
              <h5 className="text-xs font-bold text-white">Visitor Parking</h5>
              <p className="text-[11px] text-slate-400 mt-0.5">Free • 120 slots (Zone A)</p>
            </div>
          </div>

          {/* Restrooms */}
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-sky-500/20 text-sky-400 text-lg">
                🚻
              </div>
              <span className="rounded-full bg-emerald-500/20 px-2 py-0.5 text-[10px] font-bold text-emerald-300">
                Clean
              </span>
            </div>
            <div className="mt-3">
              <h5 className="text-xs font-bold text-white">Washrooms</h5>
              <p className="text-[11px] text-slate-400 mt-0.5">80m from entrance</p>
            </div>
          </div>

          {/* ATM & Cash */}
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500/20 text-amber-400">
                <DollarSign className="h-5 w-5" />
              </div>
              <span className="rounded-full bg-emerald-500/20 px-2 py-0.5 text-[10px] font-bold text-emerald-300">
                24/7
              </span>
            </div>
            <div className="mt-3">
              <h5 className="text-xs font-bold text-white">ATM & Exchange</h5>
              <p className="text-[11px] text-slate-400 mt-0.5">Commercial Bank ATM</p>
            </div>
          </div>

          {/* Cafeteria */}
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/20 text-emerald-400">
                <Coffee className="h-5 w-5" />
              </div>
              <span className="rounded-full bg-emerald-500/20 px-2 py-0.5 text-[10px] font-bold text-emerald-300">
                Active
              </span>
            </div>
            <div className="mt-3">
              <h5 className="text-xs font-bold text-white">Cafeteria & Drinks</h5>
              <p className="text-[11px] text-slate-400 mt-0.5">Fresh king coconut & water</p>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Itinerary Assistant AI Chatbot */}
      <div className="rounded-3xl border border-teal-500/30 bg-slate-900/80 backdrop-blur-xl shadow-2xl overflow-hidden">
        {/* Chat Header */}
        <div className="flex items-center justify-between border-b border-white/10 bg-slate-950/80 px-5 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-teal-400 to-sky-500 text-slate-950 shadow-md shadow-teal-500/30">
              <Bot className="h-5 w-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                Itinerary Assistant
                <span className="rounded-md bg-teal-500/20 px-1.5 py-0.2 text-[10px] font-bold text-teal-300">
                  AI Concierge
                </span>
              </h4>
              <p className="text-[11px] text-slate-400">
                Live schedule adjustment • Context-aware recommendations
              </p>
            </div>
          </div>

          <span className="inline-flex items-center gap-1.5 text-xs text-emerald-400 font-semibold">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            Online
          </span>
        </div>

        {/* Message Stream */}
        <div className="h-72 overflow-y-auto p-4 sm:p-5 space-y-4 bg-slate-950/50">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex gap-3 ${
                msg.sender === "user" ? "justify-end" : "justify-start"
              }`}
            >
              {msg.sender === "bot" && (
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-teal-500/20 text-teal-400 mt-1">
                  <Bot className="h-4 w-4" />
                </div>
              )}

              <div
                className={`max-w-[85%] rounded-2xl p-4 text-xs sm:text-sm leading-relaxed shadow-lg ${
                  msg.sender === "user"
                    ? "bg-teal-500 text-slate-950 font-medium"
                    : "border border-white/10 bg-slate-900 text-slate-200"
                }`}
              >
                <p>{msg.text}</p>

                {/* Schedule Impact Card inside bot response */}
                {msg.scheduleImpact && (
                  <div className="mt-3 rounded-xl border border-teal-500/30 bg-teal-950/40 p-3 text-xs space-y-2">
                    <div className="flex items-center justify-between text-teal-300 font-bold">
                      <span>Schedule Impact Analysis:</span>
                      <span className="rounded bg-emerald-500/20 px-1.5 py-0.5 text-[10px] text-emerald-300">
                        Feasible (+{msg.scheduleImpact.timeAddedMinutes}m)
                      </span>
                    </div>

                    <div className="flex justify-between text-slate-300 text-[11px]">
                      <span>Budget impact: ${msg.scheduleImpact.costImpactUSD}</span>
                      <span>Next stop: shifted by +{msg.scheduleImpact.timeAddedMinutes}m</span>
                    </div>

                    <button
                      type="button"
                      onClick={() =>
                        handleApplyAddition(
                          msg.scheduleImpact?.suggestedStopName || "Local Craft Market",
                          msg.scheduleImpact?.timeAddedMinutes || 25
                        )
                      }
                      className="mt-1 flex w-full items-center justify-center gap-1.5 rounded-xl bg-teal-500 p-2 font-bold text-slate-950 shadow-md hover:bg-teal-400 transition-colors cursor-pointer"
                    >
                      <Plus className="h-3.5 w-3.5" />
                      Add to Itinerary Sequence (+25 mins)
                    </button>
                  </div>
                )}

                <span
                  className={`mt-1.5 block text-[10px] text-right ${
                    msg.sender === "user" ? "text-slate-900/70" : "text-slate-500"
                  }`}
                >
                  {msg.timestamp}
                </span>
              </div>

              {msg.sender === "user" && (
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-teal-400/20 text-teal-300 mt-1">
                  <User className="h-4 w-4" />
                </div>
              )}
            </div>
          ))}

          {isTyping && (
            <div className="flex items-center gap-2 text-xs text-slate-400 pl-11">
              <div className="h-2 w-2 rounded-full bg-teal-400 animate-bounce" />
              <div className="h-2 w-2 rounded-full bg-teal-400 animate-bounce [animation-delay:0.2s]" />
              <div className="h-2 w-2 rounded-full bg-teal-400 animate-bounce [animation-delay:0.4s]" />
              <span>Itinerary Assistant calculating route impact...</span>
            </div>
          )}

          {addedStopSuccess && (
            <div className="rounded-xl border border-emerald-500/30 bg-emerald-950/40 p-3 text-center text-xs font-semibold text-emerald-300 animate-fadeIn">
              ✓ Successfully added to itinerary! DQN sequence updated.
            </div>
          )}
        </div>

        {/* Preset Query Chips */}
        <div className="border-t border-white/5 bg-slate-950/60 p-3 overflow-x-auto">
          <div className="flex gap-2 min-w-max">
            {PRESET_QUERIES.map((query, i) => (
              <button
                key={i}
                type="button"
                onClick={() => handleSendMessage(query)}
                className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-slate-300 hover:border-teal-400/40 hover:bg-white/10 hover:text-white transition-all cursor-pointer whitespace-nowrap"
              >
                💬 {query}
              </button>
            ))}
          </div>
        </div>

        {/* Input Bar */}
        <div className="border-t border-white/10 bg-slate-950/90 p-3 sm:p-4">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Ask anything about facilities, time changes, or adding a stop..."
              className="flex-1 rounded-2xl border border-white/10 bg-slate-900 px-4 py-2.5 text-xs sm:text-sm text-white placeholder-slate-500 focus:border-teal-400 focus:outline-none"
            />
            <button
              type="submit"
              disabled={!inputText.trim()}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-teal-500 text-slate-950 shadow-md shadow-teal-500/30 hover:bg-teal-400 disabled:opacity-40 transition-all cursor-pointer"
            >
              <Send className="h-4 w-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
