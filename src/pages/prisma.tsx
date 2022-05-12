import prisma, {Post} from "../lib/prisma"

// Fetch all posts (in /pages/index.tsx)
export async function getStaticProps() {
  const posts = await prisma.post.findMany()
  return {
    props: {posts}
  }
}

type Props = {
  posts: Post[]
}
// Display list of posts (in /pages/index.tsx)
export default ({posts}: Props) => (
  <>
    <h1>test Prisma</h1>
    <ul>
      {posts.map(post => (
        <li key={post.id}>{post.title}</li>
      ))}
    </ul>
  </>
);