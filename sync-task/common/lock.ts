import AsyncLock from 'async-lock'


class Lock {

    private static index = 0
    private static genLock = new AsyncLock()

    private key: string
    private lock: AsyncLock

    constructor() {
        this.lock = new AsyncLock()
    }

    private async getKey() {
        if (!this.key) {
            await Lock.genLock.acquire('__lock_gen_', () => {
                this.key = `__lock_${Lock.index++}_`
            })
        }
        return this.key
    }

    async run(fn: Function) {
        await this.lock.acquire(await this.getKey(), async () => {
            let r = fn()
            if (r instanceof Promise) {
                await r
            }
        })
    }
}

export default Lock
