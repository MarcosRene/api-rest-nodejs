import { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { randomUUID } from 'node:crypto'

import { checkSessionIdExists } from '../middlewares/checkSessionIdExists'

import { knex } from '../database'

export async function transactionsRoutes(app: FastifyInstance) {
  app.get('/', { preHandler: [checkSessionIdExists] }, async (request) => {
    const { sessionId } = request.cookies

    const transactions = await knex('transactions')
      .where('session_id', sessionId)
      .select()

    return { transactions }
  })

  app.get('/:id', { preHandler: [checkSessionIdExists] }, async (request) => {
    const getTransactionParamsSchema = z.object({
      id: z.string().uuid(),
    })

    const { sessionId } = request.cookies

    const { id } = getTransactionParamsSchema.parse(request.params)

    const transaction = await knex('transactions')
      .where({ session_id: sessionId, id })
      .first()

    return { transaction }
  })

  app.get(
    '/summary',
    { preHandler: [checkSessionIdExists] },
    async (request) => {
      const { sessionId } = request.cookies

      const summary = await knex('transactions')
        .where('session_id', sessionId)
        .sum('amount', { as: 'amount' })
        .first()

      return { summary }
    },
  )

  app.post('/', async (request, reply) => {
    const constCreateTransactionBodySchema = z.object({
      title: z.string(),
      amount: z.number(),
      type: z.enum(['credit', 'debit']),
    })

    const { title, amount, type } = constCreateTransactionBodySchema.parse(
      request.body,
    )

    let sessionId = request.cookies.sessionId

    if (!sessionId) {
      sessionId = randomUUID()

      reply.cookie('sessionId', sessionId, {
        path: '/',
        maxAge: 60 * 60 * 24 * 7, // 7 days
      })
    }

    const formatAmountType = {
      credit: amount,
      debit: amount * -1,
    }

    await knex('transactions').insert({
      id: randomUUID(),
      title,
      amount: formatAmountType[type],
      session_id: sessionId,
    })

    return reply.status(201).send()
  })
}