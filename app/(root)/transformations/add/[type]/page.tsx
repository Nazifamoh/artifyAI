import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";

import Header from "@/components/Header";
import TransformationForm from "@/components/TransformationForm";
import { transformationTypes } from "@/constants";
import { getUserById } from "@/lib/actions/user.actions";

const AddTransformationTypePage = async ({ params }: SearchParamProps) => {
  // Await params (Next.js 15 requirement)
  const { type } = await params;

  // Await auth (Next.js 15 requirement)
  const { userId } = await auth();

  if (!userId) redirect("/sign-in");

  const user = await getUserById();

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
        />
      </section>
    </>
  );
};

export default AddTransformationTypePage;
