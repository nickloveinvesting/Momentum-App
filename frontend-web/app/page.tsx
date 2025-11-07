/**
 * Landing Page for Momentum App
 * Hero section with value proposition and CTA
 */

import Link from 'next/link';
import Button from './components/Button';

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-primary-50 to-white">
      {/* Header */}
      <header className="container-safe py-6">
        <nav className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-primary-900 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xl">M</span>
            </div>
            <span className="text-2xl font-bold text-primary-900">Momentum</span>
          </div>
          <div className="flex items-center gap-4">
            <Link
              href="/login"
              className="text-primary-900 font-medium hover:text-primary-700 transition-colors"
            >
              Log In
            </Link>
            <Link href="/register">
              <Button variant="primary">Start Free Trial</Button>
            </Link>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="container-safe py-20 md:py-32">
        <div className="max-w-4xl mx-auto text-center">
          {/* Main Headline */}
          <h1 className="text-5xl md:text-7xl font-bold text-gray-900 mb-6 leading-tight">
            Expand Your{' '}
            <span className="text-primary-900">Comfort Zone</span>
          </h1>

          {/* Subheadline */}
          <p className="text-xl md:text-2xl text-gray-600 mb-4 max-w-3xl mx-auto">
            Action creates clarity. Small wins build identity.
          </p>

          <p className="text-lg md:text-xl text-gray-500 mb-12 max-w-2xl mx-auto">
            One personalized challenge per day. Evidence-based. Identity-focused.
            Transform avoidance into expansion.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/register">
              <Button variant="primary" size="lg" className="text-lg px-8 py-4">
                Start Your Free Trial
              </Button>
            </Link>
            <Link href="#how-it-works">
              <Button variant="outline" size="lg" className="text-lg px-8 py-4">
                Learn More
              </Button>
            </Link>
          </div>

          {/* Trust Badge */}
          <p className="text-sm text-gray-500 mt-6">
            7-day free trial • No credit card required • Cancel anytime
          </p>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="container-safe py-20 bg-white">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-center text-gray-900 mb-16">
            How Momentum Works
          </h2>

          <div className="grid md:grid-cols-3 gap-12">
            {/* Step 1 */}
            <div className="text-center">
              <div className="w-16 h-16 bg-social-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-white text-2xl font-bold">1</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">
                Take the Assessment
              </h3>
              <p className="text-gray-600">
                Answer 23 questions to map your avoidance patterns across Social,
                Physical, Professional, and Emotional dimensions.
              </p>
            </div>

            {/* Step 2 */}
            <div className="text-center">
              <div className="w-16 h-16 bg-physical-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-white text-2xl font-bold">2</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">
                Get Daily Challenges
              </h3>
              <p className="text-gray-600">
                Receive one personalized challenge each day, perfectly calibrated to
                your edge - difficult enough to matter, achievable enough to win.
              </p>
            </div>

            {/* Step 3 */}
            <div className="text-center">
              <div className="w-16 h-16 bg-professional-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-white text-2xl font-bold">3</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">
                Watch Your Range Expand
              </h3>
              <p className="text-gray-600">
                Visualize your comfort zone expansion with the Range Map. Each
                completion is evidence of who you&apos;re becoming.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Philosophy Section */}
      <section className="container-safe py-20 bg-gradient-to-r from-primary-900 to-primary-700 text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-5xl font-bold mb-8">
            &quot;Action creates clarity. Small wins build identity.&quot;
          </h2>
          <p className="text-xl md:text-2xl text-primary-100 mb-8">
            You don&apos;t think your way out of avoidance. You act your way out.
          </p>
          <p className="text-lg text-primary-200 max-w-2xl mx-auto">
            Momentum isn&apos;t about motivation or willpower. It&apos;s about systematic
            expansion of your comfort zone through evidence-based challenges
            that shift your identity.
          </p>
        </div>
      </section>

      {/* Features Section */}
      <section className="container-safe py-20 bg-white">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-center text-gray-900 mb-16">
            Built Different
          </h2>

          <div className="grid md:grid-cols-2 gap-12">
            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-social-100 text-social-600 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">One Challenge Per Day</h3>
                <p className="text-gray-600">
                  No overwhelm. No choice paralysis. Just one perfectly targeted action.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-physical-100 text-physical-600 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Progressive Difficulty</h3>
                <p className="text-gray-600">
                  Challenges adapt as you grow. Always at your edge, never beyond it.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-professional-100 text-professional-600 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                </div>
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Identity-First Design</h3>
                <p className="text-gray-600">
                  Every challenge includes an identity frame. This is evidence of who you are.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-emotional-100 text-emotional-600 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Evidence Required</h3>
                <p className="text-gray-600">
                  Photo, screenshot, or voice note. Proof creates belief.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="container-safe py-20 bg-primary-50">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-gray-900 mb-6">
            Ready to Expand Your Range?
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            Start with 7 days free. No credit card required.
          </p>
          <Link href="/register">
            <Button variant="primary" size="lg" className="text-lg px-12 py-4">
              Begin Your Free Trial
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="container-safe py-12 border-t border-gray-200">
        <div className="text-center text-gray-500 text-sm">
          <p>&copy; {new Date().getFullYear()} Momentum. All rights reserved.</p>
        </div>
      </footer>
    </main>
  );
}
