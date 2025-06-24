export const BOT_TOKEN = process.env.BOT_TOKEN;

export const SUPABASE_URL = process.env.SUPABASE_URL;
export const SUPABASE_KEY = process.env.SUPABASE_KEY;

export const INSIDEX_API_URL = process.env.INSIDEX_API_URL;
export const INSIDEX_API_KEY = process.env.INSIDEX_API_KEY;

export const STABLE_COINS = process.env.STABLE_COINS.split(",");

export const LOOK_BACK_PERIOD_MS = process.env.LOOK_BACK_PERIOD_MS;

export const MIN_WHALE_BALANCE = process.env.MIN_WHALE_BALANCE || 5000;

export const TRENDING_CHANNEL_ID = process.env.TRENDING_CHANNEL_ID;

export const TRENDING_MIN_BUY = {
  top3: 10,
  top10: 100,
  regular: 300,
};

export const SLOT_PRIORITY = {
  top3: 1,
  top10: 2,
  regular: 3,
  group: 4,
};

export const TRENDING_MIN_WHALE_BALANCE = 2500;
