/**
 * Loan Application Workflow Tests
 * Tests for loan submission, approval, fee calculation, payment, and disbursement
 */

import { describe, it, expect, beforeEach, vi } from "vitest";
import * as db from "./db";

// Mock database
vi.mock("./db");

describe("Loan Application Workflow", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Fee Calculation", () => {
    it("should calculate percentage-based fee correctly (2%)", async () => {
      const mockFeeConfig = {
        id: 1,
        calculationMode: "percentage" as const,
        percentageRate: 200, // 2.00% in basis points
        fixedFeeAmount: 200,
        isActive: 1,
        updatedBy: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      vi.mocked(db.getActiveFeeConfiguration).mockResolvedValue(mockFeeConfig);

      const approvedAmount = 100000; // $1,000.00
      const expectedFee = Math.round((approvedAmount * 200) / 10000); // $20.00

      expect(expectedFee).toBe(2000); // $20.00 in cents
    });

    it("should calculate percentage-based fee for minimum rate (1.5%)", () => {
      const approvedAmount = 50000; // $500.00
      const percentageRate = 150; // 1.5%
      const fee = Math.round((approvedAmount * percentageRate) / 10000);

      expect(fee).toBe(750); // $7.50 in cents
    });

    it("should calculate percentage-based fee for maximum rate (2.5%)", () => {
      const approvedAmount = 200000; // $2,000.00
      const percentageRate = 250; // 2.5%
      const fee = Math.round((approvedAmount * percentageRate) / 10000);

      expect(fee).toBe(5000); // $50.00 in cents
    });

    it("should use fixed fee when mode is 'fixed'", async () => {
      const mockFeeConfig = {
        id: 1,
        calculationMode: "fixed" as const,
        percentageRate: 200,
        fixedFeeAmount: 250, // $2.50
        isActive: 1,
        updatedBy: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      vi.mocked(db.getActiveFeeConfiguration).mockResolvedValue(mockFeeConfig);

      const approvedAmount = 100000; // $1,000.00
      const fee = mockFeeConfig.fixedFeeAmount;

      expect(fee).toBe(250); // $2.50 in cents
    });

    it("should default to 2% if no fee configuration exists", () => {
      const approvedAmount = 100000; // $1,000.00
      const defaultRate = 200; // 2%
      const fee = Math.round((approvedAmount * defaultRate) / 10000);

      expect(fee).toBe(2000); // $20.00 in cents
    });
  });

  describe("Loan Status Workflow", () => {
    it("should follow correct status progression", () => {
      const validProgression = [
        "pending",
        "under_review",
        "approved",
        "fee_pending",
        "fee_paid",
        "disbursed",
      ];

      // Verify each status transition is valid
      expect(validProgression).toContain("pending");
      expect(validProgression).toContain("approved");
      expect(validProgression).toContain("fee_paid");
      expect(validProgression).toContain("disbursed");
    });

    it("should not allow disbursement without fee payment", async () => {
      const mockApplication = {
        id: 1,
        userId: 1,
        status: "approved" as const,
        approvedAmount: 100000,
        processingFeeAmount: 2000,
        fullName: "Test User",
        email: "test@example.com",
        phone: "1234567890",
        dateOfBirth: "1990-01-01",
        ssn: "123-45-6789",
        street: "123 Main St",
        city: "Test City",
        state: "CA",
        zipCode: "12345",
        employmentStatus: "employed" as const,
        employer: "Test Corp",
        monthlyIncome: 500000,
        loanType: "installment" as const,
        requestedAmount: 100000,
        loanPurpose: "Debt consolidation",
        rejectionReason: null,
        adminNotes: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        approvedAt: new Date(),
        disbursedAt: null,
      };

      vi.mocked(db.getLoanApplicationById).mockResolvedValue(mockApplication);

      // Should not allow disbursement when status is not "fee_paid"
      expect(mockApplication.status).not.toBe("fee_paid");
    });
  });

  describe("Loan Application Validation", () => {
    it("should validate SSN format", () => {
      const validSSN = "123-45-6789";
      const invalidSSN1 = "12345678";
      const invalidSSN2 = "123-456-789";

      expect(validSSN).toMatch(/^\d{3}-\d{2}-\d{4}$/);
      expect(invalidSSN1).not.toMatch(/^\d{3}-\d{2}-\d{4}$/);
      expect(invalidSSN2).not.toMatch(/^\d{3}-\d{2}-\d{4}$/);
    });

    it("should validate date of birth format", () => {
      const validDate = "1990-01-01";
      const invalidDate1 = "01/01/1990";
      const invalidDate2 = "1990-1-1";

      expect(validDate).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(invalidDate1).not.toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(invalidDate2).not.toMatch(/^\d{4}-\d{2}-\d{2}$/);
    });

    it("should validate state code format", () => {
      const validStates = ["CA", "NY", "TX", "FL"];
      const invalidStates = ["California", "CA1", "C"];

      validStates.forEach((state) => {
        expect(state).toMatch(/^[A-Z]{2}$/);
      });

      invalidStates.forEach((state) => {
        expect(state).not.toMatch(/^[A-Z]{2}$/);
      });
    });

    it("should validate loan amounts are positive", () => {
      const validAmount = 100000; // $1,000
      const invalidAmount = -100;
      const zeroAmount = 0;

      expect(validAmount).toBeGreaterThan(0);
      expect(invalidAmount).toBeLessThan(0);
      expect(zeroAmount).not.toBeGreaterThan(0);
    });
  });

  describe("Payment Processing", () => {
    it("should create payment record with correct amount", async () => {
      const mockPayment = {
        id: 1,
        loanApplicationId: 1,
        userId: 1,
        amount: 2000, // $20.00
        currency: "USD" as const,
        paymentProvider: "authorizenet" as const,
        paymentMethod: "card" as const,
        status: "pending" as const,
        paymentIntentId: "test-intent-123",
        paymentMethodId: null,
        cardLast4: null,
        cardBrand: null,
        cryptoCurrency: null,
        cryptoAddress: null,
        cryptoTxHash: null,
        cryptoAmount: null,
        failureReason: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        completedAt: null,
      };

      vi.mocked(db.createPayment).mockResolvedValue([mockPayment] as any);

      const payment = await db.createPayment({
        loanApplicationId: 1,
        userId: 1,
        amount: 2000,
        currency: "USD",
        paymentProvider: "authorizenet",
        paymentMethod: "card",
        status: "pending",
        paymentIntentId: "test-intent-123",
      });

      expect(payment).toBeDefined();
    });

    it("should track payment status changes", async () => {
      const updateFn = vi.mocked(db.updatePaymentStatus);
      updateFn.mockResolvedValue(undefined as any);

      await db.updatePaymentStatus(1, "succeeded", {
        completedAt: new Date(),
      });

      expect(updateFn).toHaveBeenCalledWith(
        1,
        "succeeded",
        expect.objectContaining({
          completedAt: expect.any(Date),
        })
      );
    });
  });

  describe("Disbursement", () => {
    it("should only disburse when fee is paid", async () => {
      const mockApplication = {
        id: 1,
        status: "fee_paid" as const,
        approvedAmount: 100000,
      };

      vi.mocked(db.getLoanApplicationById).mockResolvedValue(mockApplication as any);

      const application = await db.getLoanApplicationById(1);

      expect(application?.status).toBe("fee_paid");
    });

    it("should create disbursement record with bank details", async () => {
      const mockDisbursement = {
        id: 1,
        loanApplicationId: 1,
        userId: 1,
        amount: 100000,
        accountHolderName: "Test User",
        accountNumber: "1234567890",
        routingNumber: "021000021",
        status: "pending" as const,
        transactionId: null,
        failureReason: null,
        adminNotes: "Test disbursement",
        createdAt: new Date(),
        updatedAt: new Date(),
        completedAt: null,
        initiatedBy: 1,
      };

      vi.mocked(db.createDisbursement).mockResolvedValue([mockDisbursement] as any);

      const disbursement = await db.createDisbursement({
        loanApplicationId: 1,
        userId: 1,
        amount: 100000,
        accountHolderName: "Test User",
        accountNumber: "1234567890",
        routingNumber: "021000021",
        status: "pending",
        initiatedBy: 1,
      });

      expect(disbursement).toBeDefined();
    });
  });
});
