"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { getCldImageUrl } from "next-cloudinary";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import {
  aspectRatioOptions,
  creditFee,
  defaultValues,
  transformationTypes,
} from "@/constants";

import { updateCredits } from "@/lib/actions/user.actions";
import { addImage, updateImage } from "@/lib/actions/image.actions";
import { AspectRatioKey, debounce, deepMergeObjects } from "@/lib/utils";

import { CustomField } from "./CustomField";
import { InsufficientCreditsModal } from "./InsufficientCreditsModal";
import MediaUploader from "./MediaUploader";
import TransformedImage from "./TransformedImage";

////////////////////////////////////////////////////
// ✅ PROPS TYPE
////////////////////////////////////////////////////

interface TransformationFormProps {
  action: "Add" | "Update";
  data?: any;
  clerkId: string;
  type: string;
  creditBalance: number;
  config?: any;
}

////////////////////////////////////////////////////

export const formSchema = z.object({
  title: z.string(),
  aspectRatio: z.string().optional(),
  color: z.string().optional(),
  prompt: z.string().optional(),
  publicId: z.string(),
});

const TransformationForm = ({
  action,
  data = null,
  clerkId,
  type,
  creditBalance,
  config = null,
}: TransformationFormProps) => {
  const transformationType = transformationTypes[type];
  const [image, setImage] = useState(data);
  const [newTransformation, setNewTransformation] = useState<any | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isTransforming, setIsTransforming] = useState(false);
  const [transformationConfig, setTransformationConfig] = useState(config);
  const [, startTransition] = useTransition();
  const router = useRouter();

  const initialValues =
    data && action === "Update"
      ? {
          title: data?.title,
          aspectRatio: data?.aspectRatio,
          color: data?.color,
          prompt: data?.prompt,
          publicId: data?.publicId,
        }
      : defaultValues;

  ////////////////////////////////////////////////////
  // SELECT HANDLER (FOR FILL)
  ////////////////////////////////////////////////////

  const onSelectFieldHandler = (
    value: string,
    onChangeField: (value: string) => void
  ) => {
    const imageSize = aspectRatioOptions[value as AspectRatioKey];

    setImage((prevState: any) => ({
      ...prevState,
      aspectRatio: imageSize.aspectRatio,
      width: imageSize.width,
      height: imageSize.height,
    }));

    setNewTransformation(transformationType.config);
    return onChangeField(value);
  };

  ////////////////////////////////////////////////////
  // INPUT HANDLER (REMOVE / RECOLOR)
  ////////////////////////////////////////////////////

  const onInputChangeHandler = (
    fieldName: string,
    value: string,
    type: string,
    onChangeField: (value: string) => void
  ) => {
    debounce(() => {
      setNewTransformation((prevState: any) => ({
        ...prevState,
        [type]: {
          ...prevState?.[type],
          [fieldName === "prompt" ? "prompt" : "to"]: value,
        },
      }));
    }, 500)();

    return onChangeField(value);
  };

  ////////////////////////////////////////////////////
  // TRANSFORM
  ////////////////////////////////////////////////////

  const onTransformHandler = async () => {
    if (!clerkId) return;

    setIsTransforming(true);

    setTransformationConfig(
      deepMergeObjects(newTransformation, transformationConfig)
    );

    setNewTransformation(null);

    startTransition(async () => {
      await updateCredits(clerkId, creditFee);
    });
  };

  ////////////////////////////////////////////////////

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: initialValues,
  });

  ////////////////////////////////////////////////////
  // SUBMIT
  ////////////////////////////////////////////////////

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true);

    if (data || image) {
      const transformationUrl = getCldImageUrl({
        width: image?.width,
        height: image?.height,
        src: image?.publicId || "",
        ...transformationConfig,
      });

      const imageData = {
        title: values.title,
        publicId: image?.publicId || "",
        transformationType: type,
        width: image?.width || 0,
        height: image?.height || 0,
        config: transformationConfig,
        secureURL: image?.secureURL || "",
        transformationURL: transformationUrl,
        aspectRatio: values.aspectRatio,
        prompt: values.prompt,
        color: values.color,
      };

      if (action === "Add") {
        const newImage = await addImage({
          image: imageData,
          userId: clerkId,
          path: "/",
        });

        if (newImage) {
          form.reset();
          setImage(null);
          router.push(`/transformations/${newImage._id}`);
        }
      }

      if (action === "Update") {
        const updatedImage = await updateImage({
          image: { ...imageData, _id: data!._id },
          userId: clerkId,
          path: `/transformations/${data!._id}`,
        });

        if (updatedImage) {
          router.push(`/transformations/${updatedImage._id}`);
        }
      }
    }

    setIsSubmitting(false);
  }

  ////////////////////////////////////////////////////
  // AUTO CONFIG FOR RESTORE / REMOVE BG
  ////////////////////////////////////////////////////

  useEffect(() => {
    if (image && (type === "restore" || type === "removeBackground")) {
      setNewTransformation(transformationType.config);
    }
  }, [image, transformationType.config, type]);

  ////////////////////////////////////////////////////
  // UI
  ////////////////////////////////////////////////////

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        {creditBalance < Math.abs(creditFee) && (
          <InsufficientCreditsModal />
        )}

        <CustomField
          control={form.control}
          name="title"
          formLabel="Image Title"
          className="w-full"
          render={({ field }) => (
            <Input {...field} className="input-field" />
          )}
        />

        {/* FILL TYPE */}
        {type === "fill" && (
          <CustomField
            control={form.control}
            name="aspectRatio"
            formLabel="Aspect Ratio"
            className="w-full"
            render={({ field }) => (
              <Select
                onValueChange={(value) =>
                  onSelectFieldHandler(value, field.onChange)
                }
                value={field.value}
              >
                <SelectTrigger className="select-field">
                  <SelectValue placeholder="Select size" />
                </SelectTrigger>
                <SelectContent>
                  {Object.keys(aspectRatioOptions).map((key) => (
                    <SelectItem key={key} value={key}>
                      {aspectRatioOptions[key as AspectRatioKey].label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
        )}

        {/* REMOVE / RECOLOR */}
        {(type === "remove" || type === "recolor") && (
          <div className="space-y-4">
            <CustomField
              control={form.control}
              name="prompt"
              formLabel={
                type === "remove"
                  ? "Object to remove"
                  : "Object to recolor"
              }
              className="w-full"
              render={({ field }) => (
                <Input
                  {...field}
                  className="input-field"
                  onChange={(e) =>
                    onInputChangeHandler(
                      "prompt",
                      e.target.value,
                      type,
                      field.onChange
                    )
                  }
                />
              )}
            />

            {type === "recolor" && (
              <CustomField
                control={form.control}
                name="color"
                formLabel="Replacement Color"
                className="w-full"
                render={({ field }) => (
                  <Input
                    {...field}
                    className="input-field"
                    onChange={(e) =>
                      onInputChangeHandler(
                        "color",
                        e.target.value,
                        "recolor",
                        field.onChange
                      )
                    }
                  />
                )}
              />
            )}
          </div>
        )}

        {/* MEDIA */}
        <CustomField
          control={form.control}
          name="publicId"
          className="flex size-full flex-col"
          render={({ field }) => (
            <MediaUploader
              onValueChange={field.onChange}
              setImage={setImage}
              publicId={field.value}
              image={image}
              type={type}
            />
          )}
        />

        <TransformedImage
          image={image}
          type={type}
          title={form.getValues().title}
          isTransforming={isTransforming}
          setIsTransforming={setIsTransforming}
          transformationConfig={transformationConfig}
        />

        <div className="flex flex-col gap-4">
          <Button
            type="button"
            className="submit-button capitalize"
            disabled={isTransforming || newTransformation === null}
            onClick={onTransformHandler}
          >
            {isTransforming ? "Transforming..." : "Apply Transformation"}
          </Button>

          <Button
            type="submit"
            className="submit-button capitalize"
            disabled={isSubmitting}
          >
            {isSubmitting
              ? "Submitting..."
              : "Save your Image on ArtifyAI's cloud"}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default TransformationForm;
