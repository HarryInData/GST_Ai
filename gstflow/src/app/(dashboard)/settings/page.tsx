import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/frontend/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/frontend/components/ui/tabs";
import { Badge } from "@/frontend/components/ui/badge";
import { Button } from "@/frontend/components/ui/button";
import { Input } from "@/frontend/components/ui/input";
import { Label } from "@/frontend/components/ui/label";
import { Separator } from "@/frontend/components/ui/separator";
import { auth } from "@/backend/auth/auth";
import { prisma } from "@/backend/db/prisma";
import { redirect } from "next/navigation";
import {
  Building2,
  User,
  FileText,
  Shield,
  Save,
} from "lucide-react";

export default async function SettingsPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  // Fetch organization data
  let org = null;
  if (session.user.organizationId) {
    org = await prisma.organization.findUnique({
      where: { id: session.user.organizationId },
    });
  }

  return (
    <div className="space-y-6 animate-slide-up">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Settings</h2>
        <p className="text-muted-foreground text-sm">
          Manage your account and business settings
        </p>
      </div>

      <Tabs defaultValue="business" className="space-y-6">
        <TabsList className="bg-muted/50">
          <TabsTrigger value="business" className="gap-2">
            <Building2 className="h-4 w-4" />
            Business
          </TabsTrigger>
          <TabsTrigger value="profile" className="gap-2">
            <User className="h-4 w-4" />
            Profile
          </TabsTrigger>
          <TabsTrigger value="invoice" className="gap-2">
            <FileText className="h-4 w-4" />
            Invoice
          </TabsTrigger>
          {session.user.role === "ADMIN" && (
            <TabsTrigger value="team" className="gap-2">
              <Shield className="h-4 w-4" />
              Team
            </TabsTrigger>
          )}
        </TabsList>

        {/* Business Settings */}
        <TabsContent value="business">
          <Card className="border-border/50 bg-card/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5 text-primary" />
                Business Profile
              </CardTitle>
              <CardDescription>
                Your GST registration and business details
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Business Name</Label>
                  <Input
                    defaultValue={org?.name || ""}
                    className="bg-background/50"
                    readOnly
                  />
                </div>
                <div className="space-y-2">
                  <Label>GSTIN</Label>
                  <Input
                    defaultValue={org?.gstin || "Not set"}
                    className="bg-background/50 font-mono"
                    readOnly
                  />
                </div>
                <div className="space-y-2">
                  <Label>State</Label>
                  <Input
                    defaultValue={
                      org?.state
                        ? `${org.state} (${org.stateCode})`
                        : "Not set"
                    }
                    className="bg-background/50"
                    readOnly
                  />
                </div>
                <div className="space-y-2">
                  <Label>Pincode</Label>
                  <Input
                    defaultValue={org?.pincode || "Not set"}
                    className="bg-background/50"
                    readOnly
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Address</Label>
                <Input
                  defaultValue={org?.address || "Not set"}
                  className="bg-background/50"
                  readOnly
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Contact admin to update business details. Editing will be
                available in a future update.
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Profile Settings */}
        <TabsContent value="profile">
          <Card className="border-border/50 bg-card/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5 text-primary" />
                Your Profile
              </CardTitle>
              <CardDescription>
                Manage your personal information
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Name</Label>
                  <Input
                    defaultValue={session.user.name || ""}
                    className="bg-background/50"
                    readOnly
                  />
                </div>
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input
                    defaultValue={session.user.email || ""}
                    className="bg-background/50"
                    readOnly
                  />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Label>Role</Label>
                <Badge
                  variant={
                    session.user.role === "ADMIN" ? "default" : "secondary"
                  }
                  className={
                    session.user.role === "ADMIN"
                      ? "gradient-primary text-white"
                      : ""
                  }
                >
                  {session.user.role}
                </Badge>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Invoice Settings */}
        <TabsContent value="invoice">
          <Card className="border-border/50 bg-card/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" />
                Invoice Configuration
              </CardTitle>
              <CardDescription>
                Customize your invoice numbering and defaults
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Invoice Prefix</Label>
                  <Input
                    defaultValue={org?.invoicePrefix || "INV"}
                    className="bg-background/50 font-mono uppercase"
                    readOnly
                  />
                </div>
                <div className="space-y-2">
                  <Label>Next Invoice Number</Label>
                  <Input
                    defaultValue={String(org?.nextInvoiceNo || 1)}
                    className="bg-background/50 font-mono"
                    readOnly
                  />
                </div>
              </div>
              <div className="p-3 rounded-lg bg-primary/5 border border-primary/10">
                <p className="text-sm">
                  Next invoice:{" "}
                  <span className="font-mono font-medium text-primary">
                    {org?.invoicePrefix || "INV"}-
                    {String(org?.nextInvoiceNo || 1).padStart(4, "0")}
                  </span>
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Team (Admin Only) */}
        {session.user.role === "ADMIN" && (
          <TabsContent value="team">
            <Card className="border-border/50 bg-card/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-primary" />
                  Team Management
                </CardTitle>
                <CardDescription>
                  Manage team members and their roles
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-col items-center justify-center py-8">
                  <p className="text-sm text-muted-foreground text-center max-w-sm">
                    Team member invitation and role management (Admin/Staff)
                    will be available in a future update. As an Admin, you have
                    full access to all features.
                  </p>
                </div>

                <Separator />

                <div className="space-y-2">
                  <h4 className="text-sm font-medium">Role Permissions</h4>
                  <div className="grid gap-2 text-sm">
                    <div className="flex items-center justify-between p-2 rounded-lg bg-muted/50">
                      <div className="flex items-center gap-2">
                        <Badge className="gradient-primary text-white">
                          Admin
                        </Badge>
                        <span>Full access</span>
                      </div>
                      <span className="text-muted-foreground text-xs">
                        All permissions
                      </span>
                    </div>
                    <div className="flex items-center justify-between p-2 rounded-lg bg-muted/50">
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary">Staff</Badge>
                        <span>Limited access</span>
                      </div>
                      <span className="text-muted-foreground text-xs">
                        Create & view invoices
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
}
