"use client";

import { Bar, BarChart, CartesianGrid, XAxis } from "recharts";
import { toast } from "sonner";
import {
  Alert,
  AlertDescription,
  AlertTitle,
  Button,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
  Field,
  FieldDescription,
  FieldLabel,
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemGroup,
  ItemMedia,
  ItemTitle,
  Input,
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
  InputGroupText,
  Skeleton,
} from "@/components/shared/shadcn";
import { Demo, Section } from "./Section";

const chartData = [
  { month: "Jan", desktop: 186, mobile: 80 },
  { month: "Feb", desktop: 305, mobile: 200 },
  { month: "Mar", desktop: 237, mobile: 120 },
  { month: "Apr", desktop: 173, mobile: 190 },
  { month: "May", desktop: 209, mobile: 130 },
];

const chartConfig = {
  desktop: { label: "Desktop", color: "var(--chart-1)" },
  mobile: { label: "Mobile", color: "var(--chart-2)" },
} satisfies ChartConfig;

export function FeedbackSection() {
  return (
    <Section id="feedback" title="Feedback, charts & fields">
      <Demo label="Alert" className="!block">
        <Alert>
          <AlertTitle>Heads up!</AlertTitle>
          <AlertDescription>
            You can add components to your app using the CLI.
          </AlertDescription>
        </Alert>
      </Demo>

      <Demo label="Skeleton">
        <div className="flex items-center gap-3">
          <Skeleton className="h-10 w-10 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-4 w-24" />
          </div>
        </div>
      </Demo>

      <Demo label="Toast (sonner)">
        <Button
          variant="outline"
          onClick={() =>
            toast.success("Saved!", { description: "Your changes were saved." })
          }
        >
          Show toast
        </Button>
      </Demo>

      <Demo label="Chart" className="!block">
        <ChartContainer config={chartConfig} className="h-40 w-full">
          <BarChart data={chartData}>
            <CartesianGrid vertical={false} />
            <XAxis dataKey="month" tickLine={false} axisLine={false} />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Bar dataKey="desktop" fill="var(--color-desktop)" radius={4} />
            <Bar dataKey="mobile" fill="var(--color-mobile)" radius={4} />
          </BarChart>
        </ChartContainer>
      </Demo>

      <Demo label="Empty state" className="!block">
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant="icon">📭</EmptyMedia>
            <EmptyTitle>No notifications</EmptyTitle>
            <EmptyDescription>You&apos;re all caught up.</EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            <Button size="sm" variant="outline">
              Refresh
            </Button>
          </EmptyContent>
        </Empty>
      </Demo>

      <Demo label="Field" className="!flex-col !items-stretch">
        <Field>
          <FieldLabel htmlFor="field-email">Email</FieldLabel>
          <Input id="field-email" type="email" placeholder="you@site.com" />
          <FieldDescription>
            We&apos;ll never share your email.
          </FieldDescription>
        </Field>
      </Demo>

      <Demo label="Input group" className="!flex-col !items-stretch">
        <InputGroup>
          <InputGroupAddon>
            <InputGroupText>@</InputGroupText>
          </InputGroupAddon>
          <InputGroupInput placeholder="username" />
        </InputGroup>
        <InputGroup>
          <InputGroupInput placeholder="amount" />
          <InputGroupAddon align="inline-end">
            <InputGroupText>USD</InputGroupText>
          </InputGroupAddon>
        </InputGroup>
      </Demo>

      <Demo label="Item list" className="!block">
        <ItemGroup className="gap-2">
          <Item variant="outline">
            <ItemMedia>📦</ItemMedia>
            <ItemContent>
              <ItemTitle>Basic plan</ItemTitle>
              <ItemDescription>Up to 5 projects</ItemDescription>
            </ItemContent>
            <ItemActions>
              <Button size="sm" variant="outline">
                Choose
              </Button>
            </ItemActions>
          </Item>
          <Item variant="outline">
            <ItemMedia>🚀</ItemMedia>
            <ItemContent>
              <ItemTitle>Pro plan</ItemTitle>
              <ItemDescription>Unlimited projects</ItemDescription>
            </ItemContent>
            <ItemActions>
              <Button size="sm">Choose</Button>
            </ItemActions>
          </Item>
        </ItemGroup>
      </Demo>
    </Section>
  );
}
