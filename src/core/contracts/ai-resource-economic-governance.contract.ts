export type EconomicDecision =
  | "ALLOW"
  | "DENY"
  | "CONTAIN"
  | "PAUSE";

export type EconomicHealth =
  | "HEALTHY"
  | "WARNING"
  | "OPTIMIZATION_REQUIRED"
  | "ECONOMIC_LIMIT"
  | "FROZEN";

export interface MoneyAmount {
  amount: number;
  currency: string;
}

export interface ResourceBudget {
  allocatedUnits: number;
  reservedUnits: number;
  consumedUnits: number;
  remainingUnits: number;
}

export interface EconomicAdmissionRequest {
  tenantId: string;
  projectId: string;
  executionId: string;

  estimatedUnits: number;
  estimatedDirectCost: MoneyAmount;
  commercialPrice: MoneyAmount;

  resourceLimit: number;

  authorizationDecisionId: string;
  policyVersion: string;
  pricingVersion: string;
}

export interface EconomicAdmissionDecision {
  decision: EconomicDecision;
  reason: string;
  policyVersion: string;
  calculatedGrossMargin?: number;
}

export interface ResourceReservation {
  reservationId: string;
  executionId: string;
  reservedUnits: number;
  expiresAt: number;
}

export interface ResourceConsumption {
  reservationId: string;
  consumedUnits: number;
}

export interface EconomicGovernanceContract {
  admit(
    request: EconomicAdmissionRequest,
  ): Promise<EconomicAdmissionDecision>;

  reserve(
    request: EconomicAdmissionRequest,
  ): Promise<ResourceReservation>;

  settle(
    consumption: ResourceConsumption,
  ): Promise<ResourceBudget>;

  release(
    reservationId: string,
  ): Promise<ResourceBudget>;
}
