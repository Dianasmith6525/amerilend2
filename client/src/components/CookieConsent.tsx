import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { X, Cookie, Settings } from "lucide-react";
import { useState, useEffect } from "react";
import { Link } from "wouter";

const COOKIE_CONSENT_KEY = "amerilend_cookie_consent";
const COOKIE_PREFERENCES_KEY = "amerilend_cookie_preferences";

type CookiePreferences = {
  necessary: boolean;
  analytics: boolean;
  marketing: boolean;
};

const defaultPreferences: CookiePreferences = {
  necessary: true,
  analytics: false,
  marketing: false,
};

export function CookieConsent() {
  const [isVisible, setIsVisible] = useState(false);
  const [showPreferences, setShowPreferences] = useState(false);
  const [preferences, setPreferences] = useState<CookiePreferences>(defaultPreferences);

  useEffect(() => {
    const consent = localStorage.getItem(COOKIE_CONSENT_KEY);
    if (!consent) {
      // Show banner after a short delay
      setTimeout(() => setIsVisible(true), 1000);
    } else {
      // Load saved preferences
      const savedPrefs = localStorage.getItem(COOKIE_PREFERENCES_KEY);
      if (savedPrefs) {
        try {
          setPreferences(JSON.parse(savedPrefs));
        } catch (e) {
          console.error("Failed to parse cookie preferences:", e);
        }
      }
    }
  }, []);

  const handleAcceptAll = () => {
    const allAccepted: CookiePreferences = {
      necessary: true,
      analytics: true,
      marketing: true,
    };
    saveConsent(allAccepted);
  };

  const handleAcceptNecessary = () => {
    saveConsent(defaultPreferences);
  };

  const handleSavePreferences = () => {
    saveConsent(preferences);
  };

  const saveConsent = (prefs: CookiePreferences) => {
    localStorage.setItem(COOKIE_CONSENT_KEY, "true");
    localStorage.setItem(COOKIE_PREFERENCES_KEY, JSON.stringify(prefs));
    setPreferences(prefs);
    setIsVisible(false);
    setShowPreferences(false);

    // Trigger analytics initialization if enabled
    if (prefs.analytics) {
      console.log("[Cookies] Analytics enabled");
      // TODO: Initialize analytics here (Google Analytics, etc.)
    }

    // Trigger marketing cookies if enabled
    if (prefs.marketing) {
      console.log("[Cookies] Marketing cookies enabled");
      // TODO: Initialize marketing pixels here (Facebook, Google Ads, etc.)
    }
  };

  if (!isVisible) return null;

  return (
    <>
      {/* Overlay for preferences modal */}
      {showPreferences && (
        <div className="fixed inset-0 bg-black/50 z-[9998]" onClick={() => setShowPreferences(false)} />
      )}

      {/* Cookie Consent Banner */}
      {!showPreferences ? (
        <div className="fixed bottom-0 left-0 right-0 z-[9999] p-4 animate-in slide-in-from-bottom duration-300">
          <Card className="max-w-5xl mx-auto bg-white shadow-2xl border-2 border-[#0033A0]/20">
            <div className="p-6">
              <div className="flex items-start gap-4">
                {/* Cookie Icon */}
                <div className="flex-shrink-0 w-12 h-12 bg-[#0033A0]/10 rounded-full flex items-center justify-center">
                  <Cookie className="w-6 h-6 text-[#0033A0]" />
                </div>

                {/* Content */}
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-[#0033A0] mb-2">
                    We Value Your Privacy
                  </h3>
                  <p className="text-sm text-gray-700 mb-4">
                    We use cookies to enhance your browsing experience, provide personalized content, and analyze our traffic. 
                    By clicking "Accept All", you consent to our use of cookies. You can also customize your preferences or accept only necessary cookies.
                  </p>
                  <p className="text-xs text-gray-500">
                    Read our{" "}
                    <Link href="/privacy-policy" className="text-[#0033A0] underline hover:text-[#002080]">
                      Privacy Policy
                    </Link>{" "}
                    and{" "}
                    <Link href="/legal/cookie_policy" className="text-[#0033A0] underline hover:text-[#002080]">
                      Cookie Policy
                    </Link>{" "}
                    to learn more about how we use cookies.
                  </p>
                </div>

                {/* Close button */}
                <button
                  onClick={() => setIsVisible(false)}
                  className="flex-shrink-0 text-gray-400 hover:text-gray-600 transition-colors"
                  aria-label="Close"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 mt-6">
                <Button
                  onClick={handleAcceptAll}
                  className="bg-[#FFA500] hover:bg-[#FF8C00] text-white font-semibold px-8"
                >
                  Accept All Cookies
                </Button>
                <Button
                  onClick={handleAcceptNecessary}
                  variant="outline"
                  className="border-[#0033A0] text-[#0033A0] hover:bg-[#0033A0] hover:text-white font-semibold px-8"
                >
                  Necessary Only
                </Button>
                <Button
                  onClick={() => setShowPreferences(true)}
                  variant="outline"
                  className="border-gray-300 text-gray-700 hover:bg-gray-50 px-8"
                >
                  <Settings className="w-4 h-4 mr-2" />
                  Customize
                </Button>
              </div>
            </div>
          </Card>
        </div>
      ) : (
        /* Preferences Modal */
        <div className="fixed inset-0 flex items-center justify-center z-[9999] p-4">
          <Card className="max-w-2xl w-full bg-white shadow-2xl border-2 border-[#0033A0]/20 max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-[#0033A0]">
                  Cookie Preferences
                </h3>
                <button
                  onClick={() => setShowPreferences(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                  aria-label="Close"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <p className="text-sm text-gray-700 mb-6">
                We use different types of cookies to optimize your experience on our website. 
                You can choose which categories of cookies you want to allow.
              </p>

              {/* Cookie Categories */}
              <div className="space-y-4 mb-6">
                {/* Necessary Cookies */}
                <div className="border rounded-lg p-4 bg-gray-50">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <h4 className="font-bold text-gray-900 mb-1">
                        Necessary Cookies
                        <span className="ml-2 text-xs bg-gray-200 text-gray-700 px-2 py-1 rounded">
                          Always Active
                        </span>
                      </h4>
                      <p className="text-sm text-gray-600">
                        These cookies are essential for the website to function properly. They enable core functionality 
                        such as security, authentication, and accessibility features. The website cannot function properly without these cookies.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Analytics Cookies */}
                <div className="border rounded-lg p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1 pr-4">
                      <h4 className="font-bold text-gray-900 mb-1">Analytics Cookies</h4>
                      <p className="text-sm text-gray-600">
                        These cookies help us understand how visitors interact with our website by collecting and reporting 
                        information anonymously. This helps us improve our website's performance and user experience.
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer flex-shrink-0">
                      <input
                        type="checkbox"
                        checked={preferences.analytics}
                        onChange={(e) =>
                          setPreferences({ ...preferences, analytics: e.target.checked })
                        }
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#0033A0]/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#0033A0]"></div>
                    </label>
                  </div>
                </div>

                {/* Marketing Cookies */}
                <div className="border rounded-lg p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1 pr-4">
                      <h4 className="font-bold text-gray-900 mb-1">Marketing Cookies</h4>
                      <p className="text-sm text-gray-600">
                        These cookies are used to track visitors across websites. The intention is to display ads that 
                        are relevant and engaging, which are more valuable for publishers and third-party advertisers.
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer flex-shrink-0">
                      <input
                        type="checkbox"
                        checked={preferences.marketing}
                        onChange={(e) =>
                          setPreferences({ ...preferences, marketing: e.target.checked })
                        }
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#0033A0]/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#0033A0]"></div>
                    </label>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t">
                <Button
                  onClick={handleSavePreferences}
                  className="bg-[#FFA500] hover:bg-[#FF8C00] text-white font-semibold px-8 flex-1"
                >
                  Save My Preferences
                </Button>
                <Button
                  onClick={handleAcceptAll}
                  variant="outline"
                  className="border-[#0033A0] text-[#0033A0] hover:bg-[#0033A0] hover:text-white font-semibold px-8 flex-1"
                >
                  Accept All
                </Button>
              </div>

              {/* Additional Links */}
              <div className="mt-4 pt-4 border-t text-center text-xs text-gray-500">
                <p>
                  Learn more about our data practices in our{" "}
                  <Link href="/privacy-policy">
                    <a className="text-[#0033A0] underline hover:text-[#002080]">
                      Privacy Policy
                    </a>
                  </Link>
                </p>
              </div>
            </div>
          </Card>
        </div>
      )}
    </>
  );
}
