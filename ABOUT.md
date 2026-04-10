# About Pulse

## The Problem

Every time you open a new chat with an AI health assistant, you start from zero. You re-explain your symptoms. You re-describe your history. The agent has no idea you mentioned chest tightness last Tuesday, or that you've been tracking a recurring headache for two weeks.

This isn't a minor inconvenience — it's a fundamental failure for any agent that's supposed to help you understand your health over time. Patterns are the whole point. A single symptom is noise. The same symptom appearing every Monday after a bad night's sleep is a signal. An agent that forgets between sessions can never see the signal.

That's the problem Pulse is built to solve.

---

## What Pulse Does

Pulse is a conversational health monitoring agent. You tell it how you're feeling — energy, sleep, symptoms, stress, mood — and it tracks those signals across sessions. It asks follow-up questions grounded in what you said before. It notices when things are getting worse, when patterns repeat, and when something you mentioned offhand two weeks ago has become a trend worth paying attention to.

The key word is *across sessions*. That's what makes it different from a chatbot wrapped around a health prompt.

---

## How Hindsight Fits In

The memory layer is built on [Hindsight](https://github.com/vectorize-io/hindsight). I chose it specifically because it operates on the agent's full conversation trajectory — not just the user's messages in isolation. After each session closes, Hindsight processes the entire exchange: what the user said, what the agent asked, what was left unresolved. It extracts structured memories with confidence scores attached.

That distinction matters. When Pulse infers something — "this user's fatigue seems tied to sleep quality, not diet" — that inference is stored differently from something the user stated directly. Low-confidence inferences get surfaced with hedging. High-confidence facts get injected into the next session's context cleanly.

The integration point is the session close hook:

```python
def close_session(session: PulseSession):
    client = HindsightClient(api_key=os.getenv("HINDSIGHT_API_KEY"))

    memories = client.extract(
        trajectory=session.messages,
        agent_id="pulse",
        user_id=session.user_id,
        config={
            "domains": ["symptoms", "lifestyle", "mood", "sleep"],
            "include_inferences": True,
            "score_confidence": True,
        }
    )

    for mem in memories:
        db.upsert_memory(
            user_id=session.user_id,
            content=mem.content,
            confidence=mem.confidence,
            tags=mem.tags,
            created_at=mem.created_at,
        )
```

At the start of the next session, relevant memories are retrieved and injected into the system prompt — ranked by a blend of recency and semantic similarity to what the user just opened with:

```python
def load_context(user_id: str, opening_message: str) -> str:
    memories = db.search_memories(
        user_id=user_id,
        query=opening_message,
        top_k=8,
        recency_weight=0.4,
    )

    lines = ["Relevant history for this user:"]
    for m in memories:
        lines.append(f"- [{m.date}] {m.content}  (confidence: {m.confidence:.2f})")

    return "\n".join(lines)
```

---

## Before and After

**Without memory:**

> User: "I've been really tired lately."
>
> Pulse: "I'm sorry to hear that. How long has this been going on? Have you noticed any changes in your sleep schedule, diet, or stress levels?"

Generic. Could be the first message the agent has ever seen from this person.

**With Hindsight memory active:**

> User: "I've been really tired lately."
>
> Pulse: "You mentioned recurring headaches 11 days ago — roughly 3–4 times a week, in the afternoons. Now fatigue. Are the two happening around the same time of day? I want to check whether these might be connected — possibly dehydration or disrupted sleep — rather than treating them as separate issues."

Same opening message. Completely different response, because the agent actually remembers.

---

## What Didn't Work

**Injecting too much context kills the conversation.** My first attempt stuffed every stored memory into the system prompt. With even a modest history, this consumed most of the context window before the user said a word. The current session became a footnote to the user's past. I added a hard 1,000-token budget for the memory block and a ranking function to enforce it. That helped significantly — but choosing *which* memories to drop is still a judgment call I'm not fully happy with.

**Recency weighting needs domain awareness.** A headache from three weeks ago is less relevant than one from yesterday. But a chronic condition mentioned once six months ago might matter more than either. A flat recency multiplier doesn't handle that distinction. Right now I compensate by tagging memories with a `chronic` flag and exempting those from recency decay — it's a workaround, not a real solution.

**Users don't trust what they can't inspect.** Early testers were sometimes surprised — occasionally unsettled — when Pulse referenced something they'd said weeks earlier. The recall felt accurate but opaque. I added a `/memory` command that lists what Pulse currently knows about you, which helped. Transparency about what's stored turns out to be as important as the accuracy of what's stored.

---

## Stack

- **Agent loop:** Python, Anthropic API (Claude)
- **Memory:** [Hindsight](https://github.com/vectorize-io/hindsight) for extraction, SQLite for storage
- **Retrieval:** Semantic search with recency blending
- **Interface:** CLI (web UI in progress)

---

## Running It

```bash
git clone https://github.com/krishnakasaudhan0/agent_memory_hackathon
cd agent_memory_hackathon
pip install -r requirements.txt

# Set your keys
export ANTHROPIC_API_KEY=your_key
export HINDSIGHT_API_KEY=your_key

python main.py
```

---

*Pulse was built for the Hindsight Agent Memory Hackathon. The core idea — that an agent that can't remember isn't really an agent — is something I want to keep building on.*
