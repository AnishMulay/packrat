# Sandstore project

type RaftState int - Creates a new type called RaftState based on the underlying int type. This provides type safety so you can't accidentally mix regular integers with RaftState values.
const block with iota - Defines three constants representing the Raft states:

Follower gets value 0 (iota starts at 0)
Candidate gets value 1 (iota increments)
Leader gets value 2 (iota increments again)

The iota keyword is Go's way of creating auto-incrementing constants within a const block.
In the Raft consensus protocol, a node can be in one of these three states:

Follower: Passively receives updates from the leader
Candidate: Actively trying to become the leader during an election
Leader: Coordinates the cluster and handles client requests

You'd use this like:
govar nodeState RaftState = Follower
// or
if nodeState == Leader {
    // handle leader logic
}
This pattern gives you type-safe, readable constants instead of using magic numbers like 0, 1, 2 throughout your code.


I have decided to keep the cluster service really minimal
i want to do this because i dont even want the cluster service to be tied to a consensus algorithm

elections timeouts are randomized within each node in a raft cluster to avoid collisions.

I have to improve the logging for the raft cluster service, it needs to be more learning focused

there is no if or switch case in the raft cluster service to handle the leader and follower functionality.
its just the way we start and stop internal functions. that is what defines the behaviour of the server.

Raft says any node can grant a vote if the rules match, and the rules dont have the state of the current node.

so there might be collisions at the start when all 3 servers are just starting, but because of logic of raft, they will get resolved
or a new election will start.

one important thing i realized is this, we not have separate commit messages which are sent from 
the leader to the followers. the leader maintains a commit index which means i have commited logs upto this index

this is added in the heartbeat from the leader. if a follower realizes its commits are behind then it starts applying
these commits. one question that did arise here is then is this process sync or async.

it is important that i understand on which level the goroutines need to be spawned in terms of the cluster service.
it cant be that the entire cluster service is a separate process because it would add uneccesary overhead. so i can
use the cluster service as a module and then inside it the operations will spawn goroutines for the things which are
non blocking in nature.

I will have to improve the errors in the entire raft implementation later. add proper error messages and use those
instead of string error messages.

# Professor Raghvendras work

I need to ramp up my knowledge about recurrent neural networks

unlike normal neural networks, RNNs feed information back into the network. RNNs work by passing the output of one step
as the input to the next step. the fundamental processing unit is a recurrent unit. the main difference is that in a traditional neural network has separate weights and doesnt use anything common between so called steps. but an RNN uses the same hidden state and passes it in between steps to makebetter predictions. the current hidden state depends on the previous hidden state. they dont use just backpropogation they use backpropogation through time.

behavioral cloning seems like the best way right now. because its the only we I found that we could use the optimal solutions. we might not have enough optimal solutions. we could try and generate some data and build optimal solutions for those as well.