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

  front() {
    return this.queue.get(this.head);
  }

  size() {
    return this.queue.size;
  }
};

export default Queue;