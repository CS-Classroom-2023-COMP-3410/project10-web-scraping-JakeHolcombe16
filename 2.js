// I genuinly have no idea where this API is being sourced from
// I've checked just about every one of the XHR/Fetch and Doc calls
// In the network panal and looked everywhere in the HTML for any useful calls
const axios = require("axios");
const cheerio = require("cheerio");
const fs = require("fs");
const path = require("path");

const URL = "https://denverpioneers.com/index.aspx";

async function scrapeAthleticEvents() {
    try {
        const { data } = await axios.get(URL);
        const $ = cheerio.load(data);
        
        let events = [];

        // Identify the section containing the carousel events
        $(".carousel-item").each((index, element) => {
            const duTeam = "Denver Pioneers"; // DU team name is consistent
            const opponent = $(element).find(".sidearm-schedule-game-opponent-name").text().trim();
            const date = $(element).find(".sidearm-schedule-game-date").text().trim();

            if (opponent && date) {
                events.push({
                    duTeam,
                    opponent,
                    date
                });
            }
        });

        // Save the results to JSON file
        const resultPath = path.join(__dirname, "results", "athletic_events.json");
        fs.mkdirSync(path.dirname(resultPath), { recursive: true });

        fs.writeFileSync(resultPath, JSON.stringify({ events }, null, 2));

        console.log("Scraped events saved successfully!");
    } catch (error) {
        console.error("Error fetching or parsing data:", error);
    }
}

scrapeAthleticEvents();
