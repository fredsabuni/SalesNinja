/**
 * Design System Showcase - Demo component to display all UI components
 */

'use client';

import * as React from 'react';
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  FormField,
  SearchableDropdown,
  StepIndicator,
  StatusBar,
} from '@/components/ui';

const mockOfficers = [
  { value: '1', label: 'John Doe', description: 'Sales Manager - North Region' },
  { value: '2', label: 'Jane Smith', description: 'Sales Rep - Downtown' },
  { value: '3', label: 'Bob Johnson', description: 'Team Lead - South Region' },
];

const steps = [
  { id: 'officer', title: 'Officer' },
  { id: 'route', title: 'Route' },
  { id: 'details', title: 'Details' },
];

export const DesignSystemShowcase: React.FC = () => {
  const [selectedOfficer, setSelectedOfficer] = React.useState('');
  const [currentStep, setCurrentStep] = React.useState(2);
  const [syncStatus, setSyncStatus] = React.useState<'idle' | 'syncing' | 'error' | 'offline'>('idle');

  return (
    <div className="space-y-8 p-4 max-w-2xl mx-auto">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-neutral-900 mb-2">
          Design System Showcase
        </h1>
        <p className="text-neutral-600">
          Preview of all UI components in the lead generation tool
        </p>
      </div>

      {/* Buttons */}
      <Card>
        <CardHeader>
          <CardTitle>Buttons</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <Button variant="default">Primary</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="outline">Outline</Button>
            <Button variant="ghost">Ghost</Button>
          </div>
          
          <div className="space-y-2">
            <Button fullWidth loading>
              Loading Button
            </Button>
            <Button fullWidth variant="destructive">
              Destructive Action
            </Button>
          </div>
          
          <div className="flex gap-2">
            <Button size="sm">Small</Button>
            <Button size="default">Default</Button>
            <Button size="lg">Large</Button>
            <Button size="icon" variant="outline">
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Form Fields */}
      <Card>
        <CardHeader>
          <CardTitle>Form Fields</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <FormField
            label="Lead Name"
            placeholder="Enter lead name"
            required
          />
          
          <FormField
            label="Phone Number"
            placeholder="+1 (555) 123-4567"
            type="tel"
            hint="Include country code for international numbers"
          />
          
          <FormField
            label="Email Address"
            placeholder="lead@example.com"
            type="email"
            error="Please enter a valid email address"
          />
          
          <FormField
            label="Disabled Field"
            placeholder="This field is disabled"
            disabled
          />
        </CardContent>
      </Card>

      {/* Searchable Dropdown */}
      <Card>
        <CardHeader>
          <CardTitle>Searchable Dropdown</CardTitle>
        </CardHeader>
        <CardContent>
          <SearchableDropdown
            label="Select Officer"
            placeholder="Choose an officer..."
            searchPlaceholder="Search officers..."
            options={mockOfficers}
            value={selectedOfficer}
            onValueChange={setSelectedOfficer}
            required
          />
        </CardContent>
      </Card>

      {/* Step Indicator */}
      <Card>
        <CardHeader>
          <CardTitle>Step Indicator</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <StepIndicator steps={steps} currentStep={currentStep} />
          
          <div className="flex gap-2 justify-center">
            <Button
              size="sm"
              variant="outline"
              onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
              disabled={currentStep === 1}
            >
              Previous
            </Button>
            <Button
              size="sm"
              onClick={() => setCurrentStep(Math.min(3, currentStep + 1))}
              disabled={currentStep === 3}
            >
              Next
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Status Bar */}
      <Card>
        <CardHeader>
          <CardTitle>Status Indicators</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <StatusBar isOnline={true} syncStatus="idle" />
            <StatusBar isOnline={true} syncStatus="syncing" />
            <StatusBar isOnline={true} syncStatus="error" pendingCount={3} />
            <StatusBar isOnline={false} syncStatus="offline" />
          </div>
          
          <div className="flex gap-2 justify-center">
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                const statuses: Array<'idle' | 'syncing' | 'error' | 'offline'> = ['idle', 'syncing', 'error', 'offline'];
                const currentIndex = statuses.indexOf(syncStatus);
                const nextIndex = (currentIndex + 1) % statuses.length;
                setSyncStatus(statuses[nextIndex]);
              }}
            >
              Cycle Status
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Color Palette */}
      <Card>
        <CardHeader>
          <CardTitle>Color Palette</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-5 gap-4">
            <div className="space-y-2">
              <div className="h-12 bg-primary-500 rounded-lg"></div>
              <p className="text-xs text-center">Primary</p>
            </div>
            <div className="space-y-2">
              <div className="h-12 bg-secondary-500 rounded-lg"></div>
              <p className="text-xs text-center">Secondary</p>
            </div>
            <div className="space-y-2">
              <div className="h-12 bg-success-500 rounded-lg"></div>
              <p className="text-xs text-center">Success</p>
            </div>
            <div className="space-y-2">
              <div className="h-12 bg-warning-500 rounded-lg"></div>
              <p className="text-xs text-center">Warning</p>
            </div>
            <div className="space-y-2">
              <div className="h-12 bg-error-500 rounded-lg"></div>
              <p className="text-xs text-center">Error</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Typography */}
      <Card>
        <CardHeader>
          <CardTitle>Typography</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h1 className="text-4xl font-bold text-neutral-900">Heading 1</h1>
            <h2 className="text-3xl font-bold text-neutral-900">Heading 2</h2>
            <h3 className="text-2xl font-bold text-neutral-900">Heading 3</h3>
            <h4 className="text-xl font-semibold text-neutral-900">Heading 4</h4>
          </div>
          
          <div className="space-y-2">
            <p className="text-base text-neutral-900">
              Body text - Regular paragraph text for general content and descriptions.
            </p>
            <p className="text-sm text-neutral-600">
              Small text - Used for hints, captions, and secondary information.
            </p>
            <p className="text-xs text-neutral-500">
              Extra small text - Used for fine print and metadata.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};