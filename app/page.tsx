"use client";
import LoginOrRegister from "@/components/auth/LoginOrRegister";
import Loader from "@/components/common/Loader";
import LogoWithText from "@/components/common/logo/LogoWithText";
import HeroPanel, { HeroPanelMessage } from "@/components/home/HeroPanel";
import { useSession } from "next-auth/react";
import { Jersey_10 } from "next/font/google";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Client } from "@stomp/stompjs";

const font = Jersey_10({ subsets: ["latin"], weight: "400" });

const MAX_PANEL_MESSAGES = 20;
// How long a card stays visible (must match the CSS animation duration below)
const CARD_LIFETIME_MS = 10000;

function formatTime(iso: string): string {
  try {
    return new Date(iso).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" });
  } catch {
    return iso;
  }
}

function PanelMessageCard({ msg }: { msg: HeroPanelMessage }) {
  return (
    <div>
      <p className="text-white text-2xl leading-snug font-semibold">{msg.sentence}</p>
      <p className="text-white/50 text-sm mt-1 tracking-wide">{formatTime(msg.timestamp)}</p>
    </div>
  );
}

function Home() {
  const { status } = useSession();
  const router = useRouter();
  const publicClientRef = useRef<Client | null>(null);
  const panelCounterRef = useRef(0);

  // Two independent message streams — fed round-robin from /topic/live-activity
  const [panel1Messages, setPanel1Messages] = useState<HeroPanelMessage[]>([]);
  const [panel2Messages, setPanel2Messages] = useState<HeroPanelMessage[]>([]);

  // Public WebSocket connection
  useEffect(() => {
    const client = new Client({
      brokerURL: `${process.env.NEXT_PUBLIC_BACKEND_URI?.replace(/^http/, "ws")}/ws-public/websocket`,
      reconnectDelay: 5000,
      onConnect: () => {
        console.log("Connected to public websocket");

        client.subscribe("/topic/live-activity", (frame) => {
          const raw = JSON.parse(frame.body);
          const id = Date.now() + Math.random();
          const msg: HeroPanelMessage = { ...raw, id };
          const slot = panelCounterRef.current % 2;
          panelCounterRef.current++;

          // Helper: add msg to a setter and schedule its removal after the card lifetime
          const addTo = (setter: React.Dispatch<React.SetStateAction<HeroPanelMessage[]>>) => {
            setter((prev) => [...prev, msg].slice(-MAX_PANEL_MESSAGES));
            setTimeout(() => setter((prev) => prev.filter((m) => m.id !== id)), CARD_LIFETIME_MS + 100);
          };

          // Alternate messages between left and right panels
          if (slot === 0) addTo(setPanel1Messages);
          else addTo(setPanel2Messages);
        });
      },
      onStompError: (frame) => {
        console.error("Public broker error:", frame);
      },
      onWebSocketError: (error) => {
        console.error("Public WebSocket error:", error);
      },
    });

    client.activate();
    publicClientRef.current = client;

    return () => {
      client.deactivate();
    };
  }, []);

  useEffect(() => {
    if (status != "loading" && status === "authenticated") {
      router.push("/home");
    }
  }, [status, router]);

  if (status === "loading") {
    return (
      <div>
        <Loader />
      </div>
    );
  } else {
    return (
      <div className={`${font.className} w-full min-h-screen overflow-y-auto bg-white scroll-smooth`}>
        {/* Hero Section */}
        <section className="relative min-h-screen overflow-hidden bg-primary-dark">

          {/* ── Split panel background ───────────────────────────────────────
              Desktop: 3 equal columns, each streaming live WS messages.
              Mobile:  single column (panels 2 & 3 hidden).
          ─────────────────────────────────────────────────────────────────── */}
          <div className="absolute inset-0 flex">
            {/* Left panel */}
            <HeroPanel
              messages={panel1Messages}
              renderMessage={(msg) => <PanelMessageCard msg={msg} />}
            />

            {/* Right panel */}
            <HeroPanel
              messages={panel2Messages}
              renderMessage={(msg) => <PanelMessageCard msg={msg} />}
            />
          </div>

          {/* Overlay — dims the panels so the headline stays readable */}
          <div className="absolute inset-0 bg-primary-darker/60 z-[1]" />

          {/* ── Foreground content ───────────────────────────────────────────── */}
          <div className="relative z-[2] flex items-center justify-center min-h-screen">
            <div className="container mx-auto px-6 py-20 text-center">
              <div className="mb-8">
                <LogoWithText />
              </div>

              <h1 className="text-5xl md:text-7xl font-bold text-white mb-6">
                Predict. Compete. Win.
              </h1>
              <p className="text-2xl md:text-3xl text-white mb-8 max-w-3xl mx-auto opacity-90">
                Create prediction games with friends, make your guesses on future events,
                and climb the leaderboard as outcomes unfold.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
                <a
                  href="#get-started"
                  className="px-10 py-4 bg-secondary text-white text-lg rounded-lg font-semibold hover:opacity-90 transition-opacity"
                >
                  Get Started
                </a>
                <a
                  href="#how-it-works"
                  className="px-10 py-4 bg-white bg-opacity-20 text-white text-lg rounded-lg font-semibold hover:bg-opacity-30 transition-all backdrop-blur-sm"
                >
                  Learn More
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section id="how-it-works" className="py-20 bg-white relative z-10">
          <div className="container mx-auto px-6">
            <h2 className="text-4xl md:text-5xl font-bold text-center mb-4 text-primary">
              How It Works
            </h2>
            <p className="text-center text-gray-600 text-lg md:text-xl mb-16 max-w-2xl mx-auto">
              Get started in four simple steps and start competing with your friends
            </p>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              <div className="text-center">
                <div className="w-20 h-20 bg-linear-primary rounded-full flex items-center justify-center text-white text-3xl font-bold mx-auto mb-4">
                  1
                </div>
                <h3 className="text-2xl font-semibold mb-3 text-primary">Create a Room</h3>
                <p className="text-gray-600 text-lg">
                  Set up your prediction room and make it public or invite-only
                </p>
              </div>

              <div className="text-center">
                <div className="w-20 h-20 bg-linear-primary rounded-full flex items-center justify-center text-white text-3xl font-bold mx-auto mb-4">
                  2
                </div>
                <h3 className="text-2xl font-semibold mb-3 text-primary">Invite Friends</h3>
                <p className="text-gray-600 text-lg">
                  Bring your friends into the room to compete together
                </p>
              </div>

              <div className="text-center">
                <div className="w-20 h-20 bg-linear-primary rounded-full flex items-center justify-center text-white text-3xl font-bold mx-auto mb-4">
                  3
                </div>
                <h3 className="text-2xl font-semibold mb-3 text-primary">Make Predictions</h3>
                <p className="text-gray-600 text-lg">
                  Create events and submit your guesses on possible outcomes
                </p>
              </div>

              <div className="text-center">
                <div className="w-20 h-20 bg-linear-primary rounded-full flex items-center justify-center text-white text-3xl font-bold mx-auto mb-4">
                  4
                </div>
                <h3 className="text-2xl font-semibold mb-3 text-primary">Compete & Win</h3>
                <p className="text-gray-600 text-lg">
                  Track your ranking as events conclude and see who predicted best
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20 bg-gray-50 relative z-10">
          <div className="container mx-auto px-6">
            <h2 className="text-4xl md:text-5xl font-bold text-center mb-4 text-primary">
              Why Choose Guessers?
            </h2>
            <p className="text-center text-gray-600 text-lg md:text-xl mb-16 max-w-2xl mx-auto">
              Everything you need to create engaging prediction competitions
            </p>

            <div className="grid md:grid-cols-3 gap-8">
              <div className="bg-white p-8 rounded-lg shadow-sm">
                <div className="text-5xl mb-4">🎯</div>
                <h3 className="text-2xl font-semibold mb-3 text-primary">Custom Events</h3>
                <p className="text-gray-600 text-lg">
                  Create unlimited prediction events with multiple outcome options for any topic
                </p>
              </div>

              <div className="bg-white p-8 rounded-lg shadow-sm">
                <div className="text-5xl mb-4">👥</div>
                <h3 className="text-2xl font-semibold mb-3 text-primary">Social Competition</h3>
                <p className="text-gray-600 text-lg">
                  Invite friends, track rankings, and see who has the best prediction skills
                </p>
              </div>

              <div className="bg-white p-8 rounded-lg shadow-sm">
                <div className="text-5xl mb-4">📊</div>
                <h3 className="text-2xl font-semibold mb-3 text-primary">Live Rankings</h3>
                <p className="text-gray-600 text-lg">
                  Real-time leaderboards update as events are finalized and winners emerge
                </p>
              </div>

              <div className="bg-white p-8 rounded-lg shadow-sm">
                <div className="text-5xl mb-4">🔒</div>
                <h3 className="text-2xl font-semibold mb-3 text-primary">Private Rooms</h3>
                <p className="text-gray-600 text-lg">
                  Keep your predictions private with invite-only rooms or go public
                </p>
              </div>

              <div className="bg-white p-8 rounded-lg shadow-sm">
                <div className="text-5xl mb-4">📜</div>
                <h3 className="text-2xl font-semibold mb-3 text-primary">Guess Papers</h3>
                <p className="text-gray-600 text-lg">
                  Track your prediction history and see your wins, losses, and accuracy over time
                </p>
              </div>

              <div className="bg-white p-8 rounded-lg shadow-sm">
                <div className="text-5xl mb-4">⚡</div>
                <h3 className="text-2xl font-semibold mb-3 text-primary">Real-time Updates</h3>
                <p className="text-gray-600 text-lg">
                  Get instant notifications about new events, finalizations, and room activities
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Get Started Section */}
        <section id="get-started" className="py-20 bg-white relative z-10">
          <div className="container mx-auto px-6">
            <h2 className="text-4xl md:text-5xl font-bold text-center mb-4 text-primary">
              Ready to Start Guessing?
            </h2>
            <p className="text-center text-gray-600 text-lg md:text-xl mb-12 max-w-2xl mx-auto">
              Create your account or sign in to join the competition
            </p>

            <div className="max-w-12xl mx-auto">
              <div className="bg-white shadow-2xl rounded-2xl overflow-hidden border border-gray-100">
                <div className="grid lg:grid-cols-5">
                  <div className="lg:col-span-2 p-12 bg-linear-primary flex items-center justify-center">
                    <div className="text-center">
                      <div className="mb-6">
                        <LogoWithText />
                      </div>
                      <h3 className="text-white text-2xl font-bold mb-4">
                        Join the Prediction Revolution
                      </h3>
                      <div className="space-y-3 text-white text-left max-w-sm mx-auto">
                        <div className="flex items-start gap-3">
                          <svg className="w-6 h-6 flex-shrink-0 mt-1" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                          </svg>
                          <span className="text-lg">Create unlimited prediction rooms</span>
                        </div>
                        <div className="flex items-start gap-3">
                          <svg className="w-6 h-6 flex-shrink-0 mt-1" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                          </svg>
                          <span className="text-lg">Compete with friends on leaderboards</span>
                        </div>
                        <div className="flex items-start gap-3">
                          <svg className="w-6 h-6 flex-shrink-0 mt-1" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                          </svg>
                          <span className="text-lg">Track your prediction accuracy</span>
                        </div>
                        <div className="flex items-start gap-3">
                          <svg className="w-6 h-6 flex-shrink-0 mt-1" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                          </svg>
                          <span className="text-lg">100% free to use</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="lg:col-span-3 p-8 lg:p-12 bg-gray-50">
                    <LoginOrRegister />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <style jsx>{`
          @keyframes floatUp {
            0%   { opacity: 0; transform: translateY(40px); }
            12%  { opacity: 1; transform: translateY(0);    }
            80%  { opacity: 1; transform: translateY(-50px); }
            100% { opacity: 0; transform: translateY(-70px); }
          }
        `}</style>
      </div>
    );
  }
}

export default Home;
