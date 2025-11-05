import { Button } from "@/components/ui/button";
import { CodeButton } from "@/components/ui/CodeButton";
import { Card, CardContent } from "@/components/ui/card";
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

export default function Home() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { isAuthenticated } = useAuth();
  const authorizeNetSealRef = useRef<HTMLDivElement>(null);
  const [currentPage, setCurrentPage] = useState(0);

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  useEffect(() => {
    if (authorizeNetSealRef.current) {
      const script = document.createElement("script");
      script.type = "text/javascript";
      script.src = "//verify.authorize.net:443/anetseal/seal.js";
      
      // Define the customer ID on the window object
      (window as any).ANS_customer_id = "2be1fcff-517b-4ceb-aa13-06e36deec1ff";

      authorizeNetSealRef.current.appendChild(script);

      return () => {
        // Cleanup: remove the script when the component unmounts
        if (authorizeNetSealRef.current) {
          authorizeNetSealRef.current.innerHTML = "";
        }
      };
    }
  }, []);

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
      {/* Header/Navigation */}
      <header className="sticky top-0 z-50 bg-white border-b shadow-sm">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link href="/">
              <a className="text-2xl font-bold">
                <span className="text-[#0033A0]">Ameri</span>
                <span className="text-[#D4AF37]">Lend</span>
                <sup className="text-xs text-[#0033A0]">®</sup>
              </a>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-6">
              <Link href="/apply">
                <a className="text-gray-700 hover:text-[#0033A0] transition-colors">
                  Loans
                </a>
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
                      <CodeButton icon={<ArrowRight />}>
                        Apply Now
                      </CodeButton>
                    </a>
                  </Link>
                  <Link href="/dashboard">
                    <a className="inline-block">
                      <Button variant="outline" className="border-[#0033A0] text-[#0033A0] hover:bg-[#0033A0] hover:text-white">
                        Dashboard
                      </Button>
                    </a>
                  </Link>
                </>
              ) : (
                <>
                  <Link href="/apply">
                    <a className="inline-block">
                      <CodeButton icon={<ArrowRight />}>
                        Apply Now
                      </CodeButton>
                    </a>
                  </Link>
                  <Link href="/login">
                    <a className="inline-block">
                      <Button
                        variant="outline"
                        className="border-[#0033A0] text-[#0033A0] hover:bg-[#0033A0] hover:text-white"
                      >
                        Log In
                      </Button>
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
                <a href="#about" className="text-gray-700 hover:text-[#0033A0]">
                  About Us
                </a>
                <a href="#faq" className="text-gray-700 hover:text-[#0033A0]">
                  Help
                </a>
                <Link href="/apply">
                  <a className="inline-block w-full">
                    <CodeButton className="w-full" icon={<ArrowRight />}>
                      Apply Now
                    </CodeButton>
                  </a>
                </Link>
                {isAuthenticated ? (
                  <Link href="/dashboard">
                    <a className="inline-block w-full">
                      <Button variant="outline" className="w-full border-[#0033A0] text-[#0033A0]">
                        Dashboard
                      </Button>
                    </a>
                  </Link>
                ) : (
                  <Link href="/login">
                    <a className="inline-block w-full">
                      <Button variant="outline" className="w-full border-[#0033A0] text-[#0033A0]">
                        Log In
                      </Button>
                    </a>
                  </Link>
                )}
              </nav>
            </div>
          )}
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-white py-12 md:py-20">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            {/* Hero Image */}
            <div className="order-2 md:order-1">
              <img
                src="/hero-background.jpg"
                alt="Happy couple reviewing loan application"
                className="shadow-lg w-full h-auto object-cover"
                style={{ borderRadius: "30% 70% 58% 42% / 36% 36% 64% 64%" }}
              />
            </div>

            {/* Hero Content */}
            <div className="order-1 md:order-2">
              <h1 className="text-4xl md:text-5xl font-bold text-[#0033A0] mb-6">
                Online Loans
                <br />
                Designed for You
              </h1>

              <ul className="space-y-3 mb-8">
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700">
                    Same-day funding available.<sup>1</sup>
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700">
                    Applying does NOT affect your FICO® credit score.<sup>2</sup>
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700">No hidden fees.</span>
                </li>
              </ul>

              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/apply">
                  <a className="inline-block">
                    <CodeButton className="btn-lg w-full sm:w-auto" icon={<ArrowRight />}>
                      Apply Now
                    </CodeButton>
                  </a>
                </Link>
                <Link href="/pre-qualify">
                  <a className="inline-block">
                    <Button variant="outline" className="border-2 border-[#0033A0] text-[#0033A0] hover:bg-[#0033A0] hover:text-white font-semibold px-8 py-6 text-lg w-full sm:w-auto">
                      Check If You Pre-Qualify
                    </Button>
                  </a>
                </Link>
              </div>

              <p className="text-sm text-gray-500 mt-4">
                Pre-qualification won't affect your credit score
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Process Section - Blue Background */}
      <section className="bg-[#0033A0] text-white py-16 md:py-24 relative">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            {/* Process Steps */}
            <div>
              <h2 className="text-3xl md:text-4xl font-bold mb-6">
                Simple Loan Application Process
              </h2>
              <p className="text-white/90 mb-8">
                Working with trusted financial partners, the AmeriLend platform offers personal loans designed to fit your needs. The process is simple and built around you:
              </p>

              <div className="space-y-6">
                {/* Step 1 */}
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-12 h-12 rounded-full bg-white text-[#0033A0] flex items-center justify-center text-xl font-bold">
                    1
                  </div>
                  <div>
                    <h3 className="font-bold text-lg mb-1">Apply Online</h3>
                    <p className="text-white/90">
                      The application process is quick and easy, with decisions often made in minutes.
                    </p>
                  </div>
                </div>

                {/* Step 2 */}
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-12 h-12 rounded-full bg-white text-[#0033A0] flex items-center justify-center text-xl font-bold">
                    2
                  </div>
                  <div>
                    <h3 className="font-bold text-lg mb-1">Approval Process</h3>
                    <p className="text-white/90">
                      We consider more than just your credit score, so even if you've been turned down by others, you may still qualify.
                    </p>
                  </div>
                </div>

                {/* Step 3 */}
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-12 h-12 rounded-full bg-white text-[#0033A0] flex items-center justify-center text-xl font-bold">
                    3
                  </div>
                  <div>
                    <h3 className="font-bold text-lg mb-1">Same-Day Funding Available</h3>
                    <p className="text-white/90">
                      If approved, you may receive money in your account as soon as the same business day!<sup>1</sup>
                    </p>
                  </div>
                </div>
              </div>

              <Link href="/apply">
                <a className="inline-block">
                  <CodeButton className="btn-lg" icon={<ArrowRight />}>
                    Apply Now
                  </CodeButton>
                </a>
              </Link>

              <p className="text-sm text-white/80 mt-4">
                Applying does NOT affect your FICO® credit score.<sup>2</sup>
              </p>
            </div>

            {/* Eligibility Requirements Card */}
            <div className="bg-white text-gray-800 rounded-lg p-8 shadow-xl">
              <h3 className="text-xl font-bold text-[#0033A0] mb-6">
                Before you get started, let's review our eligibility requirements.
              </h3>

              <ul className="space-y-4">
                <li className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
                    <FileText className="w-5 h-5 text-[#0033A0]" />
                  </div>
                  <span>Be at least 18 years old</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
                    <svg className="w-5 h-5 text-[#0033A0]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <span>
                    Reside in the United States (we serve{" "}
                    <a href="#states" className="text-[#0033A0] underline font-semibold">
                      all 50 states
                    </a>
                    )
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
                    <Clock className="w-5 h-5 text-[#0033A0]" />
                  </div>
                  <span>Have a regular source of income</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
                    <svg className="w-5 h-5 text-[#0033A0]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                  </div>
                  <span>Have a checking or savings account</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
                    <svg className="w-5 h-5 text-[#0033A0]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <span>Receive paychecks through direct deposit</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Customer Testimonials Section */}
      <section className="bg-white py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-[#0033A0] text-center mb-4">
            Hear From Our Customers
          </h2>
          <p className="text-center text-gray-600 mb-12 max-w-3xl mx-auto">
            See what real customers have to say about their experience with AmeriLend.
          </p>

          {/* Testimonials Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto mb-12">
            {/* Testimonial 1 */}
            <Card className="hover:shadow-lg transition-shadow bg-gradient-to-br from-blue-50 to-white">
              <CardContent className="p-6">
                <div className="flex items-center mb-4">
                  <img 
                    src="https://i.pravatar.cc/150?img=1&color=0033A0&background=D4AF37" 
                    alt="Sarah Martinez" 
                    className="w-14 h-14 rounded-full border-2 border-[#0033A0] mr-3"
                  />
                  <div>
                    <h4 className="font-bold text-gray-800">Sarah Martinez</h4>
                    <p className="text-sm text-gray-500">Denver, CO</p>
                  </div>
                </div>
                <div className="flex gap-1 mb-3">
                  {[...Array(5)].map((_, i) => (
                    <span key={i} className="text-yellow-400">★</span>
                  ))}
                </div>
                <p className="text-gray-700 text-sm">
                  "AmeriLend made the process so simple and quick. I got approved in less than 2 hours and had the funds by the next business day. Incredible service!"
                </p>
              </CardContent>
            </Card>

            {/* Testimonial 2 */}
            <Card className="hover:shadow-lg transition-shadow bg-gradient-to-br from-orange-50 to-white">
              <CardContent className="p-6">
                <div className="flex items-center mb-4">
                  <img 
                    src="https://i.pravatar.cc/150?img=2&color=0033A0&background=D4AF37" 
                    alt="James Thompson" 
                    className="w-14 h-14 rounded-full border-2 border-[#0033A0] mr-3"
                  />
                  <div>
                    <h4 className="font-bold text-gray-800">James Thompson</h4>
                    <p className="text-sm text-gray-500">Austin, TX</p>
                  </div>
                </div>
                <div className="flex gap-1 mb-3">
                  {[...Array(5)].map((_, i) => (
                    <span key={i} className="text-yellow-400">★</span>
                  ))}
                </div>
                <p className="text-gray-700 text-sm">
                  "I was nervous about applying after being rejected elsewhere. AmeriLend's team was so understanding and helpful. They really came through for me."
                </p>
              </CardContent>
            </Card>

            {/* Testimonial 3 */}
            <Card className="hover:shadow-lg transition-shadow bg-gradient-to-br from-green-50 to-white">
              <CardContent className="p-6">
                <div className="flex items-center mb-4">
                  <img 
                    src="https://i.pravatar.cc/150?img=3&color=0033A0&background=D4AF37" 
                    alt="Maria Rodriguez" 
                    className="w-14 h-14 rounded-full border-2 border-[#0033A0] mr-3"
                  />
                  <div>
                    <h4 className="font-bold text-gray-800">Maria Rodriguez</h4>
                    <p className="text-sm text-gray-500">Miami, FL</p>
                  </div>
                </div>
                <div className="flex gap-1 mb-3">
                  {[...Array(5)].map((_, i) => (
                    <span key={i} className="text-yellow-400">★</span>
                  ))}
                </div>
                <p className="text-gray-700 text-sm">
                  "The transparent fee structure and clear payment schedule gave me peace of mind. No surprises, just honest lending. Highly recommend!"
                </p>
              </CardContent>
            </Card>

            {/* Testimonial 4 */}
            <Card className="hover:shadow-lg transition-shadow bg-gradient-to-br from-purple-50 to-white">
              <CardContent className="p-6">
                <div className="flex items-center mb-4">
                  <img 
                    src="https://i.pravatar.cc/150?img=4&color=0033A0&background=D4AF37" 
                    alt="David Chen" 
                    className="w-14 h-14 rounded-full border-2 border-[#0033A0] mr-3"
                  />
                  <div>
                    <h4 className="font-bold text-gray-800">David Chen</h4>
                    <p className="text-sm text-gray-500">Portland, OR</p>
                  </div>
                </div>
                <div className="flex gap-1 mb-3">
                  {[...Array(5)].map((_, i) => (
                    <span key={i} className="text-yellow-400">★</span>
                  ))}
                </div>
                <p className="text-gray-700 text-sm">
                  "The loan advocates at AmeriLend are fantastic. They answered every question I had and made me feel supported throughout the entire process."
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Benefits Section - Blue Background */}
      <section id="about" className="bg-[#0033A0] text-white py-16 md:py-24">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-16">
            Why AmeriLend Is Right For You
          </h2>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {/* Benefit 1 */}
            <Card className="bg-white text-gray-800 relative pt-8">
              <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 w-16 h-16 rounded-full bg-[#0033A0] flex items-center justify-center">
                <CheckCircle2 className="w-8 h-8 text-white" />
              </div>
              <CardContent className="pt-8 pb-6 text-center">
                <h3 className="text-xl font-bold text-[#0033A0] mb-3">Easy to Apply</h3>
                <p className="text-gray-600">
                  Our online application process is convenient and only requires personal and employment information for quick and easy completion.
                </p>
              </CardContent>
            </Card>

            {/* Benefit 2 */}
            <Card className="bg-white text-gray-800 relative pt-8">
              <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 w-16 h-16 rounded-full bg-[#0033A0] flex items-center justify-center">
                <Clock className="w-8 h-8 text-white" />
              </div>
              <CardContent className="pt-8 pb-6 text-center">
                <h3 className="text-xl font-bold text-[#0033A0] mb-3">Same-Day Funding Available</h3>
                <p className="text-gray-600">
                  If approved, you may receive money in your account as soon as the same business day!<sup>1</sup>
                </p>
              </CardContent>
            </Card>

            {/* Benefit 3 */}
            <Card className="bg-white text-gray-800 relative pt-8">
              <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 w-16 h-16 rounded-full bg-[#0033A0] flex items-center justify-center">
                <Headphones className="w-8 h-8 text-white" />
              </div>
              <CardContent className="pt-8 pb-6 text-center">
                <h3 className="text-xl font-bold text-[#0033A0] mb-3">Loan Support At Every Step</h3>
                <p className="text-gray-600">
                  Our top-rated Loan Advocates are available to provide support at every step of the application process. We succeed when you do!
                </p>
              </CardContent>
            </Card>

            {/* Benefit 4 */}
            <Card className="bg-white text-gray-800 relative pt-8">
              <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 w-16 h-16 rounded-full bg-[#0033A0] flex items-center justify-center">
                <Shield className="w-8 h-8 text-white" />
              </div>
              <CardContent className="pt-8 pb-6 text-center">
                <h3 className="text-xl font-bold text-[#0033A0] mb-3">Safe and Secure</h3>
                <p className="text-gray-600">
                  We are dedicated to protecting your information and communications with advanced 256 bit encryption technology.
                </p>
              </CardContent>
            </Card>

            {/* Benefit 5 */}
            <Card className="bg-white text-gray-800 relative pt-8">
              <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 w-16 h-16 rounded-full bg-[#0033A0] flex items-center justify-center">
                <FileText className="w-8 h-8 text-white" />
              </div>
              <CardContent className="pt-8 pb-6 text-center">
                <h3 className="text-xl font-bold text-[#0033A0] mb-3">Transparent Process</h3>
                <p className="text-gray-600">
                  We supply you with an easy-to-read schedule with predictable payments and the ability to set up automatic payments.
                </p>
              </CardContent>
            </Card>

            {/* Benefit 6 */}
            <Card className="bg-white text-gray-800 relative pt-8">
              <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 w-16 h-16 rounded-full bg-[#0033A0] flex items-center justify-center">
                <TrendingUp className="w-8 h-8 text-white" />
              </div>
              <CardContent className="pt-8 pb-6 text-center">
                <h3 className="text-xl font-bold text-[#0033A0] mb-3">Build Credit History</h3>
                <p className="text-gray-600">
                  We report your payment history to the three major credit bureaus, so every on-time payment you make may help boost your credit history.<sup>6</sup>
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="bg-gray-50 py-16">
        <div className="container mx-auto px-4 max-w-4xl">
          <h2 className="text-3xl md:text-4xl font-bold text-[#0033A0] text-center mb-12">
            FAQs
          </h2>

          <div className="space-y-4">
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
                  className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-gray-50 transition-colors"
                >
                  <span className="font-semibold text-gray-800">{faq.question}</span>
                  <ChevronDown
                    className={`w-5 h-5 text-gray-500 transition-transform ${
                      openFaq === index ? "transform rotate-180" : ""
                    }`}
                  />
                </button>
                {openFaq === index && (
                  <div className="px-6 pb-4 text-gray-600">{faq.answer}</div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Educational Content Section */}
      <section className="bg-white py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-[#0033A0] text-center mb-12">
            Making Personal Finance Approachable
          </h2>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {/* Article 1 */}
            <Card className="border-l-4 border-l-green-500 hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="w-32 h-32 rounded-full bg-gray-200 mx-auto mb-4 overflow-hidden ring-2 ring-gray-300">
                  <img
                    src="https://images.unsplash.com/photo-1511895426328-dc8714191300?w=400&h=400&fit=crop"
                    alt="Family financial planning together"
                    className="w-full h-full object-cover brightness-110 contrast-110 saturate-110"
                  />
                </div>
                <h3 className="text-lg font-bold text-[#0033A0] mb-2">
                  The AmeriLend Money Guide: A Financial Management Tool
                </h3>
                <p className="text-gray-600 text-sm">
                  Pick up best practices for managing finances, from budgeting for all types of households to dealing with income challenges.
                </p>
              </CardContent>
            </Card>

            {/* Article 2 */}
            <Card className="border-l-4 border-l-orange-500 hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="w-32 h-32 rounded-full bg-gray-200 mx-auto mb-4 overflow-hidden ring-2 ring-gray-300">
                  <img
                    src="https://images.unsplash.com/photo-1609220136736-443140cffec6?w=400&h=400&fit=crop"
                    alt="Family budgeting and saving money"
                    className="w-full h-full object-cover brightness-110 contrast-110 saturate-110"
                  />
                </div>
                <h3 className="text-lg font-bold text-[#0033A0] mb-2">
                  How to Survive and Budget When Money Is Tight
                </h3>
                <p className="text-gray-600 text-sm">
                  Finding extra money to put aside isn't easy when finances are tight, but that doesn't mean you can't do it.
                </p>
              </CardContent>
            </Card>

            {/* Article 3 */}
            <Card className="border-l-4 border-l-red-500 hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="w-32 h-32 rounded-full bg-gray-200 mx-auto mb-4 overflow-hidden ring-2 ring-gray-300">
                  <img
                    src="https://images.unsplash.com/photo-1475503572774-15a45e5d60b9?w=400&h=400&fit=crop"
                    alt="Family making smart spending decisions"
                    className="w-full h-full object-cover brightness-110 contrast-110 saturate-110"
                  />
                </div>
                <h3 className="text-lg font-bold text-[#0033A0] mb-2">
                  'Should I Buy This?' A Financial Flowchart for Smart Spending
                </h3>
                <p className="text-gray-600 text-sm">
                  Are you a smart spender? These 5 questions will make you one.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Payment Methods Section */}
      <section className="bg-gray-50 py-8">
        <div className="container mx-auto px-4">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-[#0033A0] mb-2">
              Flexible Payment Options
            </h2>
            <p className="text-sm text-gray-600 max-w-2xl mx-auto">
              We accept multiple payment methods to make your loan repayment convenient and secure
            </p>
          </div>

          {/* Payment Methods - All in One Line */}
          <div className="max-w-6xl mx-auto">
            <div className="bg-white rounded-lg shadow-md p-4">
              <div className="flex flex-wrap justify-center items-center gap-4 md:gap-6">
                {/* Visa */}
                <img 
                  src="https://cdn.jsdelivr.net/npm/simple-icons@latest/icons/visa.svg" 
                  alt="Visa" 
                  className="h-8 md:h-10 object-contain"
                  title="Visa"
                />
                {/* Mastercard */}
                <img 
                  src="https://cdn.jsdelivr.net/npm/simple-icons@latest/icons/mastercard.svg" 
                  alt="Mastercard" 
                  className="h-8 md:h-10 object-contain"
                  title="Mastercard"
                />
                {/* Discover */}
                <img 
                  src="https://cdn.jsdelivr.net/npm/simple-icons@latest/icons/discover.svg" 
                  alt="Discover" 
                  className="h-8 md:h-10 object-contain"
                  title="Discover Card"
                />
                {/* American Express */}
                <img 
                  src="https://cdn.jsdelivr.net/npm/simple-icons@latest/icons/americanexpress.svg" 
                  alt="American Express" 
                  className="h-8 md:h-10 object-contain"
                  title="American Express"
                />
                {/* Divider */}
                <div className="h-8 border-l border-gray-300"></div>
                {/* Bitcoin */}
                <img 
                  src="https://cdn.jsdelivr.net/gh/atomiclabs/cryptocurrency-icons@master/128/color/btc.png" 
                  alt="Bitcoin" 
                  className="h-8 md:h-10 object-contain"
                  title="Bitcoin"
                />
                {/* Ethereum */}
                <img 
                  src="https://cdn.jsdelivr.net/gh/atomiclabs/cryptocurrency-icons@master/128/color/eth.png" 
                  alt="Ethereum" 
                  className="h-8 md:h-10 object-contain"
                  title="Ethereum"
                />
                {/* USDC */}
                <img 
                  src="https://cdn.jsdelivr.net/gh/atomiclabs/cryptocurrency-icons@master/128/color/usdc.png" 
                  alt="USDC" 
                  className="h-8 md:h-10 object-contain"
                  title="USD Coin"
                />
                {/* Divider */}
                <div className="h-8 border-l border-gray-300"></div>
                {/* ACH */}
                <img 
                  src="https://cdn.jsdelivr.net/npm/simple-icons@latest/icons/bankofamerica.svg" 
                  alt="ACH" 
                  className="h-8 md:h-10 object-contain"
                  title="ACH Bank Transfer"
                />
                {/* Wire */}
                <img 
                  src="https://cdn.jsdelivr.net/npm/simple-icons@latest/icons/stripe.svg" 
                  alt="Wire" 
                  className="h-8 md:h-10 object-contain"
                  title="Wire Transfer"
                />
                {/* PayPal */}
                <img 
                  src="https://cdn.jsdelivr.net/npm/simple-icons@latest/icons/paypal.svg"
                  alt="PayPal" 
                  className="h-8 md:h-10 object-contain"
                  title="PayPal"
                />
              </div>
            </div>

            {/* Security Notice and Trust Seals */}
            <div className="text-center mt-6 space-y-4">
              <div className="flex items-center justify-center gap-2 text-gray-600">
                <Shield className="w-4 h-4 text-green-600" />
                <span className="text-xs md:text-sm font-semibold">
                  Secure Payment Processing Protected by Industry Leaders
                </span>
              </div>
              
              <div className="flex flex-wrap justify-center items-center gap-8 pt-6 pb-4">
                {/* Authorize.Net Seal */}
                <div ref={authorizeNetSealRef} className="min-w-[100px] min-h-[50px] pointer-events-none select-none [&_*]:pointer-events-none [&_a]:!cursor-default" />
                
                {/* DigiCert Trust Seal */}
                <div className="text-center">
                  <div>
                    <a href="https://sslinsights.com/ssl-checker-tool/">
                      <img src="https://sslinsights.com/wp-content/uploads/2024/03/digicert-basic-site-seal.svg" alt="DigiCert Site Seal" />
                    </a>
                  </div>
                  <a href="https://sslinsights.com/ssl-checker-tool/" className="text-xs text-gray-500 hover:underline">Free SSL Checker</a>
                </div>

                {/* Entrust Trust Seal */}
                <div className="text-center">
                    <div>
                        <a href="https://sslinsights.com/ssl-checker-tool/">
                            <img src="https://sslinsights.com/wp-content/uploads/2024/04/entrust-site-seal.png" alt="entrust-trust-seal" />
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
      <section id="states" className="bg-gradient-to-br from-blue-50 to-white py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-[#0033A0] mb-4">
              Available Nationwide - All 50 States
            </h2>
            <p className="text-gray-600 max-w-3xl mx-auto text-lg">
              AmeriLend is proud to serve customers across the entire United States. 
              No matter where you live, we're here to help you get the financial support you need.
            </p>
          </div>

          {/* Paginated States Grid */}
          <div className="max-w-4xl mx-auto">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
              {visibleStates.map((state) => (
                <div
                  key={state}
                  className="bg-white rounded-lg p-3 text-center shadow-sm border border-gray-100"
                >
                  <span className="text-gray-700 font-medium text-sm whitespace-nowrap">{state}</span>
                </div>
              ))}
            </div>

            {/* Pagination Controls */}
            <div className="flex justify-center items-center mt-8 gap-4">
              <Button
                onClick={handlePrevPage}
                disabled={currentPage === 0}
                variant="outline"
                className="border-[#0033A0] text-[#0033A0] hover:bg-[#0033A0] hover:text-white"
              >
                <ChevronLeft className="w-4 h-4 mr-2" />
                Previous
              </Button>
              <span className="text-gray-600 font-medium">
                Page {currentPage + 1} of {totalPages}
              </span>
              <Button
                onClick={handleNextPage}
                disabled={currentPage === totalPages - 1}
                variant="outline"
                className="border-[#0033A0] text-[#0033A0] hover:bg-[#0033A0] hover:text-white"
              >
                Next
                <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>

            {/* Additional Info */}
            <div className="mt-12 bg-white rounded-xl p-8 shadow-lg">
              <div className="grid md:grid-cols-3 gap-6 text-center">
                <div>
                  <div className="text-[#0033A0] text-4xl font-bold mb-2">50</div>
                  <p className="text-gray-600">States Served</p>
                </div>
                <div>
                  <div className="text-[#0033A0] text-4xl font-bold mb-2">$500-$100K</div>
                  <p className="text-gray-600">Loan Range</p>
                </div>
                <div>
                  <div className="text-[#0033A0] text-4xl font-bold mb-2">24/7</div>
                  <p className="text-gray-600">Online Applications</p>
                </div>
              </div>

              <div className="mt-8 text-center">
                <p className="text-gray-600 mb-4">
                  Ready to get started? Apply now and get an instant decision!
                </p>
                <Link href="/apply">
                  <a className="inline-block">
                    <CodeButton className="btn-lg" icon={<ArrowRight />}>
                      Apply Now - All States Welcome
                    </CodeButton>
                  </a>
                </Link>
              </div>
            </div>
          </div>
      </section>

      {/* Careers Section */}
      <section id="careers" className="bg-white py-16 md:py-24">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-[#0033A0] mb-4">
              Join Our Team
            </h2>
            <p className="text-gray-600 text-lg">
              Ready to make a difference in people's financial lives? AmeriLend is always looking for talented, passionate individuals to join our growing team.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 mb-12">
            <Card className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <h3 className="text-lg font-bold text-[#0033A0] mb-3">Loan Advocates</h3>
                <p className="text-gray-600 mb-4">
                  Help customers navigate the loan process and provide exceptional support at every step.
                </p>
                <p className="text-sm text-gray-500">Customer Success • Full-time</p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <h3 className="text-lg font-bold text-[#0033A0] mb-3">Software Engineers</h3>
                <p className="text-gray-600 mb-4">
                  Build and maintain our innovative fintech platform serving millions of customers.
                </p>
                <p className="text-sm text-gray-500">Engineering • Full-time</p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <h3 className="text-lg font-bold text-[#0033A0] mb-3">Data Analysts</h3>
                <p className="text-gray-600 mb-4">
                  Analyze trends, create insights, and drive data-informed decisions across the organization.
                </p>
                <p className="text-sm text-gray-500">Analytics • Full-time</p>
              </CardContent>
            </Card>
          </div>

          <div className="bg-[#0033A0] text-white rounded-lg p-8 text-center">
            <h3 className="text-2xl font-bold mb-3">Interested in Working at AmeriLend?</h3>
            <p className="mb-6">
              Send your resume and cover letter to our HR team.
            </p>
            <a href="mailto:careers@amerilend.com" className="inline-block">
              <Button className="bg-[#FFA500] hover:bg-[#FF8C00] text-white font-bold">
                Apply for Careers
              </Button>
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
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
                  <Link href="/">
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
              <p className="space-y-1">
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
                  <a href="mailto:support@amerilend.com" className="text-[#D4AF37] hover:underline">
                    support@amerilend.com
                  </a>
                </div>
              </p>
            </div>
          </div>
        </div>
      </footer>

      {/* AI Support Chat Widget */}
      <AISupportChat mode="floating" />
    </div>
  );
}
