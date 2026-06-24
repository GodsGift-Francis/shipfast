import { PublicLayout } from "@/components/layout/PublicLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Search, Package, Globe, Zap, Shield, ArrowRight, 
  CheckCircle2, Clock, Truck, Star, ChevronRight 
} from "lucide-react";
import { useState } from "react";
import { useLocation, Link } from "wouter";
import { motion } from "framer-motion";

export default function Home() {
  const [, setLocation] = useLocation();
  const [trackingNumber, setTrackingNumber] = useState("");

  const handleTrack = (e: React.FormEvent) => {
    e.preventDefault();
    if (trackingNumber.trim()) {
      setLocation(`/track/${trackingNumber.trim()}`);
    }
  };

  const stats = [
    { label: "Shipments Delivered", value: "47,200+" },
    { label: "Countries Served", value: "190+" },
    { label: "On-Time Delivery", value: "99.8%" },
    { label: "Live Support", value: "24/7" },
  ];

  const steps = [
    { 
      title: "Book", 
      description: "Fill out our quote form with your package details and service level",
      icon: <Package className="w-6 h-6" />
    },
    { 
      title: "Track", 
      description: "Get a tracking number instantly and follow your shipment in real-time",
      icon: <Search className="w-6 h-6" />
    },
    { 
      title: "Delivered", 
      description: "Your package arrives on time with proof of delivery notification",
      icon: <CheckCircle2 className="w-6 h-6" />
    },
  ];

  const services = [
    {
      name: "Standard Ground",
      description: "Reliable and cost-effective shipping for non-urgent deliveries.",
      price: "$12.50",
      icon: <Truck className="w-8 h-8 text-primary" />,
      popular: false
    },
    {
      name: "Express Priority",
      description: "Faster transit times with priority handling for your urgent cargo.",
      price: "$24.90",
      icon: <Zap className="w-8 h-8 text-primary" />,
      popular: true
    },
    {
      name: "Overnight",
      description: "Next-day delivery guaranteed for your most time-sensitive shipments.",
      price: "$45.00",
      icon: <Clock className="w-8 h-8 text-primary" />,
      popular: false
    },
    {
      name: "International",
      description: "Global reach with customs clearance expertise in 190+ countries.",
      price: "$89.00",
      icon: <Globe className="w-8 h-8 text-primary" />,
      popular: false
    }
  ];

  const testimonials = [
    {
      quote: "ShipFast reduced our delivery times by 40%. The real-time tracking dashboard is a game-changer.",
      author: "Sarah M.",
      company: "TechCorp Ltd.",
      rating: 5
    },
    {
      quote: "Best freight pricing we've found. Our international shipments always arrive on time and damage-free.",
      author: "James K.",
      company: "Global Imports Inc.",
      rating: 5
    },
    {
      quote: "The portal is incredibly easy to use. Our team onboarded in under an hour.",
      author: "Priya R.",
      company: "E-commerce Solutions.",
      rating: 5
    }
  ];

  return (
    <PublicLayout>
      {/* Section 1: Hero */}
      <section className="relative pt-20 pb-32 overflow-hidden bg-slate-50">
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-96 h-96 bg-accent/5 rounded-full blur-3xl" />
        
        <div className="container mx-auto px-4 relative">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="max-w-2xl">
              <motion.h1 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-5xl md:text-6xl font-extrabold tracking-tight text-slate-900 mb-6"
              >
                Move the world's cargo. <br />
                <span className="text-primary">On time, every time.</span>
              </motion.h1>
              <motion.p 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="text-xl text-slate-600 mb-10 leading-relaxed"
              >
                ShipFast connects businesses to 190+ countries with real-time tracking, instant quotes, and guaranteed delivery.
              </motion.p>

              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="mb-8"
              >
                <form onSubmit={handleTrack} className="flex flex-col sm:flex-row gap-3 p-2 bg-white rounded-2xl shadow-xl border border-slate-200">
                  <div className="relative flex-1">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <Input 
                      value={trackingNumber}
                      onChange={(e) => setTrackingNumber(e.target.value)}
                      placeholder="Enter tracking number..." 
                      className="h-14 pl-12 text-lg border-0 shadow-none focus-visible:ring-0 bg-transparent"
                    />
                  </div>
                  <Button type="submit" size="lg" className="h-14 px-8 text-lg rounded-xl bg-primary hover:bg-primary/90">
                    Track Package
                  </Button>
                </form>
                <p className="mt-3 text-sm text-slate-500 ml-2">
                  Try: <span className="font-mono font-medium text-slate-700">SHF-A1B2C3D4</span>
                </p>
              </motion.div>

              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="flex flex-wrap gap-4"
              >
                <Button size="lg" className="h-14 px-8 rounded-xl bg-primary text-white" asChild>
                  <Link href="/quote">Get Instant Quote</Link>
                </Button>
                <Button size="lg" variant="outline" className="h-14 px-8 rounded-xl border-slate-200" asChild>
                  <Link href="/services">See Our Services</Link>
                </Button>
              </motion.div>
            </div>

            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4 }}
              className="relative hidden lg:block"
            >
              <div className="bg-white rounded-3xl shadow-2xl p-8 border border-slate-100 max-w-md ml-auto">
                <div className="flex justify-between items-start mb-8">
                  <div>
                    <Badge variant="outline" className="mb-2 bg-blue-50 text-blue-700 border-blue-100 px-3 py-1">In Transit</Badge>
                    <h3 className="text-xl font-bold text-slate-900">SHF-98234-AX</h3>
                  </div>
                  <Truck className="w-10 h-10 text-primary opacity-20" />
                </div>
                
                <div className="space-y-8">
                  {[
                    { status: "Package Picked Up", time: "Oct 24, 09:30 AM", completed: true },
                    { status: "At Sorting Facility", time: "Oct 24, 02:15 PM", completed: true },
                    { status: "In Transit", time: "Estimated: Oct 26", completed: false, active: true },
                    { status: "Out for Delivery", time: "Estimated: Oct 27", completed: false }
                  ].map((step, i) => (
                    <div key={i} className="flex gap-4 relative">
                      {i !== 3 && <div className={`absolute left-[11px] top-6 w-[2px] h-10 ${step.completed ? 'bg-primary' : 'bg-slate-200'}`} />}
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 z-10 ${step.completed ? 'bg-primary' : step.active ? 'bg-white border-4 border-primary' : 'bg-slate-200'}`}>
                        {step.completed && <CheckCircle2 className="w-4 h-4 text-white" />}
                      </div>
                      <div>
                        <p className={`text-sm font-bold ${step.active ? 'text-primary' : 'text-slate-900'}`}>{step.status}</p>
                        <p className="text-xs text-slate-500">{step.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="mt-8 p-4 bg-slate-50 rounded-xl flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Globe className="w-5 h-5 text-primary" />
                    <span className="text-sm font-medium text-slate-700">London → New York</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                </div>
              </div>
              
              {/* Floating Decorative Cards */}
              <div className="absolute -bottom-6 -left-6 bg-accent text-white p-6 rounded-2xl shadow-xl animate-bounce-slow">
                <Zap className="w-8 h-8 mb-2" />
                <p className="text-sm font-bold">Express Delivery</p>
                <p className="text-xs opacity-80 text-white/90">24h arrival</p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Section 2: Animated Stats Bar */}
      <section className="py-12 bg-primary overflow-hidden">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, i) => (
              <div key={i} className="text-center">
                <p className="text-4xl font-black text-accent mb-1">{stat.value}</p>
                <p className="text-sm font-medium text-white/80 uppercase tracking-wider">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Section 3: How It Works */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-4xl font-bold text-slate-900 mb-4">Ship in 3 simple steps</h2>
            <p className="text-lg text-slate-600">We've streamlined the logistics process so you can focus on growing your business while we handle the heavy lifting.</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-12 relative">
            {/* Connecting Line (Desktop) */}
            <div className="absolute top-12 left-1/4 right-1/4 h-[2px] bg-slate-100 hidden md:block" />
            
            {steps.map((step, i) => (
              <div key={i} className="text-center relative z-10 group">
                <div className="w-20 h-20 mx-auto rounded-full bg-slate-50 border-2 border-slate-100 flex items-center justify-center text-primary mb-6 transition-all group-hover:bg-primary group-hover:text-white group-hover:border-primary shadow-sm">
                  {step.icon}
                </div>
                <div className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-accent text-white font-bold mb-4 shadow-sm">
                  {i + 1}
                </div>
                <h3 className="text-2xl font-bold text-slate-900 mb-3">{step.title}</h3>
                <p className="text-slate-600 leading-relaxed">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Section 4: Services Preview */}
      <section className="py-24 bg-slate-50">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
            <div className="max-w-2xl">
              <h2 className="text-4xl font-bold text-slate-900 mb-4">Services built for every need</h2>
              <p className="text-lg text-slate-600">From local deliveries to global distribution, we have the right service level for your timeline and budget.</p>
            </div>
            <Button variant="outline" className="hidden md:flex items-center gap-2" asChild>
              <Link href="/services">View All Services <ArrowRight className="w-4 h-4" /></Link>
            </Button>
          </div>
          
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {services.map((service, i) => (
              <Card key={i} className={`relative overflow-hidden transition-all hover:shadow-xl ${service.popular ? 'border-primary ring-1 ring-primary' : 'border-slate-200'}`}>
                {service.popular && (
                  <div className="absolute top-0 right-0 bg-primary text-white text-[10px] font-bold px-3 py-1 rounded-bl-lg uppercase tracking-wider">
                    Most Popular
                  </div>
                )}
                <CardContent className="p-8">
                  <div className="mb-6">{service.icon}</div>
                  <h3 className="text-xl font-bold text-slate-900 mb-3">{service.name}</h3>
                  <p className="text-slate-600 text-sm mb-6 leading-relaxed">
                    {service.description}
                  </p>
                  <div className="flex items-center justify-between pt-6 border-t border-slate-100">
                    <div>
                      <p className="text-xs text-slate-500 uppercase font-medium">Starting at</p>
                      <p className="text-2xl font-black text-primary">{service.price}</p>
                    </div>
                    <Button size="sm" variant={service.popular ? "default" : "outline"} asChild>
                      <Link href="/quote">Get Quote</Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Section 5: Trust/Testimonials */}
      <section className="py-24 bg-white overflow-hidden">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-4xl font-bold text-slate-900 mb-4">Trusted by 10,000+ businesses worldwide</h2>
            <div className="flex items-center justify-center gap-1 mb-8">
              {[...Array(5)].map((_, i) => <Star key={i} className="w-5 h-5 fill-accent text-accent" />)}
              <span className="ml-2 font-bold text-slate-900">4.9/5 Rating</span>
            </div>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((t, i) => (
              <div key={i} className="p-8 rounded-3xl bg-slate-50 border border-slate-100 relative">
                <div className="flex gap-1 mb-4">
                  {[...Array(t.rating)].map((_, i) => <Star key={i} className="w-4 h-4 fill-accent text-accent" />)}
                </div>
                <p className="text-slate-700 italic mb-8 leading-relaxed">"{t.quote}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                    {t.author[0]}
                  </div>
                  <div>
                    <p className="font-bold text-slate-900">{t.author}</p>
                    <p className="text-sm text-slate-500">{t.company}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Section 6: Final CTA */}
      <section className="py-24 bg-primary relative overflow-hidden">
        <div className="absolute top-0 right-0 w-1/2 h-full opacity-10">
          <svg viewBox="0 0 100 100" className="w-full h-full fill-white">
            <circle cx="100" cy="0" r="100" />
          </svg>
        </div>
        
        <div className="container mx-auto px-4 relative z-10 text-center">
          <h2 className="text-4xl md:text-5xl font-black text-white mb-6">Ready to start shipping smarter?</h2>
          <p className="text-xl text-white/80 mb-10 max-w-2xl mx-auto">
            Join thousands of businesses who trust ShipFast for their global logistics needs. Create an account in minutes.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Button size="lg" className="h-14 px-10 text-lg rounded-xl bg-accent hover:bg-accent/90 text-white border-0 shadow-lg">
              Create Free Account
            </Button>
            <Button size="lg" variant="outline" className="h-14 px-10 text-lg rounded-xl border-white/30 text-white hover:bg-white/10">
              Talk to Sales
            </Button>
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}
