/**
 * data-structures.js
 * 
 * This file contains the implementation of core computer science data structures
 * used to simulate the cancer metastasis process.
 
/**
 * Node class represents a single element in the Linked List.
 * It holds the 'data' and a pointer 'next' to the next node.
 */
class ListNode {
    constructor(data) {
        this.data = data; // The value stored (e.g., "Liver infected")
        this.next = null; // Pointer to the next node, initially null
    }
}

/**
 * LinkedList class.
 * Logic: Keeps track of the head (start) and tail (end) for O(1) insertions at the end.
 */
class LinkedList {
    constructor() {
        this.head = null; // Start of the list
        this.tail = null; // End of the list
        this.size = 0;    // Number of nodes
    }

    // append: Adds a new node to the end of the list
    append(data) {
        const newNode = new ListNode(data);
        if (!this.head) {
            // If list is empty, new node is both head and tail
            this.head = newNode;
            this.tail = newNode;
        } else {
            // Append to the current tail and update tail reference
            this.tail.next = newNode;
            this.tail = newNode;
        }
        this.size++;
    }

    // toArray: Converts list to array for easy visualization/iteration
    toArray() {
        const result = [];
        let current = this.head;
        while (current) {
            result.push(current.data);
            current = current.next;
        }
        return result;
    }
}

/* ==========================================================================
   2. Stack Implementation
   Used for: LIFO (Last-In, First-Out) operations. 
   Scenario: Undo last step, backtracking in DFS (if implemented).
   ========================================================================== */

class Stack {
    constructor() {
        this.items = []; // Array is used as the underlying structure for simplicity
    }

    // push: Add element to the top
    push(element) {
        this.items.push(element);
    }

    // pop: Remove and return the top element
    pop() {
        if (this.isEmpty()) return "Underflow";
        return this.items.pop();
    }

    // peek: View the top element without removing it
    peek() {
        return this.items[this.items.length - 1];
    }

    // isEmpty: Check if stack is empty
    isEmpty() {
        return this.items.length === 0;
    }

    // items array accessor for visualization
    getItems() {
        return [...this.items]; // Return copy to prevent direct mutation
    }
}

/* ==========================================================================
   3. Queue Implementation
   Used for: FIFO (First-In, First-Out) operations.
   Scenario: BFS algorithm to simulate level-by-level spreading of cancer.
   ========================================================================== */

class Queue {
    constructor() {
        this.items = [];
    }

    // enqueue: Add element to the rear
    enqueue(element) {
        this.items.push(element);
    }

    // dequeue: Remove and return the front element
    dequeue() {
        if (this.isEmpty()) return "Underflow";
        return this.items.shift(); // shift() removes the first element
        // Note: For high performance apps, a linked-list based queue is better O(1)
        // Array.shift() is O(N) because it shifts indices.
    }

    // isEmpty: Check if queue is empty
    isEmpty() {
        return this.items.length === 0;
    }

    // items array accessor for visualization
    getItems() {
        return [...this.items];
    }
}

/* ==========================================================================
   4. Graph Implementation
   Used for: Modeling the biological system where Nodes = Organs and Edges = Pathways.
   Logic: Adjacency List is used (nodes mapped to list of connected nodes).
   ========================================================================== */

class Graph {
    constructor() {
        this.adjacencyList = new Map(); // Map stores key-value pairs (Node -> [Neighbors])
        this.nodes = new Map();         // Store node metadata (id -> {x, y, label})
    }

    // addVertex: Adds a node (Organ) to the graph
    addVertex(id, metaData) {
        if (!this.adjacencyList.has(id)) {
            this.adjacencyList.set(id, []);
            this.nodes.set(id, { id, ...metaData, status: 'healthy' }); // Default status
        }
    }

    // addEdge: Adds a directed connection (Spread Pathway) between two organs
    addEdge(source, destination) {
        // Ensure both nodes exist
        if (!this.adjacencyList.has(source) || !this.adjacencyList.has(destination)) {
            console.error("Invalid nodes for edge");
            return;
        }
        // Add destination to source's neighbor list
        this.adjacencyList.get(source).push(destination);
    }

    // getNeighbors: Returns list of organs connected to a specific organ
    getNeighbors(id) {
        return this.adjacencyList.get(id) || [];
    }

    // getNodes: Returns all nodes for rendering
    getNodes() {
        return Array.from(this.nodes.values());
    }

    // getEdges: Returns all edges for rendering
    getEdges() {
        const edges = [];
        for (let [source, neighbors] of this.adjacencyList) {
            for (let dest of neighbors) {
                edges.push({ source, target: dest });
            }
        }
        return edges;
    }

    // setNodeStatus: Updates the health status of an organ
    setNodeStatus(id, status) {
        if (this.nodes.has(id)) {
            const node = this.nodes.get(id);
            node.status = status;
        }
    }
}

/* ==========================================================================
   5. Binary Search Tree (BST) Implementation
   Used for: Analytics module to demonstrate efficient searching and sorting.
   Logic: Nodes are arranged such that Left < Parent < Right.
   ========================================================================== */

class BSTNode {
    constructor(data) {
        this.data = data;
        this.left = null;
        this.right = null;
        this.count = 1; // Frequency of visits to this node
    }
}

class BinarySearchTree {
    constructor() {
        this.root = null;
    }

    // Insert: Adds a new value to the tree
    insert(data) {
        const newNode = new BSTNode(data);
        if (!this.root) {
            this.root = newNode;
            return;
        }
        let current = this.root;
        while (true) {
            if (data < current.data) {
                if (!current.left) {
                    current.left = newNode;
                    return;
                }
                current = current.left;
            } else {
                if (!current.right) {
                    current.right = newNode;
                    return;
                }
                current = current.right;
            }
        }
    }

    // Search: Finds a value and metrics (steps taken)
    search(data) {
        let current = this.root;
        let steps = 0;
        let path = [];

        while (current) {
            steps++;
            current.count++; // Increment visit count for "Most Visited" analytics
            path.push(current.data);

            if (data === current.data) {
                return { found: true, steps, path, node: current };
            }
            if (data < current.data) {
                path.push("Left");
                current = current.left;
            } else {
                path.push("Right");
                current = current.right;
            }
        }
        return { found: false, steps, path };
    }

    // Get Analytics: Height, Node Count, Leaf Count
    getStats() {
        let totalNodes = 0;
        let leafCount = 0;
        let maxDepth = 0;

        function traverse(node, depth) {
            if (!node) return;
            totalNodes++;
            maxDepth = Math.max(maxDepth, depth);

            if (!node.left && !node.right) leafCount++;

            traverse(node.left, depth + 1);
            traverse(node.right, depth + 1);
        }

        traverse(this.root, 1);
        return { totalNodes, height: maxDepth, leafCount };
    }

    // Get Most Visited Node
    getMostVisited() {
        let maxNode = null;
        let maxCount = -1;

        function traverse(node) {
            if (!node) return;
            if (node.count > maxCount) {
                maxCount = node.count;
                maxNode = node;
            }
            traverse(node.left);
            traverse(node.right);
        }

        traverse(this.root);
        return maxNode ? { id: maxNode.data, count: maxCount } : null;
    }
}

/* ==========================================================================
   6. Priority Queue (Max-Heap) Implementation
   Used for: Education module "Triage" to prioritize high-severity patients.
   Logic: Complete binary tree where Parent >= Children.
   ========================================================================== */

class MaxHeap {
    constructor() {
        this.values = [];
    }

    // Insert: Add element and bubble up
    enqueue(element, priority) {
        this.values.push({ val: element, priority: priority });
        this.bubbleUp();
    }

    bubbleUp() {
        let idx = this.values.length - 1;
        const element = this.values[idx];
        while (idx > 0) {
            let parentIdx = Math.floor((idx - 1) / 2);
            let parent = this.values[parentIdx];
            if (element.priority <= parent.priority) break;
            this.values[parentIdx] = element;
            this.values[idx] = parent;
            idx = parentIdx;
        }
    }

    // Extract Max: Remove root and bubble down
    dequeue() {
        if (this.values.length === 0) return null;
        const max = this.values[0];
        const end = this.values.pop();
        if (this.values.length > 0) {
            this.values[0] = end;
            this.sinkDown();
        }
        return max; // Returns object {val, priority}
    }

    sinkDown() {
        let idx = 0;
        const length = this.values.length;
        const element = this.values[0];
        while (true) {
            let leftChildIdx = 2 * idx + 1;
            let rightChildIdx = 2 * idx + 2;
            let leftChild, rightChild;
            let swap = null;

            if (leftChildIdx < length) {
                leftChild = this.values[leftChildIdx];
                if (leftChild.priority > element.priority) {
                    swap = leftChildIdx;
                }
            }
            if (rightChildIdx < length) {
                rightChild = this.values[rightChildIdx];
                if (
                    (swap === null && rightChild.priority > element.priority) ||
                    (swap !== null && rightChild.priority > leftChild.priority)
                ) {
                    swap = rightChildIdx;
                }
            }
            if (swap === null) break;
            this.values[idx] = this.values[swap];
            this.values[swap] = element;
            idx = swap;
        }
    }

    // getSorted: Return copy of sorted items for visualization without dequeuing
    getSorted() {
        // Simple sort for display (heap is not always fully sorted, just max ordered)
        return [...this.values].sort((a, b) => b.priority - a.priority);
    }
}

// Export classes
window.LinkedList = LinkedList;
window.Stack = Stack;
window.Queue = Queue;
window.Graph = Graph;
window.BinarySearchTree = BinarySearchTree;
window.MaxHeap = MaxHeap;
