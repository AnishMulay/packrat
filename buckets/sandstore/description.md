# SandStore Bucket

## Purpose
This bucket contains all notes related to **SandStore**, a learning-first distributed file system project. It is used to record design decisions, implementation updates, Raft integration work, architectural notes, testing strategies, and distributed systems concepts as they relate to the development of SandStore.

The goal is to maintain a clean, chronological log of the project’s evolution — covering both high-level ideas and low-level execution details. This includes brainstorming, bugs, debugging sessions, milestone tracking, and open-ended technical exploration within SandStore.

## Content Cues
- Distributed file systems
- Raft consensus algorithm
- Leader election, log replication, cluster coordination
- Go code structure, interfaces, refactoring
- Communicator interface, NodeRegistry/ClusterService design
- Metadata service, chunking, storage logic
- Debugging distributed behavior, state tracking, test harnesses
- Ideas for modularity, pluggability, extensibility
- Notes on failure handling, consensus edge cases, system design tradeoffs
- Reflections or lessons learned during development

## Formatting Rules
- Use section headings for clarity (e.g., `## Leader Election Timer Design`)
- Include code snippets, pseudo-code, or interface sketches where relevant
- Use checklists for TODOs and implementation progress tracking
- Timestamp optional but encouraged for key updates
- Include diagrams or links to figures if applicable (local or external)

## Template

```markdown
## [Feature / Concept Name]

### Context
Brief explanation of what this is and where it fits in the system.

### Current Thinking
- Summary of current design/implementation ideas
- Tradeoffs or uncertainties

### Code Hooks / Integration
- Interfaces touched
- Services/modules affected
- Any new types or abstractions proposed

### TODO
- [ ] First step
- [ ] Next planned step
- [ ] Open questions

### Notes
Any additional thoughts, links to resources, or ideas for future directions.
