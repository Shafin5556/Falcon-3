# Facebook Page Post Scraper

An Apify Actor using JavaScript + Crawlee (PlaywrightCrawler) to scrape public Facebook Page posts.

## Objective

Build an Apify Actor to scrape the latest post from a public Facebook Page, extracting post text, URL, timestamp, and page name.

## Phase-1 (Current)

- Scrape latest posts (up to 10) from a Facebook Page
- Extract: Post text, Post URL, Timestamp, Page name

## Phase-2 (Future)

- Scrape: Like/Love/Care/Haha/Wow/Sad/Angry counts, Comment count, Share count
- Optional: Comments text, Media URLs (image/video)

## Scope & Limitations

### Supported
- Public Facebook Pages only
- No login required
- Headless browser scraping

### Not Supported
- Private content
- Messages
- Logged-in actions
- Ads Manager / Graph API

## Tech Stack

- **Language**: JavaScript (Node.js)
- **Framework**: Apify SDK
- **Crawler**: Crawlee – PlaywrightCrawler
- **Browser**: Chromium
- **Storage**: Apify Dataset
- **Proxy**: Apify Residential (recommended)

## High-Level Architecture

```
Input (FB Page URL)
        ↓
Playwright Browser
        ↓
Load Page + Wait
        ↓
Select First Post (DOM)
        ↓
Extract Data
        ↓
Actor.pushData()
        ↓
Dataset / API
```

## Actor Input Schema

```json
{
  "startUrls": [
    { "url": "https://www.facebook.com/nytimes" }
  ],
  "maxPosts": 10,
  "includeReactions": false,
  "includeComments": false
}
```

## DOM Strategy

Facebook renders posts inside: `<div role="article">...</div>`

### Key Selectors

| Data | Selector |
|------|----------|
| Post container | `div[role="article"]` |
| Text | `[data-ad-preview="message"]` |
| Post link | `a[href*="/posts/"], a[href*="/videos/"]` |
| Timestamp | `abbr` or `a[href][aria-label]` |
| Reactions | `[aria-label*="reactions"]` |
| Comments count | text=/comments/i |

## Dataset Output Example

```json
{
  "pageUrl": "https://www.facebook.com/nytimes",
  "text": "Breaking News: ...",
  "postUrl": "https://www.facebook.com/nytimes/posts/1016...",
  "time": "January 10 at 9:30 PM"
}
```

## Anti-Ban Strategy

- Use residential proxy to avoid IP bans
- No infinite scroll for low footprint
- Max 1–5 pages/run for safety
- Headful for scale (looks human)
- Random delays to avoid detection

## Scaling Plan

- **Phase-1**: 1 page → up to 10 posts
- **Phase-2**: 10–50 pages / run, Scheduled execution
- **Phase-3**: API endpoint, DB storage, Python NLP pipeline

## Legal & Ethics Note

- Scrape public data only
- Respect robots & rate limits
- Do not store personal sensitive data

## One-Paragraph Brief

"This Apify Actor uses a Playwright-based browser to scrape public Facebook Pages and extract the latest post data. It avoids Facebook APIs and login, operates on public HTML only, supports proxy rotation, and stores structured output in Apify datasets. The system is designed for future extension to capture reactions, comments, and engagement metrics."

## Installation & Usage

1. Install dependencies: `npm install`
2. Run the actor: `npm start https://www.facebook.com/yourpage` (URL required)
3. Or use `apify run` with input JSON
4. Provide input as per schema above.

## Final Recommendation

- JavaScript only
- Apify SDK + Crawlee
- Modular & scalable
- Safe scraping footprint
