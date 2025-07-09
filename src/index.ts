import { WebsiteAnalyzer } from './analyzer/index';

(async () => {
    const analyzer = new WebsiteAnalyzer();
    // Try with a real website URL
    await analyzer.analyze('https://wikipedia.org');
})();
