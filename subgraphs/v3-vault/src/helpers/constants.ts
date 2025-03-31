import {
  Address,
  BigDecimal,
  BigInt,
  dataSource,
} from "@graphprotocol/graph-ts";

export const ZERO_BI = BigInt.fromString("0");
export const ZERO_BD = BigDecimal.fromString("0");
export const ONE_BD = BigDecimal.fromString("1");

export const ZERO_ADDRESS = Address.fromString(
  "0x0000000000000000000000000000000000000000"
);

class AddressByNetwork {
  public canonical: string;
  public avalanche: string;
}

let network: string = dataSource.network();

let vaultAddressByNetwork: AddressByNetwork = {
  canonical: "0xbA1333333333a1BA1108E8412f11850A5C319bA9",
  avalanche: "0xba1333333333cbcdB5D83c2e5d1D898E07eD00Dc",
};

function forNetwork(
  addressByNetwork: AddressByNetwork,
  network: string
): Address {
  if (network == "avalanche") {
    return Address.fromString(addressByNetwork.avalanche);
  } else {
    return Address.fromString(addressByNetwork.canonical);
  }
}

export let VAULT_ADDRESS = forNetwork(vaultAddressByNetwork, network);
