import { Injectable, Logger } from '@nestjs/common';
import puppeteer from 'puppeteer';
import * as _ from 'lodash';
import { timeUtils } from 'src/common/time.utils';
import { XINGYE_URL } from 'src/config';

@Injectable()
export class ReptilerService {
  async financialProductCrawler(fromDate: string) {
    fromDate = timeUtils.formDate2(fromDate);
    let maxDate;
    const browser = await puppeteer.launch({
      //   headless: false,
      // executablePath: '/usr/bin/chromium-browser',
      defaultViewport: { width: 1000, height: 600 },
      ignoreDefaultArgs: ['--enable-automation'],
      args: ['--no-sandbox'],
    });
    const page = await browser.newPage();
    await page.goto(XINGYE_URL, {
      waitUntil: 'networkidle2',
    });

    const selector = '#content > div.list-box > div.middle > ul > li';

    await page.waitForSelector(selector, { visible: true });

    const outerHerfs = await page.$$eval(selector, (eles) =>
      eles.map((ele) => (ele.children[0] as HTMLAnchorElement).href),
    );
    // 翻页
    const nextSelector =
      '#content > div.list-box > div.middle > div > p.clearfix.no-padding-left :nth-child(3)';
    while (true) {
      await page.waitForSelector(selector, { visible: true });
      await page.waitForSelector(nextSelector, { visible: true });

      const resultDom = await page.$eval(nextSelector, (el) =>
        el.getAttribute('class'),
      );
      const resultHander = await page.$(nextSelector);

      const arr = await page.$$eval(selector, (eles) =>
        eles.map((ele) => {
          return {
            href: (ele.children[0] as HTMLAnchorElement).href,
            date: ele.children[1].textContent,
          };
        }),
      );

      let needBreak = false;
      for (const item of arr) {
        if (item.date <= fromDate) {
          needBreak = true;
          break;
        }
        if (!maxDate || maxDate < item.date) maxDate = item.date;
        outerHerfs.push(item.href);
      }

      if (needBreak || resultDom?.includes('next-disabled')) {
        page.close();
        break;
      } else {
        await Promise.all([page.waitForNavigation(), resultHander.click()]);
      }
    }

    // 直接在这遍历所有页面取herf

    // 1.并行，但是没有限制并行最大数，（50）
    // 2.递归翻页

    let innerHerfLength = 0;

    const list = [];
    const herfs: { outerHerf: string; innerHerfs: string[] }[] = [];
    const createOuter = (outerHerf: string) => {
      return new Promise(async (resolve) => {
        const page = await browser.newPage();
        if (outerHerf.includes('/run/')) {
          outerHerf = outerHerf.replace('/run/', '/referNetValue/');
        }
        if (outerHerf.includes('/products/')) {
          outerHerf = outerHerf.replace('/products/', '/referNetValue/');
        }
        if (
          outerHerf.includes('/202318/') ||
          outerHerf.includes('/202315/') ||
          outerHerf.includes('/202316/') ||
          outerHerf.includes('/202151/') ||
          outerHerf.includes('/202152/')
        ) {
          resolve(true);
          // 这条url有问题，会挂
          // outerHerf = outerHerf.replace('/products/', '/referNetValue/');
        }
        await page.goto(outerHerf, { waitUntil: 'networkidle2' });

        const selector1 = '#content > div.list-box > div.middle > ul > li';

        const innerHerfs = [];

        while (true) {
          try {
            await page.waitForSelector(selector1, { visible: true });
            await page.waitForSelector(nextSelector, { visible: true });

            const resultDom = await page.$eval(nextSelector, (el) =>
              el.getAttribute('class'),
            );
            const resultHander = await page.$(nextSelector);

            const arr = await page.$$eval(selector, (eles) =>
              eles.map((ele) => {
                return {
                  href: (ele.children[0] as HTMLAnchorElement).href,
                  date: ele.children[1].textContent,
                };
              }),
            );

            let needBreak = false;
            for (const item of arr) {
              if (item.date <= fromDate) {
                needBreak = true;
                break;
              }
              innerHerfs.push(item.href);
            }

            if (needBreak || resultDom?.includes('next-disabled')) {
              page.close();
              break;
            } else {
              await Promise.all([
                page.waitForNavigation(),
                resultHander.click(),
              ]);
            }
          } catch {
            Logger.log('error in createOuter');
            resolve(true);
          }
        }

        herfs.push({ outerHerf, innerHerfs });
        innerHerfLength += innerHerfs.length;
        page.close();
        resolve(true);
      });
    };

    const promiseChunks = _.chunk(outerHerfs, 10);
    let i = 0;
    for (const chunkedOuterHerfs of promiseChunks) {
      await Promise.all(chunkedOuterHerfs.map((href) => createOuter(href)));
      i += 10;
      Logger.log(
        `fetched ${i} otterHerfs----${_.round(
          (i / outerHerfs.length) * 100,
          2,
        )}%`,
      );
    }

    const createInner = (outerHerf: string, innerHerf: string) => {
      return new Promise(async (resolve) => {
        const page = await browser.newPage();
        await page.goto(innerHerf, { waitUntil: 'networkidle2' });

        const resSeletcor = '#main-text';
        await page.waitForSelector(resSeletcor, { visible: true });

        const selectors = [
          '#main-text > table:nth-child(3) > tbody > tr:nth-child(2) > td:nth-child(1)',
          '#main-text > table:nth-child(5) > tbody > tr:nth-child(2) > td:nth-child(1)',
          '#main-text > table:nth-child(5) > tbody > tr:nth-child(2) > td:nth-child(2)',
        ];

        const values = [];
        for (const item of selectors) {
          const value = await page.$eval(
            item,
            (ele) => (ele as HTMLElement).innerText,
          );
          values.push(value);
        }
        const [productCode, valuation, netWorth] = values;

        list.push({
          href: outerHerf,
          resultText: {
            productCode,
            valuation,
            netWorth,
          },
        });
        page.close();
        resolve(true);
      });
    };

    i = 0;
    for (const { outerHerf, innerHerfs } of herfs) {
      if (!innerHerfs.length) continue;
      await Promise.all(
        innerHerfs.map((innerHerf) => createInner(outerHerf, innerHerf)),
      );
      i += innerHerfs.length;
      Logger.log(
        `fetched ${i} of ${innerHerfLength} innerHerfs----${_.round(
          (i / innerHerfLength) * 100,
          2,
        )}%`,
      );
    }

    return {
      list,
      size: list.length,
      maxDate,
    };
  }
}
