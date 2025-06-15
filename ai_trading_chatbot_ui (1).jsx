// AI Trading Chatbot - Web Chat UI (React + TailwindCSS + Stock API + Indicators + GPT-4o)

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { SendHorizonal } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from "recharts";

export default function TradingChatBot() {
  const [messages, setMessages] = useState([
    { role: "bot", text: "Hi! Ask me about stock breakouts, fundamentals, or profit potential." }
  ]);
  const [input, setInput] = useState("");
  const [chartData, setChartData] = useState([]);

  const handleSend = async () => {
    if (!input.trim()) return;
    const userMessage = { role: "user", text: input };
    setMessages(prev => [...prev, userMessage]);
    setInput("");

    const stockSymbol = extractStockSymbol(input);

    if (stockSymbol) {
      const response = await fetch(`/api/analyze?symbol=${stockSymbol}`);
      const data = await response.json();

      if (data && data.chart) {
        setChartData(data.chart);
      }

      const gptResponse = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: input })
      });
      const gptData = await gptResponse.json();

      setMessages(prev => [...prev, { role: "bot", text: gptData.result }]);
    } else {
      const gptResponse = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: input })
      });
      const gptData = await gptResponse.json();

      setMessages(prev => [...prev, { role: "bot", text: gptData.result }]);
    }
  };

  const extractStockSymbol = (text) => {
    const match = text.match(/\b[A-Z]{3,5}\b/);
    return match ? match[0] : null;
  };

  return (
    <div className="max-w-3xl mx-auto p-4">
      <Card className="rounded-2xl shadow-lg">
        <CardContent className="p-4 space-y-4">
          <h2 className="text-2xl font-semibold">📈 AI Trading ChatBot</h2>
          <ScrollArea className="h-80 p-2 border rounded-xl bg-gray-50">
            <div className="space-y-3">
              {messages.map((msg, i) => (
                <div key={i} className={msg.role === "user" ? "text-right" : "text-left"}>
                  <div
                    className={`inline-block px-4 py-2 rounded-xl max-w-[80%] ${
                      msg.role === "user"
                        ? "bg-blue-500 text-white"
                        : "bg-gray-200 text-gray-800"
                    }`}
                  >
                    {msg.text}
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
          {chartData.length > 0 && (
            <div className="bg-white p-4 rounded-xl shadow-md">
              <h3 className="text-lg font-bold mb-2">📊 Price Chart + RSI + MACD</h3>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={chartData}>
                  <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                  <YAxis domain={['auto', 'auto']} />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="close" stroke="#3b82f6" strokeWidth={2} name="Close" />
                  <Line type="monotone" dataKey="rsi" stroke="#f59e0b" strokeDasharray="5 5" name="RSI" />
                  <Line type="monotone" dataKey="macd" stroke="#10b981" strokeDasharray="3 3" name="MACD" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
          <div className="flex gap-2">
            <Input
              placeholder="Ask about stock patterns, fundamentals..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              className="flex-grow"
            />
            <Button onClick={handleSend}>
              <SendHorizonal size={18} />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
