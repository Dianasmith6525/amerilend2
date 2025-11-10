import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { PrimaryButton, SecondaryButton } from "@/components/ui/enhanced-buttons";
import { FeatureCard, EnhancedCard } from "@/components/ui/enhanced-cards";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import {
  CheckCircle2,
  Clock,
  Shield,
  FileText,
  Headphones,
  TrendingUp,
  ChevronDown,
  Menu,
  Phone,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { Link } from "wouter";
import { useAuth } from "@/_core/hooks/useAuth";
import { AISupportChat } from "@/components/AISupportChat";
import SEO, { StructuredData } from "@/components/SEO";

export default function Home() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { isAuthenticated } = useAuth();
  const [currentPage, setCurrentPage] = useState(0);

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  const states = [
    'Alabama', 'Alaska', 'Arizona', 'Arkansas', 'California',
    'Colorado', 'Connecticut', 'Delaware', 'Florida', 'Georgia',
    'Hawaii', 'Idaho', 'Illinois', 'Indiana', 'Iowa',
    'Kansas', 'Kentucky', 'Louisiana', 'Maine', 'Maryland',
    'Massachusetts', 'Michigan', 'Minnesota', 'Mississippi', 'Missouri',
    'Montana', 'Nebraska', 'Nevada', 'New Hampshire', 'New Jersey',
    'New Mexico', 'New York', 'North Carolina', 'North Dakota', 'Ohio',
    'Oklahoma', 'Oregon', 'Pennsylvania', 'Rhode Island', 'South Carolina',
    'South Dakota', 'Tennessee', 'Texas', 'Utah', 'Vermont',
    'Virginia', 'Washington', 'West Virginia', 'Wisconsin', 'Wyoming'
  ];
  const statesPerPage = 10;
  const totalPages = Math.ceil(states.length / statesPerPage);

  const handlePrevPage = () => {
    setCurrentPage((prev) => (prev > 0 ? prev - 1 : prev));
  };

  const handleNextPage = () => {
    setCurrentPage((prev) => (prev < totalPages - 1 ? prev + 1 : prev));
  };

  const visibleStates = states.slice(
    currentPage * statesPerPage,
    (currentPage + 1) * statesPerPage
  );
  
  return (
    <div className="min-h-screen bg-white">
      {/* SEO Meta Tags */}
      <SEO
        title="Online Loans Designed for You"
        description="AmeriLend offers personal loans from $500-$100,000 with same-day funding available. Apply online in minutes, no FICO score impact. Serving all 50 states."
        ogImage="/hero-background.jpg"
        ogType="website"
      />
      <StructuredData type="FinancialService" />
      
      {/* Header/Navigation */}
      <header className="sticky top-0 z-50 bg-white border-b shadow-sm">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="text-2xl font-bold">
              <span className="text-[#0033A0]">Ameri</span>
              <span className="text-[#D4AF37]">Lend</span>
              <sup className="text-xs text-[#0033A0]">®</sup>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-6">
              <Link href="/apply" className="text-gray-700 hover:text-[#0033A0] transition-colors">
                Loans
              </Link>
              <Link href="/check-status" className="text-gray-700 hover:text-[#0033A0] transition-colors">
                Track Application
              </Link>
              <a href="#about" className="text-gray-700 hover:text-[#0033A0] transition-colors">
                About Us
              </a>
              <a href="#faq" className="text-gray-700 hover:text-[#0033A0] transition-colors">
                Help
              </a>
              <a
                href="tel:945-212-1609"
                className="flex items-center gap-2 text-gray-700 hover:text-[#0033A0] transition-colors"
              >
                <Phone className="w-4 h-4" />
                (945) 212-1609
              </a>
            </nav>

            {/* CTA Buttons */}
            <div className="hidden md:flex items-center gap-3">
              {isAuthenticated ? (
                <>
                  <Link href="/apply">
                    <a className="inline-block">
                      <PrimaryButton icon={<ArrowRight />}>
                        Apply Now
                      </PrimaryButton>
                    </a>
                  </Link>
                  <Link href="/dashboard">
                    <a className="inline-block">
                      <SecondaryButton>
                        Dashboard
                      </SecondaryButton>
                    </a>
                  </Link>
                </>
              ) : (
                <>
                  <Link href="/apply">
                    <a className="inline-block">
                      <PrimaryButton icon={<ArrowRight />}>
                        Apply Now
                      </PrimaryButton>
                    </a>
                  </Link>
                  <Link href="/login">
                    <a className="inline-block">
                      <SecondaryButton>
                        Log In
                      </SecondaryButton>
                    </a>
                  </Link>
                </>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button
              className="md:hidden p-2"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle menu"
            >
              <Menu className="w-6 h-6 text-gray-700" />
            </button>
          </div>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <div className="md:hidden py-4 border-t">
              <nav className="flex flex-col gap-4">
                <Link href="/apply">
                  <a className="text-gray-700 hover:text-[#0033A0]">Loans</a>
                </Link>
                <Link href="/check-status">
                  <a className="text-gray-700 hover:text-[#0033A0]">Track Application</a>
                </Link>
                <a href="#about" className="text-gray-700 hover:text-[#0033A0]">
                  About Us
                </a>
                <a href="#faq" className="text-gray-700 hover:text-[#0033A0]">
                  Help
                </a>
                <Link href="/apply">
                  <a className="inline-block w-full">
                    <PrimaryButton className="w-full" icon={<ArrowRight />}>
                      Apply Now
                    </PrimaryButton>
                  </a>
                </Link>
                {isAuthenticated ? (
                  <Link href="/dashboard">
                    <a className="inline-block w-full">
                      <SecondaryButton className="w-full">
                        Dashboard
                      </SecondaryButton>
                    </a>
                  </Link>
                ) : (
                  <Link href="/login">
                    <a className="inline-block w-full">
                      <SecondaryButton className="w-full">
                        Log In
                      </SecondaryButton>
                    </a>
                  </Link>
                )}
              </nav>
            </div>
          )}
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-white py-12 sm:py-16 md:py-32">
        <div className="container mx-auto px-4 sm:px-6 md:px-8 lg:px-12 max-w-7xl">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 sm:gap-12 md:gap-16 items-center">
            {/* Hero Image */}
            <div className="order-2 md:order-1 flex items-center justify-center">
              <img
                src="/hero-background.jpg"
                alt="Happy couple reviewing loan application"
                className="shadow-lg w-full h-auto object-cover rounded-lg sm:rounded-xl"
                style={{ borderRadius: "35% 65% 64% 36% / 29% 41% 59% 71%" }}
                loading="eager"
                fetchPriority="high"
                width="600"
                height="600"
              />
            </div>

            {/* Hero Content */}
            <div className="order-1 md:order-2 px-4 sm:px-6 md:px-8">
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-[#0033A0] mb-8 sm:mb-10 leading-tight">
                Online Loans
                <br />
                Designed for You
              </h1>

              <ul className="space-y-4 sm:space-y-5 mb-10 sm:mb-12">
                <li className="flex items-start gap-3 sm:gap-4">
                  <CheckCircle2 className="w-6 h-6 sm:w-7 sm:h-7 text-green-600 flex-shrink-0 mt-1" />
                  <span className="text-gray-700 text-base sm:text-lg leading-relaxed">
                    Same-day funding available.<sup>1</sup>
                  </span>
                </li>
                <li className="flex items-start gap-3 sm:gap-4">
                  <CheckCircle2 className="w-6 h-6 sm:w-7 sm:h-7 text-green-600 flex-shrink-0 mt-1" />
                  <span className="text-gray-700 text-base sm:text-lg leading-relaxed">
                    Applying does NOT affect your FICO® credit score.<sup>2</sup>
                  </span>
                </li>
                <li className="flex items-start gap-3 sm:gap-4">
                  <CheckCircle2 className="w-6 h-6 sm:w-7 sm:h-7 text-green-600 flex-shrink-0 mt-1" />
                  <span className="text-gray-700 text-base sm:text-lg leading-relaxed">No hidden fees.</span>
                </li>
              </ul>

              <div className="flex flex-col gap-4 sm:gap-5 mb-6 sm:mb-8">
                <Link href="/apply">
                  <a className="inline-block w-full">
                    <PrimaryButton className="btn-lg w-full text-base sm:text-lg py-3 sm:py-4" icon={<ArrowRight />}>
                      Apply Now
                    </PrimaryButton>
                  </a>
                </Link>
                <Link href="/pre-qualify">
                  <a className="inline-block w-full">
                    <SecondaryButton className="btn-lg w-full text-base sm:text-lg py-3 sm:py-4">
                      Check If You Pre-Qualify
                    </SecondaryButton>
                  </a>
                </Link>
                <Link href="/check-status">
                  <a className="inline-block w-full">
                    <SecondaryButton className="btn-lg w-full text-base sm:text-lg py-3 sm:py-4">
                      Track Your Application
                    </SecondaryButton>
                  </a>
                </Link>
              </div>

              <p className="text-sm sm:text-base text-gray-500 mt-4 sm:mt-6 leading-relaxed">
                Pre-qualification won't affect your credit score
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Process Section - Blue Background */}
      <section className="bg-[#0033A0] text-white py-12 sm:py-16 md:py-24 relative">
        <div className="container mx-auto px-3 sm:px-4 md:px-6 max-w-7xl">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 md:gap-12 items-center">
            {/* Process Steps */}
            <div>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 sm:mb-6">
                Simple Loan Application Process
              </h2>
              <p className="text-white/90 mb-6 sm:mb-8 text-sm sm:text-base">
                Working with trusted financial partners, the AmeriLend platform offers personal loans designed to fit your needs. The process is simple and built around you:
              </p>

              <div className="space-y-4 sm:space-y-6">
                {/* Step 1 */}
                <div className="flex gap-3 sm:gap-4">
                  <div className="flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white text-[#0033A0] flex items-center justify-center text-lg sm:text-xl font-bold">
                    1
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-bold text-base sm:text-lg mb-1">Apply Online</h3>
                    <p className="text-white/90 text-sm sm:text-base">
                      The application process is quick and easy, with decisions often made in minutes.
                    </p>
                  </div>
                </div>

                {/* Step 2 */}
                <div className="flex gap-3 sm:gap-4">
                  <div className="flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white text-[#0033A0] flex items-center justify-center text-lg sm:text-xl font-bold">
                    2
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-bold text-base sm:text-lg mb-1">Approval Process</h3>
                    <p className="text-white/90 text-sm sm:text-base">
                      We consider more than just your credit score, so even if you've been turned down by others, you may still qualify.
                    </p>
                  </div>
                </div>

                {/* Step 3 */}
                <div className="flex gap-3 sm:gap-4">
                  <div className="flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white text-[#0033A0] flex items-center justify-center text-lg sm:text-xl font-bold">
                    3
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-bold text-base sm:text-lg mb-1">Same-Day Funding Available</h3>
                    <p className="text-white/90 text-sm sm:text-base">
                      If approved, you may receive money in your account as soon as the same business day!<sup>1</sup>
                    </p>
                  </div>
                </div>
              </div>

              <Link href="/apply">
                <a className="inline-block mt-6 sm:mt-8">
                  <PrimaryButton className="btn-lg" icon={<ArrowRight />}>
                    Apply Now
                  </PrimaryButton>
                </a>
              </Link>

              <p className="text-xs sm:text-sm text-white/80 mt-3 sm:mt-4">
                Applying does NOT affect your FICO® credit score.<sup>2</sup>
              </p>
            </div>

            {/* Eligibility Requirements Card */}
            <div className="bg-white text-gray-800 rounded-lg p-4 sm:p-6 md:p-8 shadow-xl">
              <h3 className="text-lg sm:text-xl font-bold text-[#0033A0] mb-4 sm:mb-6">
                Before you get started, let's review our eligibility requirements.
              </h3>

              <ul className="space-y-3 sm:space-y-4">
                <li className="flex items-start gap-2 sm:gap-3">
                  <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <FileText className="w-4 h-4 sm:w-5 sm:h-5 text-[#0033A0]" />
                  </div>
                  <span className="text-sm sm:text-base">Be at least 18 years old</span>
                </li>
                <li className="flex items-start gap-2 sm:gap-3">
                  <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <svg className="w-4 h-4 sm:w-5 sm:h-5 text-[#0033A0]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <span className="text-sm sm:text-base">
                    Reside in the United States (we serve{" "}
                    <a href="#states" className="text-[#0033A0] underline font-semibold">
                      all 50 states
                    </a>
                    )
                  </span>
                </li>
                <li className="flex items-start gap-2 sm:gap-3">
                  <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-[#0033A0]" />
                  </div>
                  <span className="text-sm sm:text-base">Have a regular source of income</span>
                </li>
                <li className="flex items-start gap-2 sm:gap-3">
                  <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <svg className="w-4 h-4 sm:w-5 sm:h-5 text-[#0033A0]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                  </div>
                  <span className="text-sm sm:text-base">Have a checking or savings account</span>
                </li>
                <li className="flex items-start gap-2 sm:gap-3">
                  <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <svg className="w-4 h-4 sm:w-5 sm:h-5 text-[#0033A0]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <span className="text-sm sm:text-base">Receive paychecks through direct deposit</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Customer Testimonials Section */}
      <section className="bg-white py-16 sm:py-20 md:py-32">
        <div className="container mx-auto px-8 sm:px-12 md:px-16 lg:px-20 max-w-5xl">
          <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold text-[#0033A0] text-center mb-6 sm:mb-8">
            Hear From Our Customers
          </h2>
          <p className="text-center text-gray-600 mb-16 sm:mb-20 text-lg sm:text-xl leading-relaxed">
            See what real customers have to say about their experience with AmeriLend.
          </p>

          {/* Testimonials - Vertical Stack with Full Text */}
          <div className="space-y-12 sm:space-y-16">
            {/* Testimonial 1 */}
            <div className="pb-12 sm:pb-16 border-b border-gray-200">
              <div className="flex items-start gap-6 sm:gap-8">
                <img 
                  src="https://i.pravatar.cc/150?img=1&color=0033A0&background=D4AF37" 
                  alt="Sarah Martinez" 
                  className="w-20 h-20 sm:w-24 sm:h-24 rounded-full border-3 border-[#0033A0] flex-shrink-0"
                  loading="lazy"
                  width="96"
                  height="96"
                />
                <div className="flex-1">
                  <div className="flex gap-1 mb-4">
                    {[...Array(5)].map((_, i) => (
                      <span key={i} className="text-yellow-400 text-2xl">★</span>
                    ))}
                  </div>
                  <p className="text-gray-700 text-lg sm:text-xl leading-relaxed mb-6">
                    "AmeriLend made the process so simple and quick. I got approved in less than 2 hours and had the funds by the next business day. Incredible service!"
                  </p>
                  <h4 className="font-bold text-gray-800 text-lg">Sarah Martinez</h4>
                  <p className="text-gray-500 text-base">Denver, CO</p>
                </div>
              </div>
            </div>

            {/* Testimonial 2 */}
            <div className="pb-12 sm:pb-16 border-b border-gray-200">
              <div className="flex items-start gap-6 sm:gap-8">
                <img 
                  src="https://i.pravatar.cc/150?img=2&color=0033A0&background=D4AF37" 
                  alt="James Thompson" 
                  className="w-20 h-20 sm:w-24 sm:h-24 rounded-full border-3 border-[#0033A0] flex-shrink-0"
                  loading="lazy"
                  width="96"
                  height="96"
                />
                <div className="flex-1">
                  <div className="flex gap-1 mb-4">
                    {[...Array(5)].map((_, i) => (
                      <span key={i} className="text-yellow-400 text-2xl">★</span>
                    ))}
                  </div>
                  <p className="text-gray-700 text-lg sm:text-xl leading-relaxed mb-6">
                    "I was nervous about applying after being rejected elsewhere. AmeriLend's team was so understanding and helpful. They really came through for me."
                  </p>
                  <h4 className="font-bold text-gray-800 text-lg">James Thompson</h4>
                  <p className="text-gray-500 text-base">Austin, TX</p>
                </div>
              </div>
            </div>

            {/* Testimonial 3 */}
            <div className="pb-12 sm:pb-16 border-b border-gray-200">
              <div className="flex items-start gap-6 sm:gap-8">
                <img 
                  src="https://i.pravatar.cc/150?img=3&color=0033A0&background=D4AF37" 
                  alt="Maria Rodriguez" 
                  className="w-20 h-20 sm:w-24 sm:h-24 rounded-full border-3 border-[#0033A0] flex-shrink-0"
                  loading="lazy"
                  width="96"
                  height="96"
                />
                <div className="flex-1">
                  <div className="flex gap-1 mb-4">
                    {[...Array(5)].map((_, i) => (
                      <span key={i} className="text-yellow-400 text-2xl">★</span>
                    ))}
                  </div>
                  <p className="text-gray-700 text-lg sm:text-xl leading-relaxed mb-6">
                    "The transparent fee structure and clear payment schedule gave me peace of mind. No surprises, just honest lending. Highly recommend!"
                  </p>
                  <h4 className="font-bold text-gray-800 text-lg">Maria Rodriguez</h4>
                  <p className="text-gray-500 text-base">Miami, FL</p>
                </div>
              </div>
            </div>

            {/* Testimonial 4 */}
            <div>
              <div className="flex items-start gap-6 sm:gap-8">
                <img 
                  src="https://i.pravatar.cc/150?img=4&color=0033A0&background=D4AF37" 
                  alt="David Chen" 
                  className="w-20 h-20 sm:w-24 sm:h-24 rounded-full border-3 border-[#0033A0] flex-shrink-0"
                  loading="lazy"
                  width="96"
                  height="96"
                />
                <div className="flex-1">
                  <div className="flex gap-1 mb-4">
                    {[...Array(5)].map((_, i) => (
                      <span key={i} className="text-yellow-400 text-2xl">★</span>
                    ))}
                  </div>
                  <p className="text-gray-700 text-lg sm:text-xl leading-relaxed mb-6">
                    "The loan advocates at AmeriLend are fantastic. They answered every question I had and made me feel supported throughout the entire process."
                  </p>
                  <h4 className="font-bold text-gray-800 text-lg">David Chen</h4>
                  <p className="text-gray-500 text-base">Portland, OR</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section - Blue Background */}
      <section id="about" className="bg-[#0033A0] text-white py-12 sm:py-16 md:py-24">
        <div className="container mx-auto px-3 sm:px-4 md:px-6">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-center mb-8 sm:mb-12 md:mb-16">
            Why AmeriLend Is Right For You
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-6 lg:gap-8 max-w-6xl mx-auto">
            {/* Benefit 1 */}
            <Card className="bg-white text-gray-800 relative pt-6 sm:pt-8 hover:shadow-lg transition-shadow">
              <div className="absolute -top-5 sm:-top-6 left-1/2 transform -translate-x-1/2 w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-[#0033A0] flex items-center justify-center">
                <CheckCircle2 className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
              </div>
              <CardContent className="pt-6 sm:pt-8 pb-4 sm:pb-6 text-center px-3 sm:px-4">
                <h3 className="text-lg sm:text-xl font-bold text-[#0033A0] mb-2 sm:mb-3">Easy to Apply</h3>
                <p className="text-gray-600 text-sm sm:text-base">
                  Our online application process is convenient and only requires personal and employment information for quick and easy completion.
                </p>
              </CardContent>
            </Card>

            {/* Benefit 2 */}
            <Card className="bg-white text-gray-800 relative pt-6 sm:pt-8 hover:shadow-lg transition-shadow">
              <div className="absolute -top-5 sm:-top-6 left-1/2 transform -translate-x-1/2 w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-[#0033A0] flex items-center justify-center">
                <Clock className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
              </div>
              <CardContent className="pt-6 sm:pt-8 pb-4 sm:pb-6 text-center px-3 sm:px-4">
                <h3 className="text-lg sm:text-xl font-bold text-[#0033A0] mb-2 sm:mb-3">Same-Day Funding Available</h3>
                <p className="text-gray-600 text-sm sm:text-base">
                  If approved, you may receive money in your account as soon as the same business day!<sup>1</sup>
                </p>
              </CardContent>
            </Card>

            {/* Benefit 3 */}
            <Card className="bg-white text-gray-800 relative pt-6 sm:pt-8 hover:shadow-lg transition-shadow">
              <div className="absolute -top-5 sm:-top-6 left-1/2 transform -translate-x-1/2 w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-[#0033A0] flex items-center justify-center">
                <Headphones className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
              </div>
              <CardContent className="pt-6 sm:pt-8 pb-4 sm:pb-6 text-center px-3 sm:px-4">
                <h3 className="text-lg sm:text-xl font-bold text-[#0033A0] mb-2 sm:mb-3">Loan Support At Every Step</h3>
                <p className="text-gray-600 text-sm sm:text-base">
                  Our top-rated Loan Advocates are available to provide support at every step of the application process. We succeed when you do!
                </p>
              </CardContent>
            </Card>

            {/* Benefit 4 */}
            <Card className="bg-white text-gray-800 relative pt-6 sm:pt-8 hover:shadow-lg transition-shadow">
              <div className="absolute -top-5 sm:-top-6 left-1/2 transform -translate-x-1/2 w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-[#0033A0] flex items-center justify-center">
                <Shield className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
              </div>
              <CardContent className="pt-6 sm:pt-8 pb-4 sm:pb-6 text-center px-3 sm:px-4">
                <h3 className="text-lg sm:text-xl font-bold text-[#0033A0] mb-2 sm:mb-3">Safe and Secure</h3>
                <p className="text-gray-600 text-sm sm:text-base">
                  We are dedicated to protecting your information and communications with advanced 256 bit encryption technology.
                </p>
              </CardContent>
            </Card>

            {/* Benefit 5 */}
            <Card className="bg-white text-gray-800 relative pt-6 sm:pt-8 hover:shadow-lg transition-shadow">
              <div className="absolute -top-5 sm:-top-6 left-1/2 transform -translate-x-1/2 w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-[#0033A0] flex items-center justify-center">
                <FileText className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
              </div>
              <CardContent className="pt-6 sm:pt-8 pb-4 sm:pb-6 text-center px-3 sm:px-4">
                <h3 className="text-lg sm:text-xl font-bold text-[#0033A0] mb-2 sm:mb-3">Transparent Process</h3>
                <p className="text-gray-600 text-sm sm:text-base">
                  We supply you with an easy-to-read schedule with predictable payments and the ability to set up automatic payments.
                </p>
              </CardContent>
            </Card>

            {/* Benefit 6 */}
            <Card className="bg-white text-gray-800 relative pt-6 sm:pt-8 hover:shadow-lg transition-shadow">
              <div className="absolute -top-5 sm:-top-6 left-1/2 transform -translate-x-1/2 w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-[#0033A0] flex items-center justify-center">
                <TrendingUp className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
              </div>
              <CardContent className="pt-6 sm:pt-8 pb-4 sm:pb-6 text-center px-3 sm:px-4">
                <h3 className="text-lg sm:text-xl font-bold text-[#0033A0] mb-2 sm:mb-3">Build Credit History</h3>
                <p className="text-gray-600 text-sm sm:text-base">
                  We report your payment history to the three major credit bureaus, so every on-time payment you make may help boost your credit history.<sup>6</sup>
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="bg-gray-50 py-12 sm:py-16 md:py-24">
        <div className="container mx-auto px-3 sm:px-4 md:px-6 max-w-4xl">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-[#0033A0] text-center mb-8 sm:mb-12">
            FAQs
          </h2>

          <div className="space-y-2 sm:space-y-3 md:space-y-4">
            {[
              {
                question: "What are the eligibility requirements to apply for a loan?",
                answer:
                  "To apply, you must be at least 18 years old, reside in the United States (we serve all 50 states), have a regular source of income, maintain a checking or savings account, and receive paychecks through direct deposit.",
                color: "border-l-orange-500",
              },
              {
                question: "How much money can I apply for?",
                answer:
                  "Loan amounts are available nationwide and range from $500 to $100,000, based on your income and creditworthiness. We serve all 50 states with consistent lending criteria.",
                color: "border-l-purple-500",
              },
              {
                question: "How are AmeriLend loans different?",
                answer:
                  "We consider more than just your credit score during the approval process. Our transparent fee structure, same-day funding options, and dedicated loan advocates set us apart from traditional lenders.",
                color: "border-l-teal-500",
              },
              {
                question: "What can you use a personal loan for?",
                answer:
                  "Personal loans can be used for various purposes including debt consolidation, emergency expenses, home improvements, medical bills, or unexpected costs. However, they cannot be used for illegal activities or speculative investments.",
                color: "border-l-pink-500",
              },
              {
                question: "How does repayment of a personal loan work?",
                answer:
                  "Repayment is structured with fixed installments over a predetermined period. You'll receive a clear repayment schedule showing all payment dates and amounts. We offer automatic payment options for your convenience.",
                color: "border-l-blue-500",
              },
            ].map((faq, index) => (
              <div
                key={index}
                className={`bg-white border-l-4 ${faq.color} rounded-r-lg shadow-sm overflow-hidden`}
              >
                <button
                  onClick={() => toggleFaq(index)}
                  className="w-full px-3 sm:px-4 md:px-6 py-3 sm:py-4 text-left flex items-center justify-between hover:bg-gray-50 transition-colors"
                >
                  <span className="font-semibold text-gray-800 text-sm sm:text-base">{faq.question}</span>
                  <ChevronDown
                    className={`w-4 h-4 sm:w-5 sm:h-5 text-gray-500 transition-transform flex-shrink-0 ml-2 ${
                      openFaq === index ? "transform rotate-180" : ""
                    }`}
                  />
                </button>
                {openFaq === index && (
                  <div className="px-3 sm:px-4 md:px-6 pb-3 sm:pb-4 text-gray-600 text-sm sm:text-base">{faq.answer}</div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Educational Content Section */}
      <section className="bg-white py-12 sm:py-16 md:py-24">
        <div className="container mx-auto px-3 sm:px-4 md:px-6">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-[#0033A0] text-center mb-8 sm:mb-12">
            Making Personal Finance Approachable
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8 max-w-6xl mx-auto">
            {/* Article 1 */}
            <Card className="border-l-4 border-l-green-500 hover:shadow-lg transition-shadow">
              <CardContent className="p-4 sm:p-6">
                <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full bg-gray-200 mx-auto mb-3 sm:mb-4 overflow-hidden ring-2 ring-gray-300">
                  <img
                    src="https://images.unsplash.com/photo-1511895426328-dc8714191300?w=400&h=400&fit=crop"
                    alt="Family financial planning together"
                    className="w-full h-full object-cover brightness-110 contrast-110 saturate-110"
                    loading="lazy"
                    width="128"
                    height="128"
                  />
                </div>
                <h3 className="text-base sm:text-lg font-bold text-[#0033A0] mb-2">
                  The AmeriLend Money Guide: A Financial Management Tool
                </h3>
                <p className="text-gray-600 text-xs sm:text-sm">
                  Pick up best practices for managing finances, from budgeting for all types of households to dealing with income challenges.
                </p>
              </CardContent>
            </Card>

            {/* Article 2 */}
            <Card className="border-l-4 border-l-orange-500 hover:shadow-lg transition-shadow">
              <CardContent className="p-4 sm:p-6">
                <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full bg-gray-200 mx-auto mb-3 sm:mb-4 overflow-hidden ring-2 ring-gray-300">
                  <img
                    src="https://images.unsplash.com/photo-1609220136736-443140cffec6?w=400&h=400&fit=crop"
                    alt="Family budgeting and saving money"
                    className="w-full h-full object-cover brightness-110 contrast-110 saturate-110"
                    loading="lazy"
                    width="128"
                    height="128"
                  />
                </div>
                <h3 className="text-base sm:text-lg font-bold text-[#0033A0] mb-2">
                  How to Survive and Budget When Money Is Tight
                </h3>
                <p className="text-gray-600 text-xs sm:text-sm">
                  Finding extra money to put aside isn't easy when finances are tight, but that doesn't mean you can't do it.
                </p>
              </CardContent>
            </Card>

            {/* Article 3 */}
            <Card className="border-l-4 border-l-red-500 hover:shadow-lg transition-shadow">
              <CardContent className="p-4 sm:p-6">
                <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full bg-gray-200 mx-auto mb-3 sm:mb-4 overflow-hidden ring-2 ring-gray-300">
                  <img
                    src="https://images.unsplash.com/photo-1475503572774-15a45e5d60b9?w=400&h=400&fit=crop"
                    alt="Family making smart spending decisions"
                    className="w-full h-full object-cover brightness-110 contrast-110 saturate-110"
                    loading="lazy"
                    width="128"
                    height="128"
                  />
                </div>
                <h3 className="text-base sm:text-lg font-bold text-[#0033A0] mb-2">
                  'Should I Buy This?' A Financial Flowchart for Smart Spending
                </h3>
                <p className="text-gray-600 text-xs sm:text-sm">
                  Are you a smart spender? These 5 questions will make you one.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Payment Methods Section */}
      <section className="bg-gray-50 py-8 sm:py-12 md:py-16">
        <div className="container mx-auto px-8 sm:px-12 md:px-16 lg:px-20">
          <div className="text-center mb-12 sm:mb-16 max-w-4xl mx-auto">
            <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold text-[#0033A0] mb-6 sm:mb-8">
              Flexible Payment Options
            </h2>
            <p className="text-lg sm:text-xl md:text-2xl text-gray-600 leading-relaxed">
              We accept multiple payment methods to make your loan repayment convenient and secure
            </p>
          </div>

          {/* Payment Methods - Responsive Grid */}
          <div className="max-w-6xl mx-auto">
            <div className="bg-white rounded-lg shadow-md p-8 sm:p-12">
              <div className="flex flex-nowrap justify-center items-center gap-4 sm:gap-5 md:gap-6 overflow-x-auto pb-4">
                {/* Visa */}
                <img 
                  src="https://cdn.jsdelivr.net/npm/simple-icons@latest/icons/visa.svg" 
                  alt="Visa" 
                  className="h-8 sm:h-9 md:h-10 object-contain flex-shrink-0"
                  title="Visa"
                  loading="lazy"
                  width="40"
                  height="40"
                />
                {/* Mastercard */}
                <img 
                  src="https://cdn.jsdelivr.net/npm/simple-icons@latest/icons/mastercard.svg" 
                  alt="Mastercard" 
                  className="h-8 sm:h-9 md:h-10 object-contain flex-shrink-0"
                  title="Mastercard"
                  loading="lazy"
                  width="40"
                  height="40"
                />
                {/* Discover */}
                <img 
                  src="https://cdn.jsdelivr.net/npm/simple-icons@latest/icons/discover.svg" 
                  alt="Discover" 
                  className="h-8 sm:h-9 md:h-10 object-contain flex-shrink-0"
                  title="Discover Card"
                  loading="lazy"
                  width="40"
                  height="40"
                />
                {/* American Express */}
                <img 
                  src="https://cdn.jsdelivr.net/npm/simple-icons@latest/icons/americanexpress.svg" 
                  alt="American Express" 
                  className="h-8 sm:h-9 md:h-10 object-contain flex-shrink-0"
                  title="American Express"
                  loading="lazy"
                  width="40"
                  height="40"
                />
                {/* Divider */}
                <div className="h-8 sm:h-9 md:h-10 border-l-2 border-gray-300 flex-shrink-0"></div>
                {/* Bitcoin */}
                <img 
                  src="https://cdn.jsdelivr.net/gh/atomiclabs/cryptocurrency-icons@master/128/color/btc.png" 
                  alt="Bitcoin" 
                  className="h-7 sm:h-8 md:h-9 object-contain flex-shrink-0"
                  title="Bitcoin"
                  loading="lazy"
                  width="36"
                  height="36"
                />
                {/* Ethereum */}
                <img 
                  src="https://cdn.jsdelivr.net/gh/atomiclabs/cryptocurrency-icons@master/128/color/eth.png" 
                  alt="Ethereum" 
                  className="h-7 sm:h-8 md:h-9 object-contain flex-shrink-0"
                  title="Ethereum"
                  loading="lazy"
                  width="36"
                  height="36"
                />
                {/* USDC */}
                <img 
                  src="https://cdn.jsdelivr.net/gh/atomiclabs/cryptocurrency-icons@master/128/color/usdc.png" 
                  alt="USDC" 
                  className="h-7 sm:h-8 md:h-9 object-contain flex-shrink-0"
                  title="USD Coin"
                  loading="lazy"
                  width="36"
                  height="36"
                />
                {/* Divider */}
                <div className="h-7 sm:h-8 md:h-9 border-l-2 border-gray-300 flex-shrink-0"></div>
                {/* ACH */}
                <img 
                  src="https://cdn.jsdelivr.net/npm/simple-icons@latest/icons/bankofamerica.svg" 
                  alt="ACH" 
                  className="h-7 sm:h-8 md:h-9 object-contain flex-shrink-0"
                  title="ACH Bank Transfer"
                  loading="lazy"
                  width="36"
                  height="36"
                />
                {/* Wire */}
                <img 
                  src="https://cdn.jsdelivr.net/npm/simple-icons@latest/icons/stripe.svg" 
                  alt="Wire" 
                  className="h-7 sm:h-8 md:h-9 object-contain flex-shrink-0"
                  title="Wire Transfer"
                  loading="lazy"
                  width="36"
                  height="36"
                />
                {/* PayPal */}
                <img 
                  src="https://cdn.jsdelivr.net/npm/simple-icons@latest/icons/paypal.svg"
                  alt="PayPal" 
                  className="h-7 sm:h-8 md:h-9 object-contain flex-shrink-0"
                  title="PayPal"
                  loading="lazy"
                  width="36"
                  height="36"
                />
              </div>
            </div>

            {/* Security Notice and Trust Seals */}
            <div className="text-center mt-4 sm:mt-6 space-y-3 sm:space-y-4">
              <div className="flex items-center justify-center gap-2 text-gray-600">
                <Shield className="w-3 h-3 sm:w-4 sm:h-4 text-green-600 flex-shrink-0" />
                <span className="text-xs sm:text-sm font-semibold">
                  Secure Payment Processing Protected by Industry Leaders
                </span>
              </div>
              
              <div className="grid grid-cols-2 sm:flex sm:flex-wrap justify-center items-center gap-3 sm:gap-6 md:gap-8 pt-3 sm:pt-6 pb-2 sm:pb-4 max-w-sm sm:max-w-none mx-auto">
                {/* DigiCert Trust Seal */}
                <div className="text-center">
                  <div className="w-20 sm:w-auto mx-auto">
                    <a href="https://sslinsights.com/ssl-checker-tool/">
                      <img 
                        src="https://sslinsights.com/wp-content/uploads/2024/03/digicert-basic-site-seal.svg" 
                        alt="DigiCert Site Seal" 
                        className="w-full h-auto"
                        loading="lazy"
                        width="100"
                        height="auto"
                      />
                    </a>
                  </div>
                  <a href="https://sslinsights.com/ssl-checker-tool/" className="text-xs text-gray-500 hover:underline">Free SSL Checker</a>
                </div>

                {/* Entrust Trust Seal */}
                <div className="text-center">
                    <div className="w-20 sm:w-auto mx-auto">
                        <a href="https://sslinsights.com/ssl-checker-tool/">
                            <img 
                              src="https://sslinsights.com/wp-content/uploads/2024/04/entrust-site-seal.png" 
                              alt="entrust-trust-seal" 
                              className="w-full h-auto"
                              loading="lazy"
                              width="100"
                              height="auto"
                            />
                        </a>
                    </div>
                    <a href="https://sslinsights.com/ssl-checker-tool/" className="text-xs text-gray-500 hover:underline">Free SSL Checker</a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* States We Serve Section */}
      <section id="states" className="bg-gradient-to-br from-blue-50 to-white py-8 sm:py-12 md:py-16">
        <div className="container mx-auto px-3 sm:px-4 md:px-6">
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-[#0033A0] mb-3 sm:mb-4">
              Available Nationwide - All 50 States
            </h2>
            <p className="text-gray-600 max-w-4xl mx-auto text-sm sm:text-base md:text-lg">
              AmeriLend is proud to serve customers across the entire United States. No matter where you live, we're here to help you get the financial support you need.
            </p>
          </div>

          {/* Paginated States Grid */}
          <div className="max-w-4xl mx-auto">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 sm:gap-3 md:gap-4">
              {visibleStates.map((state) => (
                <div
                  key={state}
                  className="bg-white rounded-lg p-2 sm:p-3 text-center shadow-sm border border-gray-100 hover:border-[#0033A0] transition-colors"
                >
                  <span className="text-gray-700 font-medium text-xs sm:text-sm whitespace-nowrap">{state}</span>
                </div>
              ))}
            </div>

            {/* Pagination Controls */}
            <div className="flex justify-center items-center mt-6 sm:mt-8 gap-2 sm:gap-4 flex-wrap">
              <Button
                onClick={handlePrevPage}
                disabled={currentPage === 0}
                variant="outline"
                className="border-[#0033A0] text-[#0033A0] hover:bg-[#0033A0] hover:text-white text-xs sm:text-sm px-2 sm:px-4 py-1.5 sm:py-2"
              >
                <ChevronLeft className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                <span className="hidden sm:inline">Previous</span>
              </Button>
              <span className="text-gray-600 font-medium text-xs sm:text-base">
                Page {currentPage + 1} of {totalPages}
              </span>
              <Button
                onClick={handleNextPage}
                disabled={currentPage === totalPages - 1}
                variant="outline"
                className="border-[#0033A0] text-[#0033A0] hover:bg-[#0033A0] hover:text-white text-xs sm:text-sm px-2 sm:px-4 py-1.5 sm:py-2"
              >
                <span className="hidden sm:inline">Next</span>
                <ChevronRight className="w-3 h-3 sm:w-4 sm:h-4 ml-1 sm:ml-2" />
              </Button>
            </div>
          </div>

            {/* Additional Info */}
            <div className="mt-8 sm:mt-12 bg-white rounded-xl p-4 sm:p-6 md:p-8 shadow-lg">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 text-center">
                <div>
                  <div className="text-[#0033A0] text-2xl sm:text-3xl md:text-4xl font-bold mb-1 sm:mb-2">50</div>
                  <p className="text-gray-600 text-xs sm:text-sm md:text-base">States Served</p>
                </div>
                <div>
                  <div className="text-[#0033A0] text-2xl sm:text-3xl md:text-4xl font-bold mb-1 sm:mb-2">$500-$100K</div>
                  <p className="text-gray-600 text-xs sm:text-sm md:text-base">Loan Range</p>
                </div>
                <div>
                  <div className="text-[#0033A0] text-2xl sm:text-3xl md:text-4xl font-bold mb-1 sm:mb-2">24/7</div>
                  <p className="text-gray-600 text-xs sm:text-sm md:text-base">Online Applications</p>
                </div>
              </div>

              <div className="mt-6 sm:mt-8 text-center">
                <p className="text-gray-600 mb-3 sm:mb-4 text-xs sm:text-sm md:text-base">
                  Ready to get started? Apply now and get an instant decision!
                </p>
                <Link href="/apply">
                  <a className="inline-block">
                    <PrimaryButton className="btn-lg text-xs sm:text-sm md:text-base" icon={<ArrowRight />}>
                      Apply Now - All States Welcome
                    </PrimaryButton>
                  </a>
                </Link>
              </div>
            </div>
        </div>
      </section>

      {/* Track Application Section */}
      <section className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-12 sm:py-16 md:py-24">
        <div className="container mx-auto px-3 sm:px-4 md:px-6 max-w-4xl">
          <div className="text-center">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 sm:mb-4">
              Track Your Loan Application
            </h2>
            <p className="text-blue-100 mb-6 sm:mb-8 text-sm sm:text-base md:text-lg max-w-4xl mx-auto">
              Already applied? Check the status of your loan application anytime, anywhere. No login required.
            </p>
            
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 sm:p-8 md:p-12 border border-white/20">
              <div className="max-w-4xl mx-auto">
                <p className="text-blue-100 mb-6 sm:mb-8 text-sm sm:text-base">
                  Simply enter your application reference number and email address to see:
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8 text-left">
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 flex-shrink-0 mt-0.5" />
                    <span className="text-sm sm:text-base">Application status</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 flex-shrink-0 mt-0.5" />
                    <span className="text-sm sm:text-base">Approval amount</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 flex-shrink-0 mt-0.5" />
                    <span className="text-sm sm:text-base">Processing fees</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 flex-shrink-0 mt-0.5" />
                    <span className="text-sm sm:text-base">Next steps</span>
                  </div>
                </div>
                
                <Link href="/check-status">
                  <a className="inline-block w-full sm:w-auto">
                    <PrimaryButton className="btn-lg w-full sm:w-auto bg-white text-blue-600 hover:bg-blue-50" icon={<ArrowRight />}>
                      Check Application Status
                    </PrimaryButton>
                  </a>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Careers Section */}
      <section id="careers" className="bg-white py-12 sm:py-16 md:py-24">
        <div className="container mx-auto px-3 sm:px-4 md:px-6 max-w-4xl">
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-[#0033A0] mb-3 sm:mb-4">
              Join Our Team
            </h2>
            <p className="text-gray-600 text-sm sm:text-base md:text-lg">
              Ready to make a difference in people's financial lives? AmeriLend is always looking for talented, passionate individuals to join our growing team.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-8 sm:mb-12">
            <Card className="hover:shadow-lg transition-shadow">
              <CardContent className="p-4 sm:p-6">
                <h3 className="text-base sm:text-lg font-bold text-[#0033A0] mb-2 sm:mb-3">Loan Advocates</h3>
                <p className="text-gray-600 text-xs sm:text-sm mb-3 sm:mb-4">
                  Help customers navigate the loan process and provide exceptional support at every step.
                </p>
                <p className="text-xs text-gray-500">Customer Success • Full-time</p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardContent className="p-4 sm:p-6">
                <h3 className="text-base sm:text-lg font-bold text-[#0033A0] mb-2 sm:mb-3">Software Engineers</h3>
                <p className="text-gray-600 text-xs sm:text-sm mb-3 sm:mb-4">
                  Build and maintain our innovative fintech platform serving millions of customers.
                </p>
                <p className="text-xs text-gray-500">Engineering • Full-time</p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardContent className="p-4 sm:p-6">
                <h3 className="text-base sm:text-lg font-bold text-[#0033A0] mb-2 sm:mb-3">Data Analysts</h3>
                <p className="text-gray-600 text-xs sm:text-sm mb-3 sm:mb-4">
                  Analyze trends, create insights, and drive data-informed decisions across the organization.
                </p>
                <p className="text-xs text-gray-500">Analytics • Full-time</p>
              </CardContent>
            </Card>
          </div>

          <div className="bg-[#0033A0] text-white rounded-lg p-4 sm:p-6 md:p-8 text-center">
            <h3 className="text-lg sm:text-xl md:text-2xl font-bold mb-2 sm:mb-3">Interested in Working at AmeriLend?</h3>
            <p className="mb-4 sm:mb-6 text-xs sm:text-sm md:text-base">
              Send your resume and cover letter to our HR team.
            </p>
            <a href="mailto:careers@amerilendloan.com" className="inline-block">
              <Button className="bg-[#FFA500] hover:bg-[#FF8C00] text-white font-bold text-xs sm:text-sm">
                Apply for Careers
              </Button>
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-row justify-between items-start mb-8">
            {/* Company */}
            <div>
              <h4 className="font-bold text-lg mb-4">Company</h4>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <Link href="/about-us">
                    <a className="hover:text-white transition-colors">About Us</a>
                  </Link>
                </li>
                <li>
                  <a href="tel:945-212-1609" className="hover:text-white transition-colors">
                    Contact Us
                  </a>
                </li>
                <li>
                  <a href="#careers" className="hover:text-white transition-colors">
                    Careers
                  </a>
                </li>
              </ul>
            </div>

            {/* Loans */}
            <div>
              <h4 className="font-bold text-lg mb-4">Loans</h4>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <Link href="/apply">
                    <a className="hover:text-white transition-colors">Personal Loans</a>
                  </Link>
                </li>
                <li>
                  <Link href="/apply">
                    <a className="hover:text-white transition-colors">Installment Loans</a>
                  </Link>
                </li>
                <li>
                  <Link href="/terms-of-use">
                    <a className="hover:text-white transition-colors">Rates and Terms</a>
                  </Link>
                </li>
              </ul>
            </div>

            {/* Resources */}
            <div>
              <h4 className="font-bold text-lg mb-4">Resources</h4>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <Link href="/faq">
                    <a className="hover:text-white transition-colors">FAQs</a>
                  </Link>
                </li>
                <li>
                  <Link href="/blog">
                    <a className="hover:text-white transition-colors">Financial Blog</a>
                  </Link>
                </li>
                <li>
                  <Link href="/loan-guides">
                    <a className="hover:text-white transition-colors">Loan Guides</a>
                  </Link>
                </li>
              </ul>
            </div>

            {/* Language Selector */}
            <div className="text-center sm:text-left">
              <h4 className="font-bold text-lg mb-4">Language</h4>
              <div className="text-gray-400">
                <LanguageSwitcher />
              </div>
            </div>

            {/* Legal */}
            <div>
              <h4 className="font-bold text-lg mb-4">Legal</h4>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <Link href="/terms-of-use">
                    <a className="hover:text-white transition-colors">Terms of Service</a>
                  </Link>
                </li>
                <li>
                  <Link href="/privacy-policy">
                    <a className="hover:text-white transition-colors">Privacy Policy</a>
                  </Link>
                </li>
                <li>
                  <Link href="/california-privacy">
                    <a className="hover:text-white transition-colors">California Privacy</a>
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 pt-8 text-gray-400 text-sm space-y-6">
            {/* Main Copyright */}
            <div className="text-center">
              <p className="mb-2">
                © 2025 AmeriLend, LLC. All Rights Reserved.
              </p>
              <p className="text-xs">
                Use of AmeriLend, LLC is subject to our{" "}
                <Link href="/terms-of-use">
                  <a className="text-[#D4AF37] hover:underline cursor-pointer">
                    Terms of Use
                  </a>
                </Link>
                {" "}and{" "}
                <Link href="/privacy-policy">
                  <a className="text-[#D4AF37] hover:underline cursor-pointer">
                    Privacy Policy
                  </a>
                </Link>
              </p>
            </div>

            {/* California Privacy */}
            <div className="text-center text-xs" id="do-not-sell">
              <p>
                <Link href="/california-privacy">
                  <a className="text-[#D4AF37] hover:underline cursor-pointer">
                    California Disclosures and Privacy Policy
                  </a>
                </Link>
                {" "}| California Consumers can opt-out of the sale of personal information by clicking{" "}
                <a href="#do-not-sell" className="text-[#D4AF37] hover:underline font-semibold cursor-pointer">
                  Do Not Sell My Personal Information
                </a>
              </p>
            </div>

            {/* Bank Partners Notice */}
            <div className="text-center text-xs max-w-4xl mx-auto">
              <p>
                Applications submitted on the AmeriLend platform will be originated by one of our bank partners and serviced by AmeriLend. 
                Please see the Rates and Terms for details regarding the availability of products in your state of residence.
              </p>
            </div>

            {/* Footnotes */}
            <div className="text-center text-xs max-w-4xl mx-auto space-y-3">
              <p>
                <sup>1</sup>Subject to credit approval and verification. Actual approved loan amount and terms are dependent on our bank partners' standard underwriting guidelines and credit policies. 
                Funds may be deposited for delivery to your bank via ACH as soon as the same business day if verification is completed and final approval occurs before 12:00 PM CT on a business day. 
                If approval occurs after 12:00 PM CT on a business day or on a non-business day, funds may be delivered as soon as the next business day. 
                Availability of the funds is dependent on how quickly your bank processes the transaction.
              </p>

              <p>
                <sup>2</sup>AmeriLend's Bank Partners may use credit report information provided by Clarity Services and Experian as part of the application process to determine your creditworthiness. 
                Neither credit inquiry will appear as a hard credit inquiry on your Experian credit report and therefore they will not affect your FICO score.
              </p>

              <p>
                <sup>5</sup>According to the Consumer Federation of America, a non-profit consumer advocacy group, payday loans range in size from $100 to $1,000, depending on state legal maximums, and carry an average annual percentage rate (APR) of 400%. 
                The maximum APR for a loan offered through and serviced by AmeriLend is 195% and loan sizes range from $500 to $100,000.{" "}
                <a href="https://paydayloaninfo.org/how-payday-loans-work/" className="text-[#D4AF37] hover:underline" target="_blank" rel="noopener noreferrer">
                  https://paydayloaninfo.org/how-payday-loans-work/
                </a>
              </p>

              <p>
                <sup>6</sup>AmeriLend and its Bank Partners report customer payment history to the three major credit bureaus. On-time payments may improve credit score.
              </p>
            </div>

            {/* PATRIOT Act Notice */}
            <div className="text-center text-xs max-w-4xl mx-auto border-t border-gray-700 pt-6">
              <p className="font-semibold mb-2">USA PATRIOT ACT NOTICE: IMPORTANT INFORMATION ABOUT PROCEDURES FOR OPENING A NEW ACCOUNT</p>
              <p className="mb-4">
                To help the government fight the funding of terrorism and money laundering activities, Federal law requires all financial institutions to obtain, verify, and record information that identifies each person who opens an account. 
                What this means for you: When you open an account, we will ask for your name, address, date of birth, and other information that will allow us to identify you. 
                We may also ask to see your driver's license or other identifying documents.
              </p>
            </div>

            {/* Contact Information */}
            <div className="text-center text-xs border-t border-gray-700 pt-6">
              <p className="mb-2">If you have questions or concerns, please contact the AmeriLend Customer Support Team:</p>
              <div className="space-y-1">
                <div>
                  <strong>Phone:</strong>{" "}
                  <a href="tel:945-212-1609" className="text-[#D4AF37] hover:underline">
                    (945) 212-1609
                  </a>
                  <br />
                  Monday – Friday, 7 a.m. – 11:00 p.m. and Saturday and Sunday, 9 a.m. – 5:00 p.m. Central Time
                </div>
                <div>
                  <strong>Email:</strong>{" "}
                  <a href="mailto:support@amerilendloan.com" className="text-[#D4AF37] hover:underline">
                    support@amerilendloan.com
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </footer>

      {/* AI Support Chat Widget */}
      <AISupportChat mode="floating" />
    </div>
  );
}
