import type {NextApiRequest, NextApiResponse} from 'next'
import prisma, {LeaseUses} from "../../lib/prisma";
// Fetch all posts (in /pages/api/posts.ts)

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<LeaseUses[] | LeaseUses>
) {
  const leaseUses = await prisma.leaseUses.findMany()
  switch (req.method) {
    case 'GET':
      const name = req.query.name
      if (!!name && typeof name === 'string') {
        const leaseUse = await prisma.leaseUses.create({data: {name:name,}})
        res.json([...leaseUses, leaseUse])
        break
      }
      res.json(leaseUses)
      break

    case 'POST':
      const body = req.body
      const leaseUse = await prisma.leaseUses.create({data: {name:body.name}})
      res.json([...leaseUses, leaseUse])
      break

    case 'PATCH':
      res.json(leaseUses)
      break

    case 'DELETE':
      res.json(leaseUses)
      break

    default:
      res.status(405).end()
      break
  }
}
