'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { Calendar } from '@/components/ui/calendar';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Progress } from '@/components/ui/progress';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { UserProfile } from '@/lib/types';
import { UserLevel, getUserLevel, getProgressToNextLevel } from '@/lib/user-levels';
import { MountainIcon, StarIcon, WalletIcon, ZapIcon } from 'lucide-react';

// Componentes complejos
import { Logo } from '@/components/Logo';
import { StarRating } from '@/components/StarRating';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { RewardsDisplay } from '@/components/RewardsDisplay';

const mockProfile: UserProfile = {
  name: 'Usuario Demo Admin',
  email: 'demo@caliope.com',
  isAdmin: true,
  isProfessional: true,
  loyaltyPoints: 125,
  phone: '3001234567',
  address: 'Calle Falsa 123, Bogotá',
  createdAt: new Date().toISOString(),
};

const ShowcasePage = () => {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const userLevel = getUserLevel(mockProfile.loyaltyPoints);
  const { progress, pointsToNext } = getProgressToNextLevel(mockProfile.loyaltyPoints, userLevel);

  return (
    <div className="container mx-auto p-8 bg-background text-foreground">
      <header className="text-center mb-12">
        <h1 className="text-5xl font-bold tracking-tighter">Component Showcase</h1>
        <p className="text-muted-foreground mt-2">A visual inventory of Caliope&apos;s UI components.</p>
      </header>

      <Separator className="my-8" />

      {/* === SECCIÓN DE COMPONENTES DE UI === */}
      <h2 className="text-3xl font-bold tracking-tight mb-6">UI Primitives (src/components/ui)</h2>

      {/* --- Fila 1: Botones y Badges --- */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
        <Card>
          <CardHeader><CardTitle>Buttons</CardTitle></CardHeader>
          <CardContent className="flex flex-wrap gap-4 items-center">
            <Button>Default</Button>
            <Button variant="destructive">Destructive</Button>
            <Button variant="ghost">Ghost</Button>
            <Button variant="link">Link</Button>
            <Button variant="outline">Outline</Button>
            <Button variant="secondary">Secondary</Button>
            <Button disabled>Disabled</Button>
            <Button><ZapIcon className="mr-2 h-4 w-4" /> With Icon</Button>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Badges</CardTitle></CardHeader>
          <CardContent className="flex flex-wrap gap-4 items-center">
            <Badge>Default</Badge>
            <Badge variant="destructive">Destructive</Badge>
            <Badge variant="outline">Outline</Badge>
            <Badge variant="secondary">Secondary</Badge>
          </CardContent>
        </Card>
      </div>

      {/* --- Fila 2: Formularios --- */}
      <Card className="mb-8">
        <CardHeader><CardTitle>Form Elements</CardTitle></CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="space-y-2">
            <Label htmlFor="input">Input</Label>
            <Input id="input" placeholder="Text input" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="select">Select</Label>
            <Select>
              <SelectTrigger><SelectValue placeholder="Select an option" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="1">Option 1</SelectItem>
                <SelectItem value="2">Option 2</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="textarea">Textarea</Label>
            <Textarea id="textarea" placeholder="Type your message here." />
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox id="terms" />
            <Label htmlFor="terms">Accept terms</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Switch id="airplane-mode" />
            <Label htmlFor="airplane-mode">Airplane Mode</Label>
          </div>
          <RadioGroup defaultValue="option-one">
            <div className="flex items-center space-x-2"><RadioGroupItem value="option-one" id="r1" /><Label htmlFor="r1">Option One</Label></div>
            <div className="flex items-center space-x-2"><RadioGroupItem value="option-two" id="r2" /><Label htmlFor="r2">Option Two</Label></div>
          </RadioGroup>
        </CardContent>
      </Card>

      {/* --- Fila 3: Modales y Popups --- */}
      <Card className="mb-8">
        <CardHeader><CardTitle>Overlays & Popups</CardTitle></CardHeader>
        <CardContent className="flex flex-wrap gap-4 items-center">
          <AlertDialog>
            <AlertDialogTrigger asChild><Button variant="outline">Alert Dialog</Button></AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader><AlertDialogTitle>Are you sure?</AlertDialogTitle><AlertDialogDescription>This action cannot be undone.</AlertDialogDescription></AlertDialogHeader>
              <AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction>Continue</AlertDialogAction></AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
          <Dialog>
            <DialogTrigger asChild><Button>Dialog</Button></DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Dialog Title</DialogTitle><DialogDescription>This is a dialog description.</DialogDescription></DialogHeader>
              <p>Dialog content goes here.</p>
            </DialogContent>
          </Dialog>
          <Popover>
            <PopoverTrigger asChild><Button variant="outline">Popover</Button></PopoverTrigger>
            <PopoverContent><p>The content for the popover.</p></PopoverContent>
          </Popover>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild><Button variant="outline">Tooltip</Button></TooltipTrigger>
              <TooltipContent><p>Tooltip content</p></TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </CardContent>
      </Card>

      {/* --- Fila 4: Widgets y Display --- */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
        <Card>
          <CardHeader><CardTitle>Calendar</CardTitle></CardHeader>
          <CardContent className="flex justify-center">
            <Calendar mode="single" selected={date} onSelect={setDate} className="rounded-md border" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Other Widgets</CardTitle></CardHeader>
          <CardContent className="space-y-6">
            <div>
              <Label>Progress Bar</Label>
              <Progress value={33} className="mt-2" />
            </div>
            <Accordion type="single" collapsible>
              <AccordionItem value="item-1">
                <AccordionTrigger>Is it accessible?</AccordionTrigger>
                <AccordionContent>Yes. It adheres to the WAI-ARIA design pattern.</AccordionContent>
              </AccordionItem>
            </Accordion>
            <Tabs defaultValue="account">
              <TabsList><TabsTrigger value="account">Account</TabsTrigger><TabsTrigger value="password">Password</TabsTrigger></TabsList>
              <TabsContent value="account">Make changes to your account here.</TabsContent>
              <TabsContent value="password">Change your password here.</TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>

      <Separator className="my-8" />

      {/* === SECCIÓN DE COMPONENTES COMPUESTOS === */}
      <h2 className="text-3xl font-bold tracking-tight mb-6">Composite Components (src/components)</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        <Card>
          <CardHeader><CardTitle>Logo</CardTitle></CardHeader>
          <CardContent><Logo /></CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Loading Spinner</CardTitle></CardHeader>
          <CardContent className="flex justify-center items-center h-24"><LoadingSpinner /></CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Star Rating</CardTitle></CardHeader>
          <CardContent className="flex justify-center items-center h-24"><StarRating rating={3.5} /></CardContent>
        </Card>
        <Card className="col-span-1 md:col-span-2 lg:col-span-3">
          <CardHeader><CardTitle>Rewards Display</CardTitle></CardHeader>
          <CardContent>
                        <RewardsDisplay />
          </CardContent>
        </Card>
      </div>

    </div>
  );
};

export default ShowcasePage;
