import { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { randomUUID } from 'node:crypto'
import { knex } from '../database'

export async function transactionsRoutes(app: FastifyInstance) {
  app.post('/', async (request, reply) => {
    const constCreateTransactionBodySchema = z.object({
      title: z.string(),
      amount: z.number(),
      type: z.enum(['credit', 'debit']),
    })

    const { title, amount, type } = constCreateTransactionBodySchema.parse(
      request.body,
    )

    const formatAmountType = {
      credit: amount,
      debit: amount * -1,
    }

    await knex('transactions').insert({
      id: randomUUID(),
      title,
      amount: formatAmountType[type],
    })

    return reply.status(201).send()
  })
}
