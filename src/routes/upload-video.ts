import { FastifyInstance } from "fastify";
import { fastifyMultipart } from "@fastify/multipart"
import path from "node:path";
import { randomUUID } from "node:crypto";
import fs from "fs";
import { pipeline } from "node:stream";
import { prisma } from "../lib/prisma";
import { promisify } from "node:util";

const pump = promisify(pipeline);

export async function uploadVideoRoute(app: FastifyInstance) {
    app.register(fastifyMultipart, {
        limits: {
            fileSize: 1048576 * 25, // 25MB
        }
    })

    app.post('/videos', async (request, reply) => {
        const data = await request.file();

        if (!data) {
            return reply.status(400).send({ error: 'Missing file input.' })
        }

        const extension = path.extname(data.filename);

        if (extension !== '.mp3') {
            return reply.status(400).send({ error: 'Invalid file type.' })
        }

        const fileBaseName = path.basename(data.filename, extension);
        const fileUploadName = `${fileBaseName}-${randomUUID()}${extension}`;

        const uploadPath = path.resolve(__dirname, '../../tmp', fileUploadName);

        await pump(data.file, fs.createWriteStream(uploadPath));

        const video = await prisma.video.create({
            data: {
                name: data.filename,
                path: uploadPath,
            }
        })

        return {
            video
        }
    });
}