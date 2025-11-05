import { useState } from "react";
import { AnimatedCheckbox } from "@/components/ui/animated-checkbox";
import { FlipCheckbox } from "@/components/ui/flip-checkbox";
import { Checkbox } from "@/components/ui/checkbox";

/**
 * CheckboxExamples - Demonstrates all three checkbox types
 * This is a reference implementation showing how to use each checkbox variant
 */
export function CheckboxExamples() {
  const [animatedStates, setAnimatedStates] = useState<Record<string, boolean>>({
    newsletter: false,
    marketing: false,
    updates: false,
  });

  const [flipStates, setFlipStates] = useState<Record<string, boolean>>({
    terms: false,
    privacy: false,
    premium: false,
  });

  const handleAnimatedChange = (id: string, checked: boolean) => {
    setAnimatedStates((prev) => ({ ...prev, [id]: checked }));
  };

  const handleFlipChange = (id: string, checked: boolean) => {
    setFlipStates((prev) => ({ ...prev, [id]: checked }));
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-8 space-y-12">
      {/* Standard Checkbox Examples */}
      <section className="space-y-4">
        <h2 className="text-2xl font-bold">Standard Checkboxes</h2>
        <p className="text-gray-600">
          Default Radix UI checkboxes - use for consistency with other UI components
        </p>
        <div className="space-y-2 p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center gap-2">
            <Checkbox id="standard-1" />
            <label htmlFor="standard-1" className="cursor-pointer">
              Option 1
            </label>
          </div>
          <div className="flex items-center gap-2">
            <Checkbox id="standard-2" />
            <label htmlFor="standard-2" className="cursor-pointer">
              Option 2
            </label>
          </div>
          <div className="flex items-center gap-2">
            <Checkbox id="standard-3" disabled />
            <label htmlFor="standard-3" className="cursor-pointer text-gray-500">
              Option 3 (disabled)
            </label>
          </div>
        </div>
      </section>

      {/* Animated Checkbox Examples */}
      <section className="space-y-4">
        <h2 className="text-2xl font-bold">Animated Checkboxes</h2>
        <p className="text-gray-600">
          Smooth scale and color transitions - perfect for preferences and
          subscriptions
        </p>
        <div className="space-y-3 p-4 bg-blue-50 rounded-lg">
          <AnimatedCheckbox
            id="newsletter"
            label="Subscribe to newsletter"
            checked={animatedStates.newsletter}
            onChange={(e) => handleAnimatedChange("newsletter", e.target.checked)}
          />
          <AnimatedCheckbox
            id="marketing"
            label="Allow marketing communications"
            checked={animatedStates.marketing}
            onChange={(e) => handleAnimatedChange("marketing", e.target.checked)}
          />
          <AnimatedCheckbox
            id="updates"
            label="Get product updates"
            checked={animatedStates.updates}
            onChange={(e) => handleAnimatedChange("updates", e.target.checked)}
          />
          <AnimatedCheckbox
            id="disabled-animated"
            label="Disabled checkbox"
            disabled
          />
        </div>

        {/* Show selected state */}
        {Object.values(animatedStates).some((v) => v) && (
          <div className="text-sm text-gray-600 p-3 bg-white rounded-lg">
            Selected: {Object.keys(animatedStates).filter((k) => animatedStates[k]).join(", ")}
          </div>
        )}
      </section>

      {/* Flip Checkbox Examples */}
      <section className="space-y-4">
        <h2 className="text-2xl font-bold">Flip Checkboxes (3D)</h2>
        <p className="text-gray-600">
          Premium 3D flip animation - ideal for important agreements and premium
          features
        </p>
        <div className="space-y-4 p-4 bg-purple-50 rounded-lg">
          <FlipCheckbox
            id="terms"
            label="I agree to Terms & Conditions"
            checked={flipStates.terms}
            onChange={(e) => handleFlipChange("terms", e.target.checked)}
          />
          <FlipCheckbox
            id="privacy"
            label="I agree to Privacy Policy"
            checked={flipStates.privacy}
            onChange={(e) => handleFlipChange("privacy", e.target.checked)}
          />
          <FlipCheckbox
            id="premium"
            label="Enable premium features"
            checked={flipStates.premium}
            onChange={(e) => handleFlipChange("premium", e.target.checked)}
          />
        </div>

        {/* Status display */}
        {flipStates.terms && flipStates.privacy ? (
          <div className="p-4 bg-green-100 text-green-800 rounded-lg">
            ✓ All agreements accepted! You can proceed.
          </div>
        ) : (
          <div className="p-4 bg-yellow-100 text-yellow-800 rounded-lg">
            Please accept all agreements to continue
          </div>
        )}
      </section>

      {/* Comparison Table */}
      <section className="space-y-4">
        <h2 className="text-2xl font-bold">Comparison</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="bg-gray-200">
                <th className="border p-2 text-left">Feature</th>
                <th className="border p-2 text-center">Standard</th>
                <th className="border p-2 text-center">Animated</th>
                <th className="border p-2 text-center">Flip</th>
              </tr>
            </thead>
            <tbody>
              <tr className="hover:bg-gray-50">
                <td className="border p-2">Animation</td>
                <td className="border p-2 text-center">None</td>
                <td className="border p-2 text-center">Scale + Color</td>
                <td className="border p-2 text-center">3D Flip</td>
              </tr>
              <tr className="hover:bg-gray-50">
                <td className="border p-2">Complexity</td>
                <td className="border p-2 text-center">Low</td>
                <td className="border p-2 text-center">Medium</td>
                <td className="border p-2 text-center">High</td>
              </tr>
              <tr className="hover:bg-gray-50">
                <td className="border p-2">Best For</td>
                <td className="border p-2 text-center">Data tables, forms</td>
                <td className="border p-2 text-center">Preferences, subscriptions</td>
                <td className="border p-2 text-center">Agreements, premium features</td>
              </tr>
              <tr className="hover:bg-gray-50">
                <td className="border p-2">Label Support</td>
                <td className="border p-2 text-center">Manual</td>
                <td className="border p-2 text-center">Built-in</td>
                <td className="border p-2 text-center">Built-in</td>
              </tr>
              <tr className="hover:bg-gray-50">
                <td className="border p-2">Accessible</td>
                <td className="border p-2 text-center">✓</td>
                <td className="border p-2 text-center">✓</td>
                <td className="border p-2 text-center">✓</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* Integration Example */}
      <section className="space-y-4">
        <h2 className="text-2xl font-bold">Real-World Form Example</h2>
        <form className="space-y-6 p-6 bg-white border rounded-lg">
          <div className="space-y-2">
            <h3 className="font-semibold">Loan Agreement</h3>
            <div className="space-y-2">
              <FlipCheckbox
                id="disclosure"
                label="I have read and understand the Truth in Lending Act disclosure"
              />
              <FlipCheckbox
                id="authorization"
                label="I authorize this credit inquiry"
              />
            </div>
          </div>

          <div className="space-y-2">
            <h3 className="font-semibold">Preferences</h3>
            <div className="space-y-2">
              <AnimatedCheckbox
                id="email-updates"
                label="Send me email updates about my loan"
              />
              <AnimatedCheckbox
                id="sms-alerts"
                label="Send me SMS alerts for important updates"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Submit Application
          </button>
        </form>
      </section>
    </div>
  );
}

export default CheckboxExamples;
