import request from "supertest";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import app from "../src/server.js";
import { prisma } from "@cce/prisma";

describe("Authentication", () => {
  beforeAll(async () => {
    await prisma.user.deleteMany({
      where: {
        email: { contains: "test"}
      }
    })
  })
  afterAll(async () => {
    await prisma.user.deleteMany({
      where: {
        email: { contains: "test"}
      }
    })
  })

  it("creates account", async () => {
    const res = await request(app)
      .post('/sign-up')
      .send({ email: "test@test.com", password:"passwordTest@", confirm:"passwordTest@", username: "test101" })
    expect(res.statusCode).toBe(201);
    expect(res.body.username).toBe("test101")
  });

 
})