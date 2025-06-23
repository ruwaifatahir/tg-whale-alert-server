import axios from "axios";

import { Telegraf, Input } from "telegraf";
import { createClient } from "@supabase/supabase-js";
import { INSIDEX_API_URL, INSIDEX_API_KEY } from "./constants.js";

const bot = new Telegraf(
  process.env.BOT_TOKEN || "7207651173:AAGibr8rxsNi6EmkOB1-Nj6GYnp9krFvOkA"
);

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

export const getWalletPortfolio = async (address) => {
  try {
    const response = await axios.get(
      `${INSIDEX_API_URL}/spot-portfolio/${address}`,
      { headers: { "x-api-key": INSIDEX_API_KEY } }
    );

    return response.data;
  } catch (error) {
    console.log(error);
  }
};

export const getWalletTradeStats = async (address) => {
  try {
    const response = await axios.get(
      `${INSIDEX_API_URL}/spot-portfolio/${address}/spot-trade-stats`,
      { headers: { "x-api-key": INSIDEX_API_KEY } }
    );

    return response.data;
  } catch (error) {
    console.log(error);
  }
};

export const getBuyTradesOfCoin = async (coin, start, end) => {
  try {
    const response = await axios.get(
      `${INSIDEX_API_URL}/spot-trades/${coin}/buy-trades?startTime=${start}&endTime=${end}`,
      { headers: { "x-api-key": INSIDEX_API_KEY } }
    );

    return response.data;
  } catch (error) {
    console.log(error);
  }
};

export const getMarketDataOfCoin = async (coin) => {
  try {
    const response = await axios.get(
      `${INSIDEX_API_URL}/coins/${coin}/market-data`,
      {
        headers: { "x-api-key": INSIDEX_API_KEY },
      }
    );
    return response.data[0];
  } catch (error) {
    console.log(error);
  }
};

export const getGroups = async () => {
  const { data } = await supabase
    .from("bot_groups")
    .select("*, media_url")
    .eq("is_on", true)
    .not("token_address", "is", null);

  return data;
};

export const checkAlertExists = async (groupId, digest) => {
  const { data } = await supabase
    .from("whale_alerts")
    .select("id")
    .eq("group_id", groupId)
    .eq("digest", digest)
    .single();

  return !!data;
};

export const saveWhaleAlert = async (
  groupId,
  digest,
  whaleAddress,
  tokenAddress,
  tradeVolume
) => {
  await supabase.from("whale_alerts").insert({
    group_id: groupId,
    digest,
    whale_address: whaleAddress,
    token_address: tokenAddress,
    trade_volume: tradeVolume,
  });
};

export const sendWhaleAlert = async (groupId, message, mediaUrl = null) => {
  try {
    if (mediaUrl && mediaUrl.startsWith("http")) {
      try {
        if (mediaUrl.includes(".gif")) {
          await bot.telegram.sendAnimation(
            groupId,
            Input.fromURLStream(mediaUrl, "media.gif"),
            {
              caption: message,
              parse_mode: "Markdown",
            }
          );
        } else if (mediaUrl.includes(".mp4") || mediaUrl.includes(".mov")) {
          await bot.telegram.sendVideo(
            groupId,
            Input.fromURLStream(mediaUrl, "media.mp4"),
            {
              caption: message,
              parse_mode: "Markdown",
            }
          );
        } else {
          await bot.telegram.sendPhoto(
            groupId,
            Input.fromURLStream(mediaUrl, "media.jpg"),
            {
              caption: message,
              parse_mode: "Markdown",
            }
          );
        }
      } catch (mediaError) {
        await bot.telegram.sendMessage(groupId, message, {
          parse_mode: "Markdown",
          disable_web_page_preview: true,
        });
      }
    } else {
      await bot.telegram.sendMessage(groupId, message, {
        parse_mode: "Markdown",
        disable_web_page_preview: true,
      });
    }
  } catch (error) {
    console.error(`Failed to send message to group ${groupId}:`, error);
  }
};
