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
    await prisma.$disconnect()
  })

  describe("/sign-up", () => {

    it("creates account", async () => {
      const res = await request(app)
        .post('/sign-up')
        .send({ email: "test@test.com", password:"passwordTest@", confirm:"passwordTest@", username: "test101" })
      const cookies = [...res.header["set-cookie"]]
      expect(res.statusCode).toBe(201)
      expect(res.body.username).toBe("test101")
      expect(cookies.find(c => c.includes("token"))).toBeTruthy()
    });

    it("returns on empty fields", async () => {
      const res = await request(app)
        .post('/sign-up')
        .send({ email: "", password:"", confirm:"", username: "" })

      const cookies = res.header["set-cookie"];
      expect(res.statusCode).toBe(400)
      expect(cookies).toBe(undefined)
    })
  });

  it("returns on invalid inputs", async () => {
    const res = await request(app)
      .post('/sign-up')
      .send({ email: [], password: {}, confirm: [], username: {} })

    const cookies = res.header["set-cookie"];
    expect(res.statusCode).toBe(400)
    expect(cookies).toBe(undefined)
  })

  it("returns on duplicate email & username", async () => {
    const res = await request(app)
      .post('/sign-up')
      .send({ email: "test@test.com", password:"passwordTest@", confirm:"passwordTest@", username: "test101" })
    const cookies = res.header["set-cookie"];
    expect(res.statusCode).toBe(400)
    expect(cookies).toBe(undefined)
  })

  describe("/sign-in", () => {
    it("sign in user", async () => {
      const res = await request(app)
        .post('/sign-in')
        .send({ identifier: "test101", password: "passwordTest@" })
      const cookies = [...res.header["set-cookie"]]
      expect(res.statusCode).toBe(200)
      expect(res.body.username).toBe("test101")
      expect(cookies.find(c => c.includes("token"))).not.toBe(undefined)
    });

    it("returns on empty fields", async () => {
      const res = await request(app)
        .post('/sign-in')
        .send({ identifier: "", password: "" })

      const cookies = res.header["set-cookie"];
      expect(res.statusCode).toBe(400)
      expect(cookies).toBe(undefined)
    })
  })

  it("returns on invalid inputs", async () => {
    const res = await request(app)
      .post('/sign-in')
      .send({ identifier: {}, password: [] })

    const cookies = res.header["set-cookie"];
    expect(res.statusCode).toBe(400)
    expect(cookies).toBe(undefined)
  })

  it("returns on invalid credentials", async () => {
    const res = await request(app)
      .post('/sign-in')
      .send({ identifier: "test101", password: "wrongPassword@" })
      const cookies = res.header["set-cookie"];
    expect(res.statusCode).toBe(400)
    expect(cookies).toBe(undefined)
  })
  it("removed cookie on logout", async () => {
    const agent = request.agent(app);

    let res = await agent
      .post('/sign-in')
      .send({ identifier: "test101", password: "passwordTest@" })

    let cookies = [...res.header["set-cookie"]]
    expect(res.statusCode).toBe(200)
    expect(res.body.username).toBe("test101")
    expect(cookies.find(c => c.includes("token"))).not.toContain("token=;")

    res = await agent.post("/logout")

    cookies = [...res.header["set-cookie"]]
    expect(res.statusCode).toBe(200)
    expect(cookies.find(c => c.includes("token"))).toContain("token=;")  // semi-colon verfies token is empty
  })
});
