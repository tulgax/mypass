"use client"

import * as React from "react"
import {
  BluetoothIcon,
  ChevronRight,
  Info,
  MoreHorizontal,
  Plus,
  Terminal,
} from "lucide-react"

import { Example, ExampleWrapper } from "@/components/example"

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AspectRatio } from "@/components/ui/aspect-ratio"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Breadcrumb, BreadcrumbItem, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from "@/components/ui/combobox"
import { CtaButton } from "@/components/ui/cta-button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"
import { InputGroup, InputGroupAddon, InputGroupInput, InputGroupText } from "@/components/ui/input-group"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarProvider,
} from "@/components/ui/sidebar"
import { Skeleton } from "@/components/ui/skeleton"
import { StatusBadge } from "@/components/ui/status-badge"
import { Textarea } from "@/components/ui/textarea"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

const frameworks = ["Next.js", "SvelteKit", "Nuxt.js", "Remix", "Astro"] as const

export function BrandingShowcase() {
  const [isCollapsibleOpen, setIsCollapsibleOpen] = React.useState(true)

  return (
    <ExampleWrapper className="pt-4">
      <div className="md:col-span-2">
        <h1 className="text-2xl font-semibold">Branding</h1>
        <p className="text-sm text-muted-foreground">
          Visual reference for UI components and variants.
        </p>
      </div>

      <Example title="Button">
        <div className="flex flex-wrap gap-2">
          <Button>Default</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="outline">Outline</Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="destructive">Destructive</Button>
          <Button variant="link">Link</Button>
          <Button size="sm">Small</Button>
          <Button size="lg">Large</Button>
          <Button size="icon" aria-label="Icon button">
            <Plus />
          </Button>
        </div>
      </Example>

      <Example title="Badge">
        <div className="flex flex-wrap gap-2">
          <Badge>Default</Badge>
          <Badge variant="secondary">Secondary</Badge>
          <Badge variant="success">Success</Badge>
          <Badge variant="outline">Outline</Badge>
          <Badge variant="destructive">Destructive</Badge>
          <Badge variant="ghost">Ghost</Badge>
          <Badge variant="link" asChild>
            <a href="#">Link</a>
          </Badge>
        </div>
      </Example>

      <Example title="Status badge">
        <StatusBadge />
      </Example>

      <Example title="Alert">
        <div className="space-y-3">
          <Alert>
            <Info className="h-4 w-4" />
            <AlertTitle>Heads up</AlertTitle>
            <AlertDescription>
              This is a default alert. Use it to highlight important info.
            </AlertDescription>
          </Alert>
          <Alert variant="destructive">
            <Terminal className="h-4 w-4" />
            <AlertTitle>Something went wrong</AlertTitle>
            <AlertDescription>Try again later.</AlertDescription>
          </Alert>
        </div>
      </Example>

      <Example title="Card">
        <Card className="max-w-sm">
          <CardHeader>
            <CardTitle>Card title</CardTitle>
            <CardDescription>Card description goes here.</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              This is content inside a card.
            </p>
          </CardContent>
          <CardFooter className="gap-2">
            <Button size="sm">Action</Button>
            <Button size="sm" variant="outline">
              Secondary
            </Button>
          </CardFooter>
        </Card>
      </Example>

      <Example title="Input + Label">
        <div className="space-y-3">
          <div className="space-y-2">
            <Label htmlFor="branding-email">Email</Label>
            <Input id="branding-email" placeholder="you@example.com" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="branding-disabled">Disabled</Label>
            <Input id="branding-disabled" placeholder="Disabled" disabled />
          </div>
        </div>
      </Example>

      <Example title="Input group">
        <div className="space-y-3">
          <InputGroup>
            <InputGroupAddon>
              <InputGroupText>@</InputGroupText>
            </InputGroupAddon>
            <InputGroupInput placeholder="username" />
          </InputGroup>
          <InputGroup>
            <InputGroupAddon align="inline-start">
              <InputGroupText>USD</InputGroupText>
            </InputGroupAddon>
            <InputGroupInput placeholder="0.00" inputMode="decimal" />
            <InputGroupAddon align="inline-end">
              <InputGroupText>
                <kbd data-slot="kbd">⌘K</kbd>
              </InputGroupText>
            </InputGroupAddon>
          </InputGroup>
        </div>
      </Example>

      <Example title="Textarea">
        <Textarea placeholder="Write something…" />
      </Example>

      <Example title="Select">
        <Select defaultValue="mn">
          <SelectTrigger className="w-[220px]">
            <SelectValue placeholder="Select language" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="mn">Монгол</SelectItem>
            <SelectItem value="en">English</SelectItem>
          </SelectContent>
        </Select>
      </Example>

      <Example title="Combobox">
        <Combobox items={frameworks}>
          <ComboboxInput placeholder="Select a framework" showClear />
          <ComboboxContent>
            <ComboboxEmpty>No results.</ComboboxEmpty>
            <ComboboxList>
              {(item) => (
                <ComboboxItem key={item} value={item}>
                  {item}
                </ComboboxItem>
              )}
            </ComboboxList>
          </ComboboxContent>
        </Combobox>
      </Example>

      <Example title="Field">
        <FieldGroup>
          <Field>
            <FieldLabel htmlFor="branding-field-name">Name</FieldLabel>
            <Input id="branding-field-name" placeholder="Jane Doe" />
          </Field>
          <Field>
            <FieldLabel htmlFor="branding-field-notes">Notes</FieldLabel>
            <Textarea id="branding-field-notes" placeholder="Optional…" />
          </Field>
        </FieldGroup>
      </Example>

      <Example title="Separator">
        <div className="w-full">
          <div className="text-sm">Above</div>
          <Separator className="my-3" />
          <div className="text-sm">Below</div>
        </div>
      </Example>

      <Example title="Skeleton">
        <div className="w-full space-y-3">
          <Skeleton className="h-5 w-40" />
          <Skeleton className="h-24 w-full" />
          <div className="flex gap-3">
            <Skeleton className="h-10 w-10 rounded-full" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-1/2" />
              <Skeleton className="h-4 w-2/3" />
            </div>
          </div>
        </div>
      </Example>

      <Example title="Avatar">
        <div className="flex items-center gap-3">
          <Avatar>
            <AvatarImage src="/vercel.svg" alt="Avatar" />
            <AvatarFallback>MP</AvatarFallback>
          </Avatar>
          <div>
            <div className="text-sm font-medium">MyPass</div>
            <div className="text-xs text-muted-foreground">avatar fallback</div>
          </div>
        </div>
      </Example>

      <Example title="Aspect ratio">
        <AspectRatio ratio={16 / 9} className="bg-muted rounded-lg">
          <img
            src="/vercel.svg"
            alt="Example"
            className="h-full w-full object-contain p-8"
          />
        </AspectRatio>
      </Example>

      <Example title="Accordion">
        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="item-1">
            <AccordionTrigger>What is MyPass?</AccordionTrigger>
            <AccordionContent>
              A studio + booking experience built with shadcn/ui.
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="item-2">
            <AccordionTrigger>Can I customize it?</AccordionTrigger>
            <AccordionContent>Yes, this is the branding page.</AccordionContent>
          </AccordionItem>
        </Accordion>
      </Example>

      <Example title="Collapsible">
        <Collapsible open={isCollapsibleOpen} onOpenChange={setIsCollapsibleOpen}>
          <div className="flex items-center justify-between">
            <div className="text-sm font-medium">Details</div>
            <CollapsibleTrigger asChild>
              <Button variant="outline" size="sm">
                Toggle
              </Button>
            </CollapsibleTrigger>
          </div>
          <CollapsibleContent className="mt-3 text-sm text-muted-foreground">
            Collapsible content goes here.
          </CollapsibleContent>
        </Collapsible>
      </Example>

      <Example title="Tooltip">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="outline">Hover me</Button>
            </TooltipTrigger>
            <TooltipContent>Tooltip content</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </Example>

      <Example title="Dropdown menu">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline">Open menu</Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <Plus className="mr-2 h-4 w-4" />
              New
            </DropdownMenuItem>
            <DropdownMenuItem>
              <MoreHorizontal className="mr-2 h-4 w-4" />
              More
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </Example>

      <Example title="Dialog">
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="outline">Open dialog</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Dialog title</DialogTitle>
              <DialogDescription>
                This is a dialog description.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline">Cancel</Button>
              <Button>Save</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </Example>

      <Example title="Alert dialog">
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="outline">Open alert dialog</Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Allow connection?</AlertDialogTitle>
              <AlertDialogDescription>
                Do you want to allow this accessory to connect?
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction>
                <BluetoothIcon className="mr-2 h-4 w-4" />
                Allow
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </Example>

      <Example title="Sheet">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline">Open sheet</Button>
          </SheetTrigger>
          <SheetContent>
            <SheetHeader>
              <SheetTitle>Sheet title</SheetTitle>
              <SheetDescription>
                Side panel content goes here.
              </SheetDescription>
            </SheetHeader>
            <div className="mt-6 space-y-3">
              <Input placeholder="Type…" />
              <Button className="w-full">Continue</Button>
            </div>
          </SheetContent>
        </Sheet>
      </Example>

      <Example title="Breadcrumb">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <a className="transition-colors hover:text-foreground" href="#">
                Studio
              </a>
            </BreadcrumbItem>
            <BreadcrumbSeparator>
              <ChevronRight className="h-4 w-4" />
            </BreadcrumbSeparator>
            <BreadcrumbItem>
              <BreadcrumbPage>Branding</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </Example>

      <Example title="CTA Button">
        <CtaButton>Get started</CtaButton>
      </Example>

      <Example title="Sidebar (contained demo)">
        <SidebarProvider defaultOpen>
          <div className="w-full max-w-sm rounded-xl border bg-sidebar p-2 text-sidebar-foreground">
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton isActive>Overview</SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton>Catalog</SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton>Settings</SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>

            <div className="mt-3">
              <SidebarMenuSub>
                <SidebarMenuSubItem>
                  <SidebarMenuSubButton isActive>Classes</SidebarMenuSubButton>
                </SidebarMenuSubItem>
                <SidebarMenuSubItem>
                  <SidebarMenuSubButton>Plans</SidebarMenuSubButton>
                </SidebarMenuSubItem>
                <SidebarMenuSubItem>
                  <SidebarMenuSubButton>Coupons</SidebarMenuSubButton>
                </SidebarMenuSubItem>
              </SidebarMenuSub>
            </div>
          </div>
        </SidebarProvider>
      </Example>
    </ExampleWrapper>
  )
}

