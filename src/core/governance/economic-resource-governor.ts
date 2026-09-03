import type {
  EconomicAdmissionDecision,
  EconomicAdmissionRequest,
  EconomicGovernanceContract,
  ResourceBudget,
  ResourceConsumption,
  ResourceReservation,
  EconomicPolicyResolver,
} from "../contracts/ai-resource-economic-governance.contract.js";

export interface EconomicResourceGovernorOptions {
  allocatedUnits: number;
  tenantLimits?: Record<string, number>;
  projectLimits?: Record<string, number>;
  reservationTtlMs?: number;
    policyResolver?: EconomicPolicyResolver;
}

interface ReservationState {
  tenantId: string;
  projectId: string;
  executionId: string;
  reservedUnits: number;
  expiresAt: number;
  settled: boolean;
  released: boolean;
  settledConsumedUnits?: number;
}

export class EconomicResourceGovernor
  implements EconomicGovernanceContract
{
  private readonly allocatedUnits: number;
  private readonly tenantLimits: Map<string, number>;
  private readonly projectLimits: Map<string, number>;
  private readonly reservationTtlMs: number;
  private readonly policyResolver?: EconomicPolicyResolver;

  private reservedUnits = 0;
  private consumedUnits = 0;
  private reservationSequence = 0;

  private readonly tenantReserved = new Map<string, number>();
  private readonly projectReserved = new Map<string, number>();

  private readonly reservations = new Map<string, ReservationState>();

  constructor(
    allocatedUnitsOrOptions: number | EconomicResourceGovernorOptions,
  ) {
    const options =
      typeof allocatedUnitsOrOptions === "number"
        ? { allocatedUnits: allocatedUnitsOrOptions }
        : allocatedUnitsOrOptions;

    if (
      !Number.isFinite(options.allocatedUnits) ||
      options.allocatedUnits < 0
    ) {
      throw new Error("INVALID_ALLOCATED_UNITS");
    }

    this.allocatedUnits = options.allocatedUnits;
    this.tenantLimits = this.validateLimits(options.tenantLimits);
    this.projectLimits = this.validateLimits(options.projectLimits);

    this.reservationTtlMs = options.reservationTtlMs ?? 60_000;
    this.policyResolver = options.policyResolver;

    if (
      !Number.isFinite(this.reservationTtlMs) ||
      this.reservationTtlMs <= 0
    ) {
      throw new Error("INVALID_RESERVATION_TTL");
    }
  }

  async admit(
    request: EconomicAdmissionRequest,
  ): Promise<EconomicAdmissionDecision> {
    this.validateRequest(request);

    if (this.policyResolver) {
      const policy = await this.policyResolver.resolve(request.policyVersion);

      if (policy === undefined || policy === null) {
        return {
          decision: "DENY",
          reason: "UNKNOWN_ECONOMIC_POLICY",
          policyVersion: request.policyVersion,
        };
      }
    }
    this.expireReservations();

    if (request.estimatedUnits > request.resourceLimit) {
      return {
        decision: "DENY",
        reason: "ESTIMATED_UNITS_EXCEED_RESOURCE_LIMIT",
        policyVersion: request.policyVersion,
      };
    }

    const tenantLimit = this.tenantLimits.get(request.tenantId);

    if (
      tenantLimit !== undefined &&
      this.getTenantReserved(request.tenantId) +
        request.estimatedUnits >
        tenantLimit
    ) {
      return {
        decision: "DENY",
        reason: "TENANT_QUOTA_EXCEEDED",
        policyVersion: request.policyVersion,
      };
    }

    const projectLimit = this.projectLimits.get(request.projectId);

    if (
      projectLimit !== undefined &&
      this.getProjectReserved(request.projectId) +
        request.estimatedUnits >
        projectLimit
    ) {
      return {
        decision: "DENY",
        reason: "PROJECT_QUOTA_EXCEEDED",
        policyVersion: request.policyVersion,
      };
    }

    if (request.estimatedUnits > this.getAvailableUnits()) {
      return {
        decision: "DENY",
        reason: "INSUFFICIENT_GLOBAL_RESOURCE",
        policyVersion: request.policyVersion,
      };
    }

    const sellingPrice = request.commercialPrice.amount;
    const directCost = request.estimatedDirectCost.amount;

    const calculatedGrossMargin =
      sellingPrice > 0
        ? (sellingPrice - directCost) / sellingPrice
        : undefined;

    return {
      decision: "ALLOW",
      reason: "ECONOMIC_ADMISSION_ALLOWED",
      policyVersion: request.policyVersion,
      calculatedGrossMargin,
    };
  }

  async reserve(
    request: EconomicAdmissionRequest,
  ): Promise<ResourceReservation> {
    const admission = await this.admit(request);

    if (admission.decision !== "ALLOW") {
      throw new Error(admission.reason);
    }

    const reservationId = `reservation-${++this.reservationSequence}`;
    const expiresAt = Date.now() + this.reservationTtlMs;

    /*
     * No await occurs between admission and mutation.
     * The complete reservation update is therefore atomic
     * within this runtime's synchronous execution turn.
     */
    this.reservations.set(reservationId, {
      tenantId: request.tenantId,
      projectId: request.projectId,
      executionId: request.executionId,
      reservedUnits: request.estimatedUnits,
      expiresAt,
      settled: false,
      released: false,
    });

    this.reservedUnits += request.estimatedUnits;

    this.tenantReserved.set(
      request.tenantId,
      this.getTenantReserved(request.tenantId) +
        request.estimatedUnits,
    );

    this.projectReserved.set(
      request.projectId,
      this.getProjectReserved(request.projectId) +
        request.estimatedUnits,
    );

    this.assertBudgetInvariant();

    return {
      reservationId,
      executionId: request.executionId,
      reservedUnits: request.estimatedUnits,
      expiresAt,
    };
  }

  async settle(
    consumption: ResourceConsumption,
  ): Promise<ResourceBudget> {
    this.expireReservations();

    const reservation = this.reservations.get(
      consumption.reservationId,
    );

    if (!reservation) {
      throw new Error("UNKNOWN_RESERVATION");
    }

    if (reservation.released) {
      throw new Error("RESERVATION_ALREADY_RELEASED");
    }

    if (reservation.settled) {
      if (
        reservation.settledConsumedUnits ===
        consumption.consumedUnits
      ) {
        return this.getBudget();
      }

      throw new Error("RESERVATION_ALREADY_SETTLED");
    }

    if (
      !Number.isFinite(consumption.consumedUnits) ||
      consumption.consumedUnits < 0
    ) {
      throw new Error("INVALID_CONSUMED_UNITS");
    }

    if (
      consumption.consumedUnits >
      reservation.reservedUnits
    ) {
      throw new Error("CONSUMPTION_EXCEEDS_RESERVATION");
    }

    this.reservedUnits -= reservation.reservedUnits;
    this.consumedUnits += consumption.consumedUnits;

    this.tenantReserved.set(
      reservation.tenantId,
      this.getTenantReserved(reservation.tenantId) -
        reservation.reservedUnits,
    );

    this.projectReserved.set(
      reservation.projectId,
      this.getProjectReserved(reservation.projectId) -
        reservation.reservedUnits,
    );

    reservation.settled = true;
    reservation.settledConsumedUnits =
      consumption.consumedUnits;

    this.assertBudgetInvariant();

    return this.getBudget();
  }

  async release(
    reservationId: string,
  ): Promise<ResourceBudget> {
    this.expireReservations();

    const reservation = this.reservations.get(reservationId);

    if (!reservation) {
      throw new Error("UNKNOWN_RESERVATION");
    }

    if (reservation.settled || reservation.released) {
      return this.getBudget();
    }

    this.reservedUnits -= reservation.reservedUnits;

    this.tenantReserved.set(
      reservation.tenantId,
      this.getTenantReserved(reservation.tenantId) -
        reservation.reservedUnits,
    );

    this.projectReserved.set(
      reservation.projectId,
      this.getProjectReserved(reservation.projectId) -
        reservation.reservedUnits,
    );

    reservation.released = true;

    this.assertBudgetInvariant();

    return this.getBudget();
  }

  private validateRequest(
    request: EconomicAdmissionRequest,
  ): void {
    if (!request.tenantId) {
      throw new Error("UNKNOWN_TENANT");
    }

    if (!request.projectId) {
      throw new Error("UNKNOWN_PROJECT");
    }

    if (!request.executionId) {
      throw new Error("UNKNOWN_EXECUTION");
    }

    if (!request.authorizationDecisionId) {
      throw new Error("UNKNOWN_AUTHORIZATION");
    }

    if (!request.policyVersion) {
      throw new Error("UNKNOWN_POLICY_VERSION");
    }

    if (!request.pricingVersion) {
      throw new Error("UNKNOWN_PRICING_VERSION");
    }

    if (
      !Number.isFinite(request.estimatedUnits) ||
      request.estimatedUnits <= 0
    ) {
      throw new Error("INVALID_ESTIMATED_UNITS");
    }

    if (
      !Number.isFinite(request.resourceLimit) ||
      request.resourceLimit < 0
    ) {
      throw new Error("INVALID_RESOURCE_LIMIT");
    }

    this.validateMoney(request.estimatedDirectCost);
    this.validateMoney(request.commercialPrice);
  }

  private validateMoney(value: {
    amount: number;
    currency: string;
  }): void {
    if (
      !value ||
      !Number.isFinite(value.amount) ||
      value.amount < 0 ||
      !value.currency
    ) {
      throw new Error("INVALID_MONEY");
    }
  }

  private validateLimits(
    limits?: Record<string, number>,
  ): Map<string, number> {
    const result = new Map<string, number>();

    for (const [id, limit] of Object.entries(limits ?? {})) {
      if (!id) {
        throw new Error("INVALID_RESOURCE_SCOPE");
      }

      if (!Number.isFinite(limit) || limit < 0) {
        throw new Error("INVALID_RESOURCE_LIMIT");
      }

      result.set(id, limit);
    }

    return result;
  }

  private getTenantReserved(tenantId: string): number {
    return this.tenantReserved.get(tenantId) ?? 0;
  }

  private getProjectReserved(projectId: string): number {
    return this.projectReserved.get(projectId) ?? 0;
  }

  private getAvailableUnits(): number {
    return (
      this.allocatedUnits -
      this.reservedUnits -
      this.consumedUnits
    );
  }

  private getBudget(): ResourceBudget {
    this.expireReservations();

    return {
      allocatedUnits: this.allocatedUnits,
      reservedUnits: this.reservedUnits,
      consumedUnits: this.consumedUnits,
      remainingUnits: this.getAvailableUnits(),
    };
  }

  private expireReservations(): void {
    const now = Date.now();

    for (const reservation of this.reservations.values()) {
      if (
        !reservation.settled &&
        !reservation.released &&
        reservation.expiresAt <= now
      ) {
        this.reservedUnits -= reservation.reservedUnits;

        this.tenantReserved.set(
          reservation.tenantId,
          this.getTenantReserved(reservation.tenantId) -
            reservation.reservedUnits,
        );

        this.projectReserved.set(
          reservation.projectId,
          this.getProjectReserved(reservation.projectId) -
            reservation.reservedUnits,
        );

        reservation.released = true;
      }
    }

    this.assertBudgetInvariant();
  }

  private assertBudgetInvariant(): void {
    if (
      this.reservedUnits < 0 ||
      this.consumedUnits < 0 ||
      this.reservedUnits + this.consumedUnits >
        this.allocatedUnits
    ) {
      throw new Error("BUDGET_INVARIANT_VIOLATED");
    }

    for (const value of this.tenantReserved.values()) {
      if (value < 0) {
        throw new Error("TENANT_RESOURCE_INVARIANT_VIOLATED");
      }
    }

    for (const value of this.projectReserved.values()) {
      if (value < 0) {
        throw new Error("PROJECT_RESOURCE_INVARIANT_VIOLATED");
      }
    }
  }
}
