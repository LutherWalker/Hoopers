import { describe, expect, it, beforeEach } from "vitest";
import { generateDeviceFingerprint, getClientIp } from "./fingerprint";

describe("Device Fingerprint Generation", () => {
  it("generates consistent fingerprints for the same input", () => {
    const userAgent = "Mozilla/5.0 (Windows NT 10.0; Win64; x64)";
    const ip = "192.168.1.1";
    
    const fp1 = generateDeviceFingerprint(userAgent, ip);
    const fp2 = generateDeviceFingerprint(userAgent, ip);
    
    expect(fp1).toBe(fp2);
    expect(fp1).toHaveLength(64); // SHA256 hex string length
  });

  it("generates different fingerprints for different user agents", () => {
    const ip = "192.168.1.1";
    const ua1 = "Mozilla/5.0 (Windows NT 10.0; Win64; x64)";
    const ua2 = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)";
    
    const fp1 = generateDeviceFingerprint(ua1, ip);
    const fp2 = generateDeviceFingerprint(ua2, ip);
    
    expect(fp1).not.toBe(fp2);
  });

  it("generates different fingerprints for different IPs", () => {
    const userAgent = "Mozilla/5.0 (Windows NT 10.0; Win64; x64)";
    
    const fp1 = generateDeviceFingerprint(userAgent, "192.168.1.1");
    const fp2 = generateDeviceFingerprint(userAgent, "192.168.1.2");
    
    expect(fp1).not.toBe(fp2);
  });

  it("handles missing IP address", () => {
    const userAgent = "Mozilla/5.0 (Windows NT 10.0; Win64; x64)";
    
    const fp1 = generateDeviceFingerprint(userAgent);
    const fp2 = generateDeviceFingerprint(userAgent);
    
    expect(fp1).toBe(fp2);
    expect(fp1).toHaveLength(64);
  });
});

describe("Client IP Extraction", () => {
  it("extracts IP from x-forwarded-for header", () => {
    const req = {
      headers: {
        "x-forwarded-for": "203.0.113.1, 198.51.100.1",
      },
    };
    
    const ip = getClientIp(req);
    expect(ip).toBe("203.0.113.1");
  });

  it("extracts IP from x-client-ip header", () => {
    const req = {
      headers: {
        "x-client-ip": "203.0.113.1",
      },
    };
    
    const ip = getClientIp(req);
    expect(ip).toBe("203.0.113.1");
  });

  it("extracts IP from x-real-ip header", () => {
    const req = {
      headers: {
        "x-real-ip": "203.0.113.1",
      },
    };
    
    const ip = getClientIp(req);
    expect(ip).toBe("203.0.113.1");
  });

  it("prioritizes x-forwarded-for over other headers", () => {
    const req = {
      headers: {
        "x-forwarded-for": "203.0.113.1",
        "x-client-ip": "198.51.100.1",
        "x-real-ip": "192.0.2.1",
      },
    };
    
    const ip = getClientIp(req);
    expect(ip).toBe("203.0.113.1");
  });

  it("returns undefined when no IP headers are present", () => {
    const req = {
      headers: {},
      socket: {},
      connection: {},
    };
    
    const ip = getClientIp(req);
    expect(ip).toBeUndefined();
  });
});
