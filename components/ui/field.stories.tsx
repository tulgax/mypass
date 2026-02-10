import type { Meta, StoryObj } from "@storybook/react"

import { Input } from "./input"
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSet,
} from "./field"

const meta = {
  title: "UI/Field",
  component: Field,
} satisfies Meta<typeof Field>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => (
    <FieldSet className="max-w-md">
      <FieldLegend>Studio details</FieldLegend>
      <FieldGroup>
        <Field>
          <FieldLabel htmlFor="studio-name">Studio name</FieldLabel>
          <FieldContent>
            <Input id="studio-name" placeholder="My Studio" />
            <FieldDescription>Shown on public listings.</FieldDescription>
          </FieldContent>
        </Field>
        <Field>
          <FieldLabel htmlFor="studio-email">Contact email</FieldLabel>
          <FieldContent>
            <Input id="studio-email" placeholder="hello@studio.com" />
            <FieldError errors={[{ message: "Email is required" }]} />
          </FieldContent>
        </Field>
      </FieldGroup>
    </FieldSet>
  ),
}
