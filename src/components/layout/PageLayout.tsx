"use client";

import { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, Plus } from "lucide-react";

interface PageLayoutProps {
    title: string;
    description?: string;
    children: ReactNode;
    actions?: ReactNode;
    tabs?: Array<{
        value: string;
        label: string;
        content: ReactNode;
    }>;
    defaultTab?: string;
    showAddButton?: boolean;
    addButtonLabel?: string;
    onAddClick?: () => void;
    errors?: string[];
    success?: string[];
}

export function PageLayout({
    title,
    description,
    children,
    actions,
    tabs,
    defaultTab,
    showAddButton = false,
    addButtonLabel = "Agregar",
    onAddClick,
    errors = [],
    success = [],
}: PageLayoutProps) {
    if (tabs && tabs.length > 0) {
        return (
            <div className="container mx-auto py-10">
                <Tabs defaultValue={defaultTab || tabs[0].value}>
                    <div className="flex justify-between items-center mb-6">
                        <div>
                            <h1 className="text-3xl font-bold">{title}</h1>
                            {description && (
                                <p className="text-muted-foreground mt-1">
                                    {description}
                                </p>
                            )}
                        </div>
                        <div className="flex items-center gap-4">
                            <TabsList>
                                {tabs.map((tab) => (
                                    <TabsTrigger key={tab.value} value={tab.value}>
                                        {tab.label}
                                    </TabsTrigger>
                                ))}
                            </TabsList>
                            {showAddButton && onAddClick && (
                                <Button onClick={onAddClick}>
                                    <Plus className="h-4 w-4 mr-2" />
                                    {addButtonLabel}
                                </Button>
                            )}
                            {actions}
                        </div>
                    </div>

                    {/* Error and Success Messages */}
                    {errors.map((error, index) => (
                        <Alert key={`error-${index}`} variant="destructive" className="mb-4">
                            <AlertCircle className="h-4 w-4" />
                            <AlertDescription>{error}</AlertDescription>
                        </Alert>
                    ))}

                    {success.map((msg, index) => (
                        <Alert key={`success-${index}`} className="mb-4">
                            <AlertDescription>{msg}</AlertDescription>
                        </Alert>
                    ))}

                    {tabs.map((tab) => (
                        <TabsContent key={tab.value} value={tab.value} className="space-y-6">
                            {tab.content}
                        </TabsContent>
                    ))}
                </Tabs>
            </div>
        );
    }

    return (
        <div className="container mx-auto py-10">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-3xl font-bold">{title}</h1>
                    {description && (
                        <p className="text-muted-foreground mt-1">
                            {description}
                        </p>
                    )}
                </div>
                <div className="flex items-center gap-4">
                    {showAddButton && onAddClick && (
                        <Button onClick={onAddClick}>
                            <Plus className="h-4 w-4 mr-2" />
                            {addButtonLabel}
                        </Button>
                    )}
                    {actions}
                </div>
            </div>

            {/* Error and Success Messages */}
            {errors.map((error, index) => (
                <Alert key={`error-${index}`} variant="destructive" className="mb-4">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            ))}

            {success.map((msg, index) => (
                <Alert key={`success-${index}`} className="mb-4">
                    <AlertDescription>{msg}</AlertDescription>
                </Alert>
            ))}

            {children}
        </div>
    );
}

interface FormSectionProps {
    title: string;
    description?: string;
    children: ReactNode;
    className?: string;
}

export function FormSection({
    title,
    description,
    children,
    className = "",
}: FormSectionProps) {
    return (
        <Card className={className}>
            <CardHeader>
                <CardTitle>{title}</CardTitle>
                {description && (
                    <CardDescription>{description}</CardDescription>
                )}
            </CardHeader>
            <CardContent>{children}</CardContent>
        </Card>
    );
}

interface DataSection {
    title: string;
    description?: string;
    children: ReactNode;
    actions?: ReactNode;
    className?: string;
}

export function DataSection({
    title,
    description,
    children,
    actions,
    className = "",
}: DataSection) {
    return (
        <Card className={className}>
            <CardHeader>
                <div className="flex justify-between items-start">
                    <div>
                        <CardTitle>{title}</CardTitle>
                        {description && (
                            <CardDescription className="mt-1">
                                {description}
                            </CardDescription>
                        )}
                    </div>
                    {actions && <div className="flex gap-2">{actions}</div>}
                </div>
            </CardHeader>
            <CardContent>{children}</CardContent>
        </Card>
    );
} 