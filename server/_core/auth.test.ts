/**
 * Authentication Tests
 * Tests for OTP authentication, OAuth, and session management
 */

import { describe, it, expect, beforeEach, vi } from "vitest";
import { createOTP, verifyOTP } from "../_core/otp";
import { sdk } from "../_core/sdk";
import * as db from "../db";

// Mock database
vi.mock("../db");

describe("OTP Authentication", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("createOTP", () => {
    it("should generate a 6-digit OTP code", async () => {
      const mockDb = {
        update: vi.fn().mockReturnValue({
          set: vi.fn().mockReturnValue({
            where: vi.fn().mockResolvedValue([]),
          }),
        }),
        insert: vi.fn().mockReturnValue({
          values: vi.fn().mockResolvedValue([]),
        }),
      };

      vi.mocked(db.getDb).mockResolvedValue(mockDb as any);

      const code = await createOTP("test@example.com", "signup");

      expect(code).toMatch(/^\d{6}$/);
      expect(code.length).toBe(6);
    });

    it("should invalidate existing OTP codes before creating new one", async () => {
      const updateFn = vi.fn().mockReturnValue({
        set: vi.fn().mockReturnValue({
          where: vi.fn().mockResolvedValue([]),
        }),
      });

      const mockDb = {
        update: updateFn,
        insert: vi.fn().mockReturnValue({
          values: vi.fn().mockResolvedValue([]),
        }),
      };

      vi.mocked(db.getDb).mockResolvedValue(mockDb as any);

      await createOTP("test@example.com", "login");

      expect(updateFn).toHaveBeenCalled();
    });
  });

  describe("verifyOTP", () => {
    it("should return valid=true for correct OTP code", async () => {
      const mockOtpRecord = {
        id: 1,
        email: "test@example.com",
        code: "123456",
        purpose: "signup" as const,
        attempts: 0,
        verified: 0,
        expiresAt: new Date(Date.now() + 10 * 60 * 1000),
        createdAt: new Date(),
      };

      const mockDb = {
        select: vi.fn().mockReturnValue({
          from: vi.fn().mockReturnValue({
            where: vi.fn().mockReturnValue({
              orderBy: vi.fn().mockReturnValue({
                limit: vi.fn().mockResolvedValue([mockOtpRecord]),
              }),
            }),
          }),
        }),
        update: vi.fn().mockReturnValue({
          set: vi.fn().mockReturnValue({
            where: vi.fn().mockResolvedValue([]),
          }),
        }),
      };

      vi.mocked(db.getDb).mockResolvedValue(mockDb as any);

      const result = await verifyOTP("test@example.com", "123456", "signup");

      expect(result.valid).toBe(true);
    });

    it("should return valid=false for incorrect OTP code", async () => {
      const mockOtpRecord = {
        id: 1,
        email: "test@example.com",
        code: "123456",
        purpose: "signup" as const,
        attempts: 0,
        verified: 0,
        expiresAt: new Date(Date.now() + 10 * 60 * 1000),
        createdAt: new Date(),
      };

      const mockDb = {
        select: vi.fn().mockReturnValue({
          from: vi.fn().mockReturnValue({
            where: vi.fn().mockReturnValue({
              orderBy: vi.fn().mockReturnValue({
                limit: vi.fn().mockResolvedValue([mockOtpRecord]),
              }),
            }),
          }),
        }),
        update: vi.fn().mockReturnValue({
          set: vi.fn().mockReturnValue({
            where: vi.fn().mockResolvedValue([]),
          }),
        }),
      };

      vi.mocked(db.getDb).mockResolvedValue(mockDb as any);

      const result = await verifyOTP("test@example.com", "999999", "signup");

      expect(result.valid).toBe(false);
      expect(result.error).toBeDefined();
    });

    it("should reject after 5 failed attempts", async () => {
      const mockOtpRecord = {
        id: 1,
        email: "test@example.com",
        code: "123456",
        purpose: "signup" as const,
        attempts: 5,
        verified: 0,
        expiresAt: new Date(Date.now() + 10 * 60 * 1000),
        createdAt: new Date(),
      };

      const mockDb = {
        select: vi.fn().mockReturnValue({
          from: vi.fn().mockReturnValue({
            where: vi.fn().mockReturnValue({
              orderBy: vi.fn().mockReturnValue({
                limit: vi.fn().mockResolvedValue([mockOtpRecord]),
              }),
            }),
          }),
        }),
        update: vi.fn().mockReturnValue({
          set: vi.fn().mockReturnValue({
            where: vi.fn().mockResolvedValue([]),
          }),
        }),
      };

      vi.mocked(db.getDb).mockResolvedValue(mockDb as any);

      const result = await verifyOTP("test@example.com", "123456", "signup");

      expect(result.valid).toBe(false);
      expect(result.error).toContain("Too many failed attempts");
    });

    it("should reject expired OTP codes", async () => {
      const mockDb = {
        select: vi.fn().mockReturnValue({
          from: vi.fn().mockReturnValue({
            where: vi.fn().mockReturnValue({
              orderBy: vi.fn().mockReturnValue({
                limit: vi.fn().mockResolvedValue([]), // No valid OTP
              }),
            }),
          }),
        }),
      };

      vi.mocked(db.getDb).mockResolvedValue(mockDb as any);

      const result = await verifyOTP("test@example.com", "123456", "signup");

      expect(result.valid).toBe(false);
      expect(result.error).toContain("expired");
    });
  });
});

describe("Session Management", () => {
  describe("createSessionToken", () => {
    it("should create a valid JWT token", async () => {
      const token = await sdk.createSessionToken("test-open-id", {
        name: "Test User",
      });

      expect(token).toBeDefined();
      expect(typeof token).toBe("string");
      expect(token.split(".").length).toBe(3); // JWT format: header.payload.signature
    });
  });

  describe("verifySession", () => {
    it("should verify a valid session token", async () => {
      const token = await sdk.createSessionToken("test-open-id", {
        name: "Test User",
      });

      const session = await sdk.verifySession(token);

      expect(session).toBeDefined();
      expect(session?.openId).toBe("test-open-id");
      expect(session?.name).toBe("Test User");
    });

    it("should reject invalid session token", async () => {
      const session = await sdk.verifySession("invalid-token");

      expect(session).toBeNull();
    });

    it("should reject null/undefined token", async () => {
      const session1 = await sdk.verifySession(null);
      const session2 = await sdk.verifySession(undefined);

      expect(session1).toBeNull();
      expect(session2).toBeNull();
    });
  });
});
