import { COINS_TO_IGNORE, STABLE_COINS } from "./constants.js";

export const sleep = (time) => {
  return new Promise((resolve) => setTimeout(resolve, time));
};

export const getFilteredBalances = (balances, coinType) => {
  return balances.filter(
    (balance) =>
      !STABLE_COINS.includes(balance.coinType) &&
      !COINS_TO_IGNORE.includes(balance.coinType) &&
      balance.coinType !== coinType
  );
};

export const getTopBalance = (balances) => {
  return balances.reduce((max, balance) =>
    balance.value > max.value ? balance : max
  );
};

export const extractTicker = (coin) => {
  const parts = coin.split("::");

  return parts.length >= 3 ? parts[2] : "Unknown";
};

export const formatUsd = (amount) => {
  if (amount >= 1000000000) return `$${(amount / 1000000000).toFixed(2)}B`;
  if (amount >= 1000000) return `$${(amount / 1000000).toFixed(2)}M`;
  if (amount >= 1000) return `$${(amount / 1000).toFixed(2)}K`;
  return `$${amount}`;
};

export const formatWalletStats = (stats) => {
  const winRate = (stats.winRate * 100).toFixed(2);
  const totalTrades = stats.totalTrades;
  const pnlStatus = stats.pnl >= 0 ? "Positive" : "Negative";
  const volume = formatUsd(stats.volume.toFixed(2));
  const avgTrade = formatUsd((stats.volume / stats.totalTrades).toFixed(2));

  return { winRate, totalTrades, pnlStatus, volume, avgTrade };
};

export const formatMessage = (
  whaleTicker,
  amountBought,
  coinTicker,
  fdv,
  winRate,
  totalTrades,
  pnlStatus,
  avgTrade,
  volume
) => {
  const formattedMessage = `🐳 $${whaleTicker} whale bought ${amountBought} of $${coinTicker} at ${fdv} FDV

═══════════════════════

🎯 Whale Analytics:
▸ Win Rate: ${winRate}%
▸ Total Trades: ${totalTrades}
▸ P&L: ${pnlStatus}
▸ Avg Trade Size: ${avgTrade}
▸ Total Volume: ${volume}

🤖 Powered by Neonet AI`;
  return formattedMessage;
};
