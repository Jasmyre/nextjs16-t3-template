import { describe, expect, it } from "vitest";
import { getUserById } from "@/data/user-repository";
import { registerUser, verifyCredentials } from "@/services/auth-service";
import { integrationEnabled } from "./setup";

const describeDb = integrationEnabled ? describe : describe.skip;

describeDb("auth-service integration", () => {
  it("registers a new user and returns a userId", async () => {
    const result = await registerUser({
      name: "Jane Doe",
      email: "jane@example.com",
      password: "secret123",
    });
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.userId).toBeTypeOf("string");
    }
  });

  it("assigns the default user role on signup", async () => {
    const result = await registerUser({
      name: "Default Role",
      email: "default-role@example.com",
      password: "secret123",
    });
    expect(result.ok).toBe(true);
    if (!result.ok) {
      return;
    }

    const user = await getUserById(result.userId);
    expect(user).not.toBeNull();
    if (user) {
      expect(user.roles.map((role) => role.name)).toEqual(["USER"]);
    }
  });

  it("returns EMAIL_IN_USE when the email is already registered", async () => {
    await registerUser({
      name: "Jane Doe",
      email: "duplicate@example.com",
      password: "secret123",
    });

    const result = await registerUser({
      name: "Another Name",
      email: "duplicate@example.com",
      password: "secret123",
    });
    expect(result).toEqual({ ok: false, code: "EMAIL_IN_USE" });
  });

  it("stores a hashed (non-plaintext) password", async () => {
    const password = "plain-password";
    await registerUser({
      name: "Hash Tester",
      email: "hash@example.com",
      password,
    });

    const user = await verifyCredentials("hash@example.com", password);
    expect(user).not.toBeNull();
    if (user) {
      expect(user.password).not.toBe(password);
    }
  });
});

describeDb("verifyCredentials integration", () => {
  it("returns the user for valid credentials", async () => {
    await registerUser({
      name: "Valid User",
      email: "valid@example.com",
      password: "correct-password",
    });

    const user = await verifyCredentials(
      "valid@example.com",
      "correct-password"
    );
    expect(user).not.toBeNull();
    if (user) {
      expect(user.email).toBe("valid@example.com");
    }
  });

  it("returns null for a wrong password", async () => {
    await registerUser({
      name: "Wrong Pw",
      email: "wrongpw@example.com",
      password: "right-password",
    });

    const user = await verifyCredentials(
      "wrongpw@example.com",
      "wrong-password"
    );
    expect(user).toBeNull();
  });

  it("returns null for an unknown email", async () => {
    const user = await verifyCredentials("nobody@example.com", "whatever");
    expect(user).toBeNull();
  });
});
