"use client";

import { Button } from "@/components/ui/button";
import {
  FileText,
  Mail,
  Sparkles,
  Crown,
  Linkedin,
  Mic,
  TrendingUp,
  DollarSign,
  MailPlus,
  Globe,
  Lock,
  Smartphone,
  Route,
  ScanSearch,
} from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { AiHistoryPanel } from "@/components/ai-history-panel";
import { motion, AnimatePresence } from "framer-motion";
import React, { useState, useEffect } from "react";

// ============================================
// ANIMATIONS
// ============================================

function TypeTester() {
  const [scale, setScale] = useState(1);

  useEffect(() => {
    const interval = setInterval(() => {
      setScale((prev) => (prev === 1 ? 1.3 : 1));
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex items-center justify-center h-full">
      <motion.span
        className="font-serif text-6xl md:text-8xl text-foreground font-medium"
        animate={{ scale }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      >
        Aa
      </motion.span>
    </div>
  );
}

function LayoutAnimation() {
  const [layout, setLayout] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setLayout((prev) => (prev + 1) % 3);
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  const layouts = ["grid-cols-2", "grid-cols-3", "grid-cols-1"];

  return (
    <div className="h-full flex items-center justify-center">
      <motion.div
        className={`grid ${layouts[layout]} gap-1.5 w-full max-w-[140px]`}
        layout
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      >
        {[1, 2, 3].map((i) => (
          <motion.div
            key={i}
            className="bg-foreground/15 rounded-3xl h-5 w-full"
            layout
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          />
        ))}
      </motion.div>
    </div>
  );
}

function SpeedIndicator() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setLoading(prev => !prev);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center h-full gap-4">
      <div className="h-10 flex items-center justify-center overflow-hidden relative w-full">
        <AnimatePresence mode="wait">
          {loading ? (
            <motion.div
              key="loader"
              className="h-8 w-24 bg-foreground/10 rounded-3xl"
              animate={{ opacity: [0.4, 0.7, 0.4] }}
              transition={{ duration: 1, repeat: Infinity }}
            />
          ) : (
            <motion.span
              key="text"
              initial={{ y: 20, opacity: 0, filter: "blur(5px)" }}
              animate={{ y: 0, opacity: 1, filter: "blur(0px)" }}
              className="text-3xl md:text-4xl font-sans font-medium text-foreground"
            >
              100ms
            </motion.span>
          )}
        </AnimatePresence>
      </div>
      <span className="text-sm text-muted-foreground">Load Time</span>
      <div className="w-full max-w-[120px] h-1.5 bg-foreground/10 rounded-full overflow-hidden">
        <motion.div
          className="h-full bg-primary rounded-full"
          initial={{ width: 0 }}
          animate={{ width: loading ? "30%" : "100%" }}
          transition={{ type: "spring", stiffness: 100, damping: 15, mass: 1 }}
        />
      </div>
    </div>
  );
}

function SecurityBadge() {
  const [shields, setShields] = useState([
    { id: 1, active: false },
    { id: 2, active: false },
    { id: 3, active: false }
  ]);

  useEffect(() => {
    const interval = setInterval(() => {
      setShields(prev => {
        const nextIndex = prev.findIndex(s => !s.active);
        if (nextIndex === -1) {
          return prev.map((s) => ({ ...s, active: false }));
        }
        return prev.map((s, i) => i === nextIndex ? { ...s, active: true } : s);
      });
    }, 800);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex items-center justify-center h-full gap-2">
      {shields.map((shield) => (
        <motion.div
          key={shield.id}
          className={`w-12 h-12 rounded-xl flex items-center justify-center ${
            shield.active ? 'bg-foreground/15' : 'bg-foreground/5'
          }`}
          animate={{ scale: shield.active ? 1.1 : 1 }}
          transition={{ duration: 0.3 }}
        >
          <Lock className={`w-5 h-5 ${shield.active ? 'text-foreground' : 'text-muted-foreground/50'}`} />
        </motion.div>
      ))}
    </div>
  );
}

function GlobalNetwork() {
  const pulses = [0, 1, 2, 3, 4];

  return (
    <div className="flex items-center justify-center h-full relative">
      <Globe className="w-16 h-16 text-foreground/80 z-10" />
      {pulses.map((pulse) => (
        <motion.div
          key={pulse}
          className="absolute w-16 h-16 border-2 border-foreground/25 rounded-full"
          initial={{ scale: 0.5, opacity: 1 }}
          animate={{ scale: 3, opacity: 0 }}
          transition={{
            duration: 3,
            repeat: Infinity,
            delay: pulse * 0.8,
            ease: "easeOut"
          }}
        />
      ))}
    </div>
  );
}

function MobileAnimation() {
  return (
    <div className="flex items-center justify-center h-full">
      <motion.div
        animate={{ y: [0, -5, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        <Smartphone className="w-16 h-16 text-foreground" />
      </motion.div>
    </div>
  );
}

function MoneyCounter() {
  const [amount, setAmount] = useState(95000);
  
  useEffect(() => {
    const interval = setInterval(() => {
      setAmount(Math.floor(Math.random() * 50000) + 80000);
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center h-full">
      <motion.span
        key={amount}
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="text-4xl font-bold text-primary"
      >
        ${amount.toLocaleString()}
      </motion.span>
      <span className="text-sm text-muted-foreground mt-2">Market Rate</span>
    </div>
  );
}

// ============================================
// CAREER PATH ANIMATION
// ============================================

function CareerPathAnimation() {
  const steps = [0, 1, 2, 3, 4];

  return (
    <div className="flex flex-col items-center justify-center h-full gap-3">
      <div className="flex items-center gap-2">
        {steps.map((step) => (
          <React.Fragment key={step}>
            <motion.div
              className="w-4 h-4 rounded-full bg-primary"
              animate={{ scale: [1, 1.3, 1], opacity: [0.4, 1, 0.4] }}
              transition={{
                duration: 2,
                repeat: Infinity,
                delay: step * 0.3,
              }}
            />
            {step < steps.length - 1 && (
              <motion.div
                className="w-6 h-0.5 bg-primary/30"
                animate={{ opacity: [0.2, 0.6, 0.2] }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  delay: step * 0.3 + 0.15,
                }}
              />
            )}
          </React.Fragment>
        ))}
      </div>
      <div className="flex gap-1 mt-2">
        {["Jr", "Mid", "Sr", "Lead", "VP"].map((label, i) => (
          <motion.span
            key={label}
            className="text-[10px] text-muted-foreground w-6 text-center"
            animate={{ opacity: [0.3, 1, 0.3] }}
            transition={{ duration: 2, repeat: Infinity, delay: i * 0.3 }}
          >
            {label}
          </motion.span>
        ))}
      </div>
    </div>
  );
}

function MatchSignal() {
  const [value, setValue] = useState(72);

  useEffect(() => {
    const interval = setInterval(() => {
      setValue((current) => (current >= 94 ? 72 : current + 6));
    }, 1300);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex h-full flex-col items-center justify-center gap-4">
      <div className="relative flex h-32 w-32 items-center justify-center rounded-full border border-primary/20 bg-primary/5">
        <motion.div
          className="absolute inset-0 rounded-full border border-primary/30"
          animate={{ scale: [0.92, 1.08, 0.92], opacity: [0.5, 0.95, 0.5] }}
          transition={{ duration: 2.4, repeat: Infinity }}
        />
        <motion.div
          className="absolute inset-4 rounded-full border border-primary/30"
          animate={{ scale: [1.08, 0.92, 1.08], opacity: [0.2, 0.7, 0.2] }}
          transition={{ duration: 2.4, repeat: Infinity, delay: 0.3 }}
        />
        <motion.span
          key={value}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-4xl font-semibold text-foreground"
        >
          {value}%
        </motion.span>
      </div>
      <div className="flex gap-2">
        {["Resume", "Job", "Fit"].map((label, index) => (
          <motion.div
            key={label}
            className="rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-[10px] uppercase tracking-[0.24em] text-primary"
            animate={{ opacity: [0.35, 1, 0.35] }}
            transition={{ duration: 1.8, repeat: Infinity, delay: index * 0.25 }}
          >
            {label}
          </motion.div>
        ))}
      </div>
    </div>
  );
}

// ============================================
// MAIN PAGE
// ============================================

export default function AIToolsPage() {
  const { userProfile } = useAuth();
  const userPlan = userProfile?.plan || "free";
  const isPremium = ["pro", "premium"].includes(userPlan);

  return (
    <div className="min-h-screen -m-4 md:-m-6 p-6 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.p
          className="text-3xl md:text-4xl font-bold mb-2 text-foreground"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          Career <span className="italic text-primary">LaunchPad</span>
        </motion.p>
        <motion.p 
          className="text-muted-foreground mb-10 max-w-2xl"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          AI-powered tools to help you stand out and land your dream job.
        </motion.p>

        <AiHistoryPanel />

        {/* Bento Grid - 6 columns */}
        <div className="grid grid-cols-1 md:grid-cols-6 gap-4 auto-rows-[200px]">
          
          {/* 1. Resume Match Analyzer - Tall (2x2) */}
          <motion.div
            className="md:col-span-2 md:row-span-2 bg-card border shadow-sm rounded-3xl p-8 flex flex-col hover:border-primary/60 transition-colors cursor-pointer overflow-hidden"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            whileHover={{ scale: 1.02 }}
          >
            <Link href="/ai-tools/resume-match" className="flex flex-col h-full">
              <div className="flex-1">
                <MatchSignal />
              </div>
              <div className="mt-4">
                <h3 className="text-xl text-foreground font-medium flex items-center gap-2">
                  <ScanSearch className="w-5 h-5 text-primary" />
                  Resume Match Analyzer
                </h3>
                <p className="text-muted-foreground text-sm mt-1">
                  Compare your resume to a job description, revise text, and keep the original PDF layout.
                </p>
              </div>
            </Link>
          </motion.div>

          {/* 2. Career Path - Tall (2x2) */}
          <motion.div
            className="md:col-span-2 md:row-span-2 bg-card border shadow-sm rounded-3xl p-6 flex flex-col hover:border-primary/60 transition-colors cursor-pointer overflow-hidden"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            whileHover={{ scale: 1.02 }}
          >
            <Link href="/ai-tools/career-path" className="flex flex-col h-full">
              <div className="flex-1 flex items-center justify-center">
                <CareerPathAnimation />
              </div>
              <div className="mt-auto">
                <h3 className="text-xl text-foreground flex items-center gap-2 font-medium">
                  <Route className="w-5 h-5 text-primary" />
                  Career Path Visualizer
                </h3>
                <p className="text-muted-foreground text-sm mt-1">AI-generated career roadmap with skill milestones.</p>
              </div>
            </Link>
          </motion.div>

          {/* 3. LinkedIn - Tall (2x2) */}
          <motion.div
            className="md:col-span-2 md:row-span-2 bg-card border shadow-sm rounded-3xl p-6 flex flex-col hover:border-primary/60 transition-colors cursor-pointer overflow-hidden"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            whileHover={{ scale: 1.02 }}
          >
            <Link href="/ai-tools/linkedin" className="flex flex-col h-full">
              <div className="flex-1 flex items-center justify-center">
                <GlobalNetwork />
              </div>
              <div className="mt-auto">
                <h3 className="text-xl text-foreground flex items-center gap-2 font-medium">
                  <Linkedin className="w-5 h-5 text-primary" />
                  LinkedIn Optimizer
                </h3>
                <p className="text-muted-foreground text-sm mt-1">Get noticed by recruiters worldwide.</p>
              </div>
            </Link>
          </motion.div>

          {/* 4. Resume Builder - Standard (2x1) */}
          <motion.div
            className="md:col-span-2 bg-card border shadow-sm rounded-3xl p-6 flex flex-col hover:border-primary/60 transition-colors cursor-pointer overflow-hidden"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
            whileHover={{ scale: 0.98 }}
          >
            <Link href="/ai-tools/resume-builder" className="flex flex-col h-full">
              <div className="flex-1">
                <TypeTester />
              </div>
              <div className="mt-4">
                <h3 className="text-xl text-foreground font-medium flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  Resume Builder
                </h3>
                <p className="text-muted-foreground text-sm mt-1">Create an ATS-optimized, professional resume.</p>
              </div>
            </Link>
          </motion.div>

          {/* 5. Cover Letter - Standard (2x1) */}
          <motion.div
            className="md:col-span-2 bg-card border shadow-sm rounded-3xl p-6 flex flex-col hover:border-primary/60 transition-colors cursor-pointer overflow-hidden"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4 }}
            whileHover={{ scale: 0.98 }}
          >
            <Link href="/ai-tools/cover-letter" className="flex flex-col h-full">
              <div className="flex-1">
                <LayoutAnimation />
              </div>
              <div className="mt-4">
                <h3 className="text-xl text-foreground font-medium flex items-center gap-2">
                  <Mail className="w-5 h-5" />
                  Cover Letter
                </h3>
                <p className="text-muted-foreground text-sm mt-1">Generate compelling cover letters.</p>
              </div>
            </Link>
          </motion.div>

          {/* 6. Interview Prep - Standard (2x1) */}
          <motion.div
            className="md:col-span-2 bg-card border shadow-sm rounded-3xl p-6 flex flex-col hover:border-primary/60 transition-colors cursor-pointer overflow-hidden"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.5 }}
            whileHover={{ scale: 0.98 }}
          >
            <Link href="/ai-tools/interview-prep" className="flex flex-col h-full">
              <div className="flex-1">
                <SpeedIndicator />
              </div>
              <div className="mt-4">
                <h3 className="text-xl text-foreground font-medium flex items-center gap-2">
                  <Mic className="w-5 h-5 text-primary" />
                  Interview Prep
                </h3>
                <p className="text-muted-foreground text-sm mt-1">Practice with AI feedback.</p>
              </div>
            </Link>
          </motion.div>

          {/* 7. Skill Gap - Standard (2x1) */}
          <motion.div
            className="md:col-span-2 bg-card border shadow-sm rounded-3xl p-6 flex flex-col hover:border-primary/60 transition-colors cursor-pointer overflow-hidden"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.6 }}
            whileHover={{ scale: 0.98 }}
          >
            <Link href="/ai-tools/skill-gap" className="flex flex-col h-full">
              <div className="flex-1">
                <SecurityBadge />
              </div>
              <div className="mt-4">
                <h3 className="text-xl text-foreground flex items-center gap-2 font-medium">
                  <TrendingUp className="w-5 h-5 text-brand-crema" />
                  Skill Gap Analyzer
                </h3>
                <p className="text-muted-foreground text-sm mt-1">Identify missing skills and get learning recommendations.</p>
              </div>
            </Link>
          </motion.div>

          {/* 8. Salary - Standard (2x1) */}
          <motion.div
            className="md:col-span-2 bg-card border shadow-sm rounded-3xl p-6 flex flex-col hover:border-primary/60 transition-colors cursor-pointer overflow-hidden"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.7 }}
            whileHover={{ scale: 0.98 }}
          >
            <Link href="/ai-tools/salary" className="flex flex-col h-full">
              <div className="flex-1">
                <MoneyCounter />
              </div>
              <div className="mt-4">
                <h3 className="text-xl text-foreground font-medium flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-primary" />
                  Salary Negotiator
                </h3>
                <p className="text-muted-foreground text-sm mt-1">Get data-driven salary insights and negotiation scripts.</p>
              </div>
            </Link>
          </motion.div>

          {/* 9. Email Templates - Standard (2x1) */}
          <motion.div
            className="md:col-span-2 bg-card border shadow-sm rounded-3xl p-6 flex flex-col hover:border-primary/60 transition-colors cursor-pointer overflow-hidden"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.8 }}
            whileHover={{ scale: 0.98 }}
          >
            <Link href="/ai-tools/email-templates" className="flex flex-col h-full">
              <div className="flex-1">
                <MobileAnimation />
              </div>
              <div className="mt-4">
                <h3 className="text-xl text-foreground font-medium flex items-center gap-2">
                  <MailPlus className="w-5 h-5 text-primary" />
                  Email Templates
                </h3>
                <p className="text-muted-foreground text-sm mt-1">Professional follow-up emails.</p>
              </div>
            </Link>
          </motion.div>

        </div>

        {/* CTA for Free Users */}
        {!isPremium && (
          <motion.div 
            className="mt-12 bg-accent/60 border border-primary/30 rounded-2xl p-8 text-center"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <Crown className="h-12 w-12 mx-auto mb-4 text-brand-crema" />
            <h2 className="text-2xl font-bold mb-2 text-foreground">Unlock Premium Features</h2>
            <p className="text-muted-foreground mb-6 max-w-lg mx-auto">
              Upgrade for unlimited access to all AI tools and priority processing.
            </p>
            <Button asChild size="lg" className="rounded-full">
              <Link href="/pricing">
                <Sparkles className="mr-2 h-4 w-4" />
                View Pricing
              </Link>
            </Button>
          </motion.div>
        )}
      </div>
    </div>
  );
}
