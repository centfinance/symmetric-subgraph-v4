import { Address, Bytes } from "@graphprotocol/graph-ts";

import { handlePoolCreated, PoolType } from "./common";
import { PoolCreated } from "../types/QuantAMMWeightedPoolFactory/BasePoolFactory";
import { QuantAMMWeightedPool } from "../types/QuantAMMWeightedPoolFactory/QuantAMMWeightedPool";
import {
  QuantAMMWeightedDetail,
  QuantAMMWeightedParams,
} from "../types/schema";

/*
 * We store pool details as a list of lists of strings.
 * The first list is the category of the detail.
 * The second list is the name of the detail.
 *
 * The categories and names are stored in the CATEGORIES and NAMES arrays.
 *
 * For example:
 *  overview:
 *   - adaptabilityScore
 *   - description
 *  ruleDetail:
 *   - updateRuleName
 *
 */
const CATEGORIES = ["overview", "ruleDetail"];

const NAMES = [["adaptabilityScore", "description"], ["updateRuleName"]];

function handleQuantAMMWeightedPoolParams(poolAddress: Address): Bytes {
  let pool = QuantAMMWeightedPool.bind(poolAddress);
  let params = new QuantAMMWeightedParams(poolAddress);

  for (let i = 0; i < CATEGORIES.length; i++) {
    let category = CATEGORIES[i];
    let names = NAMES[i];

    for (let j = 0; j < names.length; j++) {
      let name = names[j];
      let poolDetailResult = pool.try_getPoolDetail(category, name);

      if (poolDetailResult.reverted) continue;
      if (poolDetailResult.value.value0 == "") continue;
      if (poolDetailResult.value.value1 == "") continue;

      let details = new QuantAMMWeightedDetail(
        poolAddress.concatI32(i).concatI32(j)
      );

      details.name = name;
      details.category = category;
      details.type = poolDetailResult.value.value0;
      details.value = poolDetailResult.value.value1;
      details.pool = params.id;
      details.save();
    }
  }

  let immutableData = pool.getQuantAMMWeightedPoolImmutableData();
  params.absoluteWeightGuardRail = immutableData.absoluteWeightGuardRail;
  params.oracleStalenessThreshold = immutableData.oracleStalenessThreshold;
  params.maxTradeSizeRatio = immutableData.maxTradeSizeRatio;
  params.updateInterval = immutableData.updateInterval;
  params.poolRegistry = immutableData.poolRegistry;
  params.epsilonMax = immutableData.epsilonMax;
  params.lambda = immutableData.lambda;

  let dynamicData = pool.getQuantAMMWeightedPoolDynamicData();
  params.weightsAtLastUpdateInterval =
    dynamicData.firstFourWeightsAndMultipliers
      .slice(0, 4)
      .concat(dynamicData.secondFourWeightsAndMultipliers.slice(0, 4));
  params.weightBlockMultipliers = dynamicData.firstFourWeightsAndMultipliers
    .slice(4, 8)
    .concat(dynamicData.secondFourWeightsAndMultipliers.slice(4, 8));
  params.lastInterpolationTimePossible = dynamicData.lastInteropTime;
  params.lastUpdateIntervalTime = dynamicData.lastUpdateTime;

  params.save();

  return params.id;
}

export function handleQuantAMMWeightedPoolCreated(event: PoolCreated): void {
  handlePoolCreated(
    event.params.pool,
    event.address, // Factory
    PoolType.QuantAMMWeighted,
    1,
    handleQuantAMMWeightedPoolParams,
    "quantAMMWeightedParams"
  );
}
