import "dotenv/config";

import {
  getBuyTradesOfCoin,
  getGroups,
  getMarketDataOfCoin,
  getWalletPortfolio,
  getWalletTradeStats,
  sendWhaleAlert,
  sendChannelAlert,
  checkAlertExists,
  saveWhaleAlert,
  getTrendingOrders,
  checkTrendingAlertExists,
  saveTrendingAlert,
} from "./api.js";

import {
  extractTicker,
  formatMessage,
  formatSocialLinks,
  formatUsd,
  formatWalletStats,
  getFilteredBalances,
  getTopBalance,
  createAddressLink,
  createTxLink,
  generateEmojis,
  formatTokenAmount,
} from "./utils.js";

import {
  LOOK_BACK_PERIOD_MS,
  MIN_WHALE_BALANCE,
  TRENDING_MIN_BUY,
  TRENDING_MIN_WHALE_BALANCE,
} from "./constants.js";

const processAlerts = async (
  tokenAddress,
  minBuy,
  socialData,
  alertKey,
  sendToGroup = null,
  isTrending = false
) => {
  const endTime = Date.now();
  const startTime = endTime - LOOK_BACK_PERIOD_MS;

  let trades = await getBuyTradesOfCoin(tokenAddress, startTime, endTime);
  trades = trades.filter((trade) => trade.volume > minBuy);

  if (trades.length === 0) return;

  const minWhaleBalance = isTrending
    ? TRENDING_MIN_WHALE_BALANCE
    : MIN_WHALE_BALANCE;

  for (const trade of trades) {
    const alertExists = isTrending
      ? await checkTrendingAlertExists(alertKey, trade.digest)
      : await checkAlertExists(alertKey, trade.digest);

    if (alertExists) continue;

    const portfolio = await getWalletPortfolio(trade.user);
    const stats = await getWalletTradeStats(trade.user);
    const filteredBalances = getFilteredBalances(
      portfolio.balances,
      tokenAddress
    );

    if (filteredBalances.length === 0) continue;

    const topBalance = getTopBalance(filteredBalances);
    if (topBalance.value < minWhaleBalance) continue;
    const coinTicker = extractTicker(tokenAddress);
    const receivedTokenTicker = extractTicker(trade.coinOut);
    const tokenAmountReceived = formatTokenAmount(trade.amountOut);
    const whaleTicker = topBalance.coinMetadata.symbol;
    const marketData = await getMarketDataOfCoin(tokenAddress);
    const amountBought = formatUsd(Number(trade.volume).toFixed(2));
    const fdv = formatUsd(Number(marketData.marketCap).toFixed(2));
    const { winRate, avgTrade, volume } = formatWalletStats(stats);
    const socialLinks = formatSocialLinks(
      socialData.website,
      socialData.telegram,
      socialData.x_link
    );
    const addressLink = createAddressLink(trade.user);
    const txLink = createTxLink(trade.digest);
    const emojis = generateEmojis(Number(trade.volume), socialData.emoji);

    const message = formatMessage(
      whaleTicker,
      amountBought,
      coinTicker,
      fdv,
      winRate,
      avgTrade,
      volume,
      addressLink,
      txLink,
      emojis,
      tokenAmountReceived,
      receivedTokenTicker,
      socialLinks,
      topBalance.value
    );

    if (sendToGroup) {
      await sendWhaleAlert(sendToGroup, message, socialData.media_url);
    }
    await sendChannelAlert(message);

    if (isTrending) {
      await saveTrendingAlert(
        alertKey,
        trade.digest,
        trade.user,
        tokenAddress,
        trade.volume
      );
    } else {
      await saveWhaleAlert(
        alertKey,
        trade.digest,
        trade.user,
        tokenAddress,
        trade.volume
      );
    }
  }
};

export default async function () {
  const trendingOrders = await getTrendingOrders();

  if (trendingOrders && trendingOrders.length > 0) {
    console.log(`${trendingOrders.length} trending orders to process`);

    for (const order of trendingOrders) {
      const minBuy =
        TRENDING_MIN_BUY[order.slot_type] || TRENDING_MIN_BUY.regular;
      const socialData = {
        website: order.website,
        telegram: order.telegram,
        x_link: order.x_link,
        emoji: order.emoji || "🐋",
        media_url: null,
      };

      await processAlerts(
        order.token_address,
        minBuy,
        socialData,
        order.id,
        null,
        true
      );
    }
  }

  const groups = await getGroups();

  if (!groups || groups.length === 0) {
    console.log("No active groups found");
    return;
  }

  console.log(`${groups.length} groups to process`);

  for (const group of groups) {
    const socialData = {
      website: group.website,
      telegram: group.telegram,
      x_link: group.x_link,
      emoji: group.emoji || "🐋",
      media_url: group.media_url,
    };

    await processAlerts(
      group.token_address,
      group.min_buy,
      socialData,
      group.group_id,
      group.group_id
    );
  }
}
