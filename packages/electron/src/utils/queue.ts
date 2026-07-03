export class Queue<T> {
  private data: Record<number, T> = {};
  private head = 0;
  private tail = 0;

  push(item: T) {
    this.data[this.tail] = item;
    this.tail++;
  }

  pop(): T | undefined {
    if (this.isEmpty()) return undefined;
    const item = this.data[this.head];
    delete this.data[this.head];
    this.head++;
    return item;
  }

  front(): T | undefined {
    return this.data[this.head];
  }

  isEmpty(): boolean {
    return this.tail === this.head;
  }

  get size(): number {
    return this.tail - this.head;
  }
}
