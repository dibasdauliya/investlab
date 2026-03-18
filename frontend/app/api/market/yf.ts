// yahoo-finance2 default export is the class, not an instance
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { default: YahooFinance } = require('yahoo-finance2');
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const yf: any = new YahooFinance({ suppressNotices: ['yahooSurvey'] });
export default yf;
