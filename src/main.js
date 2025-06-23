import "dotenv/config";

import {
  getBuyTradesOfCoin,
  getGroups,
  getMarketDataOfCoin,
  getWalletPortfolio,
  getWalletTradeStats,
  sendWhaleAlert,
  checkAlertExists,
  saveWhaleAlert,
} from "./api.js";

import {
  extractTicker,
  formatMessage,
  formatSocialLinks,
  formatUsd,
  formatWalletStats,
  getFilteredBalances,
  getTopBalance,
  sleep,
} from "./utils.js";

import { LOOK_BACK_PERIOD_MS } from "./constants.js";

export default async function () {
  const groups = await getGroups();

  if (!groups || groups.length === 0) {
    console.log("No active groups found");
    return;
  }

  console.log(`${groups.length} groups to process`);

  for (const group of groups) {
    const endTime = Date.now();
    const startTime = endTime - LOOK_BACK_PERIOD_MS;

    let trades = await getBuyTradesOfCoin(
      group.token_address,
      startTime,
      endTime
    );

    trades = trades.filter((trade) => trade.volume > group.min_buy);

    console.log(`${trades.length} trades found for ${group.group_id}`);

    if (trades.length === 0) continue;

    for (const trade of trades) {
      const alertExists = await checkAlertExists(group.group_id, trade.digest);

      if (alertExists) continue;

      const portfolio = await getWalletPortfolio(trade.user);

      const stats = await getWalletTradeStats(trade.user);

      const filteredBalances = getFilteredBalances(
        portfolio.balances,
        group.token_address
      );

      if (filteredBalances.length === 0) continue;

      const topBalance = getTopBalance(filteredBalances);

      const coinTicker = extractTicker(group.token_address);

      const whaleTicker = topBalance.coinMetadata.symbol;

      const marketData = await getMarketDataOfCoin(group.token_address);

      const amountBought = formatUsd(Number(trade.volume).toFixed(2));

      const fdv = formatUsd(Number(marketData.marketCap).toFixed(2));

      const { winRate, totalTrades, pnlStatus, avgTrade, volume } =
        formatWalletStats(stats);

      const socialLinks = formatSocialLinks(
        group.website,
        group.telegram,
        group.x_link
      );

      const message = formatMessage(
        whaleTicker,
        amountBought,
        coinTicker,
        fdv,
        winRate,
        totalTrades,
        pnlStatus,
        avgTrade,
        volume,
        socialLinks
      );

      await sendWhaleAlert(group.group_id, message, group.media_url);

      await saveWhaleAlert(
        group.group_id,
        trade.digest,
        trade.user,
        group.token_address,
        trade.volume
      );
    }
  }
}
