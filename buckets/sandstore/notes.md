## Raft Consensus Algorithm Integration

### Context
Planning to integrate the Raft consensus algorithm into SandStore to replace the problematic push-based metadata replicator. Raft will handle distributed consensus for metadata operations across the cluster.

### Current Thinking
- Raft fits well with the existing metadata replicator interface design
- The consensus algorithm can handle the complex distributed log replication while the metadata replicator interface handles local server changes
- This provides a clean separation of concerns that aligns with SandStore's interface-based architecture

### Code Hooks / Integration
- Metadata Replicator interface will need additional functions
- Consensus module will be part of the metadata replicator itself
- May need separate interface for consensus algorithm types, but implementation differences suggest keeping interface at metadata replicator level
- Integration with Communicator interface for RPC messages
- Node registry will have tight coupling with Raft for failure detection

### TODO
- [ ] Understand membership changes in detail
- [ ] Design integration with existing Communicator interface
- [ ] Handle client request routing (leader vs follower)
- [ ] Resolve RPC dependency vs Communicator abstraction
- [ ] Design new server architecture for request redirection
- [ ] Integrate with node registry for failure detection

### Notes
The Raft paper "In Search of an Understandable Consensus Algorithm" was created because PAXOS was too difficult to understand and integrate into existing systems.

## Replicated Log Data Structure

### Context
Core concept underlying Raft consensus - multiple servers maintaining the same log with same events in same order. Like multiple people keeping their notebooks in sync.

### Current Thinking
Three fundamental properties:
1. **Ordering**: Same order of events across all servers
2. **Consistency**: Eventually all servers have same log entries in same order
3. **Durability**: Once committed (acknowledged by majority), entries cannot be removed

### Code Hooks / Integration
- Submit log entries like "create file metadata" or "update file metadata" to Raft
- Raft handles replication, then local metadata store gets updated
- Guarantees all servers have same metadata without push-based replication problems

### Notes
Perfect fit for SandStore's in-memory metadata service - once Raft commits operation, all servers update their local metadata stores.

## Replicated State Machines

### Context
Understanding how Raft enables synchronized state machines across multiple servers.

### Current Thinking
- State machine: deterministic system existing in one state, transitioning based on input
- File system server as state machine: current state = metadata of all files
- Inputs: "store file", "update file", "delete file" (read operations don't change state)
- Replicated state machine: same state machine running on multiple servers, kept synchronized

### Code Hooks / Integration
- Deterministic nature ensures same inputs in same order = synchronized state machines
- Replicated log ensures same inputs delivered in same order to all servers
- Clean separation: Raft handles difficult distributed log replication, Metadata Replicator interface handles local state changes

### Notes
Excellent alignment with SandStore's Go interface-based design. The separation of concerns works naturally with the existing architecture.

## Raft Algorithm Design Principles

### Context
Understanding why Raft was designed for understandability compared to PAXOS.

### Current Thinking
**PAXOS Problems:**
- Required reading multiple papers and articles to understand
- Took researchers almost a year to implement and understand
- Very theoretical, focused on correctness proofs
- Real implementations diverged significantly from protocol
- Designed for single consensus decisions, multi-PAXOS was complex extension

**Raft Design Philosophy:**
- Understandability as primary goal from start
- Decomposition into smaller, explainable parts
- Designed around log structure from beginning (not single decisions)
- Reduced state space and non-determinism where possible
- Used non-determinism strategically (like in leader election) when it improved understandability

### Code Hooks / Integration
Raft decomposes into three main parts:
1. **Leader Election**: New leader when current fails or new term starts
2. **Log Replication**: Leader ensures all servers see same log entries
3. **Safety**: Each log index has same entry across all servers

### Notes
The focus on understandability and decomposition aligns well with SandStore's learning-first approach.

## Leader Election and Terms

### Context
Raft's approach to leadership and time management in distributed systems.

### Current Thinking
- **Terms**: Arbitrary length periods with consecutive positive integers
- **Leader Election**: Happens at start of each term, servers become candidates
- **Single Leader**: Only one leader per term after election
- **Term Synchronization**: Servers share current term, default to larger number
- **Leader Demotion**: Leader becomes follower if it sees higher term number
- **Request Rejection**: Servers reject requests with stale term numbers

### Code Hooks / Integration
- Terms act as logical clock for cluster coordination
- Client request handling: leader processes, follower redirects to leader
- Will require tight coupling between consensus algorithm and server
- May need new server implementation for proper request redirection

### TODO
- [ ] Design request routing mechanism
- [ ] Handle leader/follower request processing
- [ ] Integrate term management with existing server architecture

### Notes
The term-based approach provides elegant solution to distributed time coordination without relying on physical clocks.

## Heartbeat and Failure Detection

### Context
How Raft detects failures and maintains cluster coordination.

### Current Thinking
- **Heartbeat**: Leader sends periodic "append entries" RPC with no log entries
- **Election Timeout**: Random interval (150ms-300ms) for failure detection
- **Failure Detection**: Follower starts election if no heartbeat within timeout
- **Random Timeouts**: Prevents split votes and election conflicts

### Code Hooks / Integration
- Heartbeat mechanism needs non-blocking communication
- Integration with Communicator interface for RPC messages
- Node failure detection becomes part of Raft itself (not separate from node registry)
- May need separate Raft communicator or modify existing Communicator interface

### TODO
- [ ] Resolve RPC dependency vs Communicator abstraction
- [ ] Design non-blocking communication for heartbeats
- [ ] Integrate failure detection with node registry

### Notes
Failure detection being integral to Raft creates tight coupling with node registry, but this may be necessary for correctness.

## Log Replication Process

### Context
How Raft ensures all servers maintain identical logs.

### Current Thinking
**Leader Process:**
1. Receives client request
2. Adds entry to local log
3. Sends AppendEntries RPC to all followers
4. Waits for safe replication (majority acknowledgment)
5. Commits entry and applies to state machine
6. Notifies followers of commit

**Consistency Check:**
- AppendEntries includes index and term of preceding entry
- Follower refuses entries if preceding entry doesn't match
- Ensures log consistency across all servers

### Code Hooks / Integration
- Leader decides when entries are safe to commit
- Followers apply committed entries to local state machine
- AppendEntries can contain zero, one, or multiple log entries
- Integration with metadata store updates after commit

### Notes
The consistency check mechanism provides strong guarantees about log integrity across the cluster.

## Safety Properties and Leader Election Constraints

### Context
Ensuring committed entries are never lost when leaders change.

### Current Thinking
- **Durability Violation Risk**: New leader might override previous leader's committed logs
- **Raft Solution**: New leader must contain all committed entries from previous leaders
- **Majority Requirement**: Based on original cluster size, not current active nodes
- **Cluster Memory**: Raft cluster never forgets original size even after node failures

### Code Hooks / Integration
- Leader election must verify candidate has all committed entries
- Majority calculations use original cluster size
- Failed nodes can rejoin cluster and catch up

### TODO
- [ ] Implement leader election safety checks
- [ ] Handle node recovery and log catch-up
- [ ] Maintain cluster size configuration

### Notes
The insight about majority being based on original cluster size (not current active nodes) is crucial for correct implementation.

## Communicator Interface Non-Blocking Challenge

### Context
Current Communicator interface issue with blocking HTTP/gRPC calls affecting Raft implementation.

### Current Thinking
- `communicator.send` function is currently blocking (HTTP and gRPC are blocking)
- Raft heartbeat and voting messages need non-blocking communication
- Solution: Wrap calls in `go func()` to make them non-blocking
- This allows handling responses asynchronously without blocking communicator channel

### Code Hooks / Integration
- Modify Communicator usage for Raft-specific messages
- Wrap blocking calls in goroutines for heartbeat and election messages
- Handle responses asynchronously in separate goroutines
- Maintain non-blocking behavior for Raft timing requirements

### TODO
- [ ] Implement non-blocking wrapper for Raft communications
- [ ] Test heartbeat timing with goroutine-wrapped calls
- [ ] Ensure response handling works correctly with async pattern

### Notes
This is a practical implementation detail that bridges the gap between SandStore's communication abstraction and Raft's timing requirements. The goroutine wrapper solution maintains the Communicator interface while providing necessary non-blocking behavior.
