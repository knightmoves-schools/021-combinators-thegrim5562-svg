const http = require("http");
const fs = require("fs");
const puppeteer = require("puppeteer");

let server;
let browser;
let page;

beforeAll(async () => {
  server = http.createServer((req, res) => {
    fs.readFile(__dirname + "/.." + req.url, (err, data) => {
      if (err) {
        res.writeHead(404);
        res.end(JSON.stringify(err));
        return;
      }
      res.writeHead(200);
      res.end(data);
    });
  });
  server.listen(process.env.PORT || 3000);
});

afterAll(() => {
  server.close();
});

beforeEach(async () => {
  browser = await puppeteer.launch({ args: ["--no-sandbox"] });
  page = await browser.newPage();
  await page.goto("http://localhost:3000/index.html");
});

afterEach(async () => {
  await browser.close();
});

describe("all descendant divs within span", () => {
  it("should have orange text", async () => {
    const colors = await page.$$eval("span div", (divs) => {
      return divs.map((div) =>
        window.getComputedStyle(div).getPropertyValue("color")
      );
    });
    expect(colors.length).toBe(3);
    expect(colors.every((color) => color === "rgb(255, 165, 0)")).toBe(true);
  });
});

describe("all children divs of span", () => {
  it("should have large text", async () => {
    const fontSizes = await page.$$eval("span > div", (divs) => {
      return divs.map((div) =>
        window.getComputedStyle(div).getPropertyValue("font-size")
      );
    });
    expect(fontSizes.length).toBe(2);
    expect(fontSizes.every((size) => size === "18px")).toBe(true);
  });
});

describe("all adjacent sibling divs of span", () => {
  it("should have red text", async () => {
    const colors = await page.$$eval("span + div", (divs) => {
      return divs.map((div) =>
        window.getComputedStyle(div).getPropertyValue("color")
      );
    });
    expect(colors.length).toBe(1);
    expect(colors[0]).toBe("rgb(255, 0, 0)");
  });
});

describe("all sibling divs of span", () => {
  it("should have a yellow background", async () => {
    const backgroundColors = await page.$$eval("span ~ div", (divs) => {
      return divs.map((div) =>
        window.getComputedStyle(div).getPropertyValue("background-color")
      );
    });
    expect(backgroundColors.length).toBe(2);
    expect(backgroundColors.every((color) => color === "rgb(255, 255, 0)")).toBe(true);
  });
});
