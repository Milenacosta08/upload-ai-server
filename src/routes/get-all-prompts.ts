import { FastifyInstance } from "fastify";
import { prisma } from "../lib/prisma";

export async function getAllPromptsRoute(app: FastifyInstance) {
    app.get('/prompts', async (request, reply) => {
        const prompt = await prisma.prompt.findMany();
    
        return prompt;
    });
}