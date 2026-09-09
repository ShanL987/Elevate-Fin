# ELEVATE

### Know what you can afford before you borrow.

**ELEVATE** is an AI-powered personal financial intelligence platform that helps users understand their financial health, simulate borrowing decisions, track loans and cash flow, and receive proactive financial warnings before problems become serious.

Built by **Team Khatra** for a fintech hackathon.

---

## The Problem

Most financial platforms answer:

> **"How much can you borrow?"**

But that's not necessarily the right question.

A user may be eligible for a ₹10 lakh loan while their current income, expenses, EMIs, and savings make that loan financially unhealthy.

Users need to understand:

* Can I actually afford another EMI?
* How much debt is safe for me?
* What happens to my finances if I take this loan?
* Which existing loan should I pay off first?
* Is my spending putting me in a danger zone?
* Am I financially prepared for an unexpected expense?

**ELEVATE focuses on the decision, not just the eligibility.**

---

## Our Solution

ELEVATE acts as a **Financial Intelligence Layer** between a user's financial data and their financial decisions.

### Understand → Simulate → Decide → Compare → Protect

The platform analyzes a user's financial profile and provides actionable recommendations based on:

* Income
* Expenses
* Existing loans
* EMI obligations
* Savings
* Cash flow
* Credit health
* Insurance coverage

Instead of simply saying:

> "You are eligible for this loan."

ELEVATE can say:

> "You may be eligible, but taking this loan would push your EMI burden into a high-risk range."

---

# Key Features

## Financial Health Score

A dynamic score that evaluates the user's overall financial position.

It considers:

* Credit health
* Debt health
* Savings
* Liquidity
* Insurance protection
* Cash flow

Example:

**Financial Health Score: 78 / 100**

The score changes as the user's financial situation changes.

---

## Cash Flow Intelligence

Understand exactly where your money goes.

ELEVATE tracks:

**Income → Expenses → EMIs → Savings → Free Cash**

Users can:

* Add expenses
* Edit expenses
* Delete expenses
* Categorize spending
* Track recurring expenses
* Monitor free cash
* View spending trends
* Forecast upcoming cash flow

The goal is to answer one important question:

> **"How much money can I safely commit every month?"**

---

## EMI Planner

Simulate loans before taking them.

Users can adjust:

* Loan amount
* Interest rate
* Tenure
* Existing EMI
* Monthly income

ELEVATE dynamically calculates:

* Monthly EMI
* Total interest
* Total repayment
* DTI ratio
* Remaining monthly cash
* Risk level

### Risk Classification

| DTI    | Status         |
| ------ | -------------- |
| < 30%  | Healthy        |
| 30–40% | Watch          |
| 40–50% | High Risk      |
| > 50%  | Very High Risk |

---

## Loan Comparison

Compare simulated loan offers based on the **true cost of borrowing**, rather than just the advertised interest rate.

Users can compare:

* Interest rate
* Processing fee
* Tenure
* EMI
* Total repayment
* Foreclosure charges
* Overall borrowing cost

ELEVATE highlights the option that best fits the user's financial situation.

---

## Loan Management

Users can manage their existing loans and track:

* Outstanding principal
* EMI
* Interest rate
* Remaining tenure
* Original loan amount
* Repayment progress

All loan information is stored securely per authenticated user.

---

## Financial Health Alerts

ELEVATE doesn't wait for users to discover financial problems.

It continuously evaluates financial health and categorizes it as:

**Healthy → Watch → Danger**

For example:

> **DANGER ZONE · 8 DAYS**
>
> Your free cash has remained below your recommended safety buffer.
>
> Your discretionary spending has also increased significantly.

Users receive actionable recommendations instead of generic warnings.

---

## Weekly Financial Check-In

ELEVATE can send personalized weekly financial summaries containing:

* Financial Health Score
* Cash flow
* Spending changes
* EMI burden
* DTI
* Risk status
* Recommended action

Example:

> **Your Financial Health Check**
>
> Your financial health has remained in the Danger Zone for 8 days.
>
> Your free cash is ₹6,200, below your recommended buffer of ₹15,000.
>
> **Recommended action:** Review discretionary spending this week.

The notification system is designed to avoid unnecessary spam and duplicate alerts.

---

## AI Financial Advisor

Powered by Gemini, the AI Advisor uses the user's actual financial context to answer questions such as:

* Can I afford a ₹20L car?
* Should I take another personal loan?
* Which EMI should I pay off first?
* How can I improve my credit profile?
* Am I underinsured?
* What happens if my income drops by 20%?

The AI uses calculated financial metrics as context and provides explanations and recommendations.

> AI recommendations are intended for educational and informational purposes and are not financial advice.

---

## Financial Scenario Simulator

Explore:

### "What if?"

Users can simulate:

* Taking a new loan
* Paying off a loan
* Increasing income
* Increasing expenses
* Increasing savings
* Reducing spending

ELEVATE shows the impact on:

* Financial Health Score
* Total EMI
* DTI
* Free cash
* Savings runway

Changes are only applied to the user's actual profile when explicitly confirmed.

---

# Authentication & Data Security

ELEVATE uses **Firebase Authentication** and **Cloud Firestore**.

Supported authentication:

* Email/password
* Google Sign-In
* Password reset
* Persistent sessions
* Secure sign-out

Each user's financial data is isolated using their Firebase UID.

Example data structure:

```text
users/
  {uid}/
    profile
    financialHealthSnapshots/
    notifications/
    expenses/
    loans/
```

Firestore security rules ensure that authenticated users can only access their own financial information.

Sensitive API credentials are kept server-side and are never exposed in the frontend.

---

# Technology Stack

### Frontend

* React
* TypeScript
* Modern CSS
* Responsive UI

### Backend / Infrastructure

* Firebase Authentication
* Cloud Firestore
* Server-side APIs
* Scheduled processing for financial monitoring

### AI

* Google Gemini

### Development

* Google AI Studio
* GitHub

---

# Design Philosophy

ELEVATE is designed around:

### Premium Fintech

The interface combines:

* Dark graphite backgrounds
* Glassmorphism
* Emerald financial accents
* Soft blue/teal highlights
* Large editorial financial numbers
* Elegant charts
* Subtle gradients
* Minimal visual noise

The goal is:

> **Private banking in 2030.**

We deliberately avoid the typical:

* Generic banking dashboard
* Admin-panel aesthetic
* Crypto-terminal look
* Overloaded neon/cyberpunk UI

---

# Product Flow

```text
                 ELEVATE

                    ↓

              Financial Data
                    ↓
          ┌─────────────────────┐
          │ Financial Health    │
          │     Engine          │
          └─────────────────────┘
                    ↓
          ┌─────────────────────┐
          │ AI + Calculations   │
          └─────────────────────┘
                    ↓
              Recommendation
                    ↓
          ┌─────────────────────┐
          │ Simulate / Compare  │
          └─────────────────────┘
                    ↓
                 Decision
                    ↓
              Monitor Again
```

---

# Why ELEVATE?

Traditional financial platforms often focus on:

**Eligibility → Product → Application**

ELEVATE focuses on:

**Financial Health → Risk → Simulation → Decision**

Our goal is not to help users borrow more.

Our goal is to help users **borrow responsibly**.

---

# Team

## Team Khatra

Built with caffeine, questionable sleep schedules, and an unhealthy amount of debugging.

**Hackathon Project — ELEVATE**

> *Know what you can afford before you borrow.*

---

# Disclaimer

ELEVATE is a hackathon prototype intended for demonstration and educational purposes.

Financial calculations, recommendations, loan products, insurance products, and AI-generated insights may use simulated or incomplete data and should not be treated as professional financial advice.

---

## Future Roadmap

Potential future integrations include:

* Real bank account aggregation
* Transaction categorization
* Real-time credit bureau data
* Open banking integrations
* Automated bill detection
* Advanced debt payoff optimization
* Personalized financial goals
* Net worth tracking
* Real financial product integrations
* Smarter financial anomaly detection

---

## License

This project was created as a hackathon prototype by **Team Khatra**.
