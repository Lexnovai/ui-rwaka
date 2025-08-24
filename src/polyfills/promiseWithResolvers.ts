// Polyfill Promise.withResolvers for environments where it's missing
// This file should be imported before any pdfjs/react-pdf usage on the client.

// eslint-disable-next-line @typescript-eslint/no-explicit-any
if (typeof (Promise as any).withResolvers !== 'function') {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ;(Promise as any).withResolvers = function <T>() {
    let resolve!: (value: T | PromiseLike<T>) => void
    let reject!: (reason?: any) => void
    const promise = new Promise<T>((res, rej) => {
      resolve = res
      reject = rej
    })
    return { promise, resolve, reject }
  }
}

export {}
