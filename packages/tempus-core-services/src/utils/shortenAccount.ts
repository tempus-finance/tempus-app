export function shortenAccount(account: string, head = 6, tail = 5): string {
  return `${account.substring(0, head)}...${account.substring(account.length - tail, account.length)}`;
}
