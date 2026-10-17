
const express = require("express");
const path = require("path");

const app = express();
const PORT = 3000;

// Change this if your installed Ollama model has a different name.
const MODEL = "llama3.2:1b";

app.use(express.json({ limit: "1mb" }));
app.use(express.static(__dirname));

async function askOllama(message, systemPrompt) {
    const response = await fetch("http://127.0.0.1:11434/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            model: MODEL,
            stream: false,
            messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: message }
            ],
            options: {
    temperature: 0.4,
    num_predict: 100
}
        })
    });

    if (!response.ok) {
        const details = await response.text();
        throw new Error(`Ollama error: ${details}`);
    }

    const data = await response.json();
    return data.message?.content || "The AI returned an empty response.";
}

// AI chat assistant: Manage with AI
app.post("/api/assistant", async (req, res) => {
    try {
        const message = req.body.message;

        if (typeof message !== "string" || !message.trim()) {
            return res.status(400).json({ error: "Please enter a message." });
        }

        const reply = await askOllama(
            message.trim(),
            `You are a helpful AI assistant inside a photo storage app.
Answer in 2-3 short sentences maximum.
Use simple, clear language and get straight to the point.
Use bullet points only when necessary.
Help with photo organization, albums, and storage.
Never claim to access actual photos or account data unless provided.`
        );

        res.json({ reply });
    } catch (error) {
        console.error("Assistant error:", error.message);
        res.status(500).json({
            error: "Could not contact Ollama. Check that Ollama is running and the model is installed."
        });
    }
});

// AI album suggestions: Organize photos
app.post("/api/organize", async (req, res) => {
    try {
        const photos = req.body.photos;

        if (!Array.isArray(photos) || photos.length === 0) {
            return res.status(400).json({
                error: "No photos were provided to organize."
            });
        }

        // Only send photo descriptions, not arbitrary files or image URLs.
        const safePhotos = photos.slice(0, 100).map((photo, index) => ({
            id: String(photo.id ?? index),
            name: String(photo.name ?? "Untitled photo").slice(0, 100),
            category: String(photo.category ?? "Uncategorized").slice(0, 60),
            date: String(photo.date ?? "Unknown date").slice(0, 40)
        }));

        const prompt = `
Suggest 2 to 5 useful photo albums from this list.
Group photos by meaningful themes, places, activities, or dates.
Use only the supplied photo IDs. Do not invent photos.
Return ONLY valid JSON in this exact format:
{
  "albums": [
    {
      "name": "Album name",
      "reason": "Short explanation",
      "photoIds": ["0", "1"]
    }
  ]
}

Photos:
${JSON.stringify(safePhotos)}
`;

        const raw = await askOllama(
            prompt,
            "You organize photo libraries. Follow the requested JSON format exactly."
        );

        // Extract JSON in case the model adds markdown around it.
        const jsonText = raw.replace(/```json|```/gi, "").trim();
        const start = jsonText.indexOf("{");
        const end = jsonText.lastIndexOf("}");

        if (start === -1 || end === -1) {
            throw new Error("The model did not return valid JSON.");
        }

        const result = JSON.parse(jsonText.slice(start, end + 1));

        if (!Array.isArray(result.albums)) {
            throw new Error("The model returned no album list.");
        }

        // Keep only IDs that actually exist in the supplied list.
        const validIds = new Set(safePhotos.map(photo => photo.id));

        result.albums = result.albums.map(album => ({
            name: String(album.name || "Suggested album").slice(0, 80),
            reason: String(album.reason || "Grouped by the AI.").slice(0, 250),
            photoIds: Array.isArray(album.photoIds)
                ? album.photoIds.map(String).filter(id => validIds.has(id))
                : []
        }));

        res.json(result);
    } catch (error) {
        console.error("Organize error:", error.message);
        res.status(500).json({
            error: "AI album generation failed. Try again or check your Ollama model."
        });
    }
});

app.get("/api/health", (req, res) => {
    res.json({ status: "ok", model: MODEL });
});

app.listen(PORT, () => {
    console.log(`Photo app running at http://localhost:${PORT}`);
});
