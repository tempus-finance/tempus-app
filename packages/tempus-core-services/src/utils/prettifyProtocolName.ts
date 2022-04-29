import { ProtocolDisplayName, ProtocolName } from '../interfaces';

const protocolNameToPrettyName = new Map<ProtocolName, ProtocolDisplayName>([
  ['lido', 'Lido'],
  ['rari', 'Rari Capital'],
  ['yearn', 'Yearn'],
  ['aave', 'Aave'],
  ['compound', 'Compound'],
]);

export function prettifyProtocolName(protocolName: ProtocolName): ProtocolDisplayName {
  const prettyName = protocolNameToPrettyName.get(protocolName);

  if (!prettyName) {
    throw new Error('prettifyProtocolName() - Failed to prettify protocol name!');
  }

  return prettyName;
}
