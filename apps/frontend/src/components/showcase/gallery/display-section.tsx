"use client";

import { useState } from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
  AspectRatio,
  Button,
  Calendar,
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
  ScrollArea,
  Separator,
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/shared/shadcn";
import { Demo, Section } from "./Section";

export function DisplaySection() {
  const [date, setDate] = useState<Date | undefined>(new Date());

  return (
    <Section id="display" title="Layout & data display">
      <Demo label="Card" className="!block">
        <Card>
          <CardHeader>
            <CardTitle>Project Alpha</CardTitle>
            <CardDescription>Deployed 2 hours ago</CardDescription>
          </CardHeader>
          <CardContent className="text-sm text-slate-600">
            Cards group related content and actions.
          </CardContent>
          <CardFooter>
            <Button size="sm">View</Button>
          </CardFooter>
        </Card>
      </Demo>

      <Demo label="Tabs" className="!block">
        <Tabs defaultValue="account">
          <TabsList>
            <TabsTrigger value="account">Account</TabsTrigger>
            <TabsTrigger value="password">Password</TabsTrigger>
          </TabsList>
          <TabsContent value="account" className="text-sm text-slate-600">
            Manage your account settings.
          </TabsContent>
          <TabsContent value="password" className="text-sm text-slate-600">
            Change your password here.
          </TabsContent>
        </Tabs>
      </Demo>

      <Demo label="Accordion" className="!block">
        <Accordion type="single" collapsible>
          <AccordionItem value="a">
            <AccordionTrigger>Is it accessible?</AccordionTrigger>
            <AccordionContent>Yes. It follows WAI-ARIA.</AccordionContent>
          </AccordionItem>
          <AccordionItem value="b">
            <AccordionTrigger>Is it styled?</AccordionTrigger>
            <AccordionContent>Yes, with Tailwind tokens.</AccordionContent>
          </AccordionItem>
        </Accordion>
      </Demo>

      <Demo label="Collapsible" className="!block">
        <Collapsible className="space-y-2">
          <CollapsibleTrigger asChild>
            <Button variant="outline" size="sm">
              Toggle details
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="rounded-md border p-3 text-sm text-slate-600">
            Hidden content revealed on toggle.
          </CollapsibleContent>
        </Collapsible>
      </Demo>

      <Demo label="Table" className="!block">
        <Table>
          <TableCaption>Recent invoices</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead>Invoice</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Amount</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell>INV-001</TableCell>
              <TableCell>Paid</TableCell>
              <TableCell className="text-right">$250.00</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>INV-002</TableCell>
              <TableCell>Pending</TableCell>
              <TableCell className="text-right">$150.00</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </Demo>

      <Demo label="Calendar" className="!block">
        <Calendar
          mode="single"
          selected={date}
          onSelect={setDate}
          className="rounded-md border"
        />
      </Demo>

      <Demo label="Carousel">
        <Carousel className="w-full max-w-[12rem]">
          <CarouselContent>
            {[1, 2, 3].map((n) => (
              <CarouselItem key={n}>
                <div className="flex h-24 items-center justify-center rounded-md border bg-slate-50 text-2xl font-semibold text-slate-400">
                  {n}
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious />
          <CarouselNext />
        </Carousel>
      </Demo>

      <Demo label="Resizable" className="!block">
        <ResizablePanelGroup
          orientation="horizontal"
          className="h-28 rounded-lg border"
        >
          <ResizablePanel defaultSize={50}>
            <div className="flex h-full items-center justify-center text-sm text-slate-500">
              One
            </div>
          </ResizablePanel>
          <ResizableHandle withHandle />
          <ResizablePanel defaultSize={50}>
            <div className="flex h-full items-center justify-center text-sm text-slate-500">
              Two
            </div>
          </ResizablePanel>
        </ResizablePanelGroup>
      </Demo>

      <Demo label="Scroll area">
        <ScrollArea className="h-28 w-full rounded-md border p-3">
          <div className="space-y-2 text-sm text-slate-600">
            {Array.from({ length: 12 }, (_, i) => (
              <p key={i}>Scrollable row {i + 1}</p>
            ))}
          </div>
        </ScrollArea>
      </Demo>

      <Demo label="Aspect ratio" className="!block">
        <AspectRatio
          ratio={16 / 9}
          className="flex items-center justify-center rounded-md bg-slate-100 text-sm text-slate-400"
        >
          16 / 9
        </AspectRatio>
      </Demo>

      <Demo label="Separator" className="!flex-col !items-stretch">
        <span className="text-sm text-slate-600">Above</span>
        <Separator />
        <span className="text-sm text-slate-600">Below</span>
      </Demo>
    </Section>
  );
}
