import { HeroSection } from '@/components/marketing/HeroSection'
import { FeaturesSection } from '@/components/marketing/FeaturesSection'
import { ScreenshotCarousel } from '@/components/marketing/ScreenshotCarousel'
import { TechStackSection } from '@/components/marketing/TechStackSection'
import { CTASection } from '@/components/marketing/CTASection'

export default function LandingPage() {
  return (
    <>
      <HeroSection />
      <FeaturesSection />
      <ScreenshotCarousel />
      <TechStackSection />
      <CTASection />
    </>
  )
}
