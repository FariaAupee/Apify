const Apify = require('apify');

Apify.main(async () => {
    // Hardcoded start URL, replace with your desired URL
    const startUrl = 'https://www.goodonyou.eco/category/luxury/';

    // Initialize a request queue
    const requestQueue = await Apify.openRequestQueue();

    // Enqueue the starting URL
    await requestQueue.addRequest({ url: startUrl });

    // Create a crawler
    const crawler = new Apify.CheerioCrawler({
        requestQueue,
        handlePageFunction: async ({ request, $ }) => {
            const pageUrl = request.url;

            // Extract data from the page
            const title = $('title').text();
            const content = $('body').text();

            // Save extracted data
            await Apify.pushData({
                pageUrl,
                title,
                content,
            });

            // Find and enqueue URLs from the content
            const links = [];
            $('a').each((index, element) => {
                const link = $(element).attr('href');
                if (link && link.startsWith('http')) {
                    links.push(link);
                }
            });

            // Enqueue the discovered URLs
            await requestQueue.addRequest(links.map(link => ({ url: link })));
        },
    });

    // Start the crawler
    await crawler.run();
});
