"use client";
import React, { Suspense } from 'react';
import { useSession } from "next-auth/react";
import { useState, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { parseFileLocally } from '@/lib/client-parser';

// ✅ Success Modal Component (Replaces Plan Purchase Popup with Large Green Tick)
function FastTrackModal({ isOpen, onClose, userName }: { isOpen: boolean; onClose: () => void; userName: string }) {
  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(26, 26, 26, 0.8)',
      zIndex: 1000,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
      backdropFilter: 'blur(5px)'
    }}>
      <div style={{
        background: '#FFFFFF',
        borderRadius: '24px',
        padding: '40px 32px',
        maxWidth: '420px',
        width: '100%',
        boxShadow: '0 25px 50px rgba(0, 0, 0, 0.15)',
        textAlign: 'center',
        position: 'relative',
        border: '2px solid #10B981'
      }}>
        {/* ✅ LARGE GREEN TICK */}
        <div style={{
          width: '80px',
          height: '80px',
          background: 'rgba(16, 185, 129, 0.1)',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 24px auto'
        }}>
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M20 6L9 17L4 12" stroke="#10B981" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>

        <h2 style={{ color: '#1A1A1A', fontSize: '24px', fontWeight: '800', marginBottom: '12px' }}>
          Analysis Successful!
        </h2>
        <p style={{ color: 'rgba(26,26,26,0.6)', fontSize: '15px', marginBottom: '32px', lineHeight: '1.5' }}>
          Hi, your CV has been successfully analyzed. We found highly relevant jobs matching your profile.
        </p>

        <button 
          onClick={onClose}
          style={{
            background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
            color: '#FFFFFF',
            border: 'none',
            padding: '16px 32px',
            borderRadius: '12px',
            fontSize: '16px',
            fontWeight: '700',
            cursor: 'pointer',
            width: '100%',
            transition: 'all 0.3s',
            boxShadow: '0 4px 15px rgba(16, 185, 129, 0.3)'
          }}
        >
          View My Jobs
        </button>
      </div>
    </div>
  );
}

// ✅ AI Skill Gap Analyzer Component (Emojis removed)
function SkillGapAnalyzer({ skills, experienceYears, forceShow = false, onClose }: { skills: string[]; experienceYears: number; forceShow?: boolean; onClose?: () => void }) {
  const [showAnalysis, setShowAnalysis] = useState(forceShow);
  const [analysis, setAnalysis] = useState<any>(null);

  useEffect(() => {
    const mockAnalysis = {
      missingSkills: [
        { name: 'Advanced Excel & Power BI', demand: 'High', salaryImpact: '+25%' },
        { name: 'Python for Data Analysis', demand: 'Very High', salaryImpact: '+35%' },
        { name: 'Project Management (PMP)', demand: 'High', salaryImpact: '+30%' },
      ],
      recommendedCourses: [
        { title: 'Advanced Excel & Power BI Masterclass', platform: 'Udemy', price: '499', duration: '12 hours', url: 'https://udemy.com' },
        { title: 'Python for Data Science', platform: 'Coursera', price: '₹1,999/mo', duration: '8 weeks', url: 'https://coursera.org' },
        { title: 'PMP Certification Prep', platform: 'LinkedIn Learning', price: '₹1,299/mo', duration: '35 hours', url: 'https://linkedin.com' },
      ],
      estimatedSalaryHike: '35-45%',
      timeline: '6-12 months'
    };
    setAnalysis(mockAnalysis);
  }, [skills, experienceYears]);

  if (!showAnalysis) {
    return (
      <div style={{
        background: '#FFFFFF',
        borderRadius: '16px',
        padding: '24px',
        margin: '20px 0',
        border: '1px solid rgba(0, 102, 204, 0.1)',
        boxShadow: '0 4px 20px rgba(0,0,0,0.03)',
        textAlign: 'center',
        cursor: 'pointer'
      }}
      onClick={() => setShowAnalysis(true)}
      >
        <h3 style={{ color: '#1A1A1A', fontSize: '20px', fontWeight: '700', marginBottom: '8px' }}>
          AI Skill Gap Analyzer
        </h3>
        <p style={{ color: 'rgba(26,26,26,0.6)', fontSize: '14px', marginBottom: '16px' }}>
          Discover the exact skills that can boost your salary by <span style={{ color: '#10B981', fontWeight: '700' }}>35-45%</span>
        </p>
        <button style={{
          background: 'linear-gradient(135deg, #0066CC 0%, #0052a3 100%)',
          color: '#FFFFFF',
          border: 'none',
          padding: '12px 28px',
          borderRadius: '10px',
          fontSize: '15px',
          fontWeight: '700',
          cursor: 'pointer'
        }}>
          Analyze My Profile - Free
        </button>
      </div>
    );
  }

  return (
    <div style={{
      background: '#FFFFFF',
      borderRadius: '16px',
      padding: '24px',
      margin: '20px 0',
      border: '1px solid rgba(0, 102, 204, 0.1)',
      boxShadow: '0 4px 20px rgba(0,0,0,0.03)'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h3 style={{ color: '#1A1A1A', fontSize: '20px', fontWeight: '700', marginBottom: '4px' }}>
            Your AI-Powered Career Roadmap
          </h3>
          <p style={{ color: 'rgba(26,26,26,0.6)', fontSize: '14px' }}>
            Estimated Salary Hike: <span style={{ color: '#10B981', fontWeight: '700' }}>{analysis?.estimatedSalaryHike}</span> in {analysis?.timeline}
          </p>
        </div>
                <div style={{ display: 'flex', gap: '8px' }}>
          <button onClick={() => setShowAnalysis(false)} style={{
            background: 'rgba(26,26,26,0.05)', color: '#1A1A1A', border: 'none',
            padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', fontSize: '13px', fontWeight: '600'
          }}>Collapse</button>
          {onClose && (
            <button onClick={onClose} style={{
              background: 'rgba(239, 68, 68, 0.1)', color: '#EF4444', border: 'none',
              padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', fontSize: '13px', fontWeight: '600'
            }}>✕ Close</button>
          )}
        </div>
      </div>

      <div style={{ marginBottom: '24px' }}>
        <h4 style={{ color: '#0066CC', fontSize: '15px', fontWeight: '700', marginBottom: '16px', textTransform: 'uppercase' }}>
          High-Demand Skills to Learn
        </h4>
        <div style={{ display: 'grid', gap: '12px' }}>
          {analysis?.missingSkills.map((skill: any, idx: number) => (
            <div key={idx} style={{
              background: '#F8FAFC', borderRadius: '12px', padding: '16px',
              border: '1px solid rgba(0, 102, 204, 0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center'
            }}>
              <div>
                <div style={{ color: '#1A1A1A', fontWeight: '600', marginBottom: '4px' }}>{skill.name}</div>
                <div style={{ color: 'rgba(26,26,26,0.5)', fontSize: '13px' }}>Market Demand: {skill.demand}</div>
              </div>
              {/* ✅ CHANGE 1: Emerald Green for Salary Increase Indicators */}
              <div style={{
                background: 'rgba(16, 185, 129, 0.1)', color: '#10B981', padding: '8px 16px',
                borderRadius: '10px', fontSize: '14px', fontWeight: '800'
              }}>
                {skill.salaryImpact}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h4 style={{ color: '#0066CC', fontSize: '15px', fontWeight: '700', marginBottom: '16px', textTransform: 'uppercase' }}>
          Recommended Courses
        </h4>
        <div style={{ display: 'grid', gap: '12px' }}>
          {analysis?.recommendedCourses.map((course: any, idx: number) => (
            <div key={idx} onClick={() => window.open(course.url, '_blank')} style={{
              background: '#F8FAFC', borderRadius: '12px', padding: '16px',
              border: '1px solid rgba(0, 102, 204, 0.05)', cursor: 'pointer', transition: 'all 0.3s'
            }}>
              <div style={{ color: '#1A1A1A', fontWeight: '600', marginBottom: '8px' }}>{course.title}</div>
              <div style={{ display: 'flex', gap: '16px', fontSize: '13px', color: 'rgba(26,26,26,0.6)' }}>
                <span>{course.platform}</span>
                <span>{course.price}</span>
                <span>{course.duration}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ✅ In-Feed Monetization Card
function InFeedMonetizationCard({ position }: { position: number }) {
  return (
    <div style={{
      background: 'linear-gradient(135deg, rgba(255, 107, 53, 0.05) 0%, rgba(0, 102, 204, 0.05) 100%)',
      borderRadius: '16px',
      padding: '24px',
      margin: '16px 0',
      border: '2px solid #FF6B35',
      boxShadow: '0 12px 40px rgba(255, 107, 53, 0.1)',
      position: 'relative',
      overflow: 'hidden'
    }}>
      <div style={{
        position: 'absolute', top: '0', right: '0',
        background: '#FF6B35', color: '#FFFFFF', padding: '4px 16px',
        fontSize: '11px', fontWeight: '800', borderBottomLeftRadius: '12px',
        textTransform: 'uppercase', letterSpacing: '0.5px'
      }}>
        Hot Offer
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
        <div style={{
          background: 'linear-gradient(135deg, #FF6B35 0%, #ff8f66 100%)',
          color: '#FFFFFF', padding: '8px 16px', borderRadius: '10px',
          fontSize: '13px', fontWeight: '800', textTransform: 'uppercase'
        }}>
          10-Min Fast-Track
        </div>
      </div>

      <h3 style={{ color: '#1A1A1A', fontSize: '20px', fontWeight: '800', marginBottom: '8px' }}>
        Get Hired in 10 Minutes!
      </h3>
      <p style={{ color: 'rgba(26,26,26,0.7)', fontSize: '14px', marginBottom: '20px', lineHeight: '1.5' }}>
        Don't wait weeks for a callback. Get your CV instantly in front of decision-makers who are hiring right now.
      </p>

      <button 
        onClick={() => window.open('https://imjo.in/SBqtUs', '_blank')}
        style={{
          background: 'linear-gradient(135deg, #FF6B35 0%, #ff8f66 100%)',
          color: '#FFFFFF', border: 'none', padding: '16px', borderRadius: '12px',
          fontSize: '16px', fontWeight: '800', cursor: 'pointer', width: '100%',
          marginBottom: '12px', boxShadow: '0 4px 15px rgba(255, 107, 53, 0.3)'
        }}
      >
        Get Hired in 10 Mins - Just ₹99
      </button>

      <button 
        onClick={() => window.open('https://imjo.in/TfbXzp', '_blank')}
        style={{
          background: '#FFFFFF',
          color: '#0066CC', border: '2px solid #0066CC', padding: '14px', borderRadius: '10px',
          fontSize: '14px', fontWeight: '700', cursor: 'pointer', width: '100%',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
          transition: 'all 0.3s'
        }}
      >
        Career Consulting Package - ₹149
      </button>
    </div>
  );
}

// ✅ Small Premium Feature Card (Dashboard Grid ke liye)
function PremiumFeatureCard({ title, description, icon, isLocked, onClick }: { title: string; description: string; icon: string; isLocked: boolean; onClick: () => void }) {
  return (
    <div 
      onClick={onClick}
      style={{
        background: isLocked ? 'rgba(0,0,0,0.02)' : '#FFFFFF',
        borderRadius: '16px',
        padding: '24px',
        border: isLocked ? '2px dashed rgba(0,0,0,0.1)' : '1px solid rgba(0, 102, 204, 0.1)',
        boxShadow: isLocked ? 'none' : '0 4px 20px rgba(0,0,0,0.03)',
        cursor: 'pointer',
        opacity: isLocked ? 0.6 : 1,
        transition: 'all 0.3s',
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      {isLocked && (
        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', background: 'rgba(255,255,255,0.95)', padding: '20px', borderRadius: '12px', textAlign: 'center', border: '2px solid #FF6B35', zIndex: 10 }}>
          <div style={{ fontSize: '32px', marginBottom: '8px' }}>🔒</div>
          <div style={{ fontSize: '13px', fontWeight: '700', color: '#FF6B35' }}>Premium Feature</div>
        </div>
      )}
      <div style={{ fontSize: '32px', marginBottom: '12px' }}>{icon}</div>
      <h3 style={{ color: '#1A1A1A', fontSize: '16px', fontWeight: '700', marginBottom: '8px' }}>{title}</h3>
      <p style={{ color: 'rgba(26,26,26,0.6)', fontSize: '13px', lineHeight: '1.5' }}>{description}</p>
      {!isLocked && (
        <button style={{ marginTop: '16px', background: 'linear-gradient(135deg, #0066CC 0%, #0052a3 100%)', color: '#FFFFFF', border: 'none', padding: '10px 20px', borderRadius: '8px', fontSize: '13px', fontWeight: '600', cursor: 'pointer' }}>
          Use Feature
        </button>
      )}
    </div>
  );
}
// ✅ NEW: Pricing Comparison Card Component
function PricingCard({ onSelectPlan }: { onSelectPlan: (plan: string) => void }) {
  return (
    <div style={{
      background: '#FFFFFF',
      borderRadius: '24px',
      padding: '32px 24px',
      maxWidth: '600px',
      width: '100%',
      boxShadow: '0 25px 50px rgba(0, 0, 0, 0.15)',
    }}>
      <h2 style={{ 
        color: '#1A1A1A', 
        fontSize: '24px', 
        fontWeight: '800', 
        marginBottom: '8px',
        textAlign: 'center'
      }}>
        Choose Your Plan
      </h2>
      <p style={{ 
        color: 'rgba(26,26,26,0.6)', 
        fontSize: '14px', 
        marginBottom: '32px',
        textAlign: 'center'
      }}>
        Unlock your full potential with our premium features
      </p>

            <div className="pricing-grid" style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(3, 1fr)', 
        gap: '12px'
      }}>
                {/* FREE PLAN */}
        <div style={{
          background: 'linear-gradient(135deg, rgba(0, 102, 204, 0.05) 0%, rgba(0, 102, 204, 0.02) 100%)',
          borderRadius: '12px',
          padding: '16px 12px',
          border: '2px solid #0066CC',
          display: 'flex',
          flexDirection: 'column'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <div>
              <h3 style={{ color: '#0066CC', fontSize: '18px', fontWeight: '700', margin: 0 }}>Free</h3>
              <p style={{ color: 'rgba(26,26,26,0.5)', fontSize: '13px', margin: '4px 0 0 0' }}>Basic Access</p>
            </div>
            <div style={{ color: '#0066CC', fontSize: '20px', fontWeight: '800' }}>₹0</div>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#1A1A1A' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M20 6L9 17L4 12" stroke="#10B981" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/></svg>
              <span>20 Job Matches</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#1A1A1A' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M20 6L9 17L4 12" stroke="#10B981" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/></svg>
              <span>ATS Score Analysis</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#1A1A1A' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M20 6L9 17L4 12" stroke="#10B981" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/></svg>
              <span>Market Salary Estimate</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: 'rgba(26,26,26,0.4)' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M18 6L6 18M6 6l12 12" stroke="#EF4444" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/></svg>
              <span>AI Resume Rewrite</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: 'rgba(26,26,26,0.4)' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M18 6L6 18M6 6l12 12" stroke="#EF4444" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/></svg>
              <span>Skill Gap Analysis</span>
            </div>
          </div>
          
          <button
            disabled
            style={{
              width: '100%',
              background: '#0066CC',
              color: '#FFFFFF',
              border: 'none',
              padding: '12px',
              borderRadius: '12px',
              fontSize: '14px',
              fontWeight: '700',
              cursor: 'not-allowed',
              marginTop: '16px',
              opacity: 0.7
            }}
          >
            Current Plan
          </button>
        </div>

                {/* PRO PLAN - RECOMMENDED */}
        <div style={{
          background: 'linear-gradient(135deg, rgba(255, 107, 53, 0.05) 0%, rgba(0, 102, 204, 0.05) 100%)',
          borderRadius: '12px',
          padding: '16px 12px',
          border: '3px solid #FF6B35',
          position: 'relative',
          boxShadow: '0 10px 30px rgba(255, 107, 53, 0.15)',
          display: 'flex',
          flexDirection: 'column'
        }}>
          <div style={{
            position: 'absolute',
            top: '-12px',
            left: '50%',
            transform: 'translateX(-50%)',
            background: 'linear-gradient(135deg, #FF6B35 0%, #ff8f66 100%)',
            color: '#FFFFFF',
            padding: '4px 20px',
            borderRadius: '20px',
            fontSize: '11px',
            fontWeight: '800',
            textTransform: 'uppercase',
            letterSpacing: '0.5px'
          }}>
             Most Popular
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', marginTop: '8px' }}>
            <div>
              <h3 style={{ color: '#1A1A1A', fontSize: '18px', fontWeight: '700', margin: 0 }}>Pro</h3>
              <p style={{ color: 'rgba(26,26,26,0.5)', fontSize: '13px', margin: '4px 0 0 0' }}>For Active Job Seekers</p>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ color: '#FF6B35', fontSize: '28px', fontWeight: '800' }}>₹99</div>
              <div style={{ color: 'rgba(26,26,26,0.4)', fontSize: '11px', textDecoration: 'line-through' }}>₹249</div>
            </div>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#1A1A1A' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M20 6L9 17L4 12" stroke="#10B981" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/></svg>
              <span><strong>Unlimited Job Matches</strong></span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#1A1A1A' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M20 6L9 17L4 12" stroke="#10B981" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/></svg>
              <span>AI Resume Rewrite (XYZ Formula)</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#1A1A1A' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M20 6L9 17L4 12" stroke="#10B981" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/></svg>
              <span>Missing Skill Analysis</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#1A1A1A' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M20 6L9 17L4 12" stroke="#10B981" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/></svg>
              <span>10-Min Fast-Track Delivery</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: 'rgba(26,26,26,0.4)' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M18 6L6 18M6 6l12 12" stroke="#EF4444" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/></svg>
              <span>Career Roadmap</span>
            </div>
          </div>

          <button
            onClick={() => onSelectPlan('pro')}
            style={{
              width: '100%',
              background: 'linear-gradient(135deg, #FF6B35 0%, #ff8f66 100%)',
              color: '#FFFFFF',
              border: 'none',
              padding: '14px',
              borderRadius: '12px',
              fontSize: '15px',
              fontWeight: '700',
              cursor: 'pointer',
              boxShadow: '0 4px 15px rgba(255, 107, 53, 0.3)',
              transition: 'all 0.3s'
            }}
          >
            Get Pro Access - ₹99
          </button>
        </div>

                {/* BUNDLE PLAN */}
        <div style={{
          background: 'linear-gradient(135deg, rgba(255, 215, 0, 0.08) 0%, rgba(255, 165, 0, 0.05) 100%)',
          borderRadius: '12px',
          padding: '16px 12px',
          border: '2px solid #FFD700',
          display: 'flex',
          flexDirection: 'column'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <div>
              <h3 style={{ color: '#1A1A1A', fontSize: '18px', fontWeight: '700', margin: 0 }}>Bundle</h3>
              <p style={{ color: 'rgba(26,26,26,0.5)', fontSize: '13px', margin: '4px 0 0 0' }}>Complete Career Growth</p>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ color: '#FFD700', fontSize: '24px', fontWeight: '800' }}>149</div>
              <div style={{ color: 'rgba(26,26,26,0.4)', fontSize: '11px', textDecoration: 'line-through' }}>₹299</div>
            </div>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#1A1A1A' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M20 6L9 17L4 12" stroke="#10B981" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/></svg>
              <span><strong>Everything in Pro</strong></span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#1A1A1A' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M20 6L9 17L4 12" stroke="#10B981" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/></svg>
              <span>Career Roadmap (30-60-90 Days)</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#1A1A1A' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M20 6L9 17L4 12" stroke="#10B981" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/></svg>
              <span>Interview Prep (Technical + HR)</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#1A1A1A' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M20 6L9 17L4 12" stroke="#10B981" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/></svg>
              <span>Career Consulting Package</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#1A1A1A' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M20 6L9 17L4 12" stroke="#10B981" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/></svg>
              <span>Priority Support</span>
            </div>
          </div>

          <button
            onClick={() => onSelectPlan('bundle')}
            style={{
              width: '100%',
              background: 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)',
              color: '#1A1A1A',
              border: 'none',
              padding: '14px',
              borderRadius: '12px',
              fontSize: '15px',
              fontWeight: '800',
              cursor: 'pointer',
              boxShadow: '0 4px 15px rgba(255, 215, 0, 0.4)',
              transition: 'all 0.3s'
            }}
          >
            Get Bundle - ₹149
          </button>
        </div>
      </div>
    </div>
  );
}

// ✅ PAYMENT SUCCESS & INVOICE MODAL
function PaymentSuccessModal({ isOpen, onClose, details }: { isOpen: boolean; onClose: () => void; details: any }) {
  if (!isOpen || !details) return null;
  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      background: 'rgba(26, 26, 26, 0.85)', zIndex: 3000,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '20px', backdropFilter: 'blur(8px)'
    }}>
      <div style={{
        background: '#FFFFFF', borderRadius: '24px', padding: '32px 24px',
        maxWidth: '420px', width: '100%', boxShadow: '0 25px 50px rgba(0, 0, 0, 0.2)',
        textAlign: 'center', border: '2px solid #10B981'
      }}>
        <div style={{
          width: '80px', height: '80px', background: 'rgba(16, 185, 129, 0.1)',
          borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 24px auto'
        }}>
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none">
            <path d="M20 6L9 17L4 12" stroke="#10B981" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
        <h2 style={{ color: '#1A1A1A', fontSize: '24px', fontWeight: '800', marginBottom: '8px' }}>Payment Successful!</h2>
        <p style={{ color: 'rgba(26,26,26,0.6)', fontSize: '15px', marginBottom: '24px' }}>
          Your premium plan has been activated.
        </p>
        
        {/* Invoice Box */}
        <div style={{
          background: '#F8FAFC', borderRadius: '16px', padding: '20px',
          border: '1px solid rgba(0, 102, 204, 0.1)', textAlign: 'left', marginBottom: '24px'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px', borderBottom: '1px dashed rgba(0,0,0,0.1)', paddingBottom: '12px' }}>
            <span style={{ color: 'rgba(26,26,26,0.6)', fontSize: '14px' }}>Plan</span>
            <span style={{ color: '#1A1A1A', fontSize: '14px', fontWeight: '700' }}>{details.planName}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px', borderBottom: '1px dashed rgba(0,0,0,0.1)', paddingBottom: '12px' }}>
            <span style={{ color: 'rgba(26,26,26,0.6)', fontSize: '14px' }}>Amount Paid</span>
            <span style={{ color: '#10B981', fontSize: '14px', fontWeight: '800' }}>₹{details.amount}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
            <span style={{ color: 'rgba(26,26,26,0.6)', fontSize: '14px' }}>Purchase Date</span>
            <span style={{ color: '#1A1A1A', fontSize: '14px', fontWeight: '600' }}>{details.purchaseDate}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: 'rgba(26,26,26,0.6)', fontSize: '14px' }}>Expires On</span>
            <span style={{ color: '#FF6B35', fontSize: '14px', fontWeight: '800' }}>{details.expiryDate}</span>
          </div>
        </div>

        <button 
          onClick={onClose}
          style={{
            background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
            color: '#FFFFFF', border: 'none', padding: '16px 32px', borderRadius: '12px',
            fontSize: '16px', fontWeight: '700', cursor: 'pointer', width: '100%',
            boxShadow: '0 4px 15px rgba(16, 185, 129, 0.3)', transition: 'transform 0.2s'
          }}
        >
          Continue to Dashboard
        </button>
      </div>
    </div>
  );
}

// ✅ HELP WIDGET COMPONENT (Floating Button)
function HelpWidget() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (isOpen && !(event.target as Element).closest('.help-widget-container')) {
        setIsOpen(false);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [isOpen]);

  return (
    <div className="help-widget-container" style={{
      position: 'fixed', bottom: '24px', right: '24px', zIndex: 9999,
      display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '12px'
    }}>
      <div className={`help-menu ${isOpen ? 'active' : ''}`} style={{
        background: '#FFFFFF', borderRadius: '12px', boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
        padding: '8px', display: 'flex', flexDirection: 'column', gap: '8px', minWidth: '220px',
        opacity: isOpen ? 1 : 0, visibility: isOpen ? 'visible' : 'hidden',
        transform: isOpen ? 'translateY(0) scale(1)' : 'translateY(10px) scale(0.95)',
        transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)', transformOrigin: 'bottom right'
      }}>
        <a href="https://wa.me/91782764431" target="_blank" rel="noopener noreferrer" className="help-option whatsapp-btn" style={{
          display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', borderRadius: '8px',
          textDecoration: 'none', fontSize: '14px', fontWeight: 600, color: '#128C7E', backgroundColor: '#F0FDF4',
          transition: 'background 0.2s ease'
        }}>
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.816 9.816 0 0 0 12.04 2z"/></svg>
          <span>Chat on WhatsApp</span>
        </a>
        <a href="mailto:support@jobswitchers.com" className="help-option email-btn" style={{
          display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', borderRadius: '8px',
          textDecoration: 'none', fontSize: '14px', fontWeight: 600, color: '#1E40AF', backgroundColor: '#EFF6FF',
          transition: 'background 0.2s ease'
        }}>
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
          <span>support@jobswitchers.com</span>
        </a>
      </div>

      <button className="help-fab" onClick={() => setIsOpen(!isOpen)} aria-label="Get Help" style={{
        width: '56px', height: '56px', borderRadius: '50%',
        background: 'linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%)',
        color: 'white', border: 'none', boxShadow: '0 4px 12px rgba(37, 99, 235, 0.4)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
        transition: 'transform 0.2s ease, box-shadow 0.2s ease',
        transform: isOpen ? 'rotate(15deg)' : 'rotate(0deg)'
      }}>
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 18v-6a9 9 0 0 1 18 0v6"></path><path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z"></path><path d="M12 13v4"></path><path d="M12 17h.01"></path></svg>
      </button>
    </div>
  );
}

const trustedCompanies = [
  { name: "Google", domain: "google.com" },
  { name: "Microsoft", domain: "microsoft.com" },
  { name: "Amazon", domain: "amazon.com" },
  { name: "Apple", domain: "apple.com" },
  { name: "Meta", domain: "meta.com" },
  { name: "Netflix", domain: "netflix.com" },
  { name: "Tesla", domain: "tesla.com" },
  { name: "IBM", domain: "ibm.com" },
  { name: "Samsung", domain: "samsung.com" },
  { name: "Intel", domain: "intel.com" },
  { name: "NVIDIA", domain: "nvidia.com" },
  { name: "Adobe", domain: "adobe.com" },
  { name: "Salesforce", domain: "salesforce.com" },
  { name: "Oracle", domain: "oracle.com" },
  { name: "SAP", domain: "sap.com" },
  { name: "Cisco", domain: "cisco.com" },
  { name: "PayPal", domain: "paypal.com" },
  { name: "Uber", domain: "uber.com" },
  { name: "Airbnb", domain: "airbnb.com" },
  { name: "Spotify", domain: "spotify.com" },
  { name: "LinkedIn", domain: "linkedin.com" },
  { name: "Goldman Sachs", domain: "goldmansachs.com" },
  { name: "JPMorgan", domain: "jpmorgan.com" },
  { name: "Walmart", domain: "walmart.com" },
  { name: "Costco", domain: "costco.com" },
  { name: "Home Depot", domain: "homedepot.com" },
  { name: "McDonald's", domain: "mcdonalds.com" },
  { name: "Starbucks", domain: "starbucks.com" },
  { name: "Disney", domain: "disney.com" },
  { name: "Nike", domain: "nike.com" },
  { name: "P&G", domain: "pg.com" },
  { name: "PepsiCo", domain: "pepsico.com" },
  { name: "Coca-Cola", domain: "coca-cola.com" },
  { name: "Johnson&Johnson", domain: "jnj.com" },
  { name: "Pfizer", domain: "pfizer.com" },
  { name: "Merck", domain: "merck.com" },
  { name: "Boeing", domain: "boeing.com" },
  { name: "Lockheed Martin", domain: "lockheedmartin.com" },
  { name: "Raytheon", domain: "raytheon.com" },
  { name: "General Motors", domain: "gm.com" },
  { name: "Ford", domain: "ford.com" },
  { name: "Toyota", domain: "toyota.com" },
  { name: "Honda", domain: "honda.com" },
  { name: "Hyundai", domain: "hyundai.com" },
  { name: "Accenture", domain: "accenture.com" },
  { name: "Deloitte", domain: "deloitte.com" },
  { name: "PwC", domain: "pwc.com" },
  { name: "EY", domain: "ey.com" },
  { name: "KPMG", domain: "kpmg.com" },
];

const GUEST_USER = {
  name: "Guest User",
  email: "guest@jobswitchers.com",
};

// ==========================================
// ✅ ACTUAL DASHBOARD CONTENT (Uses useSearchParams)
// ==========================================
function DashboardContent() {
  const [atsScore, setAtsScore] = useState(0);
  const { data: session, status, update } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [jobs, setJobs] = useState<any[]>([]);
  const [skills, setSkills] = useState<string[]>([]);
  const [appliedJobs, setAppliedJobs] = useState<Set<string>>(new Set());
  const [message, setMessage] = useState("");
  const [logoErrors, setLogoErrors] = useState<Set<string>>(new Set());
  const [isDragging, setIsDragging] = useState(false);
  
  const [userLocation, setUserLocation] = useState<string>("");
  const [locationPermission, setLocationPermission] = useState<boolean>(false);
  const [userCoords, setUserCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [manualLocation, setManualLocation] = useState<string>("");
  
  const [candidateName, setCandidateName] = useState<string>("");
  const [salaryData, setSalaryData] = useState<any>(null);
  const [negotiationTip, setNegotiationTip] = useState<string>("");
  
  // ✅ NEW: State to handle Cloudflare Rate Limit Message
  const [rateLimitMessage, setRateLimitMessage] = useState<string>("");
  
  const [showFastTrackModal, setShowFastTrackModal] = useState(false);
    const [showSkillGap, setShowSkillGap] = useState(false);
      const [showAtsScore, setShowAtsScore] = useState(false);
  
  // ✅ NEW: Paywall and Premium States
  const [showPaywall, setShowPaywall] = useState(false);
  const [sessionId, setSessionId] = useState<string>("");
  const [isPremium, setIsPremium] = useState(false);
  
    // ✅ NEW: CV Text and Hash for Premium AI Features
  const [cvText, setCvText] = useState<string>("");
  const [cvHash, setCvHash] = useState<string>("");
  
  // ✅ NEW: Payment Success Modal States
  const [showPaymentSuccessModal, setShowPaymentSuccessModal] = useState(false);
  const [invoiceDetails, setInvoiceDetails] = useState<any>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const user = session?.user || GUEST_USER;
  const userName = user?.name || "Guest";

      // ✅ SECURE: Check Premium Status from Database on Load
  useEffect(() => {
    const storedSessionId = localStorage.getItem('session_id') || '';
    const storedCvText = localStorage.getItem('cv_text') || '';
    const storedCvHash = localStorage.getItem('cv_hash') || '';
    
    setSessionId(storedSessionId);
    setCvText(storedCvText);
    setCvHash(storedCvHash);
    
    // ✅ API se secure premium status check karein
    if (storedSessionId) {
      fetch('/api/user/check-premium', {
        headers: { 'x-session-id': storedSessionId }
      })
      .then(res => res.json())
      .then(data => {
        if (data.isPremium) {
          setIsPremium(true);
        }
      })
      .catch(err => console.error('Premium check failed', err));
    }
  }, []);

  useEffect(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          setLocationPermission(true);
          setUserCoords({ lat: latitude, lng: longitude });
          
          try {
            const fallbackRes = await fetch(
              `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`
            );
            
            if (fallbackRes.ok) {
              const data = await fallbackRes.json();
              const city = data.city || data.principalSubdivision || "India";
              setUserLocation(city);
              return;
            }
            
            const response = await fetch(
              `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=10`
            );
            
            if (response.ok) {
              const data = await response.json();
              let city = "";
              if (data.address) {
                city = data.address.city || data.address.town || data.address.village || data.address.state_district || data.address.state || "";
              }
              if (city) {
                setUserLocation(city);
                return;
              }
            }
            setUserLocation("India");
          } catch (error) {
            setUserLocation("India");
          }
        },
        (error) => {
          setLocationPermission(false);
          setUserLocation("India");
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
      );
    } else {
      setUserLocation("India");
    }
  }, []);

  if (status === "loading") {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.spinner}></div>
        <p style={{ color: '#1A1A1A' }}>Loading...</p>
      </div>
    );
  }

  const handleApply = async (job: any) => {
    if (appliedJobs.has(job.id)) {
      setMessage("Already applied!");
      setTimeout(() => setMessage(""), 2000);
      return;
    }
    const res = await fetch("/api/apply-job", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ jobId: job.id, jobData: job }),
    });
    if (res.ok) {
      setAppliedJobs(new Set([...appliedJobs, job.id]));
      setMessage("Redirecting...");
      setTimeout(() => { window.open(job.url, "_blank"); setMessage(""); }, 1000);
      if (update) update();
    } else {
      const data = await res.json();
      setMessage(data.error || "Failed to apply");
      setTimeout(() => setMessage(""), 3000);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0] || null;
    if (selectedFile) {
      const fileName = selectedFile.name.toLowerCase();
      if (!fileName.endsWith('.doc') && !fileName.endsWith('.docx') && !fileName.endsWith('.pdf')) {
        setMessage("Only .doc, .docx, or .pdf files are accepted.");
        setFile(null);
        setTimeout(() => setMessage(""), 5000);
        return;
      }
      setFile(selectedFile);
      setMessage("");
    }
  };

   // ✅ UPDATED: handleUpload now uses JSON instead of FormData and saves textHash for Premium AI
  const handleUpload = async () => {
    if (!file) return;
    
    // ✅ PERMANENT FIX: Ensure session_id exists BEFORE upload (works on all devices)
    let currentSessionId = localStorage.getItem('session_id');
    if (!currentSessionId || currentSessionId.length < 10) {
      try {
        if (typeof crypto !== 'undefined' && crypto.randomUUID) {
          currentSessionId = crypto.randomUUID();
        } else {
          currentSessionId = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            const r = (Math.random() * 16) | 0;
            const v = c === 'x' ? r : (r & 0x3) | 0x8;
            return v.toString(16);
          });
        }
      } catch (e) {
        currentSessionId = 'user-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
      }
      localStorage.setItem('session_id', currentSessionId);
      setSessionId(currentSessionId);
      console.log('✅ Session created for new user:', currentSessionId);
    }
    
    setUploading(true);
    setMessage("Parsing CV locally...");

    try {
      // 1. Parse file locally in browser (Zero server load)
      const { text, hash, sessionId: parsedSessionId, fileName } = await parseFileLocally(file);
      
      // 2. Save to localStorage for Premium AI features
      localStorage.setItem('cv_text', text);
      localStorage.setItem('cv_hash', hash);
      localStorage.setItem('session_id', parsedSessionId);
      setSessionId(parsedSessionId);
      setCvText(text);
      setCvHash(hash);

      setMessage("Analyzing profile & finding jobs...");

      let finalLocation = userLocation;
      let finalLat = userCoords?.lat;
      let finalLng = userCoords?.lng;

      if (!locationPermission && manualLocation.trim() !== "") {
        finalLocation = manualLocation.trim();
        try {
          const geoRes = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(finalLocation)}&limit=1`);
          const geoData = await geoRes.json();
          if (geoData && geoData.length > 0) {
            finalLat = parseFloat(geoData[0].lat);
            finalLng = parseFloat(geoData[0].lon);
          }
        } catch (error) {
          console.error("Geocoding error:", error);
        }
      }

      // 3. Send JSON payload to backend (With Mobile Timeout Handling)
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 seconds timeout for mobile

      const res = await fetch('/api/upload-cv', { 
        method: "POST", 
        headers: { 
          "Content-Type": "application/json",
          "X-Session-ID": parsedSessionId
        },
        body: JSON.stringify({
          text,
          hash,
          sessionId: parsedSessionId,
          location: finalLocation || "India",
          latitude: finalLat,
          longitude: finalLng
        }),
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      if (!res.ok) {
        throw new Error(`Server responded with ${res.status}`);
      }
      
      const data = await res.json();

      if (data.success === false) {
        setMessage(data.message || "Upload failed. Please try again.");
        setSkills([]); 
        setJobs([]); 
        setAppliedJobs(new Set());
        setUploading(false);
        return;
      }

      if (data.success) {
        setSkills(data.skills || []); 
        setAtsScore(data.atsScore || 0); 
        setJobs(data.matchedJobs || []);
        setAppliedJobs(new Set());
        setCandidateName(data.candidateFirstName || "");
        setSalaryData(data.salaryEstimate || null);
        setNegotiationTip(data.negotiationTip || "");
        
        if (data.isRateLimited) {
          setRateLimitMessage(data.rateLimitMessage);
        } else {
          setRateLimitMessage("");
        }
        
        console.log("💰 Salary Data Received:", data.salaryEstimate);
        console.log("💰 Salary Min:", data.salaryEstimate?.min);
        console.log("💰 Salary Max:", data.salaryEstimate?.max);
        
        setShowFastTrackModal(true);
        
        const radiusMsg = (finalLat && finalLng) || (finalLocation && finalLocation !== "India") 
          ? `within 70km of ${finalLocation}` : "in India";
        setMessage(`${data.matchedJobs?.length || 0} jobs found ${radiusMsg}!`);
      } else {
        setMessage(data.error || "Upload failed");
      }
    } catch (error: any) {
      console.error("Upload error:", error);
      if (error.name === 'AbortError') {
        setMessage("Request timed out. Please try again on a stable network.");
      } else {
        setMessage(`Upload failed. Please check your internet connection.`);
      }
    } finally {
      setUploading(false);
    }
  };

  // ✅ NEW: Premium AI Feature Handler
  const handlePremiumFeature = async (feature: string) => {
    if (!isPremium) {
      setShowPaywall(true);
      return;
    }

    try {
      setMessage("Generating AI insights...");
      const res = await fetch('/api/premium/ai-gateway', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Session-ID': sessionId
        },
        body: JSON.stringify({
          textHash: cvHash,
          feature,
          cvText
        })
      });

      const data = await res.json();
      
      if (data.success) {
        setMessage(`${feature} generated successfully! Check console or UI for results.`);
        console.log("AI Result:", data.data);
      } else if (res.status === 403) {
        setShowPaywall(true);
      } else {
        setMessage(data.error || 'Failed to generate');
      }
    } catch (error) {
      console.error('Premium feature error:', error);
      setMessage('Error generating feature');
    } finally {
      setTimeout(() => setMessage(""), 3000);
    }
  };

  const handleLogoError = (companyName: string) => setLogoErrors(prev => new Set(prev).add(companyName));
  const getLogoUrl = (domain: string) => `https://www.google.com/s2/favicons?domain=${domain}&sz=128`;

  const handleDragOver = (e: React.DragEvent) => { e.preventDefault(); setIsDragging(true); };
  const handleDragLeave = (e: React.DragEvent) => { e.preventDefault(); setIsDragging(false); };
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault(); setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      const fileName = files[0].name.toLowerCase();
      if (fileName.endsWith('.doc') || fileName.endsWith('.docx') || fileName.endsWith('.pdf')) {
        setFile(files[0]); setMessage("");
      } else {
        setMessage("Only .doc, .docx, or .pdf files are accepted.");
        setTimeout(() => setMessage(""), 5000);
      }
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.bgContainer}>
        <div style={styles.bgGradient}></div>
        <div style={styles.floatingLogos}>
          {trustedCompanies.slice(0, 30).map((company, idx) => (
            <div key={idx} style={{
              ...styles.floatingLogo,
              animationDelay: `${Math.random() * 10}s`,
              left: `${Math.random() * 90 + 5}%`,
              top: `${Math.random() * 90 + 5}%`,
              transform: `scale(${0.4 + Math.random() * 0.6})`,
              opacity: 0.10,
            }}>
              <img src={getLogoUrl(company.domain)} alt={company.name} style={styles.floatingLogoImg}
                onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
            </div>
          ))}
        </div>
      </div>

            {/* ✅ Success Popup with Large Green Tick */}
      <FastTrackModal isOpen={showFastTrackModal} onClose={() => setShowFastTrackModal(false)} userName={userName} />
      
            {/* ✅ Payment Success & Invoice Modal */}
      <PaymentSuccessModal 
        isOpen={showPaymentSuccessModal} 
        onClose={() => setShowPaymentSuccessModal(false)} 
        details={invoiceDetails} 
      />
      
      {showPaywall && (
  <div style={{
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(26, 26, 26, 0.8)',
    zIndex: 2000,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '20px',
    backdropFilter: 'blur(5px)',
    overflow: 'auto'
  }}>
    <div style={{ position: 'relative' }}>
      {/* Close Button */}
      <button
        onClick={() => setShowPaywall(false)}
        style={{
          position: 'absolute',
          top: '-40px',
          right: '0',
          background: 'transparent',
          border: 'none',
          color: '#FFFFFF',
          fontSize: '24px',
          cursor: 'pointer',
          width: '40px',
          height: '40px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: '50%'
        }}
      >
        ✕
      </button>
      
                 <PricingCard onSelectPlan={async (plan) => {
        try {
          setMessage("Redirecting to secure payment...");
          setShowPaywall(false); // Paywall band karein
          
          const amount = plan === 'pro' ? 99 : 149;
          const currentUser = session?.user || { name: userName, email: "guest@jobswitchers.com" };

          const res = await fetch('/api/payment/create-order', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              sessionId,
              plan,
              amount,
              name: currentUser.name,
              email: currentUser.email
            })
          });

          const data = await res.json();

          if (data.success && data.paymentUrl) {
            // Instamojo secure page par redirect karein
            window.location.href = data.paymentUrl;
          } else {
            setMessage("Payment initiation failed. Please try again.");
          }
        } catch (error) {
          console.error("Payment error:", error);
          setMessage("Network error during payment. Please try again.");
        }
      }} />
    </div>
  </div>
)}

      <div style={styles.mainLayout}>
        <div style={styles.contentArea}>
          <div style={styles.heroSection}>
            <div style={styles.heroContent}>
              <div style={styles.badge}>
                <span style={styles.badgeDot}></span>
                <span>Get Hired in 10 Minutes</span>
              </div>
              
              <h1 style={{...styles.heroTitle, fontSize: '28px', lineHeight: '1.3'}}>
                Get Hired in 10 Minutes!<br />
                <span style={{...styles.heroHighlight, fontSize: '22px', lineHeight: '1.4'}}>Upload Your CV & AI will do the rest.</span>
              </h1>
              
              <p style={styles.heroSubtext}>
                AI scans your resume · Instant HR delivery · 70km radius matching
              </p>

              {!locationPermission ? (
                <div style={styles.locationPrompt}>
                  <span style={styles.locationPromptText}>Allow location or enter city for 70km radius jobs</span>
                  <div style={styles.locationInputRow}>
                    <button onClick={() => { if ("geolocation" in navigator) navigator.geolocation.getCurrentPosition(() => window.location.reload(), () => {}, { enableHighAccuracy: true }); }} style={styles.locationAllowBtn}>
                      Allow Location
                    </button>
                    <input type="text" placeholder="Or type city (e.g., Pune)" value={manualLocation} onChange={(e) => setManualLocation(e.target.value)} style={styles.manualLocationInput} />
                  </div>
                </div>
              ) : userLocation && userLocation !== "India" ? (
                <div style={styles.locationBadge}>{userLocation} · 70km radius active</div>
              ) : (
                <div style={{ ...styles.locationBadge, background: "rgba(0, 102, 204, 0.08)", color: "#0066CC", border: "1px solid rgba(0, 102, 204, 0.15)" }}>
                  Default: India (Enable location for 70km radius)
                </div>
              )}

              <div className="flip-container" style={{ position: 'relative', minHeight: 380 }}>
                <div 
                  className={`flip-card ${showAtsScore ? 'flipped' : ''}`}
                  style={{
                    position: 'relative',
                    transformStyle: 'preserve-3d',
                    transition: 'transform 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
                  }}
                >
                                    {/* FRONT: CV Upload */}
                  <div 
                    className="flip-front"
                    style={{
                      ...styles.uploadHero,
                      ...(isDragging ? styles.uploadHeroDragging : {}),
                      backfaceVisibility: 'hidden',
                    }}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                  >
                    <div style={styles.uploadIcon}></div>
                    <h2 style={styles.uploadTitle}>{file ? file.name : "Drop your CV here"}</h2>
                    <p style={styles.uploadSub}>{file ? `${(file.size / 1024).toFixed(0)} KB · Ready to upload` : "Please upload .doc, .docx, or .pdf files (Max 5MB)"}</p>
                    
                    <div style={styles.uploadActions}>
                      <label htmlFor="cv-upload-hero" style={styles.uploadBrowse}>
  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="5" x2="12" y2="19"></line>
      <line x1="5" y1="12" x2="19" y2="12"></line>
    </svg>
    Browse Files
  </span>
</label>
                      <input type="file" id="cv-upload-hero" accept=".doc,.docx,.pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/pdf" onChange={handleFileChange} style={{ display: "none" }} />
                      <button onClick={handleUpload} disabled={uploading || !file} style={{ ...styles.uploadBtn, ...((uploading || !file) ? styles.uploadBtnDisabled : {}) }}>
                        {uploading ? (<><span style={styles.spinnerSmall}></span>Analyzing...</>) : ("Get Hired in 10 Mins")}
                      </button>
                    </div>

                    <div style={styles.features}>
                      <div style={styles.featureItem}><span style={styles.featureLabel}>AI Matching</span></div>
                      <div style={styles.featureDivider}></div>
                      <div style={styles.featureItem}><span style={styles.featureLabel}>Instant Delivery</span></div>
                      <div style={styles.featureDivider}></div>
                      <div style={styles.featureItem}><span style={styles.featureLabel}>70km Radius</span></div>
                    </div>

                    {skills.length > 0 && (
                      <button 
                        onClick={() => setShowAtsScore(!showAtsScore)}
                        style={{
                          marginTop: 16,
                          background: 'linear-gradient(135deg, #0066CC 0%, #0052a3 100%)',
                          border: 'none',
                          padding: '10px 20px',
                          borderRadius: 20,
                          cursor: 'pointer',
                          boxShadow: '0 0 15px rgba(0, 102, 204, 0.5), 0 4px 12px rgba(0, 102, 204, 0.3)',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 8,
                          margin: '16px auto 0 auto',
                          fontSize: 13,
                          fontWeight: 700,
                          color: '#FFFFFF',
                          transition: 'all 0.3s'
                        }}
                      >
                        View ATS Score ↓
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" style={{ transform: showAtsScore ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.3s' }}>
                          <path d="M12 5v14M19 12l-7 7-7-7" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </button>
                    )}
                  </div>

                  {/* BACK: ATS Score Card - Enhanced UI */}
{/* BACK: ATS Score Card - 2 Column Layout */}
<div 
  className="flip-back"
  style={{
    ...styles.uploadHero,
    background: "#FFFFFF",
    border: "2px solid #10B981",
    transform: "rotateY(180deg)",
    backfaceVisibility: 'hidden',
    padding: "24px 20px",
    textAlign: "center",
  }}
>
  <h3 style={{ margin: "0 0 20px 0", fontSize: 18, fontWeight: 700, color: "#1A1A1A" }}>
    ATS Score Analysis
  </h3>
  
  {skills.length > 0 && (
    <>
      {/* 2-Column Layout: Circle Left, Tips Right */}
      <div style={{ 
        display: 'flex', 
        gap: 20, 
        marginBottom: 20,
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        {/* Left: Circular Progress */}
        <div style={{ flex: '0 0 auto' }}>
          <div style={{
            width: 130, height: 130, borderRadius: "50%",
            background: `conic-gradient(#10B981 ${atsScore * 3.6}deg, #E5E7EB 0deg)`,
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <div style={{
              width: 100, height: 100, borderRadius: "50%", background: "#FFFFFF",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 28, fontWeight: 800, color: "#10B981"
            }}>
              {atsScore}%
            </div>
          </div>
          
          {/* Badges Below Circle */}
          <div style={{ display: "flex", gap: 6, justifyContent: "center", marginTop: 12, flexWrap: "wrap" }}>
            <div style={{ background: "rgba(16, 185, 129, 0.1)", padding: "4px 10px", borderRadius: 6, fontSize: 10, fontWeight: 600, color: "#10B981" }}>
              {atsScore >= 80 ? 'Excellent' : atsScore >= 60 ? 'Good' : 'Fair'}
            </div>
            <div style={{ background: "rgba(16, 185, 129, 0.1)", padding: "4px 10px", borderRadius: 6, fontSize: 10, fontWeight: 600, color: "#10B981" }}>
              {skills.length} Skills
            </div>
          </div>
        </div>

                {/* Right: ATS Tips - Professional UI */}
        <div style={{ 
          flex: 1, 
          textAlign: 'left',
          background: 'linear-gradient(135deg, #F8FAFC 0%, #F1F5F9 100%)',
          padding: '16px',
          borderRadius: '12px',
          border: '1px solid #E2E8F0',
          fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
          boxShadow: '0 2px 4px rgba(0,0,0,0.02)'
        }}>
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '8px', 
            marginBottom: '12px',
            borderBottom: '1px solid #E2E8F0',
            paddingBottom: '10px'
          }}>
            <div style={{
              background: '#0066CC',
              color: '#FFFFFF',
              width: '22px',
              height: '22px',
              borderRadius: '6px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '12px'
            }}>
              ✨
            </div>
            <div style={{ fontSize: '13px', fontWeight: '700', color: '#0F172A', letterSpacing: '-0.01em' }}>
              ATS Optimization Tips
            </div>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {[
              'Use standard headings (Experience, Skills)',
              'Add industry keywords naturally',
              'Include measurable achievements',
              'Avoid graphics, tables & columns',
              'Use simple fonts (Arial, Calibri)'
            ].map((tip, idx) => (
              <div key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" style={{ marginTop: '2px', flexShrink: 0 }}>
                  <path d="M20 6L9 17L4 12" stroke="#10B981" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <span style={{ fontSize: '11.5px', color: '#475569', lineHeight: '1.4', fontWeight: '500' }}>
                  {tip}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  )}

  <button 
    onClick={() => setShowAtsScore(false)}
    style={{
      background: 'linear-gradient(135deg, #0066CC 0%, #0052a3 100%)', border: 'none',
      padding: '10px 20px', borderRadius: 20, cursor: 'pointer', fontSize: 13,
      fontWeight: 700, color: '#FFFFFF', display: 'flex', alignItems: 'center', gap: 8, margin: '0 auto'
    }}
  >
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" style={{ transform: 'rotate(180deg)' }}>
      <path d="M12 5v14M19 12l-7 7-7-7" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
    Back to Upload
  </button>
</div>                </div>
              </div>

              {/* ✅ Infinite Auto-Scrolling Marquee */}
              <div style={styles.trustedCard}>
                <p style={styles.trustedText}>TRUSTED BY 500+ FORTUNE 500 COMPANIES</p>
                <div style={styles.marqueeContainer}>
                  <div style={styles.marqueeTrack}>
                    {[...trustedCompanies, ...trustedCompanies].map((company, idx) => (
                      <div key={idx} style={styles.companyLogo}>
                        {!logoErrors.has(company.name) ? (
                          <img src={getLogoUrl(company.domain)} alt={company.name} style={styles.companyLogoImg} onError={() => handleLogoError(company.name)} />
                        ) : (
                          <span style={{ color: '#1A1A1A', fontWeight: '700' }}>{company.name.charAt(0)}</span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ✅ Emerald Green for "Payment Successful" / Success Messages */}
          {message && (
            <div style={{
              ...styles.messageToast,
              background: message.toLowerCase().includes("success") || message.toLowerCase().includes("paid") || message.toLowerCase().includes("found") 
                ? "rgba(16, 185, 129, 0.1)" 
                : (message.includes("not supported") || message.includes("not accepted") || message.includes("Unsupported") || message.includes("failed") 
                  ? "rgba(255, 107, 53, 0.1)" 
                  : "#FFFFFF"),
              color: message.toLowerCase().includes("success") || message.toLowerCase().includes("paid") || message.toLowerCase().includes("found")
                ? "#10B981"
                : (message.includes("not supported") || message.includes("not accepted") || message.includes("Unsupported") || message.includes("failed")
                  ? "#FF6B35"
                  : "#1A1A1A"),
              border: message.toLowerCase().includes("success") || message.toLowerCase().includes("paid") || message.toLowerCase().includes("found")
                ? "1px solid #10B981"
                : (message.includes("not supported") || message.includes("not accepted") || message.includes("Unsupported") || message.includes("failed")
                  ? "1px solid #FF6B35"
                  : "1px solid rgba(0,0,0,0.05)")
            }}>
              {message}
            </div>
          )}

          {/* ✅ RATE LIMIT ALERT BOX WITH WHATSAPP BUTTON */}
          {rateLimitMessage && (
            <div style={{
              background: 'linear-gradient(135deg, #FFF3CD 0%, #FFE69C 100%)',
              border: '2px solid #FFC107',
              borderRadius: '16px',
              padding: '24px',
              margin: '20px 0',
              textAlign: 'center',
              boxShadow: '0 10px 30px rgba(255, 193, 7, 0.2)'
            }}>
              <div style={{ fontSize: '32px', marginBottom: '12px' }}>⚠️</div>
              <h3 style={{ color: '#856404', fontSize: '18px', fontWeight: '800', marginBottom: '12px' }}>
                AI Service Temporarily Resetting
              </h3>
              <p style={{ color: '#856404', fontSize: '14px', lineHeight: '1.6', marginBottom: '20px' }}>
                {rateLimitMessage}
              </p>
              
              {/* WhatsApp Button */}
              <a 
                href="https://wa.me/917827664431?text=Hi,%20I%20want%20to%20get%20my%20free%20CV%20market%20value%20and%20ATS%20score." 
                target="_blank" 
                rel="noopener noreferrer"
                style={{
                  background: '#25D366',
                  color: '#FFFFFF',
                  border: 'none',
                  padding: '14px 28px',
                  borderRadius: '12px',
                  fontSize: '15px',
                  fontWeight: '700',
                  textDecoration: 'none',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  boxShadow: '0 4px 15px rgba(37, 211, 102, 0.3)',
                  transition: 'transform 0.2s'
                }}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                </svg>
                Chat on WhatsApp Now
              </a>
            </div>
          )}

                    {/* ✅ SALARY CARD with Skill Gap Button */}
          {salaryData && (salaryData.min > 0 || salaryData.max > 0) && (
            <div style={{
              position: "relative", zIndex: 5, background: "#FFFFFF", borderRadius: 20, padding: 24, margin: "20px 0",
              border: "1px solid rgba(0, 102, 204, 0.1)", boxShadow: "0 10px 40px rgba(0,0,0,0.05)"
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 16 }}>
                <div style={{ flex: 1, minWidth: 250 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                    <h3 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: "#FF6B35", letterSpacing: "0.5px" }}>
                      Hi, your current market value is:
                    </h3>
                  </div>
                  <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginBottom: 12 }}>
                    <span style={{ fontSize: 36, fontWeight: 800, color: "#1A1A1A", letterSpacing: "-1px" }}>
                      ₹{salaryData.min} - ₹{salaryData.max}
                    </span>
                    <span style={{ fontSize: 16, fontWeight: 600, color: "rgba(26,26,26,0.5)" }}>{salaryData.currency}</span>
                  </div>
                  <p style={{ margin: 0, fontSize: 13, color: "rgba(26,26,26,0.6)", lineHeight: 1.5 }}>
                    Based on your {salaryData.confidence.toLowerCase()} confidence match for current Indian market trends.
                  </p>
                  
                   {/* ✅ NEW: Centered Orange Button to increase package */}
                  <div style={{ marginTop: 12, textAlign: "center" }}>
                    <button 
                      onClick={() => {
                        setShowSkillGap(true);
                        setTimeout(() => {
                          const skillGapElement = document.getElementById('skill-gap-analyzer');
                          if (skillGapElement) {
                            skillGapElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
                          }
                        }, 100);
                      }}
                      style={{
                        background: "linear-gradient(135deg, #FF6B35 0%, #ff8f66 100%)",
                        color: "#FFFFFF",
                        border: "none",
                        padding: "10px 24px",
                        borderRadius: 20,
                        fontSize: 13,
                        fontWeight: 700,
                        cursor: "pointer",
                        boxShadow: "0 0 15px rgba(255, 107, 53, 0.5), 0 4px 12px rgba(255, 107, 53, 0.3)",
                        transition: "all 0.3s",
                        animation: "glow 4s ease-in-out infinite",
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "8px"
                      }}
                    >
                      Click here to increase package for future roles
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0 }}>
                        <path d="M12 5v14M19 12l-7 7-7-7" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </button>
                  </div>
                </div>

                {negotiationTip && (
                  <div style={{ flex: 1, minWidth: 250, background: "#F8FAFC", borderRadius: 12, padding: 16, border: "1px solid rgba(0, 102, 204, 0.05)" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8 }}>
                      <span style={{ fontSize: 12, fontWeight: 700, color: "#0066CC", textTransform: "uppercase", letterSpacing: 0.5 }}>
                        HR Negotiation Tip
                      </span>
                    </div>
                    <p style={{ margin: 0, fontSize: 13, color: "#1A1A1A", lineHeight: 1.5, fontStyle: "italic" }}>
                      "{negotiationTip}"
                    </p>
                  </div>
                )}
              </div>
                            <p style={{ margin: "16px 0 0", fontSize: 10, color: "rgba(26,26,26,0.4)", textAlign: "right" }}>
                *Estimate based on market data. Actual offers may vary.
              </p>
            </div>
          )}

                    {/* ✅ NEW: Negotiation Tip Block */}
          {negotiationTip && (
            <div style={{
              background: "linear-gradient(135deg, rgba(0, 102, 204, 0.05) 0%, rgba(255, 107, 53, 0.05) 100%)",
              borderRadius: 12, padding: 16, margin: "20px 0",
              border: "1px solid rgba(0, 102, 204, 0.1)"
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                <span style={{ fontSize: 20 }}>💡</span>
                <span style={{ fontSize: 13, fontWeight: 700, color: "#0066CC" }}>HR Negotiation Tip</span>
              </div>
              <p style={{ margin: 0, fontSize: 13, color: "#1A1A1A", lineHeight: 1.5, fontStyle: "italic" }}>
                "{negotiationTip}"
              </p>
            </div>
          )}

          {skills.length > 0 && showSkillGap && (
            <div id="skill-gap-analyzer" style={{
              position: 'relative',
              animation: 'slideDown 0.3s ease-out'
            }}>
              <SkillGapAnalyzer 
                skills={skills} 
                experienceYears={0} 
                forceShow={true} 
                onClose={() => setShowSkillGap(false)} 
              />
            </div>
          )}

                                        {skills.length > 0 && (
            <div style={styles.skillsCard}>
              <h3 style={styles.sectionTitle}>Skills Detected</h3>
              <div style={{
                display: 'flex',
                flexWrap: 'nowrap',
                gap: 8,
                overflow: 'hidden'
              }}>
                {skills.slice(0, 5).map((skill, idx) => (
                  <span key={idx} style={styles.skillTag}>{skill}</span>
                ))}
                {skills.length > 5 && (
                  <span style={{
                    ...styles.skillTag,
                    background: 'rgba(0, 102, 204, 0.15)',
                    fontWeight: '700'
                  }}>
                    +{skills.length - 5}
                  </span>
                )}
              </div>
            </div>
          )}

                    {jobs.length > 0 && (
            <div style={styles.jobsSection}>
              <h3 style={styles.sectionTitle}>
                Matching Jobs ({jobs.length})
                {!isPremium && jobs.length > 20 && (
                  <span style={{ fontSize: '12px', color: '#FF6B35', fontWeight: '600', marginLeft: '8px' }}>
                    (Showing first 20 of {jobs.length})
                  </span>
                )}
              </h3>
              <div style={styles.jobsGrid}>
                {jobs.map((job, idx) => {
  const isLocked = !isPremium && idx >= 20;
  
  return (
    <React.Fragment key={idx}>
      <div style={{
        ...styles.jobCard,
        ...(isLocked ? {
          filter: 'blur(3px)',
          opacity: 0.5,
          position: 'relative' as const
        } : {}),
        transition: 'all 0.3s'
      }}>
        <div style={styles.jobHeader}>
          <div>
            <h4 style={styles.jobTitle}>{job.title || "Unknown"}</h4>
            <p style={styles.jobCompany}>{job.company || "Unknown"}</p>
          </div>
          
                    {/* ✅ SPARKLE BUTTON ON ALL JOBS */}
          <button
            onClick={() => setShowPaywall(true)}
            style={{
              background: 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)',
              border: 'none',
              padding: '6px 12px',
              borderRadius: '20px',
              fontSize: '11px',
              fontWeight: '800',
              cursor: 'pointer',
              color: '#1A1A1A',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              boxShadow: '0 0 15px rgba(255, 215, 0, 0.5), 0 4px 12px rgba(255, 165, 0, 0.3)',
              animation: 'sparkle 2s infinite',
              zIndex: 10
            }}
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2L14.5 9.5L22 12L14.5 14.5L12 22L9.5 14.5L2 12L9.5 9.5L12 2Z"/>
            </svg>
            Free Upgrade
          </button>
        </div>
                        
                        {job.location && job.location !== "India" && <p style={styles.jobLocation}>{job.location}</p>}
                        {job.distance && job.distance !== null && <p style={styles.jobDistance}>{typeof job.distance === 'number' ? job.distance.toFixed(1) : job.distance} km away</p>}
                        
                        {job.matchingSkills && job.matchingSkills.length > 0 && (
                          <div style={styles.matchingSkills}>
                            {job.matchingSkills.slice(0, 4).map((skill: string, i: number) => (
                              <span key={i} style={styles.smallSkillTag}>{skill}</span>
                            ))}
                          </div>
                        )}
                        
                        {isLocked ? (
                          <button
                            onClick={() => setShowPaywall(true)}
                            style={{
                              ...styles.applyBtn,
                              background: 'linear-gradient(135deg, #FF6B35 0%, #ff8f66 100%)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              gap: '8px',
                              position: 'relative',
                              zIndex: 10,
                              filter: 'none',
                              pointerEvents: 'auto'
                            }}
                          >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                              <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                            </svg>
                            Free Limit Reached - Upgrade Now
                          </button>
                        ) : (
                          <button 
                            onClick={() => handleApply(job)} 
                            disabled={appliedJobs.has(job.id)} 
                            style={{ ...styles.applyBtn, ...(appliedJobs.has(job.id) ? styles.applyBtnDisabled : {}) }}
                          >
                            {appliedJobs.has(job.id) ? "Applied" : "Apply Now"}
                          </button>
                        )}
                      </div>
                      
                
                    </React.Fragment>
                  );
                })}
              </div>

                            <div style={{ textAlign: "center", marginTop: 30, fontSize: 12, color: "rgba(26,26,26,0.5)", padding: "20px 0", borderTop: "1px solid rgba(0,0,0,0.05)" }}>
                Jobs powered by{" "}
                <a href="https://www.adzuna.co.in" target="_blank" rel="noopener noreferrer" style={{ color: "#0066CC", textDecoration: "none", fontWeight: 600, borderBottom: "1px solid #0066CC" }}>
                  Adzuna
                </a>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ✅ HELP WIDGET RENDERED HERE */}
      <HelpWidget />
      
    </div>
  );
} // ✅ YE CLOSING BRACE MISSING THI, AB ADD HO GAYI HAI

// ==========================================
// ✅ SUSPENSE WRAPPER (Fixes the Next.js build error)
// ==========================================
export default function Dashboard() {
  return (
    <Suspense fallback={
      <div style={styles.loadingContainer}>
        <div style={styles.spinner}></div>
        <p style={{ color: '#1A1A1A', marginTop: 16 }}>Loading Dashboard...</p>
      </div>
    }>
      <DashboardContent />
      
    </Suspense>
  );
}

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    minHeight: "100vh",
    background: "#F8FAFC",
    position: "relative",
    overflow: "hidden",
  },
  bgContainer: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 0,
    pointerEvents: "none",
    overflow: "hidden",
  },
  bgGradient: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: `
      radial-gradient(ellipse at 20% 50%, rgba(0, 102, 204, 0.05) 0%, transparent 60%),
      radial-gradient(ellipse at 80% 50%, rgba(255, 107, 53, 0.05) 0%, transparent 60%),
      radial-gradient(ellipse at 50% 100%, rgba(0, 102, 204, 0.03) 0%, transparent 50%)
    `,
    animation: "bgShift 20s ease-in-out infinite alternate",
  },
  floatingLogos: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    pointerEvents: "none",
  },
  floatingLogo: {
    position: "absolute",
    width: 60,
    height: 60,
    borderRadius: "50%",
    background: "rgba(255,255,255,0.8)",
    backdropFilter: "blur(10px)",
    border: "1px solid rgba(0,0,0,0.05)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: 8,
    animation: "floatLogo 15s ease-in-out infinite alternate",
    pointerEvents: "none",
  },
  floatingLogoImg: {
    width: "100%",
    height: "100%",
    objectFit: "contain",
    opacity: 0.6,
  },
  loadingContainer: {
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    height: "100vh",
    background: "#F8FAFC",
  },
  spinner: {
    width: 40,
    height: 40,
    border: "3px solid rgba(0, 102, 204, 0.1)",
    borderTop: "3px solid #FF6B35",
    borderRadius: "50%",
    animation: "spin 1s linear infinite",
  },
  spinnerSmall: {
    display: "inline-block",
    width: 16,
    height: 16,
    border: "2px solid rgba(255,255,255,0.3)",
    borderTop: "2px solid #FFFFFF",
    borderRadius: "50%",
    animation: "spin 1s linear infinite",
    marginRight: 8,
  },
   mainLayout: {
    display: "flex",
    flexDirection: "column",
    gap: 12,
    maxWidth: 600,
    margin: "0 auto",
    padding: "0 8px",
  },
      contentArea: {
    flex: 1,
    minWidth: 0,
    padding: "0",
  },
    heroSection: {
    position: "relative",
    zIndex: 5,
    padding: "24px 8px 24px",
  },
  heroContent: {
    maxWidth: 700,
    margin: "0 auto",
    textAlign: "center",
  },
  badge: {
    display: "inline-flex",
    alignItems: "center",
    gap: 8,
    background: "rgba(0, 102, 204, 0.08)",
    border: "1px solid rgba(0, 102, 204, 0.15)",
    borderRadius: 50,
    padding: "6px 16px",
    color: "#0066CC",
    fontSize: 11,
    fontWeight: 700,
    marginBottom: 16,
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },
  badgeDot: {
    width: 6,
    height: 6,
    background: "#FF6B35",
    borderRadius: "50%",
    animation: "pulse 1.5s infinite",
  },
    heroTitle: {
    fontSize: 28,
    color: "#1A1A1A",
    fontWeight: 700,
    lineHeight: 1.3,
    marginBottom: 12,
    letterSpacing: "-0.3px",
  },
  heroHighlight: {
    color: "#FF6B35",
    fontWeight: 700,
    fontSize: 22,
    lineHeight: 1.4,
  },
  heroSubtext: {
    fontSize: 16,
    color: "rgba(26,26,26,0.6)",
    marginBottom: 24,
    lineHeight: 1.6,
  },
  locationPrompt: {
    background: "rgba(255, 107, 53, 0.05)",
    border: "1px solid rgba(255, 107, 53, 0.15)",
    borderRadius: 12,
    padding: "16px",
    marginBottom: 16,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 12,
  },
  locationPromptText: {
    color: "#1A1A1A",
    fontSize: 14,
    fontWeight: 600,
    textAlign: "center",
  },
  locationInputRow: {
    display: "flex",
    gap: 8,
    width: "100%",
  },
  locationAllowBtn: {
    background: "#0066CC",
    color: "#FFFFFF",
    border: "none",
    padding: "10px 20px",
    borderRadius: 8,
    fontSize: 13,
    fontWeight: 600,
    cursor: "pointer",
    transition: "all 0.2s",
    whiteSpace: "nowrap",
  },
  manualLocationInput: {
    flex: 1,
    background: "#FFFFFF",
    border: "1px solid rgba(0,0,0,0.1)",
    borderRadius: 8,
    padding: "10px 14px",
    color: "#1A1A1A",
    fontSize: 14,
    outline: "none",
  },
  locationBadge: {
    color: "#0066CC",
    fontSize: 13,
    fontWeight: 600,
    background: "rgba(0, 102, 204, 0.08)",
    border: "1px solid rgba(0, 102, 204, 0.15)",
    padding: "8px 18px",
    borderRadius: 20,
    display: "inline-block",
    marginBottom: 16,
  },
    uploadHero: {
    background: "#FFFFFF",
    backdropFilter: "blur(20px)",
    border: "2px dashed rgba(0, 102, 204, 0.2)",
    borderRadius: 16,
    padding: "24px 16px",
    textAlign: "center",
    marginBottom: 16,
    transition: "all 0.4s",
    boxShadow: "0 2px 12px rgba(0,0,0,0.05)",
  },
  uploadHeroDragging: {
    borderColor: "#FF6B35",
    background: "rgba(255, 107, 53, 0.02)",
    boxShadow: "0 0 60px rgba(255, 107, 53, 0.1)",
  },
  uploadIcon: {
    fontSize: 48,
    display: "block",
    marginBottom: 12,
  },
  uploadTitle: {
    fontSize: 20,
    fontWeight: 700,
    color: "#1A1A1A",
    marginBottom: 8,
  },
  uploadSub: {
    fontSize: 14,
    color: "rgba(26,26,26,0.6)",
    marginBottom: 20,
    whiteSpace: "pre-line",
  },
  uploadActions: {
    display: "flex",
    gap: 12,
    justifyContent: "center",
    flexWrap: "wrap",
  },
  uploadBrowse: {
    background: "#FFFFFF",
    color: "#0066CC",
    padding: "12px 24px",
    borderRadius: 10,
    fontSize: 14,
    fontWeight: 600,
    cursor: "pointer",
    border: "2px solid #0066CC",
    transition: "all 0.3s",
  },
  uploadBtn: {
    background: "linear-gradient(135deg, #FF6B35 0%, #ff8f66 100%)",
    color: "#FFFFFF",
    border: "none",
    padding: "12px 32px",
    borderRadius: 10,
    fontSize: 15,
    fontWeight: 700,
    cursor: "pointer",
    minWidth: 160,
    transition: "all 0.3s",
    boxShadow: "0 4px 15px rgba(255, 107, 53, 0.3)",
  },
  uploadBtnDisabled: {
    background: "rgba(26,26,26,0.1)",
    color: "rgba(26,26,26,0.4)",
    cursor: "not-allowed",
    boxShadow: "none",
  },
  features: {
    display: "flex",
    gap: 16,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 24,
    paddingTop: 24,
    borderTop: "1px solid rgba(0,0,0,0.05)",
    flexWrap: "wrap",
  },
  featureItem: {
    display: "flex",
    alignItems: "center",
    gap: 6,
  },
  featureLabel: {
    fontSize: 12,
    color: "rgba(26,26,26,0.6)",
    fontWeight: 600,
    letterSpacing: "0.3px",
  },
  featureDivider: {
    width: 1,
    height: 16,
    background: "rgba(0,0,0,0.1)",
  },
  trustedCard: {
    background: "#FFFFFF",
    borderRadius: 14,
    padding: "20px",
    border: "1px solid rgba(0,0,0,0.05)",
    boxShadow: "0 4px 20px rgba(0,0,0,0.03)",
    overflow: "hidden",
    marginTop: "20px",
  },
  trustedText: {
    fontSize: 12,
    color: "rgba(26,26,26,0.5)",
    marginBottom: 16,
    textAlign: "center",
    fontWeight: 600,
    textTransform: "uppercase",
    letterSpacing: "0.5px",
  },
  marqueeContainer: {
    width: "100%",
    overflow: "hidden",
    position: "relative",
    maskImage: "linear-gradient(to right, transparent, black 10%, black 90%, transparent)",
    WebkitMaskImage: "linear-gradient(to right, transparent, black 10%, black 90%, transparent)",
  },
  marqueeTrack: {
    display: "flex",
    gap: "24px",
    width: "max-content",
    animation: "marqueeScroll 40s linear infinite",
  },
  companyLogo: {
    width: 40,
    height: 40,
    borderRadius: 8,
    background: "#F8FAFC",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
    cursor: "pointer",
    border: "1px solid rgba(0,0,0,0.05)",
    padding: 6,
    flexShrink: 0,
    transition: "all 0.3s",
  },
  companyLogoImg: {
    width: "100%",
    height: "100%",
    objectFit: "contain",
  },
  companyTooltip: {
    position: "absolute",
    bottom: -28,
    left: "50%",
    transform: "translateX(-50%)",
    background: "#1A1A1A",
    color: "#FFFFFF",
    padding: "4px 10px",
    borderRadius: 6,
    fontSize: 11,
    fontWeight: 600,
    whiteSpace: "nowrap",
    opacity: 0,
    transition: "opacity 0.3s",
    pointerEvents: "none",
    zIndex: 10,
  },
  messageToast: {
    position: "relative",
    zIndex: 5,
    padding: "12px 20px",
    borderRadius: 10,
    margin: "16px 0",
    textAlign: "center",
    fontSize: 14,
    fontWeight: 600,
    boxShadow: "0 4px 15px rgba(0,0,0,0.05)",
  },
    skillsCard: {
    position: "relative",
    zIndex: 5,
    background: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    margin: "12px 0",
    border: "1px solid rgba(0, 102, 204, 0.1)",
    boxShadow: "0 2px 8px rgba(0,0,0,0.03)",
  },
    sectionTitle: {
    fontSize: 15,
    fontWeight: 700,
    marginBottom: 12,
    color: "#1A1A1A",
    padding: "0 4px",
  },
  skillsContainer: {
    display: "flex",
    gap: 8,
    flexWrap: "wrap",
  },
  skillTag: {
    background: "rgba(0, 102, 204, 0.08)",
    color: "#0066CC",
    padding: "6px 14px",
    borderRadius: 20,
    fontSize: 12,
    fontWeight: 600,
    border: "1px solid rgba(0, 102, 204, 0.15)",
  },
  jobsSection: {
    position: "relative",
    zIndex: 5,
    maxWidth: 1200,
    margin: "0 auto",
    padding: "0 0 40px",
  },
  jobsGrid: {
    display: "grid",
    gridTemplateColumns: "1fr",
    gap: 16,
    padding: "0 4px",
  },
   jobCard: {
    background: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    border: "1px solid rgba(0,0,0,0.05)",
    boxShadow: "0 2px 8px rgba(0,0,0,0.03)",
    transition: "all 0.3s",
    marginBottom: 12,
  },

  jobHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  jobTitle: {
    fontSize: 16,
    fontWeight: 700,
    marginBottom: 4,
    color: "#1A1A1A",
  },
  jobCompany: {
    color: "rgba(26,26,26,0.5)",
    fontSize: 13,
    fontWeight: 500,
  },
  // ✅ Emerald Green for "Profile Matched"
  matchBadge: {
    background: "rgba(16, 185, 129, 0.1)",
    color: "#10B981",
    padding: "4px 12px",
    borderRadius: 20,
    fontSize: 12,
    fontWeight: 700,
    border: "1px solid rgba(16, 185, 129, 0.2)",
  },
  jobLocation: {
    color: "rgba(26,26,26,0.5)",
    fontSize: 13,
    marginBottom: 6,
  },
  jobDistance: {
    color: "#FF6B35",
    fontSize: 12,
    fontWeight: 700,
    marginBottom: 12,
  },
  matchingSkills: {
    display: "flex",
    gap: 6,
    flexWrap: "wrap",
    marginBottom: 16,
  },
  smallSkillTag: {
    background: "#F8FAFC",
    color: "rgba(26,26,26,0.6)",
    padding: "4px 10px",
    borderRadius: 8,
    fontSize: 11,
    fontWeight: 600,
    border: "1px solid rgba(0,0,0,0.05)",
  },
  applyBtn: {
    background: "linear-gradient(135deg, #0066CC 0%, #0052a3 100%)",
    color: "#FFFFFF",
    border: "none",
    padding: "10px",
    borderRadius: 10,
    fontSize: 14,
    fontWeight: 700,
    cursor: "pointer",
    width: "100%",
    transition: "all 0.3s",
    boxShadow: "0 2px 10px rgba(0, 102, 204, 0.2)",
  },
  applyBtnDisabled: {
    background: "rgba(26,26,26,0.05)",
    color: "rgba(26,26,26,0.4)",
    cursor: "not-allowed",
    boxShadow: "none",
  },
};

if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.textContent = `
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
        @keyframes pulse {
      0%, 100% { opacity: 0.5; }
      50% { opacity: 1; }
    }
    @keyframes sparkle {
      0%, 100% { 
        transform: scale(1); 
        box-shadow: 0 0 15px rgba(255, 215, 0, 0.5), 0 4px 12px rgba(255, 165, 0, 0.3);
      }
      50% { 
        transform: scale(1.05); 
        box-shadow: 0 0 25px rgba(255, 215, 0, 0.8), 0 6px 20px rgba(255, 165, 0, 0.5);
      }
    }
        @keyframes glow {
      0%, 100% { 
        box-shadow: 0 0 15px rgba(255, 107, 53, 0.5), 0 0 30px rgba(255, 107, 53, 0.3); 
      }
      50% { 
        box-shadow: 0 0 25px rgba(255, 107, 53, 0.8), 0 0 45px rgba(255, 107, 53, 0.5); 
      }
    }
    @keyframes floatLogo {
      0% { transform: translate(0, 0) rotate(0deg) scale(1); }
      25% { transform: translate(30px, -20px) rotate(5deg) scale(1.1); }
      50% { transform: translate(-20px, 30px) rotate(-3deg) scale(0.9); }
      75% { transform: translate(40px, 10px) rotate(4deg) scale(1.05); }
      100% { transform: translate(-30px, -30px) rotate(-5deg) scale(0.95); }
    }
    @keyframes bgShift {
      0% { transform: scale(1) rotate(0deg); }
      100% { transform: scale(1.1) rotate(5deg); }
    }
    @keyframes marqueeScroll {
      0% { transform: translateX(0); }
      100% { transform: translateX(-50%); }
    }
        @keyframes slideDown {
      from { opacity: 0; transform: translateY(-20px); }
      to { opacity: 1; transform: translateY(0); }
    }
    
    /* ✅ HELP WIDGET ANIMATIONS & STYLES */
    .help-widget-container {
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
    }
    .help-option:active {
      transform: scale(0.98);
    }
    .whatsapp-btn:active { background-color: #DCFCE7 !important; }
    .email-btn:active { background-color: #DBEAFE !important; }
    
    /* Mobile Safe Area Support */
    @supports (padding-bottom: env(safe-area-inset-bottom)) {
      .help-widget-container {
        bottom: calc(24px + env(safe-area-inset-bottom)) !important;
      }
    }
          @keyframes flipIn {
      from { transform: perspective(1000px) rotateY(0deg); opacity: 1; }
      to { transform: perspective(1000px) rotateY(-180deg); opacity: 0; }
    }
    
    @keyframes flipOut {
      from { transform: perspective(1000px) rotateY(-180deg); opacity: 0; }
      to { transform: perspective(1000px) rotateY(0deg); opacity: 1; }
    }
    
    .flip-container {
      perspective: 1000px;
      transform-style: preserve-3d;
    }
    
    .flip-card {
      transition: transform 0.6s cubic-bezier(0.4, 0, 0.2, 1);
      transform-style: preserve-3d;
    }
    
    .flip-card.flipped {
      transform: rotateY(-180deg);
    }
    
    .flip-front, .flip-back {
      backface-visibility: hidden;
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
    }
    
    .flip-back {
      transform: rotateY(180deg);
    }
    
    @media (min-width: 768px) {
      .mainLayout { flex-direction: row !important; align-items: flex-start !important; }
      .jobsGrid { grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)) !important; }
    }
    
         @media (max-width: 640px) {
      .heroTitle { font-size: 24px !important; line-height: 1.3 !important; font-weight: 700 !important; }
      .heroSubtext { font-size: 13px !important; }
      .pricing-grid { grid-template-columns: 1fr !important; gap: 16px !important; }
      .pricing-grid { grid-template-columns: 1fr !important; }
    }
      .sectionTitle { font-size: 15px !important; margin-bottom: 12px !important; }
      .uploadHero { padding: 20px 12px !important; }
      .uploadBtn { font-size: 14px !important; padding: 12px 16px !important; width: 100% !important; }
      .jobCard { padding: 14px !important; margin-bottom: 12px !important; }
      .jobTitle { font-size: 14px !important; }
      .skillTag { font-size: 10px !important; padding: 4px 8px !important; }
      .matchBadge { font-size: 10px !important; padding: 4px 8px !important; }
      .applyBtn { font-size: 13px !important; padding: 10px !important; }
      .locationInputRow { flex-direction: column !important; }
    }
    
    [class*="companyLogo"]:hover {
      transform: translateY(-2px);
      background: #FFFFFF;
      box-shadow: 0 4px 12px rgba(0,0,0,0.05);
    }
    [class*="companyLogo"]:hover [class*="companyTooltip"] { opacity: 1; }
    [class*="jobCard"]:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 30px rgba(0,0,0,0.08);
      border-color: rgba(0, 102, 204, 0.2);
    }
    [class*="uploadBrowse"]:hover { background: #F8FAFC; }
    [class*="uploadBtn"]:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow: 0 8px 25px rgba(255, 107, 53, 0.4);
    }
    input:focus {
      border-color: #0066CC !important;
      outline: none;
      box-shadow: 0 0 0 3px rgba(0, 102, 204, 0.1);
    }
  `;
  document.head.appendChild(style);
}