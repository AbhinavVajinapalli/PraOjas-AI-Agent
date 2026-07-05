import React, { useState } from 'react';
import { motion, AnimatePresence } from "framer-motion";
import { BrainCircuit, FlaskConical, Activity, Check, HeartPulse, X, Mail, Phone, MapPin, ChevronRight, Zap, ShieldCheck, ArrowRight } from "lucide-react";
import { useTheme, ThemeSwitcher } from "../App";

export default function LandingPage({ onEnter }: { onEnter: () => void }) {
  const { theme, setTheme } = useTheme();
  const [showPrivacy, setShowPrivacy] = useState(false);
  const [showTerms, setShowTerms] = useState(false);

  return (
    <div className="min-h-screen bg-background flex flex-col overflow-y-auto">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b border-border bg-card/80 backdrop-blur-md">
        <div className="container mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400">
            <HeartPulse className="w-6 h-6" />
            <span className="text-xl font-bold tracking-tight text-foreground">PraOjas AI</span>
          </div>
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-muted-foreground">
            <a href="#features" className="hover:text-foreground transition-colors">Features</a>
            <a href="#about" className="hover:text-foreground transition-colors">About Us</a>
            <a href="#contact" className="hover:text-foreground transition-colors">Contact</a>
          </nav>
          <div className="flex items-center gap-4">
            <ThemeSwitcher theme={theme} setTheme={setTheme} />
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onEnter}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold rounded-lg transition-colors shadow-sm shadow-indigo-500/25 flex items-center gap-2"
            >
              Go to Dashboard <ArrowRight className="w-4 h-4" />
            </motion.button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1">
        <section className="relative overflow-hidden pt-24 pb-32">
          <div className="absolute inset-0 bg-gradient-to-b from-indigo-500/10 to-transparent dark:from-indigo-500/5 dark:to-transparent" />
          <div className="container mx-auto px-6 relative z-10">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <motion.div 
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="max-w-2xl"
              >
                <h1 className="text-5xl lg:text-6xl font-extrabold tracking-tight text-foreground mb-6 leading-[1.1]">
                  Predicting Critical Trajectories <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-cyan-400">Before They Happen</span>.
                </h1>
                <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
                  PraOjas AI is the next-generation clinical intelligence platform for ICUs. Using advanced multi-agent reasoning, it continuously monitors vitals and labs to detect Sepsis and Mortality risks hours before clinical onset.
                </p>
                <div className="flex items-center gap-4">
                  <motion.button 
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={onEnter}
                    className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl transition-colors shadow-lg shadow-indigo-500/25 flex items-center gap-2 text-lg"
                  >
                    Enter Dashboard
                  </motion.button>
                  <motion.a 
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    href="#contact" className="px-6 py-3 bg-secondary text-foreground font-semibold rounded-xl hover:bg-secondary/80 transition-colors border border-border text-lg"
                  >
                    Contact Us
                  </motion.a>
                </div>
              </motion.div>
              <motion.div 
                initial={{ opacity: 0, scale: 0.9, y: 30 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ duration: 1, ease: "easeOut", delay: 0.2 }}
                className="relative"
              >
                <div className="absolute -inset-4 bg-gradient-to-tr from-indigo-500/20 to-cyan-400/20 rounded-[2rem] blur-3xl opacity-40" />
                <img 
                  src="/hero_clinical_dashboard.png" 
                  alt="Modern ICU Clinical Dashboard" 
                  className="relative rounded-[2rem] border border-border/50 shadow-2xl w-full object-cover"
                />
              </motion.div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-24 bg-secondary/30 border-t border-border">
          <div className="container mx-auto px-6">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              className="text-center max-w-3xl mx-auto mb-16"
            >
              <h2 className="text-3xl font-bold text-foreground mb-4">Augmenting Clinical Intelligence</h2>
              <p className="text-muted-foreground text-lg">Our multi-agent architecture ensures every patient gets personalized, evidence-based oversight 24/7.</p>
            </motion.div>
            
            <div className="grid md:grid-cols-3 gap-8">
              {[
                { icon: BrainCircuit, color: "indigo", title: "Dynamic Risk Scoring", desc: "Synthesizes complex vitals and laboratory results using advanced clinical AI to produce precise Sepsis and Mortality risk probabilities in real time." },
                { icon: FlaskConical, color: "emerald", title: "Explainable AI", desc: "Every prediction comes with transparent, guideline-backed reasoning (Sepsis-3, qSOFA), extracting exact risk factors directly from unstructured clinical notes." },
                { icon: Activity, color: "cyan", title: "Real-time Telemetry", desc: "Constant background monitoring with smart threshold alerts prevents alarm fatigue while ensuring critical deteriorations are never missed." }
              ].map((f, i) => (
                <motion.div 
                  key={i}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-50px" }}
                  transition={{ delay: i * 0.15 }}
                  className={`bg-card border border-border p-8 rounded-2xl hover:border-${f.color}-500/30 transition-colors relative group`}
                >
                  <div className={`absolute inset-0 bg-gradient-to-br from-${f.color}-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl`} />
                  <div className={`w-12 h-12 bg-${f.color}-500/10 text-${f.color}-600 dark:text-${f.color}-400 rounded-xl flex items-center justify-center mb-6 relative z-10`}>
                    <f.icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-xl font-bold text-foreground mb-3 relative z-10">{f.title}</h3>
                  <p className="text-muted-foreground leading-relaxed relative z-10">{f.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* About Section */}
        <section id="about" className="py-32">
          <div className="container mx-auto px-6">
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              <motion.div
                initial={{ opacity: 0, x: -50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-100px" }}
              >
                <img 
                  src="/about_team_medical.png" 
                  alt="Doctor using clinical analytics on tablet" 
                  className="rounded-[2rem] border border-border/50 shadow-xl w-full object-cover"
                />
              </motion.div>
              <motion.div
                initial={{ opacity: 0, x: 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-100px" }}
              >
                <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-6">About PraOjas AI</h2>
                <p className="text-lg text-muted-foreground mb-4 leading-relaxed">
                  PraOjas AI was conceived from a singular vision: to bridge the gap between overwhelming clinical data and timely, life-saving decisions in the ICU.
                </p>
                <p className="text-base text-muted-foreground mb-6 leading-relaxed">
                  Our platform is built on validated clinical datasets and adheres strictly to the latest Surviving Sepsis Campaign guidelines. We combine multiple specialized AI agents — each focused on prediction, validation, NLP extraction, and report generation — into a unified system that augments clinical judgment without replacing the clinician.
                </p>
                <ul className="space-y-4 mb-8">
                  {[
                    "Secure & HIPAA Compliant Architecture",
                    "Seamless EHR Integration via FHIR Standards",
                    "Automated Clinical Decision Support Reports",
                    "Multi-Agent AI for Transparent Reasoning",
                  ].map((item, i) => (
                    <li key={i} className="flex items-center gap-3 text-foreground font-medium">
                      <div className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center flex-shrink-0">
                        <Check className="w-3.5 h-3.5" />
                      </div>
                      {item}
                    </li>
                  ))}
                </ul>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Contact Section */}
        <section id="contact" className="py-24 bg-secondary/30 border-t border-border">
          <div className="container mx-auto px-6">
            <div className="text-center max-w-2xl mx-auto mb-12">
              <h2 className="text-3xl font-bold text-foreground mb-4">Get in Touch</h2>
              <p className="text-muted-foreground text-lg">Interested in deploying PraOjas AI at your institution? Our team is ready to help.</p>
            </div>
            <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
              <div className="bg-card border border-border p-6 rounded-2xl text-center">
                <div className="w-12 h-12 bg-indigo-500/10 text-indigo-500 dark:text-indigo-400 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <Mail className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-foreground mb-2">Email</h3>
                <p className="text-sm text-muted-foreground">support@praojas.ai</p>
              </div>
              <div className="bg-card border border-border p-6 rounded-2xl text-center">
                <div className="w-12 h-12 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <Phone className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-foreground mb-2">Phone</h3>
                <p className="text-sm text-muted-foreground">+1 (800) PRA-OJAS</p>
              </div>
              <div className="bg-card border border-border p-6 rounded-2xl text-center">
                <div className="w-12 h-12 bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <MapPin className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-foreground mb-2">Location</h3>
                <p className="text-sm text-muted-foreground">Hyderabad, India</p>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Privacy Modal */}
      {showPrivacy && (
        <div className="fixed inset-0 z-[100] bg-black/50 flex items-center justify-center p-4" onClick={() => setShowPrivacy(false)}>
          <div className="bg-card border border-border rounded-2xl max-w-2xl w-full max-h-[80vh] overflow-y-auto p-8" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-foreground">Privacy Policy</h2>
              <button onClick={() => setShowPrivacy(false)} className="p-1 hover:bg-secondary rounded-lg"><X className="w-5 h-5 text-muted-foreground" /></button>
            </div>
            <div className="space-y-4 text-sm text-muted-foreground leading-relaxed">
              <p><strong className="text-foreground">Effective Date:</strong> January 1, 2026</p>
              <p>PraOjas AI ("we", "us") is committed to protecting patient data and adhering to healthcare privacy regulations including HIPAA.</p>
              <p><strong className="text-foreground">Data Collection:</strong> We process de-identified clinical data (vitals, labs, notes) solely to provide AI-powered risk predictions. We do not collect personally identifiable information (PII) beyond what is required for clinical decision support.</p>
              <p><strong className="text-foreground">Data Security:</strong> All data is encrypted at rest (AES-256) and in transit (TLS 1.3). Our infrastructure is deployed on SOC 2 Type II certified cloud services.</p>
              <p><strong className="text-foreground">Data Retention:</strong> Patient session data is retained for the duration of the clinical encounter and purged within 30 days of discharge unless otherwise required by institutional policy.</p>
              <p><strong className="text-foreground">Third Parties:</strong> We do not sell, rent, or share patient data with any third parties. AI inference calls are made to secured API endpoints with no data persistence on external servers.</p>
              <p><strong className="text-foreground">Your Rights:</strong> Institutions may request data deletion, export, or audit at any time by contacting support@praojas.ai.</p>
            </div>
          </div>
        </div>
      )}

      {/* Terms Modal */}
      {showTerms && (
        <div className="fixed inset-0 z-[100] bg-black/50 flex items-center justify-center p-4" onClick={() => setShowTerms(false)}>
          <div className="bg-card border border-border rounded-2xl max-w-2xl w-full max-h-[80vh] overflow-y-auto p-8" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-foreground">Terms of Service</h2>
              <button onClick={() => setShowTerms(false)} className="p-1 hover:bg-secondary rounded-lg"><X className="w-5 h-5 text-muted-foreground" /></button>
            </div>
            <div className="space-y-4 text-sm text-muted-foreground leading-relaxed">
              <p><strong className="text-foreground">Effective Date:</strong> January 1, 2026</p>
              <p><strong className="text-foreground">1. Scope of Service:</strong> PraOjas AI is a clinical decision support tool intended to assist — not replace — qualified healthcare professionals. All AI-generated predictions, recommendations, and reports must be reviewed and validated by a licensed clinician before any clinical action is taken.</p>
              <p><strong className="text-foreground">2. Medical Disclaimer:</strong> PraOjas AI does not provide medical diagnoses. Risk scores and recommendations are probabilistic in nature and should be interpreted within the clinical context of each individual patient.</p>
              <p><strong className="text-foreground">3. Licensing:</strong> Access to PraOjas AI is granted on a per-institution basis. Unauthorized redistribution, reverse engineering, or use outside of licensed healthcare settings is strictly prohibited.</p>
              <p><strong className="text-foreground">4. Liability:</strong> PraOjas AI and its developers shall not be held liable for clinical outcomes resulting from the use or misuse of AI-generated predictions. The treating clinician retains full responsibility for patient care decisions.</p>
              <p><strong className="text-foreground">5. Uptime & Support:</strong> We target 99.9% uptime for production deployments. Critical support is available 24/7 at support@praojas.ai.</p>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="bg-card border-t border-border py-12">
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 mb-4">
                <HeartPulse className="w-5 h-5" />
                <span className="text-lg font-bold text-foreground">PraOjas AI</span>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Next-generation clinical intelligence for intensive care. Predicting critical trajectories before they happen.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-3 text-sm">Product</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#features" className="hover:text-foreground transition-colors">Features</a></li>
                <li><button onClick={onEnter} className="hover:text-foreground transition-colors">Dashboard</button></li>
                <li><a href="#about" className="hover:text-foreground transition-colors">About Us</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-3 text-sm">Legal</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><button onClick={() => setShowPrivacy(true)} className="hover:text-foreground transition-colors">Privacy Policy</button></li>
                <li><button onClick={() => setShowTerms(true)} className="hover:text-foreground transition-colors">Terms of Service</button></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-3 text-sm">Contact</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-center gap-2"><Mail className="w-3.5 h-3.5" /> support@praojas.ai</li>
                <li className="flex items-center gap-2"><Phone className="w-3.5 h-3.5" /> +1 (800) PRA-OJAS</li>
                <li className="flex items-center gap-2"><MapPin className="w-3.5 h-3.5" /> Hyderabad, India</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-border pt-6 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-xs text-muted-foreground">© 2026 PraOjas AI. All rights reserved. Not a medical device — intended for clinical decision support only.</p>
            <div className="flex gap-4 text-xs text-muted-foreground">
              <button onClick={() => setShowPrivacy(true)} className="hover:text-foreground transition-colors">Privacy</button>
              <button onClick={() => setShowTerms(true)} className="hover:text-foreground transition-colors">Terms</button>
              <a href="#contact" className="hover:text-foreground transition-colors">Contact</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}