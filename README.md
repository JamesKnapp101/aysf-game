# AI-Driven Interactive Fiction Engine

## 🔹 Portfolio Summary

**AI-Driven Interactive System with Structured State Integration**

This project explores how to embed AI into a real application without sacrificing reliability, predictability, or user control.

Rather than treating AI as a standalone feature, this system integrates LLM-driven interactions into a **stateful, rule-based architecture**, where all outcomes are validated and applied through deterministic logic.

### Key Highlights

- **AI as an interpreter, not a controller**
  Natural language input is mapped to structured actions within the system, ensuring AI enhances workflows rather than bypassing them.

- **Hybrid architecture (AI + deterministic systems)**
  Combines conversational AI with strict application state (inventory, progression, event systems) to maintain consistency and correctness.

- **Workflow-driven interactions**
  User progress is gated through knowledge, inventory, and context—mirroring real-world product flows where AI must operate within constraints.

- **Controlled side effects**
  All AI-driven outcomes pass through validation before affecting application state, preventing unpredictable behavior.

- **Traceability and debuggability**
  Structured logging of user actions, AI responses, and system events enables clear reasoning about system behavior.

### Why This Matters

Most AI demos focus on generating responses.
This project focuses on **making AI usable inside real systems**:

- integrating AI into workflows
- handling ambiguity safely
- preserving system integrity and user trust

It reflects the challenges of building production AI features, where correctness and control matter as much as capability.

---

## 🔹 System Flow (High-Level)

```
User Input
   ↓
AI Interpretation (LLM)
   ↓
Intent Mapping (known entities / actions)
   ↓
Validation Layer (rules, inventory, context)
   ↓
State Update (deterministic systems)
   ↓
UI + Log Output
```

This pipeline ensures that **AI never directly mutates application state** and all outcomes remain predictable and testable.

---

## 🔹 Detailed Interaction Flow

```
                    ┌─────────────────────────┐
                    │        UI Layer         │
                    │  (React Components)     │
                    └────────────┬────────────┘
                                 │
                                 ▼
                    ┌─────────────────────────┐
                    │  Interaction Controller │
                    │  (Input handling,       │
                    │   command routing)      │
                    └────────────┬────────────┘
                                 │
             ┌───────────────────┴───────────────────┐
             ▼                                       ▼
┌──────────────────────────┐           ┌──────────────────────────┐
│   AI Interpretation      │           │  Deterministic Systems   │
│  (LLM / Prompt Layer)    │           │                          │
│                          │           │  - Inventory             │
│  - intent extraction     │           │  - World State           │
│  - entity recognition    │           │  - Event System          │
│  - response generation   │           │  - Progression Rules     │
└────────────┬─────────────┘           └────────────┬─────────────┘
             │                                      │
             └──────────────┬───────────────────────┘
                            ▼
               ┌─────────────────────────┐
               │     Validation Layer    │
               │                         │
               │  - rule enforcement     │
               │  - context checks       │
               │  - guardrails           │
               └────────────┬────────────┘
                            │
                            ▼
               ┌─────────────────────────┐
               │     State Manager       │
               │                         │
               │  - apply changes        │
               │  - maintain consistency │
               │  - trigger events       │
               └────────────┬────────────┘
                            │
                            ▼
               ┌─────────────────────────┐
               │     Logging System      │
               │                         │
               │  - user actions         │
               │  - AI responses         │
               │  - system events        │
               └────────────┬────────────┘
                            │
                            ▼
             ┌──────────────────────────┐
             │        UI Update         │
             │   (Render + Feedback)    │
             └──────────────────────────┘
```

---

# Overview

This engine powers an interactive fiction experience where users interact with AI-driven NPCs to progress through a structured environment.

Unlike simple “prompt → response” demos, this system:

- Integrates AI responses into **explicit application state**
- Uses **rule-based gating and inventory systems** to control progression
- Combines **deterministic logic with AI-driven interpretation**
- Maintains a **clear separation between game state, AI interpretation, and UI rendering**

The result is a hybrid system where AI enhances interaction, but **does not control the application blindly**.

---

# What This Project Demonstrates

## 1. Stateful AI Interaction Design

AI responses are not treated as free-form output. Instead, they are:

- Interpreted in the context of current application state
- Used to trigger structured outcomes (unlocking items, revealing paths, etc.)
- Constrained by predefined rules and systems

---

## 2. Hybrid Deterministic + AI System Architecture

The engine separates:

- **Deterministic systems** (inventory, movement, world state)
- **AI interpretation layer** (parsing intent, responding to user input)
- **Outcome resolution** (applying validated changes to state)

---

## 3. Workflow-Gated AI Interactions

User progress is controlled through:

- inventory-based requirements
- discovered knowledge (logs, notes)
- contextual triggers

AI is used to:

- interpret user intent
- map it to known entities and knowledge
- trigger appropriate system actions

---

## 4. Structured Logging & Traceability

The system maintains a persistent log of:

- user actions
- AI interactions
- system-triggered events

---

## 5. Controlled Side Effects & Event Sequencing

All AI-driven outcomes pass through a controlled pipeline:

1. User input
2. AI interpretation
3. Validation
4. State update
5. UI/log output

---

# AI Integration Approach

## Role of AI

AI is used for:

- natural language interpretation
- conversational responses
- mapping user input to structured intents

AI is **not responsible for**:

- direct state mutation
- bypassing system rules

---

## Guardrails

- Strict separation between AI output and state
- Validation before any state change
- Predefined interaction surfaces

---

## Deterministic Fallbacks

- Unknown inputs are ignored safely
- System prioritizes consistency over creativity

---

## Extensibility

- Add new NPCs with defined rules
- Expand knowledge systems
- Introduce new interpreted actions

---

# Core Systems

## Inventory Model

```
inventory: {
  general: string[]
  badges: string[]
  keys: string[]
}
```

---

## Player Log

```
type PlayerLogEntry = {
  source: string
  title: string
  loggedAtTurn: number
  body: string
}
```

---

## Event System

Supports:

- room triggers
- first-time events
- NPC movement

---

# Tech Stack

- React
- TypeScript
- Modular state architecture

---

# Key Takeaways

- AI should be **constrained and integrated**, not autonomous
- Deterministic systems remain the **source of truth**
- AI enhances UX by interpreting intent, not controlling outcomes
- Clear boundaries are critical for reliability

---

# Future Enhancements

- Streaming responses
- Explicit intent parsing layer
- Persistence
- Expanded rule system
