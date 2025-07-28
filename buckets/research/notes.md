## Research Progress Update - K-Server Problem and Geometric Bipartite Matching

**Date**: 2025-07-28

### Summary
Working on understanding geometric bipartite matching algorithms for k-server problems under Professor Raghavendra's guidance. Need to prepare research summary for Monday noon meeting review before Tuesday meeting.

### Key Concepts
- Offline k-server problem (k-SP)
- k-server problem with initial positions (k-SPI)
- Geometric bipartite matching
- Extended bipartite matching
- Hierarchical partitioning
- Hungarian algorithm optimization
- Machine Learning integration for server problems

### Details / Notes

#### Research Context and Timeline
- Must set up structured research notes system before Monday noon
- Professor Raghavendra requires summary of week's work for review before Tuesday meeting
- Found the exact research paper to focus on: "Geometric Bipartite Matching based exact algorithms for server problems"

#### Paper Analysis: "Geometric Bipartite Matching based exact algorithms for server problems"

**Problem Definition:**
- We have a sequence of requests made to K servers
- Must split the sequence into K subsequences to minimize total cost
- Each subsequence cost = distance between consecutive pairs in metric space
- Requests are d-dimensional points in vector space
- Order of requests is important (subsequences, not subsets)
- Offline problem: all requests known in advance

**Key Terminology:**
- **Diameter**: Farthest distance between any two request points
- **Closest pair**: Smallest non-zero distance between two request points  
- **Spread (Δ)**: Ratio of diameter to closest pair distance

**k-SPI Problem Extension:**
- Servers start at initial locations (not just at first requests)
- Must factor in cost of server moving from initial location to first request
- Robot analogy: k robots at starting positions need to serve requests in sequence
- Optimal k-SPI solution = optimal General Offline K-Server problem solution

**Bipartite Matching Connection:**
- t-matching: vertex-disjoint edges connecting t points in set A to t points in set B
- Perfect matching: when |A| = |B| = N and t = N
- Geometric bipartite matching: when A and B are point sets in d-dimensional space
- Goal: minimize sum of edge weights in matching

**Reduction from k-SP to Min-Cost Bipartite Matching:**
- Create bipartite graph Gσ with vertex sets A ∪ B
- For each request ri: create vertex ai in A (exit gate) and bi in B (entry gate)
- Edge from ai to bj (j > i) with cost d(ai, bj) = ||ri - rj||p
- Min-cost (n-k)-matching in Gσ gives optimal k-SP solution
- Unmatched vertices indicate sequence breaks
- For k-SPI: add server vertices at initial locations to set A, need n-matching

**Understanding the Matching-to-Subsequence Conversion (Claude AI Discussion):**
- Edge ai → bj means "after serving request ri, go directly to request rj"
- (n-k) edges selected in matching
- k unmatched entry gates = k sequence starting points
- k unmatched exit gates = k sequence ending points
- Example with 4 requests, k=2 servers, matching {a1→b3, a2→b4}:
  - Server 1: r1 → r3
  - Server 2: r2 → r4
- Total unmatched vertices: 2k
- Total matched vertices: 2n - 2k
- Number of edges in matching: (2n - 2k)/2 = n - k

**Distance Norms:**
- L1 norm: Manhattan distance
- L2 norm: Euclidean distance  
- L3 norm: Chebyshev distance

**Related Work Insights:**
- Hungarian algorithm finds min-cost t-matching for any t ∈ [0,N]
- Gattani's GRS algorithm lacks this property - cannot find min-cost t-matching
- Previous O(n²k) algorithms used min-cost flow with -∞ edge costs, losing metric properties
- This paper's main contribution: sub-quadratic queries to DWNN (Dynamically Weighted Nearest Neighbors) data structures instead of quadratic queries

**Extended Matching and Hierarchical Partitioning:**
- Space divided into rectangles with aspect ratio ≤ t (reasonably square)
- Divider placement: middle third of longer side, minimizing nearby points
- Paper quote: "We Partition a rectangle into two children by picking a divider (the purple dashed vertical line) with the minimum number of points close to it (gray shaded area) within the middle-third of its longer side (the part between the two vertical dotted lines)."
- Recursive division until ≤2 points per cell (leaf nodes)
- Extended matching: can match points to cell boundaries
- Distance to boundary = distance to nearest boundary point of that cell

**Constrained Dual Framework (Section 2.3):**
- Defines feasible weights and admissible paths for minimum cost matching within cells
- Defines admissible weights for points matched to boundaries
- Upper bound of O(n^4/5) points matched to boundaries
- These boundary-matched points need to be handled when merging rectangles

**Algorithm Structure (2D k-SP problem):**
1. Extended Hungarian search step (uses priority queue)
2. Merge step (merge rectangles, handle boundaries, update min-cost matching)

**Machine Learning Integration Research Direction:**
- Professor Raghavendra specifically requested finding AI/ML algorithms to use
- ML algorithms predict something - need to determine what exactly
- Train on previously computed optimal solutions (since offline problem allows optimal calculation)
- k-server problem similar to NYC taxi problem Professor mentioned
- Current hypothesis: ML could predict optimal server assignments or subsequence divisions
- Key question to resolve: What specific aspect should the ML algorithm predict?

**Section 4 Notes:**
- Focuses on faster Hungarian algorithm implementations
- Specifically optimized for k-SP and k-SPI problems
- Need to study this section more thoroughly

**Mixed Language Notes (Marathi/English):**
- Extended Bipartite Matching involves recursive cell division
- Cells divided until ≤2 points each, becoming leaf nodes
- New matching type defined: match to points in B or to boundary points
- Boundary distance metric defined for extended matching

### References
- "Geometric Bipartite Matching based exact algorithms for server problems" (main paper)
- Related work: Gattani's algorithm, previous O(n²k) approaches
- Claude AI discussion on bipartite matching reduction understanding
