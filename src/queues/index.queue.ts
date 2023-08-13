import { EventEmitter } from 'events';

export default class TaskQueue extends EventEmitter {
    private concurrency: number;
    private running: number;
    private queue: (() => Promise<void>)[];

    constructor(concurrency: number = 10) {
        super();
        this.queue = [];
        this.running = 0;
        this.concurrency = concurrency;
    }

    public async add<T>(task: () => Promise<T>): Promise<T> {
        return new Promise<T>((resolve, reject) => {
            const wrappedTask = async () => {
                try {
                    const result = await task();
                    resolve(result);
                } catch (error) {
                    reject(error);
                }
                this.running--;
                this.process();
            };

            this.queue.push(wrappedTask);
            this.process();
        });
    }

    private async process() {
        if (this.running === 0 && this.queue.length === 0) {
            return this.emit('empty');
        }
        while (this.running < this.concurrency && this.queue.length) {
            const task = this.queue.shift();
            if (task) {
                this.running++;
                task();
            }
        }
    }
}
