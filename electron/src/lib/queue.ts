export class Queue {
  data: number[] = [];
  head: number = 0;
  tail: number = 0;

  constructor() {
    this.data = [];
    this.head = 0;
    this.tail = 0;
  }
  push(task: number) {
    this.data[this.tail] = task;
    this.tail++;
  }
  pop() {
    if (this.empty()) return undefined;
    delete this.data[this.head];
    this.head++;
  }
  front() {
    return this.data[this.head];
  }
  empty() {
    return this.tail === this.head;
  }
}
