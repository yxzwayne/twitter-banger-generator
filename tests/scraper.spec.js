import fs from "fs";

// @ts-check
const { test } = require("@playwright/test");

// Use a throwaway account for this
const { username, password } = require('../config.json');

const scrapeFilePath = "./raw";
const scrollSize = 2000;
const timeoutPerscroll = () => {
  // add some jitter per scroll so we look like an actuall human
  return 2887 + Math.random() * 965;
};

// How long to loop the [scroll + scrape] for
// normally this is too much because a person's timeline won't have that many posts, probaly 100 is good enough
const loopFor = 500;

test("Twitter TimeLine Scraper", async ({ page }) => {
  // Your Favorite Twitter shitposter
  const twitterAt = "fi56622380";

  // upper bound of our execution time
  test.setTimeout(loopFor * 6000 + 10000);
  await page.setViewportSize({
    width: 1000,
    height: scrollSize,
  });

  await page.goto("https://x.com/");
  await page.click("text=Sign in");
  // Wait for page to load
  await page.waitForTimeout(3589);
  const userInput = "input";
  await page.fill(userInput, username);
  await page.click("text=Next");
  await page.waitForTimeout(1500);
  await page.screenshot({ path: `sreenshot1.png` });
  await page.keyboard.type(password, { delay: 50 });
  await page.click("text=Log in");
  await page.waitForTimeout(1500);

  // We are logged into twitter now
  await page.goto("https://twitter.com/" + twitterAt);
  await page.waitForTimeout(3869);

  let tweets = [];

  // create a set of long tweets that we processed to prevent repeatedly scraping long tweets.
  let longTweets = new Set();

  // Start scrolling
  for (let i = 0; i < loopFor; i++) {
    await page.mouse.wheel(0, scrollSize);
    await page.waitForTimeout(timeoutPerscroll());
    // tweets = tweets.concat(await page.getByTestId("tweetText").allInnerTexts());
    // Instead, we are going to process each tweet before writing to file.
    let thisTweets = await page.getByTestId("tweetText").allInnerTexts();
    for (let tweet of thisTweets) {
      if (tweet.trim() === "") {
        continue;
      }
      if (longTweets.has(tweet)) {
        continue;
      }
      if (tweet.includes("Show more")) {
        longTweets.add(tweet);
        try {
          await page.click(`text=${tweet}`, { timeout: 5000 });
          await page.waitForTimeout(1093);
          let longTweet = await page.getByTestId("tweetText").allInnerTexts();
          tweet = tweet.trim();
          tweets.push(longTweet[0]);
          await page.waitForTimeout(1034);
          await page.click('[aria-label="Back"]');
          // dividing by 3 is arbitrarily guessed. Working well so far.
          await page.mouse.wheel(0, scrollSize / 3);
        } catch (e) {
          console.log("Click took too long.");
        }
      } else if (!tweet.includes("Show more")) {
        tweet = tweet.trim();
        tweets.push(tweet);
      }
    }

    // Write immediately. This makes sense here becasue each write overwrites the file.
    fs.writeFileSync(
      scrapeFilePath + "/" + twitterAt + ".txt",
      tweets.map(tweet => tweet.trim()).join("\n------\n"),
      "utf-8"
    );
  }
});

// Scape in Parallel Too!  Don't do too many or ELON will get mad >:(
// test("Twitter Screenshot 2", async ({ page }) => {
//   const twitterAt = "realGeorgeHotz";

//   // upper bound of our execution time
//   test.setTimeout(loopFor * 6000 + 10000);
//   await page.setViewportSize({
//     width: 1000,
//     height: scrollSize,
//   });

//   await page.goto("https://x.com/");
//   await page.click("text=Sign in");
//   // Wait for page to load
//   await page.waitForTimeout(5000);
//   const userInput = "input";
//   await page.fill(userInput, userName);
//   await page.click("text=Next");
//   await page.waitForTimeout(2000);
//   await page.screenshot({ path: `1.png` });
//   await page.keyboard.type(password, { delay: 50 });
//   await page.click("text=Log in");
//   await page.waitForTimeout(2000);

//   // We are logged into twitter now
//   await page.goto("https://twitter.com/" + twitterAt);
//   await page.waitForTimeout(4000);

//   let tweets = [];
//   // Start scrolling
//   for (let i = 0; i < loopFor; i++) {
//     await page.mouse.wheel(0, scrollSize);
//     await page.waitForTimeout(timeoutPerscroll());
//     tweets = tweets.concat(await page.getByTestId("tweetText").allInnerTexts());
//     // Write immediately
//     fs.writeFileSync(
//       scrapeFilePath + "/" + twitterAt + ".txt",
//       tweets.join("\n------\n"),
//       "utf-8"
//     );
//   }
// });
