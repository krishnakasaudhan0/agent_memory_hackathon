# Pulse: How I Built a Health Agent That Actually Remembers You

Most health-tracking tools have the memory of a goldfish. You log a migraine on Monday, describe your sleep patterns on Wednesday, mention you've been stressed about a deadline — and by the next session, the agent asks you to start over from scratch. I got tired of that. So I built Pulse.

Pulse is a conversational health monitoring agent that maintains a longitudinal understanding of a user's physical and mental state over time. It doesn't just respond to prompts — it notices patterns, correlates symptoms, and asks follow-up questions that are actually grounded in what you told it last week. The key to making that work is [agent memory](https://vectorize.io/what-is-agent-memory), and specifically, how memory is built up not from explicit user commands but from the agent's own retrospective analysis of past interactions.

## What Pulse Does and How It Hangs Together

At its core, Pulse is a multi-turn conversational agent with three responsibilities: intake, analysis, and recall.

**Intake** is the standard loop — the user describes how they're feeling, what they ate, their sleep quality, stress levels, physical symptoms. Pulse asks clarifying questions, probes edge cases, and records the session.

**Analysis** is where it gets interesting. After each session, Pulse runs a background pass over the conversation and extracts structured health signals: symptom mentions, severity scores, potential correlations (fatigue + poor sleep + high stress, for instance), and open questions that should be revisited.

**Recall** is what makes it feel different from a chatbot. When a user starts a new session, Pulse doesn't greet them with a blank slate. It opens with context: "Last time you mentioned your lower back pain was a 6 out of 10. How is that today?" That continuity changes the entire tone of the interaction.

The stack is Python on the backend, with the agent loop built around the Anthropic API. Sessions are stored, and the memory layer sits between the raw session log and the active context window.

## The Core Technical Story: Hindsight as the Memory Engine

Here's the thing about health data: it's temporally dense and semantically noisy. A user might mention "I felt off today" in one session and "my stomach's been weird since the antibiotics" three sessions later. A naive keyword search across session logs won't connect those dots. You need something that understands meaning across time and can surface the right memories at the right moment.

I knew I needed [agent memory](https://vectorize.io/what-is-agent-memory) that was more than a retrieval-augmented dump of old transcripts. After looking at a few options, I landed on [Hindsight](https://github.com/vectorize-io/hindsight). What drew me to it was the framing: Hindsight is designed specifically for agents that need to learn from their own past interactions — not just store them. That matches exactly what Pulse needs.

The way [Hindsight agent memory](https://hindsight.vectorize.io/) works is that it operates on the agent's trajectory — the sequence of messages, tool calls, and reasoning steps — rather than just the final outputs. When a session ends, Hindsight processes the full interaction and extracts durable memories: facts the user stated, inferences the agent made, unresolved questions, and importantly, whether the agent's responses were accurate or helpful. That last part — the retrospective evaluation — is what gives it the "hindsight" quality. The agent doesn't just remember what happened; it remembers what it got right and wrong.

For Pulse, this means the memory layer isn't a flat log of health data. It's a structured set of observations with attached confidence scores and temporal metadata.

## Code-Backed Explanations

The session handling in Pulse is straightforward. After each conversational turn, we append to the session record and trigger the memory extraction pipeline at close:

```python
class PulseSession:
    def __init__(self, user_id: str):
        self.user_id = user_id
        self.messages = []
        self.session_id = str(uuid.uuid4())
        self.started_at = datetime.utcnow()

    def add_turn(self, role: str, content: str):
        self.messages.append({
            "role": role,
            "content": content,
            "timestamp": datetime.utcnow().isoformat()
        })

    def close(self):
        extract_and_store_memories(
            session_id=self.session_id,
            user_id=self.user_id,
            messages=self.messages
        )
```

The `extract_and_store_memories` function is where Hindsight does its work. We pass the full message trajectory and let the memory pipeline identify what's worth persisting:

```python
def extract_and_store_memories(session_id, user_id, messages):
    hindsight_client = HindsightClient(api_key=HINDSIGHT_API_KEY)
    
    memories = hindsight_client.extract(
        trajectory=messages,
        agent_id="pulse-health-agent",
        user_id=user_id,
        extraction_config={
            "domains": ["health", "symptoms", "lifestyle"],
            "include_inferences": True,
            "score_confidence": True
        }
    )
    
    for memory in memories:
        memory_store.upsert(
            user_id=user_id,
            memory_id=memory.id,
            content=memory.content,
            confidence=memory.confidence,
            tags=memory.tags,
            created_at=memory.created_at
        )
```

At the start of a new session, we don't stuff everything into the context window. We retrieve semantically relevant memories based on what the user opens with:

```python
def build_session_context(user_id: str, opening_message: str) -> str:
    relevant_memories = memory_store.search(
        user_id=user_id,
        query=opening_message,
        top_k=8,
        recency_weight=0.4
    )
    
    context_block = "Relevant health history for this user:\n"
    for mem in relevant_memories:
        context_block += f"- [{mem.date}] {mem.content} (confidence: {mem.confidence:.2f})\n"
    
    return context_block
```

The `recency_weight` parameter is something I spent time tuning. Health data has a half-life: a headache from two months ago is less relevant than one from last week, but a chronic condition mentioned once six months ago might be more important than either. Blending recency with semantic similarity handles most cases reasonably well, but it's not a solved problem.

## Concrete Behavior: What This Looks Like in Practice

Here's an example interaction from a multi-session scenario. In session one, the user mentions:

> "I've been getting these afternoon headaches, maybe 3 or 4 times a week. Nothing severe, just annoying. Probably stress."

The agent probes: timing, location, duration, water intake. Extracts and stores a memory tagged `[symptom: headache, frequency: high, attribution: stress, confidence: 0.7]`.

Three sessions later, the user says:

> "I've been really tired lately. I don't know why."

Without memory, the agent would ask generic fatigue questions. With Pulse, the context block at session start includes the headache pattern. The agent connects the dots:

> "You mentioned recurring headaches a couple of weeks ago, and now fatigue. Are the two happening around the same time of day? I want to understand if these might be related — possibly dehydration or sleep quality — rather than two separate issues."

That's not a scripted response. The agent generated it because the memory context was there. That's the actual payoff of getting memory right.

## Lessons Learned

**1. Memory extraction is a separate problem from memory retrieval.** I initially conflated the two and tried to handle both in the retrieval step. That doesn't work. Extraction — deciding what's worth remembering and how to represent it — needs to happen eagerly, right after a session ends, with access to the full trajectory. By the time you're doing retrieval, it's too late to go back and structure the raw transcript.

**2. Confidence scores are load-bearing, not decorative.** When the agent infers something ("the user seems to be under-sleeping based on their described energy levels") rather than recording something the user stated explicitly, that distinction matters. Surfacing a low-confidence inference as if it were a stated fact erodes trust immediately. I surface inferences with explicit hedging in the context block.

**3. Hindsight's trajectory-based approach catches things keyword search misses.** Because it operates on the full exchange — including the agent's questions and the user's responses to those questions — it captures implicit signals. If a user deflects a question about alcohol twice across two sessions, that pattern is extractable in a way that raw text search wouldn't surface.

**4. Context window budgeting matters more than you think.** Injecting eight memories sounds modest. Inject twenty and you start crowding out the current conversation. I landed on a hard limit of 1,000 tokens for the memory context block, with a ranking function that prioritizes recency, semantic relevance, and confidence. Anything outside that budget gets dropped, not summarized.

**5. Users notice continuity before they notice accuracy.** The most consistent feedback from early users wasn't about the quality of Pulse's health observations — it was the emotional relief of not having to re-explain themselves. "It remembered I had the blood test coming up" is a comment I received more than once. That continuity is the user-visible surface of everything the memory layer is doing underneath. It's a surprisingly high-leverage feature for how much infrastructure it requires.

---

Pulse is available on GitHub. The memory layer, the session extraction pipeline, and the retrieval logic are all separated into distinct modules — partly for testability, partly because the memory architecture is the part I expect to keep evolving. If you're building an agent that interacts with the same user across time and finds yourself reaching for a longer system prompt instead of a proper memory layer, I'd encourage you to look at [Hindsight](https://github.com/vectorize-io/hindsight) before you go any further down that path. The gap between "I shoved everything into context" and "the agent actually remembers" is wider than it looks from the outside.
