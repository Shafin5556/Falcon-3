import { Actor } from 'apify';
import { PlaywrightCrawler } from 'crawlee';

await Actor.init();

const input = await Actor.getInput() || {
    startUrls: [{ url: 'https://www.facebook.com/nytimes' }],
    maxPosts: 10,
    includeReactions: false,
    includeComments: false
};

const crawler = new PlaywrightCrawler({
    launchContext: {
        launchOptions: {
            headless: true,
        },
    },

    async requestHandler({ page, request }) {
        console.log(`Scraping: ${request.url}`);

        // Accept cookies
        try {
            await page.click('text=Allow all cookies', { timeout: 5000 });
        } catch (e) {}

        // Close login modal if present
        try {
            await page.evaluate(() => {
                document.querySelector('div[aria-label="Close"][role="button"]')?.click() ||
                document.querySelector('[aria-label="Close"]')?.click();
            });
        } catch (e) {}

        // Wait for posts
        await page.waitForSelector('div[role="article"]', { timeout: 30000 });

        // Scroll to load more posts
        const maxPosts = input.maxPosts || 10;
        let posts = await page.$$('div[role="article"]');
        let scrollAttempts = 0;
        const maxScrolls = 20; // Allow more scrolls for 10 posts

        while (posts.length < maxPosts && scrollAttempts < maxScrolls) {
            await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
            await page.waitForTimeout(2000); // Wait for loading

            // Check and close modal again if it reappears during scrolling
            await page.evaluate(() => {
                document.querySelector('div[aria-label="Close"][role="button"]')?.click() ||
                document.querySelector('[aria-label="Close"]')?.click();
            });

            posts = await page.$$('div[role="article"]');
            scrollAttempts++;
        }

        // Get all posts
        posts = await page.$$('div[role="article"]');
        console.log(`Found ${posts.length} posts`);

        // Limit to maxPosts (first 5)
        const postsToScrape = posts.slice(0, maxPosts);

        const allPosts = [];
        for (const [index, post] of postsToScrape.entries()) {
            const data = await post.evaluate((postEl, postIndex) => {
                const text =
                    postEl.querySelector('[dir="auto"]')?.innerText || null;

                console.log(`Post ${postIndex + 1} text: "${text?.substring(0, 100)}..."`);

                const linkEl =
                    postEl.querySelector('a[href*="/posts/"], a[href*="/videos/"]');

                const postUrl = linkEl ? linkEl.href : null;

                const time =
                    postEl.querySelector('abbr')?.getAttribute('title') ||
                    postEl.querySelector('time')?.getAttribute('datetime') || null;

                return {
                    text,
                    postUrl,
                    time
                };
            }, index);

            allPosts.push({
                pageUrl: request.url,
                ...data,
            });
        }

        await Actor.pushData({
            pageUrl: request.url,
            posts: allPosts
        });
    },
});

await crawler.run(input.startUrls);
await Actor.exit();
