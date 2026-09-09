// 寄付率の唯一の定義。FAQ・買取の仕組みページの「販売価格の5%」と揃える
export const DONATION_RATE = 0.05;
export const DONATION_RATE_LABEL = '5%';

// この商品を買ったときに寄付される金額（円）
export const donationAmount = (price: number) => Math.floor(price * DONATION_RATE);
