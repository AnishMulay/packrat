# Personal Stack Overflow

## Q CLI Command Error - 2025-07-27

**Problem**: Got an error when trying to use `--no-interactive` and `--trust-all-tools` commands with Q CLI

**Solution**: These flags can only be used with the `q chat` command, not just `q`

**Command that works**: `q chat --no-interactive --trust-all-tools`
**Command that doesn't work**: `q --no-interactive --trust-all-tools`

## Making Blocking HTTP/gRPC Calls Non-Blocking in Go

**Date**: 2025-07-30

### Problem
Working on a distributed system project where the Communicator interface uses blocking HTTP and gRPC calls via `communicator.send()`. However, for implementing Raft consensus algorithm, heartbeat and voting messages need to be non-blocking to prevent timing issues and communication channel blocking.

### Diagnosis
The core issue is that both HTTP and gRPC are inherently blocking operations. When used in a distributed consensus algorithm like Raft, these blocking calls can:
- Block the communicator channel
- Interfere with critical timing requirements for heartbeats (150ms-300ms intervals)
- Prevent proper handling of concurrent election and replication messages

### Solution
Wrap the blocking `communicator.send()` calls inside goroutines to make them effectively non-blocking:

```go
// Instead of blocking call:
response := communicator.send(message)

// Use non-blocking pattern:
go func() {
    response := communicator.send(message)
    // Handle response asynchronously
    handleResponse(response)
}()
```

This approach:
- Makes the call non-blocking from the caller's perspective
- Allows handling responses asynchronously when they arrive
- Prevents blocking of the communicator channel
- Maintains proper timing for Raft heartbeat and election mechanisms

### Notes / Learnings
- This pattern is particularly useful when you need to maintain interface abstractions (like a generic Communicator) while adapting to specific timing requirements
- The goroutine wrapper preserves the existing interface design while solving the blocking behavior problem
- Essential for distributed consensus algorithms that have strict timing requirements
- Can be applied to any blocking I/O operation that needs to be made non-blocking without changing the underlying interface
