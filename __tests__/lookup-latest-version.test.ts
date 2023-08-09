import {HttpClient, HttpClientResponse} from '@actions/http-client'

import {lookupLatestVersion} from '../src/lookup-latest-version'
import {expect, test} from '@jest/globals'
import {IncomingHttpHeaders} from 'http'

jest.mock('@actions/core')
jest.mock('@actions/http-client')

const mockHttpClientResponse = jest.mocked(HttpClientResponse)

test('lookupLatestVersion() success', async () => {
  // Arrange
  HttpClient.prototype.get = jest.fn().mockImplementation(() => {
    return {
      message: {
        statusCode: 301,
        headers: {
          location: 'https://example.com/tool-name-1.2.3.zip'
        } as IncomingHttpHeaders
      }
    } as HttpClientResponse
  })

  // Act
  const {name, version, url} = await lookupLatestVersion()

  // Assert
  await expect(name).toBe('tool-name')
  await expect(version).toBe('1.2.3')
  await expect(url).toBe('https://example.com/tool-name-1.2.3.zip')
})

test('lookupLatestVersion()  no status throws error', async () => {
  // Arrange
  HttpClient.prototype.get = jest.fn().mockImplementation(() => {
    return {
      message: {
        headers: {} as IncomingHttpHeaders
      }
    } as HttpClientResponse
  })

  // Act and Assert
  await expect(async () => {
    await lookupLatestVersion()
  }).rejects.toThrow('Expected 3xx response but found undefined')
})

test('lookupLatestVersion() no redirect throws error', async () => {
  // Arrange
  HttpClient.prototype.get = jest.fn().mockImplementation(() => {
    return {
      message: {
        statusCode: 404,
        headers: {} as IncomingHttpHeaders
      }
    } as HttpClientResponse
  })

  // Act and Assert
  await expect(async () => {
    await lookupLatestVersion()
  }).rejects.toThrow('Expected 3xx response but found 404')
})

test('lookupLatestVersion() no redirect location throws error', async () => {
  // Arrange
  HttpClient.prototype.get = jest.fn().mockImplementation(() => {
    return {
      message: {
        statusCode: 301,
        headers: {} as IncomingHttpHeaders
      }
    } as HttpClientResponse
  })

  // Act and Assert
  await expect(async () => {
    await lookupLatestVersion()
  }).rejects.toThrow('Expected redirect location but found none')
})

test('lookupLatestVersion() unparseable redirect location throws error', async () => {
  // Arrange
  HttpClient.prototype.get = jest.fn().mockImplementation(() => {
    return {
      message: {
        statusCode: 301,
        headers: {
          location: 'https://example.com'
        } as IncomingHttpHeaders
      }
    } as HttpClientResponse
  })

  // Act and Assert
  await expect(async () => {
    await lookupLatestVersion()
  }).rejects.toThrow('Expected parseable url but found https://example.com')
})
