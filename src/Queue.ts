class Queue {
  queue: Map<number, string>;
  head: number;
  tail: number;

  constructor() {
    this.queue = new Map();
    this.head = 0;
    this.tail = 0;
  }

  enqueue(id: string) {
    this.queue.set(this.tail, id);
    ++this.tail;
  }

  dequeue(): string | undefined {
    const dequeued = this.queue.get(this.head);
    this.queue.delete(this.head);
    ++this.head;

    return dequeued;
  }

  remove(id: string) {
    // Find the head/tail index of the target id
    let target_index: number | undefined = undefined;
    this.queue.forEach((val, key) => {
      if (val === id) {
        target_index = key;
      }
    });

    if (target_index === undefined) {
      return;
    }

    // Swap with the current last element in queue
    if (this.size() === 0) {
      // No elements
      return;
    } else if (this.size() === 1) {
      // Only element in the queue
      this.tail -= 1
    } else {
      // Swap element with last element
      let lastId: string | undefined = this.queue.get(this.tail);
      if (lastId) {
        this.queue.set(target_index, lastId);
      }

      this.tail -= 1;
    }
  }

  front() {
    return this.queue.get(this.head);
  }

  size() {
    return this.tail - this.head;
  }
};

export default Queue;