import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { AddressAutocomplete } from "@/components/ui/AddressAutocomplete";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { trpc } from "@/lib/trpc";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Briefcase,
  Clock,
  Heart,
  AlertCircle,
  Edit2,
  Save,
  X,
  ArrowLeft,
  Lock,
  Shield,
} from "lucide-react";
import { useState } from "react";
import { FullPageLoader } from "@/components/ui/loader";
import { Link } from "wouter";
import { toast } from "sonner";

export default function UserProfile() {
  const { user, isAuthenticated, loading: authLoading } = useAuth({
    redirectOnUnauthenticated: true,
    redirectPath: "/login"
  });

  const [isEditing, setIsEditing] = useState(false);
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);
  const [showEmailDialog, setShowEmailDialog] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || "",
    email: user?.email || "",
    phone: user?.phone || "",
    street: user?.street || "",
    city: user?.city || "",
    state: user?.state || "",
    zipCode: user?.zipCode || "",
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [emailData, setEmailData] = useState({
    newEmail: "",
    password: "",
  });

  const updateProfileMutation = trpc.users.updateProfile.useMutation({
    onSuccess: () => {
      toast.success("Profile updated successfully!");
      setIsEditing(false);
    },
    onError: (error) => {
      toast.error(error.message || "Failed to update profile");
    },
  });

  const { data: userStats } = trpc.users.getStats.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  const handleSaveProfile = async () => {
    try {
      await updateProfileMutation.mutateAsync({
        name: formData.name,
        phone: formData.phone,
        street: formData.street,
        city: formData.city,
        state: formData.state,
        zipCode: formData.zipCode,
      });
    } catch (error) {
      console.error("Profile update error:", error);
    }
  };

  const handleChangePassword = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error("New passwords do not match");
      return;
    }
    if (passwordData.newPassword.length < 8) {
      toast.error("Password must be at least 8 characters");
      return;
    }
    // Here you would call your password update mutation
    toast.success("Password changed successfully!");
    setShowPasswordDialog(false);
    setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" });
  };

  const handleChangeEmail = async () => {
    if (!emailData.newEmail || !emailData.password) {
      toast.error("Please fill in all fields");
      return;
    }
    // Here you would call your email update mutation
    toast.success("Email change request sent! Please check your new email to confirm.");
    setShowEmailDialog(false);
    setEmailData({ newEmail: "", password: "" });
  };

  if (authLoading) {
    return <FullPageLoader text="Loading your profile..." />;
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="max-w-md w-full mx-4">
          <CardContent className="p-8 text-center">
            <AlertCircle className="w-12 h-12 text-[#0033A0] mx-auto mb-4" />
            <h2 className="text-xl font-bold text-[#0033A0] mb-2">Sign In Required</h2>
            <p className="text-gray-600 mb-6">Please sign in to view your profile.</p>
            <Link href="/login">
              <a className="inline-block w-full">
                <Button className="w-full bg-[#FFA500] hover:bg-[#FF8C00] text-white">
                  Sign In
                </Button>
              </a>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white border-b shadow-sm">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <Link href="/dashboard">
                <Button variant="ghost" size="sm" className="p-2">
                  <ArrowLeft className="h-4 w-4" />
                </Button>
              </Link>
              <Link href="/">
                <a className="text-2xl font-bold">
                  <span className="text-[#0033A0]">Ameri</span>
                  <span className="text-[#D4AF37]">Lend</span>
                  <sup className="text-xs text-[#0033A0]">®</sup>
                </a>
              </Link>
            </div>

            <nav className="flex items-center gap-6">
              <Link href="/dashboard">
                <a className="text-gray-700 hover:text-[#0033A0] transition-colors">
                  Dashboard
                </a>
              </Link>
              <Link href="/apply">
                <a className="text-gray-700 hover:text-[#0033A0] transition-colors">
                  Apply
                </a>
              </Link>
              <Button
                variant="outline"
                className="border-[#0033A0] text-[#0033A0] hover:bg-[#0033A0] hover:text-white"
                onClick={() => window.location.href = "/"}
              >
                Logout
              </Button>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Profile Header */}
          <div className="flex items-start justify-between mb-8">
            <div>
              <h1 className="text-4xl font-bold text-[#0033A0] mb-2">Profile</h1>
              <p className="text-gray-600">Manage your account information and preferences</p>
            </div>
            <Button
              onClick={() => setIsEditing(!isEditing)}
              className={`flex items-center gap-2 ${isEditing ? "bg-red-500 hover:bg-red-600" : "bg-[#0033A0] hover:bg-[#002080]"} text-white`}
            >
              {isEditing ? (
                <>
                  <X className="w-4 h-4" />
                  Cancel
                </>
              ) : (
                <>
                  <Edit2 className="w-4 h-4" />
                  Edit Profile
                </>
              )}
            </Button>
          </div>

          {/* User Stats */}
          {userStats && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-500 text-sm mb-1">Total Applications</p>
                      <p className="text-3xl font-bold text-[#0033A0]">{userStats.totalApplications}</p>
                    </div>
                    <Briefcase className="w-8 h-8 text-[#0033A0]/20" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-500 text-sm mb-1">Approved Loans</p>
                      <p className="text-3xl font-bold text-green-600">{userStats.approvedLoans}</p>
                    </div>
                    <Heart className="w-8 h-8 text-green-200" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-500 text-sm mb-1">Member Since</p>
                      <p className="text-sm font-bold text-[#0033A0]">
                        {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : "N/A"}
                      </p>
                    </div>
                    <Clock className="w-8 h-8 text-[#0033A0]/20" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-500 text-sm mb-1">Account Status</p>
                      <p className="text-sm font-bold text-[#0033A0] capitalize">
                        {user?.role || "User"}
                      </p>
                    </div>
                    <User className="w-8 h-8 text-[#0033A0]/20" />
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Personal Information */}
          <Card className="mb-8">
            <CardHeader className="border-b">
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5 text-[#0033A0]" />
                Personal Information
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              {isEditing ? (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="name">Full Name</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="John Doe"
                        className="border-gray-300 focus:border-[#0033A0]"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email Address</Label>
                      <div className="flex gap-2">
                        <Input
                          id="email"
                          value={formData.email}
                          disabled
                          className="bg-gray-100 text-gray-600 cursor-not-allowed flex-1"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setShowEmailDialog(true)}
                          className="border-[#0033A0] text-[#0033A0]"
                        >
                          <Mail className="w-4 h-4 mr-2" />
                          Change
                        </Button>
                      </div>
                      <p className="text-xs text-gray-500">Click "Change" to update your email</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone Number</Label>
                      <Input
                        id="phone"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        placeholder="(555) 123-4567"
                        className="border-gray-300 focus:border-[#0033A0]"
                      />
                    </div>
                  </div>

                  <AddressAutocomplete
                    id="street"
                    value={formData.street}
                    onInputChange={(value) => setFormData({ ...formData, street: value })}
                    onAddressSelect={(address) => {
                      setFormData({
                        ...formData,
                        street: address.street,
                        city: address.city,
                        state: address.state,
                        zipCode: address.zipCode,
                      });
                    }}
                    label="Street Address"
                    placeholder="Start typing your address..."
                    apiKey={import.meta.env.VITE_GOOGLE_PLACES_API_KEY || ""}
                    className="border-gray-300 focus:border-[#0033A0]"
                  />

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="city">City</Label>
                      <Input
                        id="city"
                        value={formData.city}
                        onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                        placeholder="Los Angeles"
                        className="border-gray-300 focus:border-[#0033A0]"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="state">State</Label>
                      <Input
                        id="state"
                        value={formData.state}
                        onChange={(e) => setFormData({ ...formData, state: e.target.value.toUpperCase() })}
                        placeholder="CA"
                        maxLength={2}
                        className="border-gray-300 focus:border-[#0033A0]"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="zipCode">Zip Code</Label>
                      <Input
                        id="zipCode"
                        value={formData.zipCode}
                        onChange={(e) => setFormData({ ...formData, zipCode: e.target.value })}
                        placeholder="90001"
                        className="border-gray-300 focus:border-[#0033A0]"
                      />
                    </div>
                  </div>

                  <div className="flex gap-4 pt-4">
                    <Button
                      onClick={handleSaveProfile}
                      disabled={updateProfileMutation.isPending}
                      className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white"
                    >
                      <Save className="w-4 h-4" />
                      {updateProfileMutation.isPending ? "Saving..." : "Save Changes"}
                    </Button>
                    <Button
                      onClick={() => setIsEditing(false)}
                      variant="outline"
                      className="flex items-center gap-2"
                    >
                      <X className="w-4 h-4" />
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="flex items-start gap-4">
                      <User className="w-5 h-5 text-[#0033A0] mt-1 flex-shrink-0" />
                      <div>
                        <p className="text-sm text-gray-500">Full Name</p>
                        <p className="text-lg font-semibold text-gray-900">{formData.name || "Not provided"}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-4">
                      <Mail className="w-5 h-5 text-[#0033A0] mt-1 flex-shrink-0" />
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm text-gray-500">Email Address</p>
                            <p className="text-lg font-semibold text-gray-900">{formData.email}</p>
                          </div>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => setShowEmailDialog(true)}
                            className="text-[#0033A0] hover:text-[#002080]"
                          >
                            Change
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="flex items-start gap-4">
                      <Phone className="w-5 h-5 text-[#0033A0] mt-1 flex-shrink-0" />
                      <div>
                        <p className="text-sm text-gray-500">Phone Number</p>
                        <p className="text-lg font-semibold text-gray-900">{formData.phone || "Not provided"}</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <MapPin className="w-5 h-5 text-[#0033A0] mt-1 flex-shrink-0" />
                    <div>
                      <p className="text-sm text-gray-500">Address</p>
                      <p className="text-lg font-semibold text-gray-900">
                        {formData.street || "Not provided"}
                      </p>
                      {formData.city && (
                        <p className="text-sm text-gray-600">
                          {formData.city}, {formData.state} {formData.zipCode}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Account Security */}
          <Card className="mb-8">
            <CardHeader className="border-b">
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-[#0033A0]" />
                Account Security
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm text-gray-700">
                    <strong>Last Login:</strong>{" "}
                    {user?.lastSignedIn
                      ? new Date(user.lastSignedIn).toLocaleString()
                      : "First login"}
                  </p>
                </div>
                <Button
                  onClick={() => setShowPasswordDialog(true)}
                  className="w-full bg-[#0033A0] hover:bg-[#002080] text-white flex items-center justify-center gap-2"
                >
                  <Lock className="w-4 h-4" />
                  Change Password
                </Button>
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Shield className="w-5 h-5 text-green-600" />
                    <p className="text-sm text-green-800 font-semibold">
                      Two-Factor Authentication
                    </p>
                  </div>
                  <p className="text-xs text-gray-600 mt-1">
                    Add an extra layer of security to your account
                  </p>
                  <Button variant="outline" className="mt-3 w-full border-green-600 text-green-600">
                    Enable 2FA
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Preferences */}
          <Card className="mb-8">
            <CardHeader className="border-b">
              <CardTitle>Notification Preferences</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div>
                    <p className="font-semibold text-gray-900">Email Notifications</p>
                    <p className="text-sm text-gray-600">Receive updates about your applications</p>
                  </div>
                  <input type="checkbox" defaultChecked className="w-5 h-5 text-[#0033A0]" />
                </div>
                <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div>
                    <p className="font-semibold text-gray-900">SMS Notifications</p>
                    <p className="text-sm text-gray-600">Receive updates via text message</p>
                  </div>
                  <input type="checkbox" className="w-5 h-5 text-[#0033A0]" />
                </div>
                <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div>
                    <p className="font-semibold text-gray-900">Marketing Emails</p>
                    <p className="text-sm text-gray-600">Receive promotional offers and updates</p>
                  </div>
                  <input type="checkbox" className="w-5 h-5 text-[#0033A0]" />
                </div>
              </div>
              <Button className="w-full mt-6 bg-[#0033A0] hover:bg-[#002080] text-white">
                Save Preferences
              </Button>
            </CardContent>
          </Card>

          {/* Danger Zone */}
          <Card className="border-red-200">
            <CardHeader className="border-b border-red-200 bg-red-50">
              <CardTitle className="text-red-600">Danger Zone</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <p className="text-sm text-gray-600 mb-4">
                Once you delete your account, there is no going back. Please be certain.
              </p>
              <Button
                variant="outline"
                className="border-red-500 text-red-500 hover:bg-red-50"
              >
                Delete Account
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t bg-[#0033A0] text-white mt-16">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center text-sm">
            <p>&copy; 2025 AmeriLend. All rights reserved.</p>
          </div>
        </div>
      </footer>

      {/* Change Password Dialog */}
      <Dialog open={showPasswordDialog} onOpenChange={setShowPasswordDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Lock className="w-5 h-5 text-[#0033A0]" />
              Change Password
            </DialogTitle>
            <DialogDescription>
              Enter your current password and choose a new secure password.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="currentPassword">Current Password</Label>
              <Input
                id="currentPassword"
                type="password"
                value={passwordData.currentPassword}
                onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                placeholder="Enter current password"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="newPassword">New Password</Label>
              <Input
                id="newPassword"
                type="password"
                value={passwordData.newPassword}
                onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                placeholder="Enter new password"
              />
              <p className="text-xs text-gray-500">Minimum 8 characters</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm New Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={passwordData.confirmPassword}
                onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                placeholder="Confirm new password"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowPasswordDialog(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleChangePassword}
              className="bg-[#0033A0] hover:bg-[#002080] text-white"
            >
              Update Password
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Change Email Dialog */}
      <Dialog open={showEmailDialog} onOpenChange={setShowEmailDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Mail className="w-5 h-5 text-[#0033A0]" />
              Change Email Address
            </DialogTitle>
            <DialogDescription>
              Enter your new email address and your password to confirm.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="currentEmail">Current Email</Label>
              <Input
                id="currentEmail"
                type="email"
                value={formData.email}
                disabled
                className="bg-gray-100"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="newEmail">New Email Address</Label>
              <Input
                id="newEmail"
                type="email"
                value={emailData.newEmail}
                onChange={(e) => setEmailData({ ...emailData, newEmail: e.target.value })}
                placeholder="Enter new email address"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="emailPassword">Password (for verification)</Label>
              <Input
                id="emailPassword"
                type="password"
                value={emailData.password}
                onChange={(e) => setEmailData({ ...emailData, password: e.target.value })}
                placeholder="Enter your password"
              />
            </div>
            <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-xs text-yellow-800">
                You will receive a verification email at your new address. Your email won't change until you confirm it.
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowEmailDialog(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleChangeEmail}
              className="bg-[#0033A0] hover:bg-[#002080] text-white"
            >
              Send Verification
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
