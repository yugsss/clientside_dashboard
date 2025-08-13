"use client"

import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Check, Video, Clock, Users, Shield, Zap } from 'lucide-react';

export default function HomePage() {
  const handlePlanPurchase = (planId: string, stripeUrl: string) => {
    // Store plan info in localStorage for post-payment processing
    localStorage.setItem('selectedPlan', planId);
    window.open(stripeUrl, '_blank');
  };

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-10 bg-black/80 backdrop-blur-sm border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <img src="/images/editlobby-logo.jpg" alt="Edit Lobby" className="h-8 w-auto" />
              <span className="ml-3 text-xl font-bold text-white">Edit Lobby</span>
            </div>
            <div className="hidden md:block">
              <div className="ml-10 flex items-baseline space-x-4">
                <a href="#features" className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors">Features</a>
                <a href="#pricing" className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors">Pricing</a>
                <a href="#workflow" className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors">How It Works</a>
                <a href="app/dashboard/page.tsx" className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors">Dashboard</a>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center bg-gradient-to-b from-purple-900/20 to-black pt-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="space-y-8">
            <Badge className="bg-purple-600/20 text-purple-300 border-purple-500/30 px-4 py-2 text-sm">
              Professional Video Editing Service
            </Badge>
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold bg-gradient-to-r from-white via-purple-200 to-purple-400 bg-clip-text text-transparent">
              Edit Better
            </h1>
            <p className="text-xl md:text-2xl text-gray-400 max-w-3xl mx-auto leading-relaxed">
              Professional video editing service with dedicated editors, QC review, and Frame.io integration. 
              From raw footage to polished content - we handle it all.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                onClick={() => document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' })}
                className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-3 rounded-lg text-lg font-semibold transition-all duration-200 transform hover:scale-105"
              >
                Choose Your Plan
              </Button>
              <Button 
                variant="outline" 
                onClick={() => document.getElementById('workflow')?.scrollIntoView({ behavior: 'smooth' })}
                className="border-gray-600 text-white hover:bg-gray-800 px-8 py-3 rounded-lg text-lg font-semibold transition-all duration-200"
              >
                See How It Works
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="workflow" className="py-20 bg-gray-900/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">
              How It Works
            </h2>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto">
              Simple 5-step process from payment to final delivery
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-white font-bold text-xl">1</span>
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Choose Plan</h3>
              <p className="text-gray-400 text-sm">Select your editing plan and complete secure payment via Stripe</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-white font-bold text-xl">2</span>
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Secure Signup</h3>
              <p className="text-gray-400 text-sm">Receive secure signup link via email (24-hour token)</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-white font-bold text-xl">3</span>
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Upload Project</h3>
              <p className="text-gray-400 text-sm">Create project and share Google Drive link with raw footage</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-white font-bold text-xl">4</span>
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Professional Edit</h3>
              <p className="text-gray-400 text-sm">Assigned editor works on your project with QC review</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-white font-bold text-xl">5</span>
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Final Delivery</h3>
              <p className="text-gray-400 text-sm">Review via Frame.io, request revisions, or approve final video</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">
              Why Choose Edit Lobby
            </h2>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto">
              Professional video editing service with enterprise-grade tools and workflow
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="bg-gray-900/50 border-gray-700 hover:border-purple-500/50 transition-all duration-300">
              <CardHeader>
                <div className="w-12 h-12 bg-purple-600 rounded-lg flex items-center justify-center mb-4">
                  <Video className="w-6 h-6 text-white" />
                </div>
                <CardTitle className="text-white">Professional Editors</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-400">Dedicated professional editors assigned to your projects with expertise in your industry</p>
              </CardContent>
            </Card>
            
            <Card className="bg-gray-900/50 border-gray-700 hover:border-purple-500/50 transition-all duration-300">
              <CardHeader>
                <div className="w-12 h-12 bg-green-600 rounded-lg flex items-center justify-center mb-4">
                  <Shield className="w-6 h-6 text-white" />
                </div>
                <CardTitle className="text-white">QC Review Process</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-400">Every project goes through quality control review before client delivery</p>
              </CardContent>
            </Card>
            
            <Card className="bg-gray-900/50 border-gray-700 hover:border-purple-500/50 transition-all duration-300">
              <CardHeader>
                <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center mb-4">
                  <Zap className="w-6 h-6 text-white" />
                </div>
                <CardTitle className="text-white">Frame.io Integration</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-400">Seamless review and collaboration through integrated Frame.io platform</p>
              </CardContent>
            </Card>
            
            <Card className="bg-gray-900/50 border-gray-700 hover:border-purple-500/50 transition-all duration-300">
              <CardHeader>
                <div className="w-12 h-12 bg-yellow-600 rounded-lg flex items-center justify-center mb-4">
                  <Clock className="w-6 h-6 text-white" />
                </div>
                <CardTitle className="text-white">Fast Turnaround</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-400">Quick delivery times with real-time progress tracking and milestone updates</p>
              </CardContent>
            </Card>
            
            <Card className="bg-gray-900/50 border-gray-700 hover:border-purple-500/50 transition-all duration-300">
              <CardHeader>
                <div className="w-12 h-12 bg-red-600 rounded-lg flex items-center justify-center mb-4">
                  <Users className="w-6 h-6 text-white" />
                </div>
                <CardTitle className="text-white">Team Collaboration</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-400">Real-time notifications and updates between clients, editors, and QC team</p>
              </CardContent>
            </Card>
            
            <Card className="bg-gray-900/50 border-gray-700 hover:border-purple-500/50 transition-all duration-300">
              <CardHeader>
                <div className="w-12 h-12 bg-indigo-600 rounded-lg flex items-center justify-center mb-4">
                  <Shield className="w-6 h-6 text-white" />
                </div>
                <CardTitle className="text-white">Secure & Reliable</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-400">Enterprise-grade security with secure file sharing and project management</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 bg-gray-900/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">
              Choose Your Plan
            </h2>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto">
              Professional video editing plans designed for every need and budget
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Basic Plan */}
            <Card className="bg-gray-800/50 border-gray-700 hover:border-purple-500/50 transition-all duration-300 relative">
              <CardHeader className="text-center">
                <CardTitle className="text-2xl font-bold text-white mb-2">Basic</CardTitle>
                <div className="text-4xl font-bold text-white mb-2">
                  $45<span className="text-lg text-gray-400">/video</span>
                </div>
                <p className="text-gray-400 text-sm">Perfect for occasional projects</p>
              </CardHeader>
              <CardContent className="space-y-4">
                <ul className="space-y-3 text-gray-300">
                  <li className="flex items-center">
                    <Check className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" />
                    <span className="text-sm">One professional video edit</span>
                  </li>
                  <li className="flex items-center">
                    <Check className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" />
                    <span className="text-sm">48-hour turnaround</span>
                  </li>
                  <li className="flex items-center">
                    <Check className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" />
                    <span className="text-sm">2 rounds of revisions</span>
                  </li>
                  <li className="flex items-center">
                    <Check className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" />
                    <span className="text-sm">Frame.io review platform</span>
                  </li>
                  <li className="flex items-center">
                    <Check className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" />
                    <span className="text-sm">QC review included</span>
                  </li>
                </ul>
                <Button 
                  onClick={() => handlePlanPurchase('basic', 'https://buy.stripe.com/test_00w4gs2ca7jZgmd7W6gbm05')}
                  className="w-full bg-purple-600 hover:bg-purple-700 text-white py-3 px-6 rounded-lg font-semibold transition-all duration-200 transform hover:scale-105"
                >
                  Get Started
                </Button>
              </CardContent>
            </Card>

            {/* Monthly Pass Plan */}
            <Card className="bg-gray-800/50 border-gray-700 hover:border-purple-500/50 transition-all duration-300 relative">
              <CardHeader className="text-center">
                <CardTitle className="text-2xl font-bold text-white mb-2">Monthly Pass</CardTitle>
                <div className="text-4xl font-bold text-white mb-2">
                  $350<span className="text-lg text-gray-400">/month</span>
                </div>
                <Badge className="bg-green-600 text-white text-xs px-2 py-1">Save $100</Badge>
              </CardHeader>
              <CardContent className="space-y-4">
                <ul className="space-y-3 text-gray-300">
                  <li className="flex items-center">
                    <Check className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" />
                    <span className="text-sm">10 videos per month</span>
                  </li>
                  <li className="flex items-center">
                    <Check className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" />
                    <span className="text-sm">48-hour turnaround per video</span>
                  </li>
                  <li className="flex items-center">
                    <Check className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" />
                    <span className="text-sm">2 rounds of revisions per video</span>
                  </li>
                  <li className="flex items-center">
                    <Check className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" />
                    <span className="text-sm">Priority support</span>
                  </li>
                  <li className="flex items-center">
                    <Check className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" />
                    <span className="text-sm">Dedicated project manager</span>
                  </li>
                </ul>
                <Button 
                  onClick={() => handlePlanPurchase('monthly_pass', 'https://buy.stripe.com/test_00wfZaaIGeMrfi9gsCgbm04')}
                  className="w-full bg-purple-600 hover:bg-purple-700 text-white py-3 px-6 rounded-lg font-semibold transition-all duration-200 transform hover:scale-105"
                >
                  Get Started
                </Button>
              </CardContent>
            </Card>

            {/* Premium Plan */}
            <Card className="bg-gradient-to-b from-purple-600/20 to-gray-800/50 border-purple-500 relative transform scale-105">
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                <Badge className="bg-purple-600 text-white px-4 py-1 text-sm font-semibold">
                  Most Popular
                </Badge>
              </div>
              <CardHeader className="text-center">
                <CardTitle className="text-2xl font-bold text-white mb-2">Premium</CardTitle>
                <div className="text-4xl font-bold text-white mb-2">
                  $500<span className="text-lg text-gray-400">/video</span>
                </div>
                <p className="text-gray-400 text-sm">High-end editing for important projects</p>
              </CardHeader>
              <CardContent className="space-y-4">
                <ul className="space-y-3 text-gray-300">
                  <li className="flex items-center">
                    <Check className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" />
                    <span className="text-sm">One premium edit</span>
                  </li>
                  <li className="flex items-center">
                    <Check className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" />
                    <span className="text-sm">3-4 day turnaround</span>
                  </li>
                  <li className="flex items-center">
                    <Check className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" />
                    <span className="text-sm">2 rounds of revisions</span>
                  </li>
                  <li className="flex items-center">
                    <Check className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" />
                    <span className="text-sm">Advanced color grading</span>
                  </li>
                  <li className="flex items-center">
                    <Check className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" />
                    <span className="text-sm">Motion graphics included</span>
                  </li>
                </ul>
                <Button 
                  onClick={() => handlePlanPurchase('premium', 'https://buy.stripe.com/test_cNibIUdUS6fV8TL0tEgbm03')}
                  className="w-full bg-purple-600 hover:bg-purple-700 text-white py-3 px-6 rounded-lg font-semibold transition-all duration-200 transform hover:scale-105"
                >
                  Get Started
                </Button>
              </CardContent>
            </Card>

            {/* Ultimate Plan */}
            <Card className="bg-gray-800/50 border-gray-700 hover:border-purple-500/50 transition-all duration-300 relative">
              <CardHeader className="text-center">
                <CardTitle className="text-2xl font-bold text-white mb-2">Ultimate</CardTitle>
                <div className="text-4xl font-bold text-white mb-2">
                  $999<span className="text-lg text-gray-400">/month</span>
                </div>
                <Badge className="bg-orange-600 text-white text-xs px-2 py-1">Our Best Offering</Badge>
              </CardHeader>
              <CardContent className="space-y-4">
                <ul className="space-y-3 text-gray-300">
                  <li className="flex items-center">
                    <Check className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" />
                    <span className="text-sm">One active project a day</span>
                  </li>
                  <li className="flex items-center">
                    <Check className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" />
                    <span className="text-sm">24-hour turnaround per edit</span>
                  </li>
                  <li className="flex items-center">
                    <Check className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" />
                    <span className="text-sm">Multiple rounds of revisions</span>
                  </li>
                  <li className="flex items-center">
                    <Check className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" />
                    <span className="text-sm">Dedicated editor & QC team</span>
                  </li>
                  <li className="flex items-center">
                    <Check className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" />
                    <span className="text-sm">24/7 priority support</span>
                  </li>
                </ul>
                <Button 
                  onClick={() => handlePlanPurchase('ultimate', 'https://buy.stripe.com/test_28EeV66sqgUz7PH4JUgbm02')}
                  className="w-full bg-purple-600 hover:bg-purple-700 text-white py-3 px-6 rounded-lg font-semibold transition-all duration-200 transform hover:scale-105"
                >
                  Get Started
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 py-12 border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center mb-4">
                <img src="/images/editlobby-logo.jpg" alt="Edit Lobby" className="h-8 w-auto" />
                <span className="ml-3 text-xl font-bold text-white">Edit Lobby</span>
              </div>
              <p className="text-gray-400">
                Professional video editing service with dedicated editors, QC review, and seamless collaboration.
              </p>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Services</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#pricing" className="hover:text-white transition-colors">Video Editing</a></li>
                <li><a href="#pricing" className="hover:text-white transition-colors">Color Grading</a></li>
                <li><a href="#pricing" className="hover:text-white transition-colors">Motion Graphics</a></li>
                <li><a href="#pricing" className="hover:text-white transition-colors">QC Review</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#workflow" className="hover:text-white transition-colors">How It Works</a></li>
                <li><a href="#features" className="hover:text-white transition-colors">Features</a></li>
                <li><a href="#" className="hover:text-white transition-colors">About Us</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="/dashboard" className="hover:text-white transition-colors">Dashboard</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Help Center</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Terms of Service</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 Edit Lobby. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
