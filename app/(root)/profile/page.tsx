export const dynamic = "force-dynamic";
import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";

import Header from "@/components/Header";
import { Collection } from "@/components/Collection";
import { getUserImages } from "@/lib/actions/image.actions";

interface SearchParamProps {
  searchParams: Promise<{
    page?: string;
  }>;
}

const Profile = async ({ searchParams }: SearchParamProps) => {
  const params = await searchParams;
  const page = Number(params?.page) || 1;

  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const images = await getUserImages({ userId, page });

  return (
    <>
      <Header title="Profile" subtitle="Your generated images" />

      <section className="mt-8">
        <Collection
          images={images.data}
          totalPages={images.totalPages}
          page={page}
        />
      </section>
    </>
  );
};

export default Profile;
