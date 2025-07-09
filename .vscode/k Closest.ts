class MinHeap {
    private heap: [number, number][] = []; // [difference, element]

    constructor() {}

    parent(i: number): number {
        return Math.floor((i - 1) / 2);
    }

    leftChild(i: number): number {
        return 2 * i + 1;
    }

    rightChild(i: number): number {
        return 2 * i + 2;
    }

    swap(i: number, j: number): void {
        [this.heap[i], this.heap[j]] = [this.heap[j], this.heap[i]];
    }

    insert(diff: number, element: number): void {
        this.heap.push([diff, element]);
        this.heapifyUp(this.heap.length - 1);
    }

    extractMin(): number {
        if (this.heap.length === 0) return -1;
        
        const min = this.heap[0][1];
        const last = this.heap.pop()!;
        
        if (this.heap.length > 0) {
            this.heap[0] = last;
            this.heapifyDown(0);
        }
        
        return min;
    }

    private heapifyUp(i: number): void {
        while (i > 0) {
            const parent = this.parent(i);
            if (this.heap[i][0] < this.heap[parent][0]) {
                this.swap(i, parent);
                i = parent;
            } else {
                break;
            }
        }
    }

    private heapifyDown(i: number): void {
        let minIndex = i;
        const left = this.leftChild(i);
        const right = this.rightChild(i);

        if (left < this.heap.length && this.heap[left][0] < this.heap[minIndex][0]) {
            minIndex = left;
        }

        if (right < this.heap.length && this.heap[right][0] < this.heap[minIndex][0]) {
            minIndex = right;
        }

        if (minIndex !== i) {
            this.swap(i, minIndex);
            this.heapifyDown(minIndex);
        }
    }

    size(): number {
        return this.heap.length;
    }
}

function findKClosestElements(arr: number[], k: number, target: number): number[] {
    const heap = new MinHeap();
    
    // Add all elements with their differences to target
    for (const num of arr) {
        heap.insert(Math.abs(num - target), num);
    }
    
    // Extract k closest elements
    const result: number[] = [];
    for (let i = 0; i < k && heap.size() > 0; i++) {
        result.push(heap.extractMin());
    }
    
    return result; // Return in sorted order
}

// Test the implementation
function test() {
    const arr = [1, 2, 3, 4, 5];
    const k = 4;
    const target = 3;
    
    console.log(`Finding ${k} closest elements to ${target} in [${arr.join(', ')}]`);
    const result = findKClosestElements(arr, k, target);
    console.log(`Result: [${result.join(', ')}]`);
}

test();