"use client";
import {
  Navbar,
  NavBody,
  NavItems,
  MobileNav,
  NavbarLogo,
  NavbarButton,
  MobileNavHeader,
  MobileNavToggle,
  MobileNavMenu,
} from "@/components/ui/resizable-navbar";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { ModeToggle } from "@/components/ui/theme-toggle";
import { SparklesCore } from "@/components/ui/sparkles";
import { useTheme } from "next-themes";
import { GridBackground } from "@/components/ui/grid-background";
import { WobbleCard } from "@/components/ui/wobble-card";
import { Timeline } from "@/components/ui/timeline";
import { Pricing2 } from "@/components/pricing2";
import { Footer2 } from "@/components/footer2";
import { Spotlight } from "@/components/ui/Spotlight";
import { Contact7 } from "@/components/contact7";
import { Boxes } from "@/components/ui/background-boxes";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
export default function Page() {
  const navItems = [
    {
      name: "Features",
      link: "#features",
    },
    {
      name: "Pricing",
      link: "#pricing",
    },
    {
      name: "Contact",
      link: "#contact",
    },
  ];

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className={cn("relative w-full ")}>
      <Navbar>
        {/* Desktop Navigation */}
        <NavBody>
          <NavbarLogo />
          <NavItems items={navItems} />
          <div className="flex items-center gap-4">
            {/* <NavbarButton variant="secondary"><Link href="/auth/login">Login</Link></NavbarButton> */}
            <NavbarButton variant="primary"><Link href="/auth/login">Login</Link></NavbarButton>
            <NavbarButton variant="empty">
              <ModeToggle />
            </NavbarButton>
          </div>
        </NavBody>

        {/* Mobile Navigation */}
        <MobileNav>
          <MobileNavHeader>
            <NavbarLogo />
            <MobileNavToggle
              isOpen={isMobileMenuOpen}
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            />
          </MobileNavHeader>

          <MobileNavMenu
            isOpen={isMobileMenuOpen}
            onClose={() => setIsMobileMenuOpen(false)}
          >
            {navItems.map((item, idx) => (
              <a
                key={`mobile-link-${idx}`}
                href={item.link}
                onClick={() => setIsMobileMenuOpen(false)}
                className="relative text-neutral-600 dark:text-neutral-300"
              >
                <span className="block">{item.name}</span>
              </a>
            ))}
            <div className="flex w-full flex-col gap-4">
              {/* <NavbarButton
                onClick={() => setIsMobileMenuOpen(false)}
                variant="primary"
                className="w-full"
              >
                Login
              </NavbarButton> */}
              <NavbarButton
                onClick={() => setIsMobileMenuOpen(false)}
                variant="primary"
                className="w-full"
              >
                <Link href="/auth/login">Login</Link>
              </NavbarButton>
              <ModeToggle />

            </div>
          </MobileNavMenu>
        </MobileNav>
      </Navbar>
      {/* <DummyContent /> */}
      <PageContent />
      <Footer2/>
      {/* Navbar */}
    </div>
  );
}

const PageContent = () => {
  return (
    <div >
    <Hero/>
    <div className="relative flex  w-full items-center justify-center bg-background">
      <div
        className={cn(
          "absolute inset-0",
          "[background-size:20px_20px]",
          "[background-image:radial-gradient(#d4d4d4_1px,transparent_1px)]",
          "dark:[background-image:radial-gradient(#404040_1px,transparent_1px)]",
        )}
      />
      {/* Radial gradient for the container to give a faded look */}
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-background [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)] "></div>
      <p className="relative z-20 bg-gradient-to-b from-neutral-200 to-neutral-500 bg-clip-text ">
           <TimelineDemo/>
      </p>
    </div>
    </div>
  );
};

const WobbleCards = () => {
  return(
   <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 max-w-5xl mx-auto w-full">
      <WobbleCard
        containerClassName="col-span-1 lg:col-span-2 h-full bg-pink-800 min-h-[500px] lg:min-h-[300px]"
        className=" relative"
      >
        <div className="max-w-xs">
          <h2 className="text-left text-balance text-base md:text-xl lg:text-3xl font-semibold tracking-[-0.015em] text-white">
            Powers faster mortgage decisions
          </h2>
          <p className="mt-4 text-left  text-base/6 text-neutral-200">
            With instant matching against lender credit criteria, CreditMatch saves advisers hours and improves accuracy in adverse credit cases.
          </p>
        </div>
        <img
          src="/ss.webp"
          width={500}
          height={500}
          alt="CreditMatch demo image"
          className="fixed -right-4 lg:-right-[60%] grayscale filter -bottom-2 object-contain rounded-2xl"
        />
      </WobbleCard>
      <WobbleCard containerClassName="col-span-1 min-h-[300px]">
        <h2 className="max-w-80  text-left text-balance text-base md:text-xl lg:text-3xl font-semibold tracking-[-0.015em] text-white">
          Accurate, compliant, up-to-date.
        </h2>
        <p className="mt-4 max-w-[26rem] text-left  text-base/6 text-neutral-200">
          Every match reflects the latest adverse credit acceptance rules.
        </p>
      </WobbleCard>
      <WobbleCard containerClassName=" relative col-span-1 lg:col-span-3 bg-blue-900 min-h-[500px] lg:min-h-[600px] xl:min-h-[300px]">
        <div className="max-w-sm">
          <h2 className="max-w-sm md:max-w-lg  text-left text-balance text-base md:text-xl lg:text-3xl font-semibold tracking-[-0.015em] text-white">
            Subscribe today and simplify adverse credit matching.
          </h2>
          <p className="mt-4 max-w-[26rem] text-left  text-base/6 text-neutral-200">
            Designed for mortgage advisers, CreditMatch turns complex criteria checks into instant, clear lender match results.
          </p>
        </div>
        <img
          src="/ss.webp"
          width={500}
          height={500}
          alt="CreditMatch demo image"
          className="fixed -right-10 md:-right-[40%] lg:-right-[20%] -bottom-10 object-contain rounded-2xl"
        />
      </WobbleCard>
    </div>
  );
}

const TimelineDemo = () => {
  const data = [
    {
      title: "Features",
      content: (
        <div id="features">
          <WobbleCards/>
        </div>
      ),
    },
    {
      title: "Pricing",
      content: (
        <div id="pricing">
          <Pricing2/>
        </div>
      ),
    },
    {
      title: "Contact",
      content: (
        <div id="contact">
          <Contact7/>
        </div>
      ),
    },
  ];
  return (
    <div className="pt-10 relative bg-transparent w-full overflow-clip">
      <Timeline data={data} />
    </div>
  );
}

const Hero = () =>{
  const { resolvedTheme } = useTheme();

  return (
    <div className="h-[500px] relative w-full overflow-hidden bg-background flex flex-col items-start justify-center rounded-lg">
      <div className="absolute inset-0 w-full h-full bg-background z-20 [mask-image:radial-gradient(transparent,white)] pointer-events-none" />
      <Boxes />
      <div className="mx-40 z-20 flex flex-col space-y-2">
      <h1 className={cn("md:text-4xl text-xl text-foreground relative z-20")}>
        Match the Right Lender. Every Time.
      </h1>
      <p className="text-center text-muted-foreground relative z-20">
        CreditMatch lets you input adverse credit details and instantly find lenders who accept, consider, or decline — no manual checks needed.
      </p>
      <Button className=" mt-4 w-fit"><Link className='flex flex-row gap-2' href="/auth/sign-up">Get Started <ArrowRight/> </Link></Button>
      </div>
    </div>
  );
}


