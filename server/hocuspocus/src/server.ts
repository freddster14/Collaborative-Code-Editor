import { Server } from "@hocuspocus/server";
import jwt from "jsonwebtoken";
import requireEnv from "./utils/env.js";
import type { WSToken } from "./types/ws.js";
import redis from "../redis.js";
import { prisma } from "../../prisma/client.js";
import * as Y from "yjs";

const server = new Server({
  name: 'hocuspocus-cce-01',
  port: 1234,
  debounce: 1000 * 60 * 3,
  maxDebounce: 1000 * 60 * 15,
  async onAuthenticate(data) {
    const { token } = data;
    const { requestParameters } = data;
    const docId = Number(requestParameters.get('docId'))

    if(!docId) throw Error("No doc id provided");
    if(!token) throw Error("No token provided");

    const payload = jwt.verify(token, requireEnv("SECRET")) as WSToken
    if(payload.id !== docId) throw Error("Invalid Token");
    return payload
  },
  async onLoadDocument({ context }) {
    const ydoc = new Y.Doc()
    const cachedData = await redis.get(`doc:${context.id}`)
    if(cachedData) {
      const uint8Array = Buffer.from(cachedData, 'base64')
      Y.applyUpdate(ydoc, uint8Array)
      return ydoc
    }
    const dbData = await prisma.document.findUnique({ where: { id: context.id }})
    if(dbData?.doc) {
      const uint8Array = Buffer.from(dbData.doc)
      Y.applyUpdate(ydoc, uint8Array)
    }
    
    return ydoc
  },
  async onStoreDocument(data) {
    const { document, lastContext } = data;
    const doc = Y.encodeStateAsUpdate(document)
    const encodedDoc = Buffer.from(doc).toString('base64')
    const uint8Array = Buffer.from(doc)
    await Promise.all([
      redis.set(`doc:${lastContext.id}`, encodedDoc),
      redis.persist(`doc:${lastContext.id}`),
      prisma.document.update({
        where: { id: lastContext.id },
        data: { doc: uint8Array }
      })
    ])
  },
  async onDisconnect(data) {
    const { document, context, clientsCount } = data;
    if (clientsCount === 0) {
      const doc = Y.encodeStateAsUpdate(document);
      const encodedDoc = Buffer.from(doc).toString('base64');
      const uint8Array = Buffer.from(doc);
      await Promise.all([
        redis.set(`doc:${context.id}`, encodedDoc, { EX: 60 * 60 * 24 }), // 1 day
        prisma.document.update({
          where: { id: context.id },
          data: { doc: uint8Array }
        })
      ])
    }
  }
});

server.listen()