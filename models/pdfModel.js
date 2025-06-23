const puppeteer = require("puppeteer");

class PdfModel {
  async gerar(html) {
    return new Promise(async (resolve, reject) => {
      try {
        const browser = await puppeteer.launch({
          args: ["--no-sandbox", "--disable-setuid-sandbox"],
        });
        const page = await browser.newPage();
        await page.setContent(html, { waitUntil: "networkidle0" });

        const pdfBuffer = await page.pdf({ format: "A4" });

        await browser.close();

        resolve(pdfBuffer);
      } catch (err) {
        reject(err);
      }
    });
  }
}

module.exports = new PdfModel();
