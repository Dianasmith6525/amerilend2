import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { trpc } from "@/lib/trpc";
import { Copy, Check, Users, DollarSign, TrendingUp } from "lucide-react";
import { toast } from "sonner";

export function ReferralComponent() {
  const [copied, setCopied] = useState(false);
  const [shareUrl, setShareUrl] = useState("");

  // Get user's referral code
  const { data: codeData, isLoading: codeLoading } = trpc.referrals.getMyCode.useQuery();

  // Get referral statistics
  const { data: statsData, isLoading: statsLoading } = trpc.referrals.getStats.useQuery();

  // Get list of referrals made by user
  const { data: referralsData, isLoading: referralsLoading } = trpc.referrals.getMyReferrals.useQuery();

  const referralCode = codeData?.code;
  const stats = statsData?.stats;
  const myReferrals = referralsData?.referrals || [];

  useEffect(() => {
    if (referralCode) {
      // Build share URL
      const baseUrl = window.location.origin;
      const url = `${baseUrl}/signup?referral=${referralCode}`;
      setShareUrl(url);
    }
  }, [referralCode]);

  const handleCopyCode = async () => {
    if (referralCode) {
      try {
        await navigator.clipboard.writeText(referralCode);
        setCopied(true);
        toast.success("Referral code copied!");
        setTimeout(() => setCopied(false), 2000);
      } catch (error) {
        toast.error("Failed to copy code");
      }
    }
  };

  const handleCopyUrl = async () => {
    if (shareUrl) {
      try {
        await navigator.clipboard.writeText(shareUrl);
        setCopied(true);
        toast.success("Share link copied!");
        setTimeout(() => setCopied(false), 2000);
      } catch (error) {
        toast.error("Failed to copy link");
      }
    }
  };

  const handleShareEmail = () => {
    if (shareUrl) {
      const subject = "Join AmeriLend and Get $25 Off";
      const body = `I found this great platform for personal loans. Use my referral link to get $25 off your first application:\n\n${shareUrl}\n\nWe both get rewards when you apply!`;
      window.location.href = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    }
  };

  if (codeLoading || statsLoading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="animate-pulse text-center text-gray-500">Loading referral data...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Your Referral Code Section */}
      <Card className="border-2 border-[#0033A0]">
        <CardHeader className="bg-gradient-to-r from-[#0033A0] to-[#0052CC] text-white">
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Your Referral Code
          </CardTitle>
          <CardDescription className="text-blue-100">
            Share your unique code and earn $50 for each person who applies
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          {referralCode ? (
            <div className="space-y-4">
              {/* Code Display */}
              <div className="flex gap-2">
                <Input
                  readOnly
                  value={referralCode}
                  className="font-mono text-lg font-bold text-center bg-gray-50"
                />
                <Button
                  onClick={handleCopyCode}
                  variant="outline"
                  className="gap-2"
                >
                  {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  {copied ? "Copied" : "Copy"}
                </Button>
              </div>

              {/* Share URL */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Shareable Link</label>
                <div className="flex gap-2">
                  <Input
                    readOnly
                    value={shareUrl}
                    className="text-sm bg-gray-50"
                  />
                  <Button
                    onClick={handleCopyUrl}
                    variant="outline"
                    className="gap-2"
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {/* Share Buttons */}
              <div className="grid grid-cols-2 gap-2">
                <Button
                  onClick={handleShareEmail}
                  className="bg-[#FFA500] hover:bg-[#FF8C00]"
                >
                  Share via Email
                </Button>
                <Button variant="outline">
                  Share on Social
                </Button>
              </div>

              {/* Reward Info */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">You Earn</p>
                    <p className="text-2xl font-bold text-[#0033A0]">
                      ${(codeData?.rewards?.referrerAmount || 0) / 100}
                    </p>
                    <p className="text-xs text-gray-500">per successful referral</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">They Save</p>
                    <p className="text-2xl font-bold text-green-600">
                      ${(codeData?.rewards?.refereeAmount || 0) / 100}
                    </p>
                    <p className="text-xs text-gray-500">application discount</p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500 mb-4">No referral code yet</p>
              <Button className="bg-[#0033A0] hover:bg-[#0024A0]">
                Generate Referral Code
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Statistics Section */}
      <div className="grid md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
              <Users className="w-4 h-4" />
              Total Referrals
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-[#0033A0]">
              {stats?.totalReferrals || 0}
            </div>
            <p className="text-xs text-gray-500 mt-1">people you've referred</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
              <DollarSign className="w-4 h-4" />
              Total Earnings
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">
              ${(stats?.totalEarnings || 0) / 100}
            </div>
            <p className="text-xs text-gray-500 mt-1">total rewards earned</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              Pending Rewards
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-orange-600">
              ${(stats?.pendingRewards || 0) / 100}
            </div>
            <p className="text-xs text-gray-500 mt-1">awaiting completion</p>
          </CardContent>
        </Card>
      </div>

      {/* Referrals List */}
      <Card>
        <CardHeader>
          <CardTitle>Your Referrals</CardTitle>
          <CardDescription>
            Track the status of people you've referred
          </CardDescription>
        </CardHeader>
        <CardContent>
          {referralsLoading ? (
            <div className="animate-pulse text-center text-gray-500">Loading referrals...</div>
          ) : myReferrals.length === 0 ? (
            <div className="text-center py-8">
              <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">No referrals yet</p>
              <p className="text-sm text-gray-400 mt-1">
                Share your code to start earning rewards!
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-semibold">Status</th>
                    <th className="text-left py-3 px-4 font-semibold">Referred Date</th>
                    <th className="text-left py-3 px-4 font-semibold">Your Reward</th>
                    <th className="text-left py-3 px-4 font-semibold">Reward Status</th>
                  </tr>
                </thead>
                <tbody>
                  {myReferrals.map((referral) => (
                    <tr key={referral.id} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4">
                        <Badge
                          variant="outline"
                          className={
                            referral.status === "completed"
                              ? "bg-green-50 text-green-700 border-green-200"
                              : referral.status === "loan_approved"
                              ? "bg-blue-50 text-blue-700 border-blue-200"
                              : "bg-yellow-50 text-yellow-700 border-yellow-200"
                          }
                        >
                          {referral.status.replace("_", " ")}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-gray-600">
                        {new Date(referral.createdAt).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-4 font-semibold">
                        ${referral.referrerRewardAmount / 100}
                      </td>
                      <td className="py-3 px-4">
                        <Badge
                          variant="outline"
                          className={
                            referral.referrerRewardStatus === "paid"
                              ? "bg-green-50 text-green-700 border-green-200"
                              : referral.referrerRewardStatus === "earned"
                              ? "bg-blue-50 text-blue-700 border-blue-200"
                              : "bg-gray-50 text-gray-700 border-gray-200"
                          }
                        >
                          {referral.referrerRewardStatus}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* How It Works */}
      <Card>
        <CardHeader>
          <CardTitle>How It Works</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <div className="flex items-center justify-center h-8 w-8 rounded-full bg-[#0033A0] text-white font-semibold">
                  1
                </div>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900">Share Your Code</h4>
                <p className="text-sm text-gray-600">
                  Send your referral code or link to friends and family
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <div className="flex items-center justify-center h-8 w-8 rounded-full bg-[#D4AF37] text-white font-semibold">
                  2
                </div>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900">They Sign Up</h4>
                <p className="text-sm text-gray-600">
                  They create an account using your referral code
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <div className="flex items-center justify-center h-8 w-8 rounded-full bg-[#FFA500] text-white font-semibold">
                  3
                </div>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900">They Apply for a Loan</h4>
                <p className="text-sm text-gray-600">
                  When they apply, they get $25 off their application fee
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <div className="flex items-center justify-center h-8 w-8 rounded-full bg-green-600 text-white font-semibold">
                  4
                </div>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900">You Earn $50</h4>
                <p className="text-sm text-gray-600">
                  Once their loan is approved, you earn $50 bonus cash
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
