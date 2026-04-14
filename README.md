# Pulse: AI-Powered Incident Response Agent

## Demo :  https://pulse-nine-mu.vercel.app/login

https://github.com/krishnakasaudhan0/agent_memory_hackathon/raw/main/assets/demo.mp4

*(If the video player does not load, [click here to view or download the demo](https://github.com/krishnakasaudhan0/agent_memory_hackathon/raw/main/assets/demo.mp4))*


## 🚨 Problem Statement 
### We’ve scaled software systems—but not their memory.


Modern software systems are becoming exponentially complex, but the way engineers debug failures hasn’t evolved.

Every production incident forces teams to start from zero—digging through logs, searching dashboards, and trying to recall what worked last time. Despite having years of incident history, systems have no real memory.

As a result:

The same outages are diagnosed repeatedly
Critical knowledge stays trapped in tickets and Slack threads
Response times increase when speed matters most
Engineering productivity is lost to repetitive debugging

At scale, this isn’t just inefficient—it directly impacts reliability, user experience, and revenue.

##  PULSE Solution 

Pulse solves this problem by introducing a persistent memory layer for incident response instead of relying on stateless debugging.
It continuously captures incidents, their root causes, and successful resolutions as structured memory.
When a new issue occurs, Pulse retrieves similar past incidents using semantic search rather than manual lookup.
It then uses an LLM to analyze patterns and suggest the most relevant fix instantly.
Over time, Pulse learns which solutions worked best and improves its recommendations.
It eliminates the need to re-read logs, tickets, or dashboards repeatedly.
By connecting past and present incidents, it reduces debugging time and avoids repeated mistakes.
It also adapts to team-specific systems, making responses context-aware and personalized.
Ultimately, Pulse transforms debugging from a reactive process into a learning-driven system that gets smarter with every incident.


## 🧠 Use of Hindsight Memory in Pulse

Pulse uses Hindsight as a persistent memory layer to store and retrieve incident knowledge across time.
Every incident—along with its logs, root cause, and resolution—is stored as a structured memory entry.
When a new issue occurs, Pulse queries Hindsight to recall semantically similar past incidents, not just exact matches.
This allows the system to connect current problems with historical patterns instantly.
The retrieved memories are injected into the LLM prompt, enabling the agent to generate context-aware and experience-driven solutions.
After resolving the issue, the new interaction is again stored in Hindsight, creating a continuous learning loop.
Over time, this memory layer helps Pulse identify recurring failures, refine fixes, and improve accuracy.
Instead of acting like a stateless chatbot, Pulse behaves like an engineer who remembers every incident it has ever solved.


## 🚀 Key Features of Pulse

🧠 Persistent Incident Memory
Stores past incidents, root causes, and resolutions for long-term learning
🔍 Semantic Incident Recall
Finds similar past issues using meaning-based search, not keyword matching
⚡ Instant Solution Suggestions
Provides relevant fixes in seconds based on historical data
🔁 Continuous Learning Loop
Improves over time by storing every new incident and its outcome
🎯 Context-Aware Responses
Uses past incidents + current logs to generate accurate, tailored solutions
📊 Pattern Detection
Identifies recurring failures and common system weaknesses
🛠️ Integration with Dev Tools
Connects with tools like logs, alerts, and monitoring systems
⏱️ Reduced Debugging Time
Eliminates repetitive log searching and manual investigation
🧑‍💻 Team Knowledge Retention
Preserves debugging knowledge beyond individuals and sessions
🚀 Scalable Incident Intelligence
Gets smarter as more incidents are processed and stored

## Weakness 
### Limited Context Understanding

Pulse mainly uses:
logs + incidents
But ignores:
codebase context
deployment history
architecture

👉This limits depth of suggestions


# Article
#### https://dev.to/krishnakasaudhan0/pulse-how-i-built-a-health-agent-that-actually-remembers-you-2j2n
# linkdin 
#### https://www.linkedin.com/posts/krishna-kasaudhan-577411318_ai-devops-machinelearning-ugcPost-7448792726893936640-J-Fi?utm_source=social_share_send&utm_medium=member_desktop_web&rcm=ACoAAFCByusB4Cz3JqeKhXcDfg7JYUNk3YAJjcA




