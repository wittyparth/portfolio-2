import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";
import { PageHeader } from "@/components/page-header";
import { SocialWall } from "@/components/social-wall";
import { socialPosts } from "@content/social";

export const metadata: Metadata = pageMetadata({
  title: "Posts · Partha Saradhi",
  description: "Shorter thoughts from X and LinkedIn by Partha Saradhi, collected in one place.",
  path: "/posts",
});

export default function PostsPage() {
  return (
    <main className="mx-auto w-full max-w-[44rem] px-6 pb-32">
      <PageHeader
        title="Posts"
        intro="Shorter thoughts from X and LinkedIn, collected in one place. The longer ones become blog posts."
      />
      <SocialWall posts={socialPosts} />
    </main>
  );
}
