import { Injectable } from '@nestjs/common';
import * as data from './utils/quotes.json';
import * as stoicData from './utils/stoic.quotes.json';
import * as motivationalData from './utils/motivational.quotes.json';
import * as entrepreneurData from './utils/entrepreneur.quotes.json';
import * as codingData from './utils/coding.quotes.json';
import * as affirmationsData from './utils/affirmations.quotes.json';
import * as affirmationsData2 from './utils/affirmations2.quotes.json';

@Injectable()
export class AppService {
  getHello(): string {
    return 'Hello World!';
  }

  getRandomQuote(type: string): any {
    let res;
    if (type === 'stoic') {
      res = stoicData;
    } else if (type === 'motivational') {
      res = motivationalData;
    } else if (type === 'entrepreneur') {
      res = entrepreneurData;
    } else if (type === 'coding') {
      res = codingData;
    } else if (type === 'affirmations') {
      res = affirmationsData;
    } else if (type === 'affirmations2') {
      res = affirmationsData2;
    } else {
      res = data;
    }
    const randomNumber = Math.floor(Math.random() * res.quotes.length);
    return res.quotes[randomNumber];
  }
}
