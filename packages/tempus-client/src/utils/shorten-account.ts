export default function shortenAccount(account: string) {
  return `${account.substring(0, 6)}...${account.substring(account.length - 5, account.length)}`;
}
