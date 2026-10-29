require("dotenv").config();

const express = require("express");
const cors = require("cors");
const Groq = require("groq-sdk");

const app = express();
const PORT = process.env.PORT || 3001;

if (!process.env.GROQ_API_KEY) {
  console.error("Missing GROQ_API_KEY in .env");
  process.exit(1);
}

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

app.use(cors());
app.use(express.json({ limit: "1mb" }));

/* ------------------------------------------------------------------ */
/* Chat                                                                */
/* ------------------------------------------------------------------ */

const SYSTEM_PROMPT = `You are Veyra, a friendly health companion in a mobile app. Your users have NO medical knowledge. Use simple, everyday words and explain any medical term the first time you use it.

SAFETY
- You give information, not diagnoses. Say "this can be linked to..." or "this may point to...", never "you have...".
- Never give medication names or doses. Food, lifestyle and habit advice is fine.
- If a value is dangerously far outside its range, or symptoms sound like an emergency, tell the user to see a doctor or go to urgent care soon.

WHEN THE USER SENDS A MEDICAL REPORT (blood test, urine test, lipid profile, thyroid, sugar, liver, kidney, vitamins, etc.)

Step 1. Read EVERY test in the report, not only the first ones or the famous ones. Compare each value with the reference range printed in the report. If a test has no range, use typical adult ranges. Also use any H, L, High, Low or arrow flags the report shows.
Step 2. Sort every test into HIGH, LOW or NORMAL. Do not skip any test and do not invent tests that are not in the report.
Step 3. Never mention or repeat: patient name, age, ID numbers, dates, hospital or lab name, doctor name, address or sample details. Do not describe the document itself.

Use exactly this structure:

**Quick summary**
One or two sentences, with counts. Example: "14 tests checked: 3 are high, 2 are low, 9 are normal."

**⬆️ High (above normal)**
For EACH high test:
- **Test name: value unit** (normal: range)
  - **What it means:** what this test measures and what a high value can suggest.
  - **How to bring it down:** practical food, lifestyle and habit steps.

**⬇️ Low (below normal)**
For EACH low test:
- **Test name: value unit** (normal: range)
  - **What it means:** what this test measures and what a low value can suggest.
  - **How to raise it:** practical food, lifestyle and habit steps.

**✅ Normal**
One compact list of the normal tests with their values, no explanations. Example: Platelets 268, WBC 7.2, Sodium 140.

**Next steps**
- Which doctor to see and how soon (routine, soon or urgent).
- Two or three good questions to ask the doctor.

Rules for the sections:
- Put the most concerning results first inside High and Low.
- If a section has no results, leave that section out.
- If related results point to the same cause (for example high cholesterol, LDL and triglycerides), explain them together once so the answer stays short.
- If every result is normal, say so happily and give general habits to stay healthy.
- If the extracted text looks incomplete or messy, say which values you could not read and ask the user to upload a clearer copy.

WHEN THE USER ASKS A NORMAL QUESTION (no report)
Answer directly in simple language, in short paragraphs or "-" bullets, under 200 words unless they ask for more.

FORMATTING (the screen is a narrow phone)
- Never use tables, HTML tags or <br>.
- Use **bold** for test names, values and the section headings above.
- Keep sentences short.

End every reply with one short line: "This is general information, not a diagnosis, so please check with a doctor."`;

// Safety net: strip HTML the model sometimes adds anyway
function cleanReply(text) {
  return text
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/&nbsp;/g, " ")
    .replace(/<\/?[^>]+>/g, "")
    .trim();
}

app.get("/api/health", (_req, res) => {
  res.json({
    status: "ok",
    service: "Veyra AI Backend",
  });
});

app.post("/api/chat", async (req, res) => {
  try {
    const { message, history = [] } = req.body;

    if (typeof message !== "string" || !message.trim()) {
      return res.status(400).json({
        error: "Please provide a message.",
      });
    }

    if (message.length > 14000) {
      return res.status(400).json({
        error: "Message must be 14000 characters or fewer.",
      });
    }

    // History items can be long (the AI's own report explanations),
    // so they get a bigger limit than before.
    if (
      !Array.isArray(history) ||
      history.length > 20 ||
      history.some(
        (item) =>
          !item ||
          !["user", "assistant"].includes(item.role) ||
          typeof item.content !== "string" ||
          item.content.length > 14000
      )
    ) {
      return res.status(400).json({
        error: "Invalid chat history.",
      });
    }

    const messages = [
      { role: "system", content: SYSTEM_PROMPT },
      ...history.map(({ role, content }) => ({ role, content })),
      { role: "user", content: message.trim() },
    ];

    const completion = await groq.chat.completions.create({
      model: "openai/gpt-oss-120b",
      messages,
      temperature: 0.4,
      max_tokens: 3500,
      reasoning_effort: "low",
    });

    const raw = completion.choices[0]?.message?.content;
    const reply = raw ? cleanReply(raw) : "";

    if (!reply) {
      return res.status(502).json({
        error: "The AI returned an empty response. Please try again.",
      });
    }

    return res.json({ reply });
  } catch (error) {
    console.error("FULL GROQ ERROR:", error);

    return res.status(502).json({
      error: "Veyra could not get a response right now. Please try again.",
    });
  }
});

/* ------------------------------------------------------------------ */
/* Report analysis (feeds the Analysis tab)                            */
/* ------------------------------------------------------------------ */

const ANALYZE_PROMPT = `You convert medical lab reports into structured data for a health app. Reply with ONE JSON object and nothing else.

Rules:
- Include EVERY test in the report. Do not skip tests and do not invent tests.
- Never include patient name, age, IDs, dates, hospital, lab or doctor names.
- Take the normal range from the report. If a test has no range, use typical adult ranges.
- "numericValue", "rangeLow" and "rangeHigh" must be numbers or null (no units, no text). If a range has only an upper limit, rangeLow is null, and the other way round.
- "status" is "High", "Low" or "Normal". For results that are not numbers (for example Positive or Negative), use "High" if abnormal and "Normal" otherwise.
- For High and Low tests only, write "meaning" (what the test measures and what this result can suggest, as a possibility, never a diagnosis) and "howToImprove" (practical food, lifestyle and habit steps). Each is at most 35 words, in simple words for someone with no medical knowledge.
- For Normal tests, "meaning" and "howToImprove" are empty strings.
- Never name medication doses.
- If the text is not a medical report, return {"isHealthReport": false, "markers": []}.

JSON shape:
{
  "isHealthReport": true,
  "reportType": "short name, for example Complete blood count",
  "summary": "one or two plain sentences with counts, for example 14 tests checked: 3 high, 2 low, 9 normal",
  "markers": [
    {
      "name": "Hemoglobin",
      "value": "10.2",
      "numericValue": 10.2,
      "unit": "g/dL",
      "rangeText": "12-16",
      "rangeLow": 12,
      "rangeHigh": 16,
      "status": "Low",
      "meaning": "",
      "howToImprove": ""
    }
  ],
  "nextSteps": ["which doctor to see and how soon", "a question to ask the doctor"]
}`;

function toNumber(value) {
  if (typeof value === "number") return Number.isFinite(value) ? value : null;
  if (typeof value !== "string") return null;
  const n = parseFloat(value.replace(/,/g, ""));
  return Number.isFinite(n) ? n : null;
}

function cleanText(value, max) {
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}

function sanitizeAnalysis(raw) {
  if (!raw || raw.isHealthReport === false || !Array.isArray(raw.markers)) {
    return { isHealthReport: false, markers: [] };
  }

  const markers = raw.markers
    .slice(0, 80)
    .map((m) => {
      const numericValue = toNumber(m.numericValue ?? m.value);
      const low = toNumber(m.rangeLow);
      const high = toNumber(m.rangeHigh);

      let status = ["High", "Low", "Normal"].includes(m.status)
        ? m.status
        : "Normal";

      // Trust the numbers over the model when we have both a value and a range
      if (numericValue !== null && (low !== null || high !== null)) {
        if (high !== null && numericValue > high) status = "High";
        else if (low !== null && numericValue < low) status = "Low";
        else status = "Normal";
      }

      return {
        name: cleanText(m.name, 60),
        value: cleanText(String(m.value ?? ""), 30),
        numericValue,
        unit: cleanText(m.unit, 20),
        rangeText: cleanText(m.rangeText, 30),
        status,
        meaning: status === "Normal" ? "" : cleanText(m.meaning, 400),
        howToImprove: status === "Normal" ? "" : cleanText(m.howToImprove, 400),
      };
    })
    .filter((m) => m.name && m.value);

  return {
    isHealthReport: markers.length > 0,
    reportType: cleanText(raw.reportType, 60) || "Health report",
    summary: cleanText(raw.summary, 300),
    markers,
    nextSteps: Array.isArray(raw.nextSteps)
      ? raw.nextSteps.map((s) => cleanText(s, 200)).filter(Boolean).slice(0, 4)
      : [],
  };
}

app.post("/api/analyze", async (req, res) => {
  try {
    const { text } = req.body;

    if (typeof text !== "string" || !text.trim()) {
      return res.status(400).json({ error: "Please provide report text." });
    }

    if (text.length > 14000) {
      return res.status(400).json({ error: "Report text is too long." });
    }

    const completion = await groq.chat.completions.create({
      model: "openai/gpt-oss-120b",
      messages: [
        { role: "system", content: ANALYZE_PROMPT },
        { role: "user", content: `REPORT TEXT:\n${text.trim()}` },
      ],
      temperature: 0.1,
      max_tokens: 6000,
      reasoning_effort: "low",
      response_format: { type: "json_object" },
    });

    const content = completion.choices[0]?.message?.content || "";
    const json = content
      .replace(/^```(?:json)?/i, "")
      .replace(/```$/, "")
      .trim();

    let parsed;
    try {
      parsed = JSON.parse(json);
    } catch {
      return res.status(502).json({ error: "Could not read the analysis." });
    }

    return res.json(sanitizeAnalysis(parsed));
  } catch (error) {
    console.error("ANALYZE ERROR:", error);
    return res.status(502).json({ error: "Could not analyse the report." });
  }
});

/* ------------------------------------------------------------------ */

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Veyra backend running on port ${PORT}`);
});
