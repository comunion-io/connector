class Utils {
    static async sleep(ms: number): Promise<any> {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                resolve()
            }, ms)
        })
    }
}


export default Utils
