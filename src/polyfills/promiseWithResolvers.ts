// Polyfill Promise.withResolvers for environments where it's missing
// This file should be imported before any pdfjs/react-pdf usage on the client.

// eslint-disable-next-line @typescript-eslint/no-explicit-any
if (typeof (Promise as any).withResolvers !== 'function') {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ;(Promise as any).withResolvers = function <T>() {
    const resolvers: {
      promise: Promise<T>
      resolve: (value: T | PromiseLike<T>) => void
      reject: (reason?: unknown) => void
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } = {} as any

    resolvers.promise = new Promise<T>((res, rej) => {
      resolvers.resolve = res
      resolvers.reject = rej
    })

    return resolvers
  }
}

export {}
