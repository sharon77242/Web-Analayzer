class Queue<T> {
    private items: T[] = [];

    enqueue(item: T): void {
        this.items.push(item);
    }

    dequeue(): T | undefined {
        return this.items.shift();
    }

    isEmpty(): boolean {
        return this.items.length === 0;
    }
}

class TreeNode {
    val: number;
    left: TreeNode | null;
    right: TreeNode | null;

    constructor(val: number) {
        this.val = val;
        this.left = null;
        this.right = null;
    }
}

function bfs(root: TreeNode | null): number[] {
    if (!root) return [];

    const result: number[] = [];
    const queue = new Queue<TreeNode>();
    queue.enqueue(root);

    while (!queue.isEmpty()) {
        const node = queue.dequeue()!;
        result.push(node.val);

        if (node.left) {
            queue.enqueue(node.left);
        }
        if (node.right) {
            queue.enqueue(node.right);
        }
    }

    return result;
}

// Test the implementation
function test() {
    //     1
    //    / \
    //   2   3
    //  / \   \
    // 4   5   6
    const root = new TreeNode(1);
    root.left = new TreeNode(2);
    root.right = new TreeNode(3);
    root.left.left = new TreeNode(4);
    root.left.right = new TreeNode(5);
    root.right.right = new TreeNode(6);

    console.log("BFS traversal:", bfs(root));  // Expected: [1, 2, 3, 4, 5, 6]
}

test();