const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs'); // Using callback-based fs

// The main URL for the events listing
const CALENDAR_URL = 'https://www.du.edu/calendar?search=&start_date=2025-01-01&end_date=2025-12-31#events-listing-date-filter-anchor';

// Output file
const OUTPUT_FILE = 'results/calendar_events.json';

(async () => {
  try {
    // 1. Fetch the main calendar page
    const { data } = await axios.get(CALENDAR_URL);
    const $ = cheerio.load(data);

    // 2. Select each event card
    const eventCards = $('.events-listing__item');

    // Prepare an array to hold event data
    const events = [];

    // 3. Loop through each event card and extract info
    for (let i = 0; i < eventCards.length; i++) {
      const eventCard = eventCards.eq(i);

      // Extract details from the event card
      const title = eventCard.find('h3').text().trim();
      const date = eventCard.find('p').first().text().trim();
      const time = eventCard
        .find('.icon-du-clock')
        .parent()
        .text()
        .trim()
        .replace(/\s+/g, ' ') || undefined;

      // The "More Details" link that goes to the event’s own page
      let detailsLink = eventCard.find('a.event-card').attr('href');
      // Convert relative URL to absolute if necessary
      if (detailsLink && detailsLink.startsWith('/')) {
        detailsLink = new URL(detailsLink, 'https://www.du.edu').href;
      }

      // Fetch description from the detail page
      let description = '';
      if (detailsLink) {
        try {
          const info = await axios.get(detailsLink);
          const $detail = cheerio.load(info.data);
          description = $detail('.description').text().trim().replace(/\s+/g, ' ');
        } catch (err) {
          console.error(`Error fetching detail page ${detailsLink}:`, err);
        }
      }

      // Push the event object into our array
      events.push({
        title,
        date,
        ...(time ? { time } : {}),
        ...(description ? { description } : {})
      });
    }

    // 4. Build the final JSON object and save to a file
    const result = { events };
    fs.writeFile(OUTPUT_FILE, JSON.stringify(result, null, 2), (err) => {
      if (err) {
        console.error('Error writing file:', err);
      } else {
        console.log(`Scraping complete. Results saved to ${OUTPUT_FILE}`);
      }
    });
  } catch (error) {
    console.error('Error fetching events:', error);
  }
})();
