import request from "supertest";
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";
import { prisma } from "@cce/prisma";
import { Role } from "@cce/shared-types";
import app from "../src/server.js";

const mockUser = vi.hoisted(() => ({ id: 0, username: "docuser1" }));

vi.mock('../src/middlewares/authenticate.js', () => ({
  authenticateUser: (req: { user: typeof mockUser }, _res: unknown, next: () => void) => {
    req.user = mockUser;
    next();
  },
}));

describe("Document", () => {
  let folderId: number;
  let docId: number;
  let secondUserId: number;
  let secondUserDocId: number;

  beforeAll(async () => {
    await prisma.user.deleteMany({
      where: {
        OR: [
          { email: "doc@test.com" },
          { email: "docuser2@test.com" },
        ]
      }
    })

    const user = await prisma.user.create({
      data: {
        username: mockUser.username,
        email: "doc@test.com",
        hashedPass: "hashedPass",
      }
    });
    mockUser.id = user.id;

    const folder = await prisma.folder.create({
      data: {
        userId: user.id,
        name: "DocTestFolder",
      }
    });
    folderId = folder.id;

    const secondUser = await prisma.user.create({
      data: {
        username: "docuser2",
        email: "docuser2@test.com",
        hashedPass: "hashedPass",
      }
    });
    secondUserId = secondUser.id;
  });

  afterAll(async () => {
    await prisma.user.deleteMany({
      where: {
        OR: [
          { email: "doc@test.com" },
          { email: "docuser2@test.com" },
        ]
      }
    });
    await prisma.$disconnect();
  });

  describe("POST /document/:folderId", () => {
    it("creates document", async () => {
      const res = await request(app)
        .post(`/document/${folderId}`)
        .send({ name: "MyDocument" });

      expect(res.statusCode).toBe(201);
      expect(res.body.name).toBe("MyDocument");
      expect(res.body.id).toBeTruthy();
      docId = res.body.id;
    });

    it("returns on invalid folderId", async () => {
      const res = await request(app)
        .post('/document/-1')
        .send({ name: "OrphanDoc" });

      expect(res.statusCode).toBe(404);
      expect(res.body.main).toBe("Folder not found");
    });

    it("returns on duplicate name within same folder", async () => {
      const res = await request(app)
        .post(`/document/${folderId}`)
        .send({ name: "MyDocument" });

      expect(res.statusCode).toBe(400);
      expect(res.body.main).toBe("Name taken in folder");
    });

    it("returns on empty name", async () => {
      const res = await request(app)
        .post(`/document/${folderId}`)
        .send({ name: "" });

      expect(res.statusCode).toBe(400);
      expect(res.body.name).toBeTruthy();
    });

    it("returns on invalid name input", async () => {
      const res = await request(app)
        .post(`/document/${folderId}`)
        .send({ name: [] });

      expect(res.statusCode).toBe(400);
      expect(res.body.name).toBeTruthy();
    });
  });

  describe("GET /document/recent", () => {
    it("returns recent documents", async () => {
      const res = await request(app).get('/document/recent');

      expect(res.statusCode).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBeGreaterThan(0);
      expect(res.body[0].document.id).toBe(docId);
    });
  });

  describe("GET /document", () => {
    it("returns my documents", async () => {
      const res = await request(app).get('/document');

      expect(res.statusCode).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.some((d: { document: { id: number } }) => d.document.id === docId)).toBe(true);
    });
  });

  describe("GET /document/shared", () => {
    it("returns shared documents", async () => {
      const res = await request(app).get('/document/shared');

      expect(res.statusCode).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
    });
  });

  describe("GET /document/:docId", () => {
    it("generates websocket token", async () => {
      const res = await request(app).get(`/document/${docId}`);

      expect(res.statusCode).toBe(201);
      expect(res.body.token).toBeTruthy();
      expect(res.body.role).toBe(Role.OWNER);
    });

    it("returns when document not found", async () => {
      const res = await request(app).get('/document/999999');

      expect(res.statusCode).toBe(404);
      expect(res.body.main).toBe("Page not found");
    });
  });

  describe("PUT /document/:docId", () => {
    it("updates document name", async () => {
      const res = await request(app)
        .put(`/document/${docId}`)
        .send({ name: "RenamedDocument" });

      expect(res.statusCode).toBe(200);
      expect(res.body.name).toBe("RenamedDocument");
    });

    it("returns on duplicate name in folder", async () => {
      await request(app)
        .post(`/document/${folderId}`)
        .send({ name: "AnotherDoc" });

      const res = await request(app)
        .put(`/document/${docId}`)
        .send({ name: "AnotherDoc" });

      expect(res.statusCode).toBe(404);
      expect(res.body.main).toBe("Name taken");
    });

    it("returns on empty name", async () => {
      const res = await request(app)
        .put(`/document/${docId}`)
        .send({ name: "" });

      expect(res.statusCode).toBe(400);
      expect(res.body.name).toBeTruthy();
    });

    it("returns when document not found", async () => {
      const res = await request(app)
        .put('/document/999999')
        .send({ name: "Ghost" });

      expect(res.statusCode).toBe(404);
      expect(res.body.main).toBe("Document not found");
    });
  });

  describe("GET /document/roles/:docId", () => {
    it("returns users with lower roles", async () => {
      const res = await request(app).get(`/document/roles/${docId}`);

      expect(res.statusCode).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
    });

    it("returns when document not found", async () => {
      const res = await request(app).get('/document/roles/999999');

      expect(res.statusCode).toBe(404);
      expect(res.body.main).toBe("Document not found");
    });
  });

  describe("GET /document/admins/:docId", () => {
    it("returns admins for owner", async () => {
      const res = await request(app).get(`/document/admins/${docId}`);

      expect(res.statusCode).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
    });
  });

  describe("POST /document/permission/:docId", () => {
    it("grants access to users", async () => {
      const res = await request(app)
        .post(`/document/permission/${docId}`)
        .send({ usersId: [secondUserId], roles: [Role.EDIT] });

      expect(res.statusCode).toBe(200);
      expect(res.body.main).toBe("Granted");

      const userDoc = await prisma.userDocuments.findUnique({
        where: {
          userId_documentId: {
            userId: secondUserId,
            documentId: docId,
          }
        }
      });
      expect(userDoc?.role).toBe(Role.EDIT);
      secondUserDocId = userDoc!.id;
    });

    it("returns on invalid user ids", async () => {
      const res = await request(app)
        .post(`/document/permission/${docId}`)
        .send({ usersId: [999999], roles: [Role.VIEW] });

      expect(res.statusCode).toBe(400);
      expect(res.body.main).toBe("Could not add users");
      expect(res.body.missing).toContain(999999);
    });

    it("returns when granting role at or above own role", async () => {
      const res = await request(app)
        .post(`/document/permission/${docId}`)
        .send({ usersId: [secondUserId], roles: [Role.OWNER] });

      expect(res.statusCode).toBe(404);
      expect(res.body.main).toBe("Could not update roles");
    });

    it("returns on invalid roles input", async () => {
      const res = await request(app)
        .post(`/document/permission/${docId}`)
        .send({ usersId: [secondUserId], roles: ["INVALID"] });
      expect(res.statusCode).toBe(400);
      expect(res.body.roles).toBeTruthy();
    });
  });

  describe("DELETE /document/:docId/remove/:id", () => {
    it("removes user access", async () => {
      const res = await request(app)
        .delete(`/document/${docId}/remove/${secondUserDocId}`);
      
      expect(res.statusCode).toBe(200);
      expect(res.body.msg).toBe("removed");
    });

    it("returns when user not found in document", async () => {
      const res = await request(app)
        .delete(`/document/${docId}/remove/-1`);

      expect(res.statusCode).toBe(404);
      expect(res.body.main).toBe("User not found");
    });

    it("returns when owner tries to remove themselves", async () => {
      const owner = await prisma.userDocuments.findUnique({
        where: {
          userId_documentId: {
            userId: mockUser.id,
            documentId: docId,
          }
        },
        select: {
          id:true
        }
      });

      const res = await request(app)
        .delete(`/document/${docId}/remove/${owner!.id}`);

      expect(res.statusCode).toBe(400);
      expect(res.body.main).toBe("Must transer document ownership or delete");
    });
  });

  describe("PUT /document/roles/:docId", () => {
    beforeAll(async () => {
      await request(app)
        .post(`/document/permission/${docId}`)
        .send({ usersId: [secondUserId], roles: [Role.EDIT] });

      const userDoc = await prisma.userDocuments.findUnique({
        where: {
          userId_documentId: {
            userId: secondUserId,
            documentId: docId,
          }
        }
      });
      secondUserDocId = userDoc!.id;
    });

    it("updates user roles", async () => {
      const res = await request(app)
        .put(`/document/roles/${docId}`)
        .send({ usersId: [secondUserId], roles: [Role.ADMIN] });

      expect(res.statusCode).toBe(200);
      expect(res.body.msg).toBe("Updated");

      const userDoc = await prisma.userDocuments.findUnique({
        where: {
          userId_documentId: {
            userId: secondUserId,
            documentId: docId,
          }
        }
      });
      expect(userDoc?.role).toBe(Role.ADMIN);
    });

    it("returns on empty usersId", async () => {
      const res = await request(app)
        .put(`/document/roles/${docId}`)
        .send({ usersId: [], roles: ["ADMIN"] });

      expect(res.statusCode).toBe(400);
      expect(res.body.main).toBe("Nothing to update");
    });

    it("returns on missing users in document", async () => {
      const res = await request(app)
        .put(`/document/roles/${docId}`)
        .send({ usersId: [-1], roles: [Role.VIEW] });

      expect(res.statusCode).toBe(400);
      expect(res.body.main).toBe("Could not add users");
    });
  });

  describe("DELETE /document/:docId", () => {
    it("deletes document as owner", async () => {
      const res = await request(app).delete(`/document/${docId}`);

      expect(res.statusCode).toBe(204);

      const doc = await prisma.document.findUnique({ where: { id: docId } });
      expect(doc).toBeNull();
    });
  });

  describe("PUT /document/transfer/:docId", () => {
    beforeAll(async () => {
      const res = await request(app)
        .post(`/document/${folderId}`)
        .send({ name: "TransferDoc" });
      docId = res.body.id;

      await request(app)
        .post(`/document/permission/${docId}`)
        .send({ usersId: [secondUserId], roles: [Role.ADMIN] });

      const userDoc = await prisma.userDocuments.findUnique({
        where: {
          userId_documentId: {
            userId: secondUserId,
            documentId: docId,
          }
        }
      });
      secondUserDocId = userDoc!.id;
    });

    it("transfers ownership to admin", async () => {
      const res = await request(app)
        .put(`/document/transfer/${docId}`)
        .send({ id: secondUserDocId });

      expect(res.statusCode).toBe(200);
      expect(res.body.msg).toBe("Transfered");

      const owner = await prisma.userDocuments.findUnique({
        where: {
          userId_documentId: {
            userId: secondUserId,
            documentId: docId,
          }
        },
        select: {
          role: true
        }
      });
      expect(owner?.role).toBe(Role.OWNER);
    });

    it("returns when not owner", async () => {
      // mockUser is not owner anymore - secondUser is
      const res = await request(app)
        .put(`/document/transfer/${docId}`)
        .send({ id: secondUserDocId });

      expect(res.statusCode).toBe(404);
      expect(res.body.main).toBe("Not able to change ownership");
    });

    it("returns when deleting without ownership", async () => {
      const res = await request(app).delete(`/document/${docId}`);

      expect(res.statusCode).toBe(404);
      expect(res.body.main).toBe("Document not found");
    });
  });
});
