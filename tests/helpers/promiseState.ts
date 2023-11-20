export function promiseState (promise): Promise<{ status: 'pending' | 'fulfilled' | 'rejected' }> {
  const pendingState = { status: 'pending' }

  return Promise.race([promise, pendingState]).then(
    (value) =>
      value === pendingState ? value : { status: 'fulfilled', value },
    (reason) => ({ status: 'rejected', reason }),
  )
}
