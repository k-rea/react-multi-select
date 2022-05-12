import type {NextApiRequest, NextApiResponse} from 'next'
import prisma, {Post} from "../../lib/prisma";
// Fetch all posts (in /pages/api/posts.ts)

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Post[] | Post>
) {
  const posts = await prisma.post.findMany()
  switch (req.method) {
    case 'GET':
      const title = req.query.title
      if (!!title && typeof title === 'string') {
        const post = await prisma.post.create({data: {title: title,}})
        res.json([...posts, post])
        break
      }
      res.json(posts)
      break

    case 'POST':
      const body = JSON.parse(req.body)
      res.json(posts)
      break

    case 'PATCH':
      res.json(posts)
      break

    case 'DELETE':
      res.json(posts)
      break

    default:
      res.status(405).end()
      break
  }
}