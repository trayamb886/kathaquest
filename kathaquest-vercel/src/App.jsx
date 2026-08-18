import { useState } from "react";

// No API key needed — Pollinations is a free, open, no-signup image endpoint.
function pollinationsUrl(prompt) {
  const encoded = encodeURIComponent(prompt);
  return `https://image.pollinations.ai/prompt/${encoded}?width=768&height=512&nologo=true`;
}

async function callTurn(history) {
  const resp = await fetch("/api/turn", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ history }),
  });
  if (!resp.ok) throw new Error("Failed to reach the story engine");
  return resp.json();
}

export default function App() {
  const [history, setHistory] = useState([]); // Gemini-format conversation so far
  const [setting, setSetting] = useState("a merchant in the Vijayanagara Empire");
  const [scene, setScene] = useState(null); // { narration, choices, image_prompt, is_ending }
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  async function startStory() {
    setLoading(true);
    setError(null);
    try {
      const userTurn = {
        role: "user",
        parts: [
          {
            text: `The player wants to be ${setting}. Start the story: set the scene (time period, place, the player's role) and give the first choice.`,
          },
        ],
      };
      const story = await callTurn([userTurn]);
      setHistory([userTurn, { role: "model", parts: [{ text: JSON.stringify(story) }] }]);
      setScene(story);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  async function choose(choice) {
    setLoading(true);
    setError(null);
    try {
      const userTurn = {
        role: "user",
        parts: [{ text: `The player chose: "${choice}". Continue the story from here.` }],
      };
      const newHistory = [...history, userTurn];
      const story = await callTurn(newHistory);
      setHistory([...newHistory, { role: "model", parts: [{ text: JSON.stringify(story) }] }]);
      setScene(story);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  function restart() {
    setHistory([]);
    setScene(null);
    setError(null);
  }

  if (!scene) {
    return (
      <div className="start-screen">
        <h1>KathaQuest</h1>
        <p className="tagline">A generative historical visual novel</p>
        <label htmlFor="setting">I want to be...</label>
        <input
          id="setting"
          value={setting}
          onChange={(e) => setSetting(e.target.value)}
          placeholder="a merchant in the Vijayanagara Empire"
        />
        <button onClick={startStory} disabled={loading || !setting.trim()}>
          {loading ? "Conjuring your story..." : "Begin Quest"}
        </button>
        {error && <p className="error">{error}</p>}
      </div>
    );
  }

  return (
    <div className="game-screen">
      <div className="image-panel">
        <img src={pollinationsUrl(scene.image_prompt)} alt="scene" />
      </div>

      <div className="dialogue-box">
        <p>{scene.narration}</p>

        {error && <p className="error">{error}</p>}

        {scene.is_ending ? (
          <button onClick={restart}>Play Again</button>
        ) : (
          <div className="choices">
            {scene.choices.map((c, i) => (
              <button key={i} onClick={() => choose(c)} disabled={loading}>
                {loading ? "..." : c}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
