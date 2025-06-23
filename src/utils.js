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

export const formatSocialLinks = (website, telegram, xLink) => {
  const links = [];

  if (website) links.push(`[Website](${website})`);
  if (telegram) links.push(`[Telegram](${telegram})`);
  if (xLink) links.push(`[Twitter](${xLink})`);

  return links.length > 0 ? `\n\n🔗 ${links.join(" | ")}` : "";
};

export const truncateAddress = (address) => {
  return `${address.slice(0, 4)}...${address.slice(-4)}`;
};

export const createAddressLink = (address) => {
  const truncated = truncateAddress(address);
  return `[${truncated}](https://suivision.xyz/account/${address})`;
};

export const createTxLink = (txHash) => {
  return `[Tx](https://suivision.xyz/txblock/${txHash})`;
};

export const generateEmojis = (amount) => {
  const dollarAmount =
    typeof amount === "string"
      ? parseFloat(amount.replace(/[$,]/g, ""))
      : amount;
  const emojiCount = Math.floor(dollarAmount / 10);
  return "🐋".repeat(Math.min(emojiCount, 50));
};

export const formatTokenAmount = (amount, decimals = 6) => {
  const formattedAmount = (amount / Math.pow(10, decimals)).toLocaleString(
    "en-US",
    {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }
  );
  return formattedAmount;
};

export const formatMessage = (
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
  socialLinks = ""
) => {
  const formattedMessage = `$${whaleTicker} whale bought ${coinTicker}  
${emojis}

📊 Size ${amountBought} (${fdv} FDV)
🏛️ Got ${tokenAmountReceived} of $${receivedTokenTicker} 
👤 Buyer ${addressLink} | ${txLink}
📈 MC ${fdv}

═══════════════════════

🎯 Whale Analytics:
• Win Rate: ${winRate}%
• Avg Trade Size: ${avgTrade}
• Total Volume: ${volume}

🤖 Powered by Neonet AI${socialLinks}`;
  return formattedMessage;
};
