import type { Metadata } from "next";
import { PageHeader } from "@/components/page-header";
import { SocialWall } from "@/components/social-wall";
import { socialPosts } from "@content/social";
import { profile } from "@/lib/content";

export const metadata: Metadata = {
  title: `Posts · ${profile.name}`,
  description: "Shorter thoughts from X and LinkedIn, collected in one place.",
};

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
