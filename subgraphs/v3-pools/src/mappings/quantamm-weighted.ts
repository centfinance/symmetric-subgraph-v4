import { Address, Bytes } from "@graphprotocol/graph-ts";

import { handlePoolCreated, PoolType } from "./common";
import { PoolCreated } from "../types/QuantAMMWeightedPoolFactory/QuantAMMWeightedPoolFactory";
import { QuantAMMWeightedPool } from "../types/QuantAMMWeightedPoolFactory/QuantAMMWeightedPool";
import { QuantAMMWeightedParams } from "../types/schema";

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

  params.poolDetails = [];

  CATEGORIES.forEach((category, index) => {
    NAMES[index].forEach((name) => {
      let poolDetailResult = pool.try_getPoolDetail(category, name);
      if (!poolDetailResult.reverted) {
        const values = [
          category,
          name,
          poolDetailResult.value.value0,
          poolDetailResult.value.value1,
        ];
        params.poolDetails!.push(values);
      }
    });
  });

  let immutableData = pool.getQuantAMMWeightedPoolImmutableData();

  params.absoluteWeightGuardRail = immutableData.absoluteWeightGuardRail;
  params.oracleStalenessThreshold = immutableData.oracleStalenessThreshold;
  params.maxTradeSizeRatio = immutableData.maxTradeSizeRatio;
  params.ruleParameters = immutableData.ruleParameters;
  params.updateInterval = immutableData.updateInterval;
  params.poolRegistry = immutableData.poolRegistry;
  params.epsilonMax = immutableData.epsilonMax;
  params.lambda = immutableData.lambda;

  let dynamicData = pool.getQuantAMMWeightedPoolDynamicData();
  params.weightsAtLastUpdateInterval = dynamicData.weightsAtLastUpdateInterval;
  params.weightBlockMultipliers = dynamicData.weightBlockMultipliers;
  params.lastUpdateIntervalTime = dynamicData.lastUpdateIntervalTime;
  params.lastInterpolationTimePossible =
    dynamicData.lastInterpolationTimePossible;

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
