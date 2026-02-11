export const dynamic = "force-dynamic";

import { redirect } from "next/navigation";
import { currentUser } from "@clerk/nextjs/server";

import Header from "@/components/Header";
import TransformationForm from "@/components/TransformationForm";
import { transformationTypes } from "@/constants";
import { getUserById } from "@/lib/actions/user.actions";

interface PageProps {
  params: Promise<{
    type: string;
  }>;
}

const AddTransformationTypePage = async ({ params }: PageProps) => {
  // ✅ MUST await params in Next 15
  const { type } = await params;

  // ✅ Clerk auth
  const clerkUser = await currentUser();
  if (!clerkUser) redirect("/sign-in");

  // ✅ Fetch user
  const user = await getUserById(clerkUser.id);
  if (!user) redirect("/");

  // ✅ Validate transformation
  const transformation = transformationTypes[type];
  if (!transformation) redirect("/");

  return (
    <>
      <Header
        title={transformation.title}
        subtitle={transformation.subTitle}
      />

      <section className="mt-10">
        <TransformationForm
          action="Add"
          type={transformation.type as TransformationTypeKey}
          creditBalance={user.creditBalance}
          clerkId={clerkUser.id}
        />
      </section>
    </>
  );
};

export default AddTransformationTypePage;
