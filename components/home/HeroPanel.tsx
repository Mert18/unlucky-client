"use client";

export type HeroPanelMessage = {
  id: number; // synthetic, generated client-side for keying
  sentence: string;
  timestamp: string; // ISO-8601
};

type HeroPanelProps = {
  messages: HeroPanelMessage[];
  renderMessage: (msg: HeroPanelMessage) => React.ReactNode;
};

export default function HeroPanel({ messages, renderMessage }: HeroPanelProps) {
  const latest = messages[messages.length - 1];

  return (
    <div className="flex-1 flex flex-col items-center justify-end h-full overflow-hidden px-6 pb-12">
      {latest && (
        <div
          key={latest.id}
          className="text-center"
          style={{ animation: "floatUp 10s ease-in-out forwards" }}
        >
          {renderMessage(latest)}
        </div>
      )}
    </div>
  );
}
