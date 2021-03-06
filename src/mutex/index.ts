import Redis from 'ioredis'
import { v4 as uuid4 } from 'uuid'

import TimeoutError from '../errors/TimeoutError'
import acquireMutex from './acquire'
import refreshMutex from './refresh'
import releaseMutex from './release'

function getKey(key: string) {
  return `mutex:${key}`
}

export async function acquire(
  client: Redis.Redis | Redis.Cluster,
  key: string,
  lockTimeout: number,
  acquireTimeout: number,
  retryInterval: number
) {
  const identifier = uuid4()
  const finalKey = getKey(key)
  const result = await acquireMutex(
    client,
    finalKey,
    identifier,
    lockTimeout,
    acquireTimeout,
    retryInterval
  )
  if (result) {
    return identifier
  } else {
    throw new TimeoutError(`Acquire mutex ${key} timeout`)
  }
}

export async function refresh(
  client: Redis.Redis | Redis.Cluster,
  key: string,
  identifier: string,
  lockTimeout: number
) {
  const finalKey = getKey(key)
  return await refreshMutex(client, finalKey, identifier, lockTimeout)
}

export async function release(
  client: Redis.Redis | Redis.Cluster,
  key: string,
  identifier: string
) {
  const finalKey = getKey(key)
  return await releaseMutex(client, finalKey, identifier)
}
