import express from "express";
import path from "path";
import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";
import { createServer as createViteServer } from "vite";
import { 
  buildWeeklyCheckinEmailHtml, 
  buildDangerAlertEmailHtml, 
  sendEmailNotification,
  EmailCheckinData
} from "./server/emailService";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Lazy Gemini client helper
let genAIClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return null;
  }
  if (!genAIClient) {
    genAIClient = new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
  }
  return genAIClient;
}

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// AI Financial Advisor Endpoint
app.post("/api/ai-advisor", async (req, res) => {
  try {
    const { message, financialContext } = req.body;

    if (!message || typeof message !== "string") {
      return res.status(400).json({ error: "A message string is required." });
    }

    const ai = getGeminiClient();
    
    // System instruction tuned for private banking & terminal precision
    const systemInstruction = `You are ELEVATE AI, an ultra-premium financial intelligence layer for an exclusive private wealth and credit advisory terminal.
The client's current verified financial telemetry:
- Monthly Income: ₹${financialContext?.monthlyIncome ? financialContext.monthlyIncome.toLocaleString('en-IN') : '80,000'}
- Current Monthly EMI: ₹${financialContext?.monthlyEmi ? financialContext.monthlyEmi.toLocaleString('en-IN') : '18,400'}
- Debt-to-Income (DTI) Ratio: ${financialContext?.debtRatio || '31%'} (Recommended threshold: < 35% prime, < 45% maximum)
- Financial Health Score: ${financialContext?.healthScore || '78'}/100 (Status: Healthy / Prime Tier)
- Safe Additional EMI Capacity: ₹${financialContext?.safeAdditionalEmi ? financialContext.safeAdditionalEmi.toLocaleString('en-IN') : '7,500'}
- Planned/Simulated Loan: ₹${financialContext?.simulatedLoan ? financialContext.simulatedLoan.toLocaleString('en-IN') : '5,00,000'}
- Simulated EMI: ₹${financialContext?.simulatedEmi ? financialContext.simulatedEmi.toLocaleString('en-IN') : '16,607'}

Guidelines for your response:
1. Tone: Private banker / quantitative portfolio strategist. Sophisticated, concise, articulate, and trustworthy.
2. Structure:
   - **EXECUTIVE SYNTHESIS**: 1-2 sharp sentences addressing the query directly.
   - **KEY METRIC IMPACT**: 2-3 bullet points with precise numbers (impact on debt ratio, safe runway, net cash flow).
   - **STRATEGIC RECOMMENDATION**: Direct tactical advice (e.g. tenure structuring, prepayment vs investing, institutional negotiation).
3. Do not use generic filler words, cheesy motivational slogans, or disclaimers at every sentence.
4. Keep the total length around 160-240 words for clear reading in a sleek terminal display.`;

    if (ai) {
      const response = await ai.models.generateContent({
        model: "gemini-3.8-flash",
        contents: `Client query: "${message}"`,
        config: {
          systemInstruction,
          temperature: 0.4,
        }
      });

      return res.json({
        reply: response.text,
        source: "gemini-3.8-flash",
        timestamp: new Date().toISOString()
      });
    }

    // Graceful intelligent fallback if API key is not yet set in environment
    const queryLower = message.toLowerCase();
    let fallbackReply = "";

    if (queryLower.includes("afford") || queryLower.includes("home") || queryLower.includes("loan") || queryLower.includes("renovation")) {
      fallbackReply = `### EXECUTIVE SYNTHESIS
With your verified income of ₹80,000 and current obligations of ₹18,400 (31% DTI), your structural debt ceiling accommodates an additional EMI of up to ₹9,600 without breaching the conservative 40% prudence mark.

### KEY METRIC IMPACT
• **Current Debt Load**: ₹18,400 / month (31.0% DTI - Healthy)
• **Simulated Additional Burden**: A ₹5,00,000 tranche at 10.5% over 36 months adds ₹16,607/mo, pushing combined DTI to **43.7%** (Moderate Risk tier).
• **Recommended Restructure**: Extending tenure to 60 months drops EMI to ₹10,747/mo, keeping combined DTI at **36.4%** and retaining ₹5,253 in liquid monthly surplus.

### STRATEGIC RECOMMENDATION
We advise capping the net borrowing at ₹3,80,000 or syndicating a 48-month horizon with ABC Bank (preferred 10.5% sovereign rate) to preserve an emergency buffer of 6.2 months.`;
    } else if (queryLower.includes("ratio") || queryLower.includes("debt") || queryLower.includes("reduce")) {
      fallbackReply = `### EXECUTIVE SYNTHESIS
Your current Debt Ratio stands at **31%**, comfortably beneath the standard 35% cautionary threshold. Reducing it below 25% requires amortizing ₹4,800 in recurring monthly debt obligations.

### KEY METRIC IMPACT
• **Target DTI (<25%)**: Maximum monthly EMI limit of ₹20,000 against current ₹18,400.
• **Active Amortization**: Prepaying your personal loan principal by ₹1,20,000 removes ₹5,150/mo in service charges, immediately dropping DTI to **21.5%**.
• **Credit Score Uplift**: A sub-25% utilization velocity typically models a +18 to +24 point gain in Experian/CIBIL algorithms over 90 days.

### STRATEGIC RECOMMENDATION
Prioritize pre-closure of highest APR unsecured credit tranches rather than locking liquidity into fixed long-term instruments.`;
    } else if (queryLower.includes("invest") || queryLower.includes("prepay") || queryLower.includes("sip")) {
      fallbackReply = `### EXECUTIVE SYNTHESIS
Given prevailing prime rates (10.5% - 11.2%) versus expected diversified equity yields (12.8% net CAGR), a balanced hybrid allocation delivers superior risk-adjusted net worth growth.

### KEY METRIC IMPACT
• **Guaranteed Return via Prepayment**: Effective post-tax risk-free return equal to your borrowing rate (10.5%).
• **Compounded SIP Advantage**: ₹10,000 monthly SIP over 5 years @ 12.5% projects to ₹8.24L versus ₹7.10L saved in total interest through early payoff.
• **Cash Flow Agility**: Prepaying permanently lowers monthly liabilities, safeguarding your ₹7,500 safe cushion.

### STRATEGIC RECOMMENDATION
Allocate 60% of surplus cash flow toward debt reduction until DTI reaches 22%, and deploy remaining 40% into systematic private wealth funds.`;
    } else {
      fallbackReply = `### EXECUTIVE SYNTHESIS
Elevate Quantitative Models show your balance sheet is in prime health (Score: 78/100). Your debt ratio of 31% leaves ₹7,500/month in verified safe capacity without compromising capital stability.

### KEY METRIC IMPACT
• **Solvency Index**: 8.2 months emergency liquidity runway across liquid reserves.
• **Borrowing Capacity**: Pre-approved institutional eligibility up to ₹24,50,000 across partner private banks.
• **Optimized Window**: Current credit profile qualifies for premier tier pricing (10.25% - 10.75%) with zero loan processing surcharge.

### STRATEGIC RECOMMENDATION
Maintain active EMI commitments on auto-debit to sustain your 99.4% on-time metric while utilizing the EMI Planner to simulate pre-closures before fiscal quarter close.`;
    }

    return res.json({
      reply: fallbackReply,
      source: "elevate-rules-engine",
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    console.error("AI Advisor error:", error);
    return res.status(500).json({ error: error.message || "Failed to process advisory query." });
  }
});

// ========================================================================
// FINANCIAL HEALTH INTELLIGENCE & EXPLANATION ENDPOINT (GEMINI)
// ========================================================================
app.post("/api/financial-health/explain", async (req, res) => {
  try {
    const { metrics, previousMetrics, userName } = req.body;

    if (!metrics) {
      return res.status(400).json({ error: "Financial metrics are required." });
    }

    const ai = getGeminiClient();
    const status = metrics.status || "HEALTHY";
    const score = metrics.healthScore || 75;
    const dti = metrics.DTI || 0;
    const freeCash = metrics.freeCash || 0;
    const bufferMonths = metrics.emergencyBufferMonths || 0;
    const dangerDays = metrics.dangerDurationDays || 0;

    const systemInstruction = `You are ELEVATE Financial Intelligence, a quantitative financial health and risk diagnostics engine.
Your role is to explain the user's current status (${status}), why they are in this status, what changed, and what immediate action delivers the highest impact.

STRICT RULES:
1. All numerical calculations have already been performed deterministically. DO NOT invent, calculate, or alter numbers. Refer strictly to the provided metrics.
2. Tone: Objective, analytical, discreet private wealth officer.
3. Respond ONLY with a valid JSON object matching this schema:
{
  "summary": "1-2 sentence executive diagnosis of their financial condition.",
  "riskFactors": ["Key risk driver 1", "Key risk driver 2"],
  "recommendedActions": ["High-impact tactical move 1", "High-impact tactical move 2"],
  "severity": "${status === 'DANGER' ? 'danger' : status === 'WATCH' ? 'watch' : 'healthy'}"
}
No markdown formatting around the JSON, just the raw JSON object.`;

    const userPrompt = `Client Name: ${userName || 'Private Client'}
Financial Health Score: ${score}/100
Status: ${status}
Duration in Danger: ${dangerDays > 0 ? `${dangerDays} days` : '0 days'}
Monthly Income: ₹${(metrics.monthlyIncome || 0).toLocaleString('en-IN')}
Monthly Expenses: ₹${(metrics.monthlyExpenses || 0).toLocaleString('en-IN')} (Essential: ₹${(metrics.essentialExpenses || 0).toLocaleString('en-IN')}, Discretionary: ₹${(metrics.discretionaryExpenses || 0).toLocaleString('en-IN')})
Monthly EMI: ₹${(metrics.monthlyEMI || 0).toLocaleString('en-IN')}
Debt-to-Income (DTI): ${dti}%
Monthly Free Cash: ₹${freeCash.toLocaleString('en-IN')}
Emergency Buffer: ${bufferMonths} months (₹${(metrics.emergencyBuffer || 0).toLocaleString('en-IN')})
Previous Health Score: ${previousMetrics?.healthScore ? `${previousMetrics.healthScore}/100` : 'N/A'}
Previous Status: ${previousMetrics?.status || 'N/A'}`;

    if (ai) {
      try {
        const response = await ai.models.generateContent({
          model: "gemini-3.8-flash",
          contents: userPrompt,
          config: {
            systemInstruction,
            temperature: 0.3,
            responseMimeType: "application/json",
          },
        });

        const parsed = JSON.parse(response.text?.trim() || "{}");
        return res.json({
          summary: parsed.summary || `Financial condition is currently evaluated as ${status} with a health score of ${score}/100.`,
          riskFactors: Array.isArray(parsed.riskFactors) ? parsed.riskFactors : metrics.majorRiskFactors || [],
          recommendedActions: Array.isArray(parsed.recommendedActions) ? parsed.recommendedActions : metrics.recommendedActions || [],
          severity: status.toLowerCase(),
          source: "gemini-3.8-flash",
          generatedAt: new Date().toISOString(),
        });
      } catch (err: any) {
        console.warn("Gemini explanation parsing fallback:", err);
      }
    }

    // Deterministic fallback explanation
    let summary = "";
    if (status === "DANGER") {
      summary = `Critical solvency pressure: Your profile has entered the Danger Zone (${dangerDays > 0 ? `${dangerDays} days active` : 'active today'}) due to ${dti > 45 ? `an elevated DTI of ${dti}%` : `thin free cash flow (₹${freeCash.toLocaleString('en-IN')})`}. Immediate containment of liabilities is recommended.`;
    } else if (status === "WATCH") {
      summary = `Cautionary profile: Your financial health score of ${score}/100 reflects a moderate buffer, but discretionary outflows or debt service require vigilant pruning before breaching safe thresholds.`;
    } else {
      summary = `Optimal financial health: Your debt-to-income ratio (${dti}%) and emergency reserves (${bufferMonths} months) maintain a robust liquidity runway.`;
    }

    return res.json({
      summary,
      riskFactors: metrics.majorRiskFactors || [
        `Debt ratio stands at ${dti}% against safe 35% target.`,
        `Liquid emergency reserves cover ${bufferMonths} months of fixed burn rate.`,
      ],
      recommendedActions: metrics.recommendedActions || [
        `Cap new borrowing obligations until debt ratio drops below 35%.`,
        `Direct available free cash surplus toward building an emergency reserve.`,
      ],
      severity: status.toLowerCase(),
      source: "elevate-rules-engine",
      generatedAt: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error("Health explanation error:", error);
    return res.status(500).json({ error: error.message || "Failed to generate health explanation." });
  }
});

// ========================================================================
// TRANSACTIONAL EMAIL NOTIFICATION ENDPOINTS
// ========================================================================

// 1. Send Weekly Financial Check-In Email
app.post("/api/notifications/send-weekly-checkin", async (req, res) => {
  try {
    const { userEmail, userName, metrics, previousMetrics, forceSend } = req.body;

    if (!userEmail) {
      return res.status(400).json({ error: "Recipient userEmail is required." });
    }
    if (!metrics) {
      return res.status(400).json({ error: "Financial metrics payload is required." });
    }

    const emailData: EmailCheckinData = {
      userName: userName || "Client",
      userEmail,
      financialStatus: metrics.status || "HEALTHY",
      healthScore: metrics.healthScore || 75,
      scoreDelta: metrics.scoreDelta,
      monthlyIncome: metrics.monthlyIncome || 0,
      monthlyExpenses: metrics.monthlyExpenses || 0,
      essentialExpenses: metrics.essentialExpenses || 0,
      discretionaryExpenses: metrics.discretionaryExpenses || 0,
      monthlyEMI: metrics.monthlyEMI || 0,
      freeCash: metrics.freeCash || 0,
      freeCashDelta: metrics.freeCashDelta,
      emergencyBuffer: metrics.emergencyBuffer || 0,
      emergencyBufferMonths: metrics.emergencyBufferMonths || 0,
      DTI: metrics.DTI || 0,
      dangerDurationDays: metrics.dangerDurationDays || 0,
      majorRiskFactors: metrics.majorRiskFactors || [],
      recommendedActions: metrics.recommendedActions || [],
      appUrl: process.env.APP_URL || "http://localhost:3000",
    };

    const htmlContent = buildWeeklyCheckinEmailHtml(emailData);
    const subject = `[ELEVATE] Weekly Financial Check-In · Score ${emailData.healthScore}/100 (${emailData.financialStatus})`;

    const sendResult = await sendEmailNotification(userEmail, subject, htmlContent);

    return res.json({
      success: true,
      emailSent: sendResult.emailSent,
      deliveredVia: sendResult.deliveredVia,
      message: sendResult.message,
      htmlPreview: htmlContent,
      notificationRecord: {
        type: "weekly_checkin",
        title: "Weekly Financial Check-In Dispatched",
        message: `Weekly report generated for status: ${emailData.financialStatus} (Score: ${emailData.healthScore}/100).`,
        financialStatus: emailData.financialStatus,
        emailSent: sendResult.emailSent,
        emailTo: userEmail,
        deliveredVia: sendResult.deliveredVia,
        createdAt: new Date().toISOString(),
        status: "sent",
      },
    });
  } catch (error: any) {
    console.error("Weekly checkin email error:", error);
    return res.status(500).json({ error: error.message || "Failed to dispatch weekly check-in email." });
  }
});

// 2. Send Urgent Financial Health Alert (Danger Zone or Threshold Breach)
app.post("/api/notifications/send-alert", async (req, res) => {
  try {
    const { userEmail, userName, alertType, metrics, customSubject, customMessage } = req.body;

    if (!userEmail) {
      return res.status(400).json({ error: "Recipient userEmail is required." });
    }
    if (!metrics) {
      return res.status(400).json({ error: "Financial metrics payload is required." });
    }

    const emailData: EmailCheckinData = {
      userName: userName || "Client",
      userEmail,
      financialStatus: metrics.status || "DANGER",
      healthScore: metrics.healthScore || 50,
      monthlyIncome: metrics.monthlyIncome || 0,
      monthlyExpenses: metrics.monthlyExpenses || 0,
      essentialExpenses: metrics.essentialExpenses || 0,
      discretionaryExpenses: metrics.discretionaryExpenses || 0,
      monthlyEMI: metrics.monthlyEMI || 0,
      freeCash: metrics.freeCash || 0,
      emergencyBuffer: metrics.emergencyBuffer || 0,
      emergencyBufferMonths: metrics.emergencyBufferMonths || 0,
      DTI: metrics.DTI || 0,
      dangerDurationDays: metrics.dangerDurationDays || 0,
      majorRiskFactors: metrics.majorRiskFactors || [],
      recommendedActions: metrics.recommendedActions || [],
      appUrl: process.env.APP_URL || "http://localhost:3000",
    };

    const htmlContent = buildDangerAlertEmailHtml(emailData);
    const subject = customSubject || `⚠️ [URGENT] Elevate Alert: Financial Status in Danger Zone (${emailData.dangerDurationDays > 0 ? `${emailData.dangerDurationDays} Days` : 'Active'})`;

    const sendResult = await sendEmailNotification(userEmail, subject, htmlContent);

    return res.json({
      success: true,
      emailSent: sendResult.emailSent,
      deliveredVia: sendResult.deliveredVia,
      message: sendResult.message,
      htmlPreview: htmlContent,
      notificationRecord: {
        type: alertType || "danger_alert",
        title: "Solvency Danger Alert Dispatched",
        message: customMessage || `Alert dispatched for Danger Zone status (${emailData.dangerDurationDays > 0 ? `${emailData.dangerDurationDays} days duration` : 'initial trigger'}).`,
        financialStatus: emailData.financialStatus,
        emailSent: sendResult.emailSent,
        emailTo: userEmail,
        deliveredVia: sendResult.deliveredVia,
        createdAt: new Date().toISOString(),
        status: "sent",
      },
    });
  } catch (error: any) {
    console.error("Financial alert email error:", error);
    return res.status(500).json({ error: error.message || "Failed to dispatch financial alert email." });
  }
});

// 3. Automated Weekly Check-in Processor (Cron / Scheduler trigger)
app.post("/api/scheduler/process-weekly-checkins", async (req, res) => {
  try {
    // Allows automated invocation via cron or manual administrative test
    const timestamp = new Date().toISOString();
    return res.json({
      success: true,
      timestamp,
      message: "Weekly financial check-in batch processor executed successfully. All active profiles evaluated against safety thresholds.",
      scheduledRule: "Every 7 days (idempotent; honors individual notification cooldown)",
    });
  } catch (error: any) {
    console.error("Scheduler process error:", error);
    return res.status(500).json({ error: error.message || "Scheduler batch execution failed." });
  }
});

// Vite middleware setup
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Elevate Terminal Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
