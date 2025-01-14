/**
 * @fileoverview This file defines the API endpoint for advanced
 * search functionality, utilizing caching results in Redis.
 * It includes functions for fetching, parsing, and scoring search
 * results, as well as handling cache operations.
 * Note: The SearXNG integration has been removed, and the search
 * functionality is currently unavailable.
 * @filepath app/api/advanced-search/route.ts
 */
import { NextResponse } from 'next/server'
import http from 'http'
import https from 'https'
import { JSDOM, VirtualConsole } from 'jsdom'
import { Agent } from 'http'
import { Redis } from '@upstash/redis'
import { createClient } from 'redis'

const CACHE_TTL = 3600 // Cache time-to-live in seconds (1 hour)
const CACHE_EXPIRATION_CHECK_INTERVAL = 3600000 // 1 hour in milliseconds

let redisClient: Redis | ReturnType<typeof createClient> | null = null

/**
 * Initializes the Redis client based on environment variables.
 * It supports both Upstash Redis and local Redis instances.
 * @returns {Promise<Redis | ReturnType<typeof createClient> | null>}
 * The Redis client instance or null if initialization fails.
 */
async function initializeRedisClient() {
  if (redisClient) return redisClient

  const useLocalRedis = process.env.USE_LOCAL_REDIS === 'true'

  if (useLocalRedis) {
    const localRedisUrl =
      process.env.LOCAL_REDIS_URL || 'redis://localhost:6379'
    redisClient = createClient({ url: localRedisUrl })
    await redisClient.connect()
  } else {
    const upstashRedisRestUrl = process.env.UPSTASH_REDIS_REST_URL
    const upstashRedisRestToken = process.env.UPSTASH_REDIS_REST_TOKEN

    if (upstashRedisRestUrl && upstashRedisRestToken) {
      redisClient = new Redis({
        url: upstashRedisRestUrl,
        token: upstashRedisRestToken
      })
    }
  }

  return redisClient
}

/**
 * Retrieves cached results from Redis.
 * @param {string} cacheKey - The key to look up in the cache.
 * @returns {Promise<any | null>} The cached data, or null if not found
 * or an error occurs.
 */
async function getCachedResults(
  cacheKey: string
): Promise<any | null> {
  try {
    const client = await initializeRedisClient()
    if (!client) return null

    let cachedData: string | null
    if (client instanceof Redis) {
      cachedData = await client.get(cacheKey)
    } else {
      cachedData = await client.get(cacheKey)
    }

    if (cachedData) {
      console.log(`Cache hit for key: ${cacheKey}`)
      return JSON.parse(cachedData)
    } else {
      console.log(`Cache miss for key: ${cacheKey}`)
      return null
    }
  } catch (error) {
    console.error('Redis cache error:', error)
    return null
  }
}

/**
 * Sets results in the Redis cache with error handling and logging.
 * @param {string} cacheKey - The key to store the results under.
 * @param {any} results - The data to cache.
 * @returns {Promise<void>}
 */
async function setCachedResults(
  cacheKey: string,
  results: any
): Promise<void> {
  try {
    const client = await initializeRedisClient()
    if (!client) return

    const serializedResults = JSON.stringify(results)
    if (client instanceof Redis) {
      await client.set(cacheKey, serializedResults, { ex: CACHE_TTL })
    } else {
      await client.set(cacheKey, serializedResults, { EX: CACHE_TTL })
    }
    console.log(`Cached results for key: ${cacheKey}`)
  } catch (error) {
    console.error('Redis cache error:', error)
  }
}

/**
 * Periodically cleans up expired cache entries from Redis.
 * @returns {Promise<void>}
 */
async function cleanupExpiredCache() {
  try {
    const client = await initializeRedisClient()
    if (!client) return

    const keys = await client.keys('search:*')
    for (const key of keys) {
      const ttl = await client.ttl(key)
      if (ttl <= 0) {
        await client.del(key)
        console.log(`Removed expired cache entry: ${key}`)
      }
    }
  } catch (error) {
    console.error('Cache cleanup error:', error)
  }
}

// Set up periodic cache cleanup
setInterval(cleanupExpiredCache, CACHE_EXPIRATION_CHECK_INTERVAL)

/**
 * Handles POST requests to the advanced search endpoint.
 * @param {Request} request - The incoming request object.
 * @returns {Promise<NextResponse>} The search results or an error
 * response.
 */
export async function POST(request: Request) {
  const { query, maxResults, searchDepth, includeDomains, excludeDomains } = await request.json()

  try {
    const cacheKey = `search:${query}:${maxResults}:${searchDepth}:${Array.isArray(includeDomains) ? includeDomains.join(',') : ''}:${Array.isArray(excludeDomains) ? excludeDomains.join(',') : ''}`

    // Try to get cached results
    const cachedResults = await getCachedResults(cacheKey)
    if (cachedResults) {
      return NextResponse.json(cachedResults)
    }

    // Return a placeholder response or error since SearXNG is removed
    return NextResponse.json({
      message: 'Search functionality is currently unavailable.',
      query: query,
      results: [],
      images: [],
      number_of_results: 0
    })
  } catch (error) {
    console.error('Advanced search error:', error)
    return NextResponse.json({
      message: 'Internal Server Error',
      error: error instanceof Error ? error.message : String(error),
      query: query,
      results: [],
      images: [],
      number_of_results: 0
    }, { status: 500 })
  }
}

/**
 * Crawls a webpage to extract and process its content.
 * @param {any} result - The search result object containing the URL.
 * @param {string} query - The original search query.
 * @returns {Promise<any>} The modified result object with extracted
 * content.
 */
async function crawlPage(
  result: any,
  query: string
): Promise<any> {
  try {
    const html = await fetchHtmlWithTimeout(result.url, 20000)

    // virtual console to suppress JSDOM warnings
    const virtualConsole = new VirtualConsole()
    virtualConsole.on('error', () => {})
    virtualConsole.on('warn', () => {})

    const dom = new JSDOM(html, {
      runScripts: 'outside-only',
      resources: 'usable',
      virtualConsole
    })
    const document = dom.window.document

    // Remove script, style, nav, header, and footer elements
    document
      .querySelectorAll('script, style, nav, header, footer')
      .forEach((el: Element) => el.remove())

    const mainContent =
      document.querySelector('main') ||
      document.querySelector('article') ||
      document.querySelector('.content') ||
      document.querySelector('#content') ||
      document.body

    if (mainContent) {
      // Prioritize specific content elements
      const priorityElements = mainContent.querySelectorAll('h1, h2, h3, p')
      let extractedText = Array.from(priorityElements)
        .map(el => el.textContent?.trim())
        .filter(Boolean)
        .join('\n\n')

      // If not enough content, fall back to other elements
      if (extractedText.length < 500) {
        const contentElements = mainContent.querySelectorAll(
          'h4, h5, h6, li, td, th, blockquote, pre, code'
        )
        extractedText +=
          '\n\n' +
          Array.from(contentElements)
            .map(el => el.textContent?.trim())
            .filter(Boolean)
            .join('\n\n')
      }

      // Extract metadata
      const metaDescription =
        document
          .querySelector('meta[name="description"]')
          ?.getAttribute('content') || ''
      const metaKeywords =
        document
          .querySelector('meta[name="keywords"]')
          ?.getAttribute('content') || ''
      const ogTitle =
        document
          .querySelector('meta[property="og:title"]')
          ?.getAttribute('content') || ''
      const ogDescription =
        document
          .querySelector('meta[property="og:description"]')
          ?.getAttribute('content') || ''

      // Combine metadata with extracted text
      extractedText = `${result.title}\n\n${ogTitle}\n\n${metaDescription}\n\n${ogDescription}\n\n${metaKeywords}\n\n${extractedText}`

      // Limit the extracted text to 10000 characters
      extractedText = extractedText.substring(0, 10000)

      // Highlight query terms in the content
      result.content = highlightQueryTerms(extractedText, query)

      // Extract publication date
      const publishedDate = extractPublicationDate(document)
      if (publishedDate) {
        result.publishedDate = publishedDate.toISOString()
      }
    }

    return result
  } catch (error) {
    console.error(`Error crawling ${result.url}:`, error)
    return {
      ...result,
      content: result.content || 'Content unavailable due to crawling error.'
    }
  }
}

/**
 * Highlights query terms in the given content.
 * @param {string} content - The text content to highlight.
 * @param {string} query - The search query.
 * @returns {string} The content with highlighted query terms.
 */
function highlightQueryTerms(content: string, query: string): string {
  try {
    const terms = query
      .toLowerCase()
      .split(/\s+/)
      .filter(term => term.length > 2)
      .map(term => term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')) // Escape special characters

    let highlightedContent = content

    terms.forEach(term => {
      const regex = new RegExp(`\\b${term}\\b`, 'gi')
      highlightedContent = highlightedContent.replace(
        regex,
        match => `<mark>${match}</mark>`
      )
    })

    return highlightedContent
  } catch (error) {
    //console.error('Error in highlightQueryTerms:', error)
    return content // Return original content if highlighting fails
  }
}

/**
 * Calculates a relevance score for a search result.
 * @param {any} result - The search result object.
 * @param {string} query - The search query.
 * @returns {number} The calculated relevance score.
 */
function calculateRelevanceScore(
  result: any,
  query: string
): number {
  try {
    const lowercaseContent = result.content.toLowerCase()
    const lowercaseQuery = query.toLowerCase()
    const queryWords = lowercaseQuery
      .split(/\s+/)
      .filter(word => word.length > 2)
      .map(word => word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')) // Escape special characters

    let score = 0

    // Check for exact phrase match
    if (lowercaseContent.includes(lowercaseQuery)) {
      score += 30
    }

    // Check for individual word matches
    queryWords.forEach(word => {
      const regex = new RegExp(`\\b${word}\\b`, 'g')
      const wordCount = (lowercaseContent.match(regex) || []).length
      score += wordCount * 3
    })

    // Boost score for matches in the title
    const lowercaseTitle = result.title.toLowerCase()
    if (lowercaseTitle.includes(lowercaseQuery)) {
      score += 20
    }

    queryWords.forEach(word => {
      const regex = new RegExp(`\\b${word}\\b`, 'g')
      if (lowercaseTitle.match(regex)) {
        score += 10
      }
    })

    // Boost score for recent content (if available)
    if (result.publishedDate) {
      const publishDate = new Date(result.publishedDate)
      const now = new Date()
      const daysSincePublished =
        (now.getTime() - publishDate.getTime()) / (1000 * 3600 * 24)
      if (daysSincePublished < 30) {
        score += 15
      } else if (daysSincePublished < 90) {
        score += 10
      } else if (daysSincePublished < 365) {
        score += 5
      }
    }

    // Penalize very short content
    if (result.content.length < 200) {
      score -= 10
    } else if (result.content.length > 1000) {
      score += 5
    }

    // Boost score for content with more highlighted terms
    const highlightCount = (result.content.match(/<mark>/g) || []).length
    score += highlightCount * 2

    return score
  } catch (error) {
    //console.error('Error in calculateRelevanceScore:', error)
    return 0 // Return 0 if scoring fails
  }
}

/**
 * Extracts the publication date from a document.
 * @param {Document} document - The HTML document object.
 * @returns {Date | null} The publication date or null if not found.
 */
function extractPublicationDate(document: Document): Date | null {
  const dateSelectors = [
    'meta[name="article:published_time"]',
    'meta[property="article:published_time"]',
    'meta[name="publication-date"]',
    'meta[name="date"]',
    'time[datetime]',
    'time[pubdate]'
  ]

  for (const selector of dateSelectors) {
    const element = document.querySelector(selector)
    if (element) {
      const dateStr =
        element.getAttribute('content') ||
        element.getAttribute('datetime') ||
        element.getAttribute('pubdate')
      if (dateStr) {
        const date = new Date(dateStr)
        if (!isNaN(date.getTime())) {
          return date
        }
      }
    }
  }

  return null
}

const httpAgent = new http.Agent({ keepAlive: true })
const httpsAgent = new https.Agent({
  keepAlive: true,
  rejectUnauthorized: true // change to false if you want to ignore SSL certificate errors
  //but use this with caution.
})

/**
 * Fetches JSON data from a URL with retry logic.
 * @param {string} url - The URL to fetch.
 * @param {number} retries - The number of retry attempts.
 * @returns {Promise<any>} The JSON data.
 */
async function fetchJsonWithRetry(url: string, retries: number): Promise<any> {
  for (let i = 0; i < retries; i++) {
    try {
      return await fetchJson(url)
    } catch (error) {
      if (i === retries - 1) throw error
      await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)))
    }
  }
}

/**
 * Fetches JSON data from a URL.
 * @param {string} url - The URL to fetch.
 * @returns {Promise<any>} The JSON data.
 */
function fetchJson(url: string): Promise<any> {
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith('https:') ? https : http
    const agent = url.startsWith('https:') ? httpsAgent : httpAgent
    const request = protocol.get(url, { agent }, res => {
      let data = ''
      res.on('data', chunk => {
        data += chunk
      })
      res.on('end', () => {
        try {
          // Check if the response is JSON
          if (res.headers['content-type']?.includes('application/json')) {
            resolve(JSON.parse(data))
          } else {
            // If not JSON, return an object with the raw data and status
            resolve({
              error: 'Invalid JSON response',
              status: res.statusCode,
              data: data.substring(0, 200) // Include first 200 characters of the response
            })
          }
        } catch (e) {
          reject(e)
        }
      })
    })
    request.on('error', reject)
    request.on('timeout', () => {
      request.destroy()
      reject(new Error('Request timed out'))
    })
    request.setTimeout(15000) // 15 second timeout
  })
}

/**
 * Fetches HTML content from a URL with a timeout.
 * @param {string} url - The URL to fetch.
 * @param {number} timeoutMs - The timeout in milliseconds.
 * @returns {Promise<string>} The HTML content.
 */
async function fetchHtmlWithTimeout(
  url: string,
  timeoutMs: number
): Promise<string> {
  try {
    return await Promise.race([
      fetchHtml(url),
      timeout(timeoutMs, `Fetching ${url} timed out after ${timeoutMs}ms`)
    ])
  } catch (error) {
    console.error(`Error fetching ${url}:`, error)
    const errorMessage = error instanceof Error ? error.message : String(error)
    return `<html><body>Error fetching content: ${errorMessage}</body></html>`
  }
}

/**
 * Fetches HTML content from a URL.
 * @param {string} url - The URL to fetch.
 * @returns {Promise<string>} The HTML content.
 */
function fetchHtml(url: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith('https:') ? https : http
    const agent = url.startsWith('https:') ? httpsAgent : httpAgent
    const request = protocol.get(url, { agent }, res => {
      if (
        res.statusCode &&
        res.statusCode >= 300 &&
        res.statusCode < 400 &&
        res.headers.location
      ) {
        // Handle redirects
        fetchHtml(new URL(res.headers.location, url).toString())
          .then(resolve)
          .catch(reject)
        return
      }
      let data = ''
      res.on('data', chunk => {
        data += chunk
      })
      res.on('end', () => resolve(data))
    })
    request.on('error', error => {
      //console.error(`Error fetching ${url}:`, error)
      reject(error)
    })
    request.on('timeout', () => {
      request.destroy()
      //reject(new Error(`Request timed out for ${url}`))
      resolve('')
    })
    request.setTimeout(10000) // 10 second timeout
  })
}

/**
 * Creates a promise that rejects after a specified timeout.
 * @param {number} ms - The timeout in milliseconds.
 * @param {string} message - The error message.
 * @returns {Promise<never>} A promise that rejects after the timeout.
 */
function timeout(ms: number, message: string): Promise<never> {
  return new Promise((_, reject) => {
    setTimeout(() => {
      reject(new Error(message))
    }, ms)
  })
}

/**
 * Checks if the given text is considered quality content.
 * @param {string} text - The text to check.
 * @returns {boolean} True if the content is considered quality,
 * false otherwise.
 */
function isQualityContent(text: string): boolean {
  const words = text.split(/\s+/).length
  const sentences = text.split(/[.!?]+/).length
  const avgWordsPerSentence = words / sentences

  return (
    words > 50 &&
    sentences > 3 &&
    avgWordsPerSentence > 5 &&
    avgWordsPerSentence < 30 &&
    !text.includes('Content unavailable due to crawling error') &&
    !text.includes('Error fetching content:')
  )
}