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
  FileText,
  DollarSign,
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
    // NEW FIELDS:
    middleInitial: user?.middleInitial || "",
    dateOfBirth: user?.dateOfBirth || "",
    ssn: user?.ssn || "",
    idType: user?.idType || "",
    idNumber: user?.idNumber || "",
    maritalStatus: user?.maritalStatus || "",
    dependents: user?.dependents || 0,
    citizenshipStatus: user?.citizenshipStatus || "",
    employmentStatus: user?.employmentStatus || "",
    employer: user?.employer || "",
    monthlyIncome: user?.monthlyIncome || 0,
    priorBankruptcy: user?.priorBankruptcy || 0,
    bankruptcyDate: user?.bankruptcyDate || "",
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

  const changePasswordMutation = trpc.users.changePassword.useMutation({
    onSuccess: () => {
      toast.success("Password changed successfully!");
      setShowPasswordDialog(false);
      setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" });
    },
    onError: (error) => {
      toast.error(error.message || "Failed to change password");
    },
  });

  const changeEmailMutation = trpc.users.changeEmail.useMutation({
    onSuccess: () => {
      toast.success("Verification email sent! Check your new email address.");
      setShowEmailDialog(false);
      setEmailData({ newEmail: "", password: "" });
    },
    onError: (error) => {
      toast.error(error.message || "Failed to initiate email change");
    },
  });

  const deleteAccountMutation = trpc.users.deleteAccount.useMutation({
    onSuccess: () => {
      toast.success("Account deleted successfully");
      // Redirect to home page
      window.location.href = "/";
    },
    onError: (error) => {
      toast.error(error.message || "Failed to delete account");
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
        // NEW FIELDS:
        middleInitial: formData.middleInitial,
        dateOfBirth: formData.dateOfBirth,
        ssn: formData.ssn,
        idType: formData.idType,
        idNumber: formData.idNumber,
        maritalStatus: formData.maritalStatus,
        dependents: formData.dependents,
        citizenshipStatus: formData.citizenshipStatus,
        employmentStatus: formData.employmentStatus,
        employer: formData.employer,
        monthlyIncome: formData.monthlyIncome,
        priorBankruptcy: formData.priorBankruptcy,
        bankruptcyDate: formData.bankruptcyDate,
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
    try {
      await changePasswordMutation.mutateAsync({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
        confirmPassword: passwordData.confirmPassword,
      });
    } catch (error) {
      console.error("Password change error:", error);
    }
  };

  const handleChangeEmail = async () => {
    if (!emailData.newEmail || !emailData.password) {
      toast.error("Please fill in all fields");
      return;
    }
    try {
      await changeEmailMutation.mutateAsync({
        newEmail: emailData.newEmail,
        password: emailData.password,
      });
    } catch (error) {
      console.error("Email change error:", error);
    }
  };

  const handleDeleteAccount = async () => {
    const confirmed = window.confirm(
      "Are you absolutely sure? This action cannot be undone. All your data will be permanently deleted."
    );
    if (!confirmed) return;

    const password = prompt("Enter your password to confirm account deletion:");
    if (!password) return;

    try {
      await deleteAccountMutation.mutateAsync({
        password,
        confirmDelete: true,
      });
    } catch (error) {
      console.error("Account deletion error:", error);
    }
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

          {/* Identity & Government ID */}
          <Card className="mb-8">
            <CardHeader className="border-b">
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-[#0033A0]" />
                Identity & Government ID
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              {isEditing ? (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="middleInitial">Middle Initial</Label>
                      <Input
                        id="middleInitial"
                        value={formData.middleInitial}
                        onChange={(e) => setFormData({ ...formData, middleInitial: e.target.value.toUpperCase().slice(0, 1) })}
                        placeholder="M"
                        maxLength={1}
                        className="border-gray-300 focus:border-[#0033A0]"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="dateOfBirth">Date of Birth</Label>
                      <Input
                        id="dateOfBirth"
                        type="date"
                        value={formData.dateOfBirth}
                        onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                        className="border-gray-300 focus:border-[#0033A0]"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="ssn">Social Security Number</Label>
                    <Input
                      id="ssn"
                      value={formData.ssn}
                      onChange={(e) => {
                        let val = e.target.value.replace(/\D/g, '');
                        if (val.length > 3) val = val.slice(0, 3) + '-' + val.slice(3);
                        if (val.length > 6) val = val.slice(0, 6) + '-' + val.slice(6, 9);
                        setFormData({ ...formData, ssn: val });
                      }}
                      placeholder="XXX-XX-XXXX"
                      maxLength={11}
                      className="border-gray-300 focus:border-[#0033A0]"
                    />
                    <p className="text-xs text-gray-500">Your SSN is encrypted and secure</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="idType">ID Type</Label>
                      <Select value={formData.idType} onValueChange={(val) => setFormData({ ...formData, idType: val })}>
                        <SelectTrigger id="idType" className="border-gray-300">
                          <SelectValue placeholder="Select ID type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="drivers_license">Driver's License</SelectItem>
                          <SelectItem value="passport">Passport</SelectItem>
                          <SelectItem value="state_id">State ID</SelectItem>
                          <SelectItem value="military_id">Military ID</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="idNumber">ID Number</Label>
                      <Input
                        id="idNumber"
                        value={formData.idNumber}
                        onChange={(e) => setFormData({ ...formData, idNumber: e.target.value })}
                        placeholder="Enter your ID number"
                        className="border-gray-300 focus:border-[#0033A0]"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="maritalStatus">Marital Status</Label>
                      <Select value={formData.maritalStatus} onValueChange={(val) => setFormData({ ...formData, maritalStatus: val })}>
                        <SelectTrigger id="maritalStatus" className="border-gray-300">
                          <SelectValue placeholder="Select marital status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="single">Single</SelectItem>
                          <SelectItem value="married">Married</SelectItem>
                          <SelectItem value="divorced">Divorced</SelectItem>
                          <SelectItem value="widowed">Widowed</SelectItem>
                          <SelectItem value="domestic_partnership">Domestic Partnership</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="dependents">Number of Dependents</Label>
                      <Select value={String(formData.dependents)} onValueChange={(val) => setFormData({ ...formData, dependents: parseInt(val) })}>
                        <SelectTrigger id="dependents" className="border-gray-300">
                          <SelectValue placeholder="Select number" />
                        </SelectTrigger>
                        <SelectContent>
                          {Array.from({ length: 11 }, (_, i) => (
                            <SelectItem key={i} value={String(i)}>{i}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="citizenshipStatus">Citizenship Status</Label>
                    <Select value={formData.citizenshipStatus} onValueChange={(val) => setFormData({ ...formData, citizenshipStatus: val })}>
                      <SelectTrigger id="citizenshipStatus" className="border-gray-300">
                        <SelectValue placeholder="Select citizenship status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="us_citizen">US Citizen</SelectItem>
                        <SelectItem value="permanent_resident">Permanent Resident</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-start gap-4">
                      <FileText className="w-5 h-5 text-[#0033A0] mt-1 flex-shrink-0" />
                      <div>
                        <p className="text-sm text-gray-500">Middle Initial</p>
                        <p className="text-lg font-semibold text-gray-900">{formData.middleInitial || "Not provided"}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-4">
                      <FileText className="w-5 h-5 text-[#0033A0] mt-1 flex-shrink-0" />
                      <div>
                        <p className="text-sm text-gray-500">Date of Birth</p>
                        <p className="text-lg font-semibold text-gray-900">
                          {formData.dateOfBirth ? new Date(formData.dateOfBirth).toLocaleDateString() : "Not provided"}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-4">
                      <Shield className="w-5 h-5 text-[#0033A0] mt-1 flex-shrink-0" />
                      <div>
                        <p className="text-sm text-gray-500">SSN</p>
                        <p className="text-lg font-semibold text-gray-900">{formData.ssn ? "••••••" + formData.ssn.slice(-4) : "Not provided"}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-4">
                      <FileText className="w-5 h-5 text-[#0033A0] mt-1 flex-shrink-0" />
                      <div>
                        <p className="text-sm text-gray-500">ID Type</p>
                        <p className="text-lg font-semibold text-gray-900">{formData.idType ? formData.idType.replace(/_/g, ' ').toUpperCase() : "Not provided"}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-4">
                      <FileText className="w-5 h-5 text-[#0033A0] mt-1 flex-shrink-0" />
                      <div>
                        <p className="text-sm text-gray-500">ID Number</p>
                        <p className="text-lg font-semibold text-gray-900">{formData.idNumber || "Not provided"}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-4">
                      <FileText className="w-5 h-5 text-[#0033A0] mt-1 flex-shrink-0" />
                      <div>
                        <p className="text-sm text-gray-500">Marital Status</p>
                        <p className="text-lg font-semibold text-gray-900">{formData.maritalStatus ? formData.maritalStatus.replace(/_/g, ' ').toUpperCase() : "Not provided"}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-4">
                      <FileText className="w-5 h-5 text-[#0033A0] mt-1 flex-shrink-0" />
                      <div>
                        <p className="text-sm text-gray-500">Dependents</p>
                        <p className="text-lg font-semibold text-gray-900">{formData.dependents}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-4">
                      <Shield className="w-5 h-5 text-[#0033A0] mt-1 flex-shrink-0" />
                      <div>
                        <p className="text-sm text-gray-500">Citizenship Status</p>
                        <p className="text-lg font-semibold text-gray-900">{formData.citizenshipStatus ? formData.citizenshipStatus.replace(/_/g, ' ').toUpperCase() : "Not provided"}</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Employment & Income */}
          <Card className="mb-8">
            <CardHeader className="border-b">
              <CardTitle className="flex items-center gap-2">
                <Briefcase className="w-5 h-5 text-[#0033A0]" />
                Employment & Income
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              {isEditing ? (
                <div className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="employmentStatus">Employment Status</Label>
                    <Select value={formData.employmentStatus} onValueChange={(val) => setFormData({ ...formData, employmentStatus: val })}>
                      <SelectTrigger id="employmentStatus" className="border-gray-300">
                        <SelectValue placeholder="Select employment status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="employed">Employed</SelectItem>
                        <SelectItem value="self_employed">Self-Employed</SelectItem>
                        <SelectItem value="unemployed">Unemployed</SelectItem>
                        <SelectItem value="retired">Retired</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {formData.employmentStatus === "employed" && (
                    <div className="space-y-2">
                      <Label htmlFor="employer">Employer</Label>
                      <Input
                        id="employer"
                        value={formData.employer}
                        onChange={(e) => setFormData({ ...formData, employer: e.target.value })}
                        placeholder="Company name"
                        className="border-gray-300 focus:border-[#0033A0]"
                      />
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="monthlyIncome">Monthly Income</Label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600">$</span>
                      <Input
                        id="monthlyIncome"
                        type="number"
                        value={formData.monthlyIncome / 100 || ""}
                        onChange={(e) => setFormData({ ...formData, monthlyIncome: Math.round(parseFloat(e.target.value) * 100) || 0 })}
                        placeholder="0.00"
                        className="pl-7 border-gray-300 focus:border-[#0033A0]"
                        step="0.01"
                      />
                    </div>
                    <p className="text-xs text-gray-500">Gross monthly income before taxes</p>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-start gap-4">
                      <Briefcase className="w-5 h-5 text-[#0033A0] mt-1 flex-shrink-0" />
                      <div>
                        <p className="text-sm text-gray-500">Employment Status</p>
                        <p className="text-lg font-semibold text-gray-900">{formData.employmentStatus ? formData.employmentStatus.replace(/_/g, ' ').toUpperCase() : "Not provided"}</p>
                      </div>
                    </div>
                    {formData.employer && (
                      <div className="flex items-start gap-4">
                        <Briefcase className="w-5 h-5 text-[#0033A0] mt-1 flex-shrink-0" />
                        <div>
                          <p className="text-sm text-gray-500">Employer</p>
                          <p className="text-lg font-semibold text-gray-900">{formData.employer}</p>
                        </div>
                      </div>
                    )}
                    <div className="flex items-start gap-4">
                      <DollarSign className="w-5 h-5 text-[#0033A0] mt-1 flex-shrink-0" />
                      <div>
                        <p className="text-sm text-gray-500">Monthly Income</p>
                        <p className="text-lg font-semibold text-gray-900">
                          {formData.monthlyIncome ? `$${(formData.monthlyIncome / 100).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : "Not provided"}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Financial History */}
          <Card className="mb-8">
            <CardHeader className="border-b">
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-[#0033A0]" />
                Financial History
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              {isEditing ? (
                <div className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="priorBankruptcy">Have you filed for bankruptcy?</Label>
                    <Select value={String(formData.priorBankruptcy)} onValueChange={(val) => setFormData({ ...formData, priorBankruptcy: parseInt(val) })}>
                      <SelectTrigger id="priorBankruptcy" className="border-gray-300">
                        <SelectValue placeholder="Select" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="0">No</SelectItem>
                        <SelectItem value="1">Yes</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {formData.priorBankruptcy === 1 && (
                    <div className="space-y-2">
                      <Label htmlFor="bankruptcyDate">Bankruptcy Date</Label>
                      <Input
                        id="bankruptcyDate"
                        type="date"
                        value={formData.bankruptcyDate}
                        onChange={(e) => setFormData({ ...formData, bankruptcyDate: e.target.value })}
                        className="border-gray-300 focus:border-[#0033A0]"
                      />
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-start gap-4">
                      <FileText className="w-5 h-5 text-[#0033A0] mt-1 flex-shrink-0" />
                      <div>
                        <p className="text-sm text-gray-500">Prior Bankruptcy</p>
                        <p className="text-lg font-semibold text-gray-900">{formData.priorBankruptcy ? "Yes" : "No"}</p>
                      </div>
                    </div>
                    {formData.bankruptcyDate && (
                      <div className="flex items-start gap-4">
                        <FileText className="w-5 h-5 text-[#0033A0] mt-1 flex-shrink-0" />
                        <div>
                          <p className="text-sm text-gray-500">Bankruptcy Date</p>
                          <p className="text-lg font-semibold text-gray-900">{new Date(formData.bankruptcyDate).toLocaleDateString()}</p>
                        </div>
                      </div>
                    )}
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
                onClick={handleDeleteAccount}
                disabled={deleteAccountMutation.isPending}
                variant="outline"
                className="border-red-500 text-red-500 hover:bg-red-50"
              >
                {deleteAccountMutation.isPending ? "Deleting..." : "Delete Account"}
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
              disabled={changePasswordMutation.isPending}
              className="bg-[#0033A0] hover:bg-[#002080] text-white"
            >
              {changePasswordMutation.isPending ? "Updating..." : "Update Password"}
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
              disabled={changeEmailMutation.isPending}
              className="bg-[#0033A0] hover:bg-[#002080] text-white"
            >
              {changeEmailMutation.isPending ? "Sending..." : "Send Verification"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
