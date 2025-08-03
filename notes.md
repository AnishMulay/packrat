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

behavioral cloning seems like the best way right now. because its the only we I found that we could use the optimal solutions. we might not have enough optimal solutions. we could try and generate some data and build optimal solutions for those as well.# Professor Raghvendra work

One of the things that Professor Raghvendra mentioned during our last meeting was that we make a small change in the case of the K-SP or K Server problem when we are dealing with New York taxis. The change is that we assume a fixed velocity for a taxi to get from one point to the other point. After we make this assumption, we will only have a certain number of future matchings available. If you have Set A and Set B, where Set A represents the starting points and Set B represents the ending points for the requests, these are for the request. Set A will have all the requests, and Set B will also have all the requests. To have this feasibility, not only do we need to make sure that edges only map to requests which are ahead of it in time but also the ones which are feasible. Then we can run the algorithm again to compute the optimal solution.

The next paper that Prof. Raghvendra has told me to read is titled "Attention, learn to solve routing problems"

# Attention, learn to solve routing problems

This paper, in its related work, also mentions another paper which introduces the pointer network. The Pointer Network uses a transformer to output a permutation of the input. This model is then trained to solve the Euclidean version of the Traveling Salesman Problem.

Another paper also described an actor-critic model to train this policy or this algorithm without any helpers or examples.But in our case, I think we are more interested in something they mentioned with AlphaGo, which is: we have the optimal solution and then we want to baseline the policy using some kind of RL algorithm and then learn newer versions. It's not a game, so we won't be able to generate data about this.

They also mention a research paper by Nazari which talks about a few changes to this model and trains it on the Vehicle Routing Problem. And I think this is most relevant to us since we are looking at the Vehicle Routing Problem in some sense.

I need to figure out some of the important keywords and what they mean in the answer that Perplexity Labs gave me.
