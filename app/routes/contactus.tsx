import { useId } from "react";
import { conform, useForm } from "@conform-to/react";
import { parse } from "@conform-to/zod";
import { json, redirect, type ActionFunctionArgs } from "@remix-run/cloudflare";
import { Form, useActionData } from "@remix-run/react";
import { z } from "zod";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Textarea } from "~/components/ui/textarea";

const schema = z.object({
  email: z
    .string({ required_error: "Email is required" })
    .email("Email is invalid"),
  message: z.string({ required_error: "Message is required" }),
});

type T = z.infer<typeof schema>;

async function sendMessage(data: z.infer<typeof schema>) {
  console.log("sendMessge", data);
  return redirect("/");
}

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  const submission = parse(formData, { schema });
  if (submission.intent !== "submit" || !submission.value) {
    return json(submission);
  }
  return await sendMessage(submission.value);
}

export default function ContactUs() {
  const lastSubmission = useActionData<typeof action>();
  const id = useId();
  const [form, fields] = useForm({
    id,
    lastSubmission,
    shouldValidate: "onBlur",
    onValidate({ formData }) {
      return parse(formData, { schema });
    },
  });
  return (
    <Form
      method="post"
      className="mx-auto flex max-w-md flex-col gap-4"
      {...form.props}
    >
      <div className="grid w-full gap-1.5">
        <Label htmlFor={fields.email.id}>Email</Label>
        <Input {...conform.input(fields.email, { type: "email" })} />
        <div id={fields.email.errorId} className="text-destructive">
          {fields.email.errors}
        </div>
      </div>
      <div className="grid w-full gap-1.5">
        <Label htmlFor={fields.message.id}>Your message</Label>
        <Textarea {...conform.textarea(fields.message)} />
        <div id={fields.message.errorId} className="text-destructive">
          {fields.message.errors}
        </div>
      </div>
      <Button>Send</Button>
    </Form>
  );
}
