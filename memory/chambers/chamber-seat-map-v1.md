# Chamber Seat Map v1

| Seat | Model ID | Role |
| --- | --- | --- |
| Chair | `xai/grok-4.5` | Frames and synthesizes; sole promote/reject chair. |
| Structural | `zai/glm-5.2` | Architecture and structural analysis. |
| Skeptic | `openai/gpt-5.6-sol` | Finds flaws, security risks, and failure modes; never synthesizes or chairs. |
| Alternative | `deepseek/deepseek-v4-flash` | Cheap independent alternative path. |

The GPT Skeptic is an explicit per-run chamber override only. It is not a brain,
swarm-default, fallback, synthesis, or chair model.
