import request from "supertest";
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";
import { prisma } from "@cce/prisma";
import app from "../src/server.js";

const mockUser = vi.hoisted(() => ({ id: 0, username: "folderuser101" }));

vi.mock('../src/middlewares/authenticate.js', () => ({
  authenticateUser: (req: { user: typeof mockUser }, _res: unknown, next: () => void) => {
    req.user = mockUser;
    next();
  },
}));

describe("Folder", () => {
  let projectId: number;
  let subfolderId: number;
  let otherUserFolderId: number;

  beforeAll(async () => {
    await prisma.user.deleteMany({
      where: {
        email: { contains: "folder"  } ,
      }
    });

    const user = await prisma.user.create({
      data: {
        username: mockUser.username,
        email: "folder@test.com",
        hashedPass: "hashedPass",
      }
    });
    mockUser.id = user.id;

    const otherUser = await prisma.user.create({
      data: {
        username: "folderuser2",
        email: "folderuser2@test.com",
        hashedPass: "hashedPass",
      }
    });

    const otherFolder = await prisma.folder.create({
      data: {
        userId: otherUser.id,
        name: "OtherUserProject",
      }
    });
    otherUserFolderId = otherFolder.id;
  });

  afterAll(async () => {
    await prisma.user.deleteMany({
      where: {
        email: { contains: "folder"  } ,
      }
    });
    await prisma.$disconnect();
  });

  describe("GET /folder/", () => {
    it("returns root projects", async () => {
      const res = await request(app).get('/folder');

      expect(res.statusCode).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
    });
  });

  describe("POST /folder", () => {
    it("creates root project", async () => {
      const res = await request(app)
        .post('/folder')
        .send({ name: "MyProject" });

      expect(res.statusCode).toBe(201);
      expect(res.body.name).toBe("MyProject");
      expect(res.body.parentId).toBeNull();
      expect(res.body.id).toBeTruthy();
      projectId = res.body.id;
    });

    it("creates nested folder", async () => {
      const res = await request(app)
        .post('/folder')
        .send({ name: "SubFolder", folderId: String(projectId) });

      expect(res.statusCode).toBe(201);
      expect(res.body.name).toBe("SubFolder");
      expect(res.body.parentId).toBe(projectId);
      subfolderId = res.body.id;
    });

    it("returns on invalid parent folder", async () => {
      const res = await request(app)
        .post('/folder')
        .send({ name: "OrphanFolder", folderId: "99999" });
      expect(res.statusCode).toBe(404);
      expect(res.body.main).toBe("Parent folder does not exist");
    });

    it("returns on duplicate name in projects", async () => {
      const res = await request(app)
        .post('/folder')
        .send({ name: "MyProject" });

      expect(res.statusCode).toBe(400);
      expect(res.body.main).toBe("Name taken in projects");
    });

    it("returns on duplicate name within parent folder", async () => {
      const res = await request(app)
        .post('/folder')
        .send({ name: "SubFolder", folderId: String(projectId) });

      expect(res.statusCode).toBe(400);
      expect(res.body.main).toBe("Name taken in folder");
    });

    it("returns on empty name", async () => {
      const res = await request(app)
        .post('/folder')
        .send({ name: "" });

      expect(res.statusCode).toBe(400);
      expect(res.body.name).toBeTruthy();
    });

    it("returns on invalid name input", async () => {
      const res = await request(app)
        .post('/folder')
        .send({ name: [] });

      expect(res.statusCode).toBe(400);
      expect(res.body.name).toBeTruthy();
    });
  });

  describe("GET /folder/:id", () => {
    it("returns folder with children", async () => {
      const res = await request(app).get(`/folder/${projectId}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.id).toBe(projectId);
      expect(res.body.folders).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ id: subfolderId, name: "SubFolder" })
        ])
      );
    });

    it("returns when folder not found", async () => {
      const res = await request(app).get('/folder/9999');

      expect(res.statusCode).toBe(404);
      expect(res.body.main).toBe("Folder not found");
    });

    it("returns when folder belongs to another user", async () => {
      const res = await request(app).get(`/folder/${otherUserFolderId}`);

      expect(res.statusCode).toBe(404);
      expect(res.body.main).toBe("Folder not found");
    });
  });

  describe("GET /folder after create", () => {
    it("includes created projects", async () => {
      const res = await request(app).get('/folder');

      expect(res.statusCode).toBe(200);
      expect(res.body.some((f: { id: number }) => f.id === projectId)).toBe(true);
    });
  });

  describe("PUT /folder/:id", () => {
    it("updates nested folder name", async () => {
      const res = await request(app)
        .put(`/folder/${subfolderId}`)
        .send({ name: "RenamedSubFolder" });

      expect(res.statusCode).toBe(200);
      expect(res.body.name).toBe("RenamedSubFolder");
    });

    it("returns on duplicate name within parent folder", async () => {
      await request(app)
        .post('/folder')
        .send({ name: "SiblingFolder", folderId: String(projectId) });

      const res = await request(app)
        .put(`/folder/${subfolderId}`)
        .send({ name: "SiblingFolder" });

      expect(res.statusCode).toBe(400);
      expect(res.body.main).toBe("Name taken in folder");
    });

    it("returns on duplicate name in projects", async () => {
      await request(app)
        .post('/folder')
        .send({ name: "AnotherProject" });

      const res = await request(app)
        .put(`/folder/${projectId}`)
        .send({ name: "AnotherProject" });

      expect(res.statusCode).toBe(400);
      expect(res.body.main).toBe("Name taken in projects");
    });

    it("returns on empty name", async () => {
      const res = await request(app)
        .put(`/folder/${projectId}`)
        .send({ name: "" });

      expect(res.statusCode).toBe(400);
      expect(res.body.name).toBeTruthy();
    });

    it("returns when folder not found", async () => {
      const res = await request(app)
        .put('/folder/9999')
        .send({ name: "Ghost" });

      expect(res.statusCode).toBe(404);
      expect(res.body.main).toBe("Folder not found");
    });
  });

  describe("DELETE /folder/:id", () => {
    it("returns when folder not found", async () => {
      const res = await request(app).delete('/folder/9999');

      expect(res.statusCode).toBe(404);
      expect(res.body.main).toBe("Folder not found");
    });

    it("deletes nested folder", async () => {
      const res = await request(app).delete(`/folder/${subfolderId}`);

      expect(res.statusCode).toBe(204);

      const folder = await prisma.folder.findUnique({ where: { id: subfolderId } });
      expect(folder).toBeNull();
    });

    it("deletes root project", async () => {
      const res = await request(app).delete(`/folder/${projectId}`);

      expect(res.statusCode).toBe(204);

      const folder = await prisma.folder.findUnique({ where: { id: projectId } });
      expect(folder).toBeNull();
    });
  });
});
