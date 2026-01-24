"use client"
import { uuid, z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useForm } from "react-hook-form"
import axios from "axios"

const formSchema = z.object({
  "codingLabs": z.boolean(),
  "sketch": z.boolean(),
})

export default function page() {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      codingLabs: false,
      sketch: false,
    },
  })
 
  function onSubmit(values: z.infer<typeof formSchema>) {
    const response = axios.post(`/api/create/`, { values })
  }
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="codingLabs"
          render={({ field }) => (
            <FormItem>
              <FormLabel>codingLabs</FormLabel>
              <FormControl>
                <Input {...field} type="checkbox"/>
              </FormControl>
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="sketch"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Sketch</FormLabel>
              <FormControl>
                <Input {...field} type="checkbox"/> 
              </FormControl>
            </FormItem>
          )}
        />
        <Button type="submit" className="cursor-pointer">Create x00m</Button>
      </form>
    </Form>
  )
}