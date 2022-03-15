export function shortenAccount(account: string, head: number = 6, tail: number = 5) {
  return `${account.substring(0, head)}...${account.substring(account.length - tail, account.length)}`;
}
