const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');

const LINK = "https://bulletin.du.edu/undergraduate/majorsminorscoursedescriptions/traditionalbachelorsprogrammajorandminors/computerscience/#coursedescriptionstext"

axios.get(LINK)
  .then(response => {
    const $ = cheerio.load(response.data);
    const courseBlocks = $('.courseblock');
    const courses = [];

    courseBlocks.each((index, element) => {
      const courseTitle = $(element).find('.courseblocktitle').text();
      const courseDesc = $(element).find('.courseblockdesc').text();
      if (/COMP\s3\d{3}/.test(courseTitle) && !/Prerequisite/.test(courseDesc)) {
        courses.push({
          title: courseTitle,
          description: courseDesc
        });
      }
    });

    fs.writeFileSync('results/courses.json', JSON.stringify(courses, null, 2));
    console.log('Courses saved to courses.json');
  })
  .catch(error => {
    console.error('Error fetching data:', error);
  });