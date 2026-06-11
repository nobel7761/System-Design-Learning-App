"use client";

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
  Badge,
  Button,
  ButtonGroup,
  Kbd,
  KbdGroup,
  Spinner,
  Toggle,
  ToggleGroup,
  ToggleGroupItem,
} from "@/components/shared/shadcn";
import { Demo, Section } from "./Section";

export function ButtonsSection() {
  return (
    <Section id="buttons" title="Buttons, badges & toggles">
      <Demo label="Button variants">
        <Button>Default</Button>
        <Button variant="secondary">Secondary</Button>
        <Button variant="outline">Outline</Button>
        <Button variant="ghost">Ghost</Button>
        <Button variant="destructive">Destructive</Button>
        <Button variant="link">Link</Button>
      </Demo>

      <Demo label="Button sizes">
        <Button size="sm">Small</Button>
        <Button size="default">Default</Button>
        <Button size="lg">Large</Button>
        <Button disabled>Disabled</Button>
      </Demo>

      <Demo label="Button group">
        <ButtonGroup>
          <Button variant="outline">Left</Button>
          <Button variant="outline">Middle</Button>
          <Button variant="outline">Right</Button>
        </ButtonGroup>
      </Demo>

      <Demo label="Badges">
        <Badge>Default</Badge>
        <Badge variant="secondary">Secondary</Badge>
        <Badge variant="destructive">Destructive</Badge>
        <Badge variant="outline">Outline</Badge>
      </Demo>

      <Demo label="Toggle / toggle group">
        <Toggle aria-label="Bold">B</Toggle>
        <ToggleGroup type="single" defaultValue="left">
          <ToggleGroupItem value="left">L</ToggleGroupItem>
          <ToggleGroupItem value="center">C</ToggleGroupItem>
          <ToggleGroupItem value="right">R</ToggleGroupItem>
        </ToggleGroup>
      </Demo>

      <Demo label="Avatars">
        <Avatar>
          <AvatarImage src="https://github.com/shadcn.png" alt="@shadcn" />
          <AvatarFallback>CN</AvatarFallback>
        </Avatar>
        <Avatar>
          <AvatarFallback>ML</AvatarFallback>
        </Avatar>
      </Demo>

      <Demo label="Keyboard keys">
        <KbdGroup>
          <Kbd>⌘</Kbd>
          <Kbd>K</Kbd>
        </KbdGroup>
        <KbdGroup>
          <Kbd>Ctrl</Kbd>
          <Kbd>C</Kbd>
        </KbdGroup>
      </Demo>

      <Demo label="Spinner">
        <Spinner />
        <Button disabled>
          <Spinner /> Loading
        </Button>
      </Demo>
    </Section>
  );
}
