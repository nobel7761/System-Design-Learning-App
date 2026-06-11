"use client";

import {
  Checkbox,
  Input,
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
  Label,
  NativeSelect,
  NativeSelectOption,
  Progress,
  RadioGroup,
  RadioGroupItem,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Slider,
  Switch,
  Textarea,
} from "@/components/shared/shadcn";
import { Demo, Section } from "./Section";

export function InputsSection() {
  return (
    <Section id="inputs" title="Inputs & controls">
      <Demo label="Text input" className="!flex-col !items-stretch">
        <Label htmlFor="demo-name">Name</Label>
        <Input id="demo-name" placeholder="Jane Doe" />
        <Input placeholder="Disabled" disabled />
      </Demo>

      <Demo label="Textarea" className="!flex-col !items-stretch">
        <Textarea placeholder="Write something..." rows={3} />
      </Demo>

      <Demo label="Select">
        <Select>
          <SelectTrigger className="w-44">
            <SelectValue placeholder="Pick a fruit" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="apple">Apple</SelectItem>
            <SelectItem value="banana">Banana</SelectItem>
            <SelectItem value="mango">Mango</SelectItem>
          </SelectContent>
        </Select>
      </Demo>

      <Demo label="Native select">
        <NativeSelect defaultValue="b">
          <NativeSelectOption value="a">Option A</NativeSelectOption>
          <NativeSelectOption value="b">Option B</NativeSelectOption>
          <NativeSelectOption value="c">Option C</NativeSelectOption>
        </NativeSelect>
      </Demo>

      <Demo label="Checkbox">
        <Label className="flex items-center gap-2">
          <Checkbox defaultChecked /> Accept terms
        </Label>
        <Label className="flex items-center gap-2">
          <Checkbox /> Subscribe
        </Label>
      </Demo>

      <Demo label="Radio group">
        <RadioGroup defaultValue="one" className="flex gap-4">
          <Label className="flex items-center gap-2">
            <RadioGroupItem value="one" /> One
          </Label>
          <Label className="flex items-center gap-2">
            <RadioGroupItem value="two" /> Two
          </Label>
        </RadioGroup>
      </Demo>

      <Demo label="Switch">
        <Label className="flex items-center gap-2">
          <Switch defaultChecked /> Airplane mode
        </Label>
      </Demo>

      <Demo label="Slider" className="!flex-col !items-stretch">
        <Slider defaultValue={[40]} max={100} step={1} />
      </Demo>

      <Demo label="Input OTP">
        <InputOTP maxLength={6}>
          <InputOTPGroup>
            <InputOTPSlot index={0} />
            <InputOTPSlot index={1} />
            <InputOTPSlot index={2} />
          </InputOTPGroup>
          <InputOTPSeparator />
          <InputOTPGroup>
            <InputOTPSlot index={3} />
            <InputOTPSlot index={4} />
            <InputOTPSlot index={5} />
          </InputOTPGroup>
        </InputOTP>
      </Demo>

      <Demo label="Progress" className="!flex-col !items-stretch">
        <Progress value={66} />
      </Demo>
    </Section>
  );
}
