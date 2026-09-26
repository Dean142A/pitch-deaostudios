// backend/data/presetTemplates.js
// Ready-Made Pitch Deck Templates Data Store

const PRESET_TEMPLATES = [
  {
    id: 'saas-seed',
    name: 'SaaS B2B Seed Pitch Deck',
    category: 'SaaS & Software',
    badge: 'Popular',
    description: 'Battle-tested 10-slide pitch deck structure designed specifically for early-stage B2B SaaS startups raising Seed/Pre-Seed capital.',
    style: 'modern-tech',
    backgroundPreset: 'dark-obsidian',
    numSlides: 10,
    tags: ['B2B', 'SaaS', 'Seed Round', 'ARR', 'Metrics'],
    slides: [
      {
        slide_type: 'title',
        layout: 'hero',
        content: {
          title: 'CloudPulse AI',
          subtitle: 'Autonomous Infrastructure Monitoring & Cost Optimization for Enterprise SaaS',
          callout: 'Raising $2.5M Seed Round • Accelerating Enterprise Cloud Efficiency'
        },
        chart_data: null
      },
      {
        slide_type: 'problem',
        layout: 'two_column',
        content: {
          title: 'The Enterprise Cloud Overhead Crisis',
          subtitle: 'Cloud costs are growing 3x faster than enterprise revenue.',
          bullets: [
            'Over 40% of cloud infrastructure spend is wasted on over-provisioned idle resources.',
            'Engineering teams spend 15+ hours/week manually triaging false-alarm alerts.',
            'Legacy monitoring tools detect downtime after customers have already experienced outages.'
          ],
          callout: 'Enterprise companies waste $38B annually on unoptimized cloud instances.'
        },
        chart_data: null
      },
      {
        slide_type: 'solution',
        layout: 'hero',
        content: {
          title: 'Autonomous Real-Time Cloud Optimization',
          subtitle: 'Predictive AI that dynamically scales and heals cloud workloads before failures occur.',
          bullets: [
            'Instant 1-Click Deployment: Zero-code sidecar deployment across AWS, Azure, and GCP.',
            '35% Average Cost Reduction: Automated resource right-sizing in real time.',
            'Zero Downtime Guarantee: Predictive failover prevents 99.8% of micro-outages.'
          ]
        },
        chart_data: null
      },
      {
        slide_type: 'market_size',
        layout: 'chart_focus',
        content: {
          title: 'Target Market Opportunity',
          subtitle: 'Capturing the $72B Cloud Management & Observability Industry',
          bullets: [
            'TAM: $72B Global Cloud Operations & Observability Market',
            'SAM: $18B Enterprise Mid-Market B2B SaaS Platforms',
            'SOM: $450M Initial Target — High-Growth FinTech & HealthTech Scaleups'
          ]
        },
        chart_data: {
          type: 'bar',
          title: 'Market Opportunity ($ Billions)',
          labels: ['SOM (Target)', 'SAM (Serviceable)', 'TAM (Total)'],
          datasets: [
            {
              label: 'Market Size ($B)',
              data: [0.45, 18, 72],
              backgroundColor: ['#0ea5e9', '#6366f1', '#a855f7']
            }
          ]
        }
      },
      {
        slide_type: 'business_model',
        layout: 'two_column',
        content: {
          title: 'Value-Based SaaS Pricing Model',
          subtitle: 'Aligned directly with client cloud savings for high net expansion.',
          bullets: [
            'Starter Tier: $1,200/mo base for up to 50 cloud nodes.',
            'Growth Tier: $4,500/mo + 10% share of verified cloud cost savings.',
            'Enterprise Custom: $15,000+/mo SLA with dedicated compliance & VPC deployment.',
            'Net Revenue Retention: 138% driven by expansion as client infrastructure scales.'
          ]
        },
        chart_data: null
      },
      {
        slide_type: 'traction',
        layout: 'chart_focus',
        content: {
          title: 'Traction & Annual Recurring Revenue Growth',
          subtitle: 'Scalable go-to-market with 4.2x ARR growth in 12 months.',
          bullets: [
            '$840K ARR reached in Month 12 with 34 active enterprise accounts.',
            'CAC Payback period under 5 months; LTV / CAC ratio of 6.2x.',
            'Design partners include FastScale, DataCore, and Nexus Systems.'
          ]
        },
        chart_data: {
          type: 'line',
          title: 'ARR Growth Trajectory ($K)',
          labels: ['Q1', 'Q2', 'Q3', 'Q4'],
          datasets: [
            {
              label: 'ARR ($K)',
              data: [200, 380, 590, 840],
              borderColor: '#0ea5e9',
              backgroundColor: 'rgba(14, 165, 233, 0.2)'
            }
          ]
        }
      },
      {
        slide_type: 'go_to_market',
        layout: 'single_column',
        content: {
          title: 'Go-To-Market Execution Strategy',
          subtitle: 'Product-Led Growth paired with Account-Based Enterprise Sales',
          bullets: [
            'PLG Developer Edition: Free 14-day trial with instant AWS cost analysis report.',
            'Outbound Enterprise Motion: Target VP of Engineering / DevOps Leads at Series B+ companies.',
            'Strategic Cloud Ecosystems: Co-selling partnerships with AWS Marketplace and Datadog integrations.'
          ]
        },
        chart_data: null
      },
      {
        slide_type: 'team',
        layout: 'team_grid',
        content: {
          title: 'World-Class Founding & Engineering Team',
          subtitle: 'Deep expertise in distributed cloud architectures and machine learning.',
          members: [
            { name: 'Alex Rivera', role: 'CEO & Founder', bio: 'Ex-AWS Principal Cloud Architect, 2x Exit' },
            { name: 'Dr. Sarah Chen', role: 'CTO & Co-Founder', bio: 'PhD Computer Science Stanford, AI Systems Leader' },
            { name: 'Marcus Vance', role: 'VP of Sales', bio: 'Ex-Datadog Enterprise Sales Director ($0M-$20M ARR)' }
          ]
        },
        chart_data: null
      },
      {
        slide_type: 'financials',
        layout: 'chart_focus',
        content: {
          title: 'Financial Projections & Efficiency',
          subtitle: 'Path to $10M ARR in 24 months with high gross margins.',
          bullets: [
            'Gross Margin: 86% driven by automated serverless pipeline.',
            'Year 2 Target: $3.8M ARR | Year 3 Target: $10.4M ARR.',
            'Capital Efficient: Positive cash flow projected by Month 22.'
          ]
        },
        chart_data: {
          type: 'bar',
          title: 'Revenue Projection ($ Millions)',
          labels: ['Year 1', 'Year 2', 'Year 3'],
          datasets: [
            {
              label: 'ARR Projection ($M)',
              data: [0.84, 3.8, 10.4],
              backgroundColor: '#10b981'
            }
          ]
        }
      },
      {
        slide_type: 'funding_ask',
        layout: 'hero',
        content: {
          title: 'The Investment Opportunity',
          subtitle: 'Raising $2.5M Seed Round to dominate autonomous cloud observability.',
          bullets: [
            '50% Engineering & AI Development: Expand core automated optimization engine.',
            '35% Go-To-Market & Sales: Scale enterprise outbound sales force.',
            '15% Operations & Compliance: SOC2 Type II, ISO27001 certification.'
          ],
          callout: 'Contact: founders@cloudpulse.ai • Join us in building the future of cloud computing.'
        },
        chart_data: null
      }
    ]
  },
  {
    id: 'ai-deeptech',
    name: 'AI & DeepTech Innovator Deck',
    category: 'AI & Tech',
    badge: 'Trending',
    description: 'High-impact pitch deck designed for frontier AI, machine learning, and hardware/software deeptech startups.',
    style: 'modern-tech',
    backgroundPreset: 'midnight-cyan',
    numSlides: 10,
    tags: ['AI', 'DeepTech', 'LLM', 'Robotics', 'Seed/Series A'],
    slides: [
      {
        slide_type: 'title',
        layout: 'hero',
        content: {
          title: 'NeuralMind Tech',
          subtitle: 'Next-Generation Ultra-Low Latency Inference Engine for Edge AI',
          callout: 'Raising $4.0M Seed Round • 10x Speedup with 80% Less Energy'
        },
        chart_data: null
      },
      {
        slide_type: 'problem',
        layout: 'two_column',
        content: {
          title: 'The AI Compute Bottleneck',
          subtitle: 'Existing Transformer models are too power-hungry and slow for real-time edge hardware.',
          bullets: [
            'Cloud GPU latency makes real-time robotics and automotive vision impractical.',
            'Edge processors run out of memory when executing multi-billion parameter models.',
            'Data privacy regulations forbid streaming live camera feeds to centralized cloud servers.'
          ],
          callout: 'Energy consumption of frontier models is doubling every 3.4 months.'
        },
        chart_data: null
      },
      {
        slide_type: 'solution',
        layout: 'hero',
        content: {
          title: 'Proprietary Quantized Neural Compiler',
          subtitle: 'Compressing complex models into micro-joule edge microchips without accuracy loss.',
          bullets: [
            '10x Faster Inference: Sub-5 millisecond response times on low-cost ARM & RISC-V hardware.',
            '80% Energy Reduction: Enables 24/7 battery-powered AI vision cameras.',
            'Zero Accuracy Loss: Patented dynamic sparse tensor quantization algorithm.'
          ]
        },
        chart_data: null
      },
      {
        slide_type: 'product_demo',
        layout: 'single_column',
        content: {
          title: 'Proprietary Architecture & Benchmarks',
          subtitle: 'Benchmark comparison against standard ONNX and TensorRT edge runtimes.',
          bullets: [
            'NeuralMind Compiler processes 1,420 frames/sec vs 145 frames/sec baseline.',
            'Hardware Agnostic: Runs seamlessly on Nvidia Jetson, NXP, Qualcomm, and custom ASIC chips.',
            '4 Granted Patents covering sparse matrix computation and on-chip memory caching.'
          ]
        },
        chart_data: {
          type: 'bar',
          title: 'Inference Latency Speedup (FPS)',
          labels: ['Standard ONNX', 'TensorRT', 'NeuralMind Engine'],
          datasets: [
            {
              label: 'Frames Per Second (Higher is Better)',
              data: [145, 410, 1420],
              backgroundColor: ['#64748b', '#0284c7', '#10b981']
            }
          ]
        }
      },
      {
        slide_type: 'market_size',
        layout: 'chart_focus',
        content: {
          title: 'Massive Edge AI Acceleration Market',
          subtitle: 'Riding the wave of 100B connected autonomous hardware devices by 2030.',
          bullets: [
            'TAM: $42B Edge AI Hardware & Software Market',
            'SAM: $12B Industrial Automation, Autonomous Vehicles & Drones',
            'SOM: $320M Commercial Robotics & Smart Vision OEMs'
          ]
        },
        chart_data: null
      },
      {
        slide_type: 'business_model',
        layout: 'two_column',
        content: {
          title: 'Dual License & Royalty Business Model',
          subtitle: 'High-margin software licensing coupled with per-device chip royalty fees.',
          bullets: [
            'SDK Developer Subscription: $25,000 / year per engineering team.',
            'Per-Unit Chip Royalty: $1.50 - $4.00 per hardware device deployed.',
            'Enterprise Custom Model Compression: $100K+ recurring service contracts.'
          ]
        },
        chart_data: null
      },
      {
        slide_type: 'traction',
        layout: 'single_column',
        content: {
          title: 'Commercial Pilots & Research Milestones',
          subtitle: 'Active pilots with top tier automotive and robotics Tier-1 suppliers.',
          bullets: [
            '3 Signed Paid Pilots with Fortune 500 Automotive & Robotics OEMs.',
            '$650K in Pipeline Contracts under contract negotiation.',
            'Published in NeurIPS and IEEE Micro top-tier peer-reviewed conferences.'
          ]
        },
        chart_data: null
      },
      {
        slide_type: 'team',
        layout: 'team_grid',
        content: {
          title: 'Pioneering AI Researchers & Hardware Veterans',
          subtitle: 'Built systems deployed in millions of mobile and aerospace hardware units.',
          members: [
            { name: 'Dr. Elena Rostova', role: 'CEO & Co-Founder', bio: 'Ex-NVIDIA Senior Scientist, PhD MIT Neural Architectures' },
            { name: 'David K. Thorne', role: 'CTO & Co-Founder', bio: 'Ex-Qualcomm Principal Chip Architect, 14 Patents' },
            { name: 'Siddharth Mehta', role: 'Head of Business Dev', bio: 'Ex-Intel Capital Director, 10+ years HW Partnerships' }
          ]
        },
        chart_data: null
      },
      {
        slide_type: 'financials',
        layout: 'chart_focus',
        content: {
          title: 'Multi-Year Revenue Outlook',
          subtitle: 'Rapid expansion as OEM chip volumes scale to production.',
          bullets: [
            'Year 1: $1.2M (Pilots & SDK Licenses)',
            'Year 2: $4.5M (Production Volume Scaling)',
            'Year 3: $14.8M (Mass Deployment across 5M+ devices)'
          ]
        },
        chart_data: {
          type: 'line',
          title: 'Projected Device Volume & Revenue',
          labels: ['Year 1', 'Year 2', 'Year 3'],
          datasets: [
            {
              label: 'Revenue ($M)',
              data: [1.2, 4.5, 14.8],
              borderColor: '#8b5cf6',
              backgroundColor: 'rgba(139, 92, 246, 0.2)'
            }
          ]
        }
      },
      {
        slide_type: 'funding_ask',
        layout: 'hero',
        content: {
          title: 'Raising $4.0M Seed Round',
          subtitle: 'Accelerate chip foundry tape-out and commercial OEM deployments.',
          bullets: [
            '60% Engineering & Compiler Optimization Team Expansion',
            '25% Silicon Tape-Out & Hardware Validation Hardware',
            '15% OEM Partner BD & Field Application Engineering'
          ],
          callout: 'Contact: contact@neuralmind.tech • Building the silicon foundation for Edge AI.'
        },
        chart_data: null
      }
    ]
  },
  {
    id: 'd2c-growth',
    name: 'Consumer Brand & E-Commerce Deck',
    category: 'Consumer & D2C',
    badge: 'High ROI',
    description: 'Vibrant, metric-heavy pitch deck crafted for direct-to-consumer (D2C) brands, omnichannel retail, and consumer products.',
    style: 'creative',
    backgroundPreset: 'deep-purple',
    numSlides: 10,
    tags: ['D2C', 'Consumer', 'E-Commerce', 'Retail', 'CAC/LTV'],
    slides: [
      {
        slide_type: 'title',
        layout: 'hero',
        content: {
          title: 'Aura Organics',
          subtitle: 'Clean Bio-Active Skincare Engine Powered by Personalized Plant Nutrition',
          callout: 'Raising $1.8M Growth Round • 3.8x YoY Revenue Growth'
        },
        chart_data: null
      },
      {
        slide_type: 'problem',
        layout: 'two_column',
        content: {
          title: 'The Synthetic Skincare Backlash',
          subtitle: 'Modern Gen-Z & Millennial consumers demand sustainable, transparent skincare that actually works.',
          bullets: [
            '76% of traditional beauty products contain synthetic micro-plastics and irritating fillers.',
            'Consumers waste hundreds of dollars on generic off-the-shelf creams not tailored to their skin bio-profile.',
            'Excessive packaging waste causes environmental guilt among modern eco-conscious shoppers.'
          ],
          callout: 'Clean Beauty is growing 4x faster than conventional cosmetics.'
        },
        chart_data: null
      },
      {
        slide_type: 'solution',
        layout: 'hero',
        content: {
          title: 'Personalized Bio-Fermented Clean Beauty',
          subtitle: 'Dermatologist-formulated organic skincare customized via AI quiz algorithms.',
          bullets: [
            'Clean & Zero Waste: 100% biodegradable refillable glass packaging.',
            'Custom Formulations: Tailored to climate, skin barrier type, and daily routine.',
            'Proven Efficacy: 94% of clinical trial participants reported visible skin glow within 14 days.'
          ]
        },
        chart_data: null
      },
      {
        slide_type: 'traction',
        layout: 'chart_focus',
        content: {
          title: 'Monthly Revenue & Customer Acquisition',
          subtitle: 'Rapid customer traction driven by organic TikTok viral community and subscriptions.',
          bullets: [
            '$185K Monthly Recurring Revenue (MRR) with 64% subscription blend.',
            'Industry-Leading Unit Economics: $34 CAC vs $182 12-Month LTV (5.3x LTV/CAC).',
            '48% 90-Day Repeat Order Rate.'
          ]
        },
        chart_data: {
          type: 'line',
          title: 'Monthly Revenue ($K)',
          labels: ['Jan', 'Mar', 'May', 'Jul', 'Sep', 'Nov'],
          datasets: [
            {
              label: 'Monthly Revenue ($K)',
              data: [35, 62, 95, 128, 155, 185],
              borderColor: '#ec4899',
              backgroundColor: 'rgba(236, 72, 153, 0.2)'
            }
          ]
        }
      },
      {
        slide_type: 'market_size',
        layout: 'single_column',
        content: {
          title: 'Massive Global Clean Beauty Market',
          subtitle: 'Capitalizing on the shift toward sustainable wellness.',
          bullets: [
            'TAM: $180B Global Skincare & Personal Care Market',
            'SAM: $28B Premium Clean Beauty & Organic Cosmetics Segment',
            'SOM: $120M Direct-to-Consumer Personalized Skincare Target'
          ]
        },
        chart_data: null
      },
      {
        slide_type: 'business_model',
        layout: 'two_column',
        content: {
          title: 'Omnichannel & Subscription Revenue Strategy',
          subtitle: 'Combining direct digital subscriptions with premium retail placement.',
          bullets: [
            'D2C Subscription Bundle: $49/mo auto-ship regimen (64% gross margin).',
            'Retail Distribution: Target launch in Sephora, Ulta, and Whole Foods.',
            'Corporate Corporate Gifting & Spa Partnerships: 22% of revenue.'
          ]
        },
        chart_data: null
      },
      {
        slide_type: 'go_to_market',
        layout: 'single_column',
        content: {
          title: 'Viral Community & Influencer Engine',
          subtitle: 'Organic social video content generating millions of monthly views.',
          bullets: [
            '12M+ Monthly Organically Generated Views on TikTok and Instagram Reels.',
            'Network of 450+ Micro-Ambassadors with high conversion rates.',
            'Exclusive AI Skin Diagnosis Quiz converting site traffic at 6.8%.'
          ]
        },
        chart_data: null
      },
      {
        slide_type: 'team',
        layout: 'team_grid',
        content: {
          title: 'Passionate Brand Creators & Operators',
          subtitle: 'Experienced in scaling D2C brands from zero to $50M+ exits.',
          members: [
            { name: 'Chloe Vance', role: 'Founder & CEO', bio: 'Ex-Glossier VP Brand Marketing, Beauty Influencer (250K followers)' },
            { name: 'Dr. Antoine Mercier', role: 'Chief Chemist', bio: 'Former Head of R&D at L’Oréal Skincare Division' },
            { name: 'Liam Sterling', role: 'Head of Growth', bio: 'Scaled D2C Beverage startup from $0 to $18M ARR' }
          ]
        },
        chart_data: null
      },
      {
        slide_type: 'financials',
        layout: 'chart_focus',
        content: {
          title: 'Unit Economics & Financial Roadmap',
          subtitle: 'Strong contribution margins expanding as retail scale is unlocked.',
          bullets: [
            'Average Order Value (AOV): $78',
            'Gross Margin: 74% D2C / 58% Wholesale',
            'Projected Year 2 Revenue: $6.5M | Year 3 Revenue: $18.2M'
          ]
        },
        chart_data: {
          type: 'bar',
          title: 'Annual Revenue Outlook ($M)',
          labels: ['Current', 'Year 1', 'Year 2'],
          datasets: [
            {
              label: 'Revenue ($M)',
              data: [2.2, 6.5, 18.2],
              backgroundColor: '#f43f5e'
            }
          ]
        }
      },
      {
        slide_type: 'funding_ask',
        layout: 'hero',
        content: {
          title: 'Investment & Use of Funds',
          subtitle: 'Raising $1.8M Series Seed to scale retail inventory and marketing.',
          bullets: [
            '45% Performance Marketing & Creator Partnerships',
            '35% Working Capital & Inventory Scale for Retail Launch',
            '20% Team Expansion (Dermatologist R&D and Logistics)'
          ],
          callout: 'Contact: chloe@auraorganics.com • Transform beauty from within.'
        },
        chart_data: null
      }
    ]
  },
  {
    id: 'investor-update',
    name: 'Quarterly Investor & Board Update',
    category: 'Investor Updates',
    badge: 'Executive',
    description: 'Sleek executive deck template for quarterly board reviews, investor updates, financial transparency, and strategic alignment.',
    style: 'corporate',
    backgroundPreset: 'corporate-navy',
    numSlides: 8,
    tags: ['Board Deck', 'Investor Update', 'Financials', 'KPIs', 'OKRs'],
    slides: [
      {
        slide_type: 'title',
        layout: 'hero',
        content: {
          title: 'Q3 Board & Investor Executive Brief',
          subtitle: 'FinTech Platform Quarterly Key Metrics, Financial Health & Strategic Growth Objectives',
          callout: 'Quarter Ending September 30 • Confidential Report'
        },
        chart_data: null
      },
      {
        slide_type: 'traction',
        layout: 'chart_focus',
        content: {
          title: 'Executive Summary & Q3 Highlights',
          subtitle: 'Beat top-line revenue target by 14% while extending cash runway.',
          bullets: [
            'ARR hit $4.2M (+28% QoQ growth driven by enterprise upsells).',
            'Net Burn Rate reduced by 22% down to $95K/month.',
            'Cash Runway extended to 22 months with $2.1M remaining in reserves.'
          ]
        },
        chart_data: {
          type: 'line',
          title: 'Quarterly ARR Trajectory ($M)',
          labels: ['Q4 Prev', 'Q1 Curr', 'Q2 Curr', 'Q3 Curr'],
          datasets: [
            {
              label: 'ARR ($M)',
              data: [2.4, 2.9, 3.3, 4.2],
              borderColor: '#0ea5e9',
              backgroundColor: 'rgba(14, 165, 233, 0.2)'
            }
          ]
        }
      },
      {
        slide_type: 'financials',
        layout: 'chart_focus',
        content: {
          title: 'Quarterly Financial Summary & P&L',
          subtitle: 'Improved gross margins and disciplined OPEX control.',
          bullets: [
            'Gross Revenue Q3: $1,080,000 (Target: $950,000)',
            'Gross Margin: 82% (vs 77% in Q2 due to cloud infrastructure optimizations)',
            'EBITDA Loss: -$285,000 (Improved from -$365,000 in Q2)'
          ]
        },
        chart_data: {
          type: 'bar',
          title: 'OPEX Breakdown vs Previous Quarter ($K)',
          labels: ['R&D / Eng', 'Sales & Mktg', 'G&A Ops'],
          datasets: [
            {
              label: 'Q2 OPEX ($K)',
              data: [320, 240, 110],
              backgroundColor: '#64748b'
            },
            {
              label: 'Q3 OPEX ($K)',
              data: [290, 210, 95],
              backgroundColor: '#0284c7'
            }
          ]
        }
      },
      {
        slide_type: 'solution',
        layout: 'two_column',
        content: {
          title: 'Product Velocity & Feature Releases',
          subtitle: 'Key engineering deliverables shipped ahead of schedule in Q3.',
          bullets: [
            'Shipped Automated Treasury Compliance Engine (SOC2 Type II compliant).',
            'Launched Multi-Currency Settlement supporting EUR, GBP, and JPY.',
            'API Latency reduced by 45% following microservice migration.'
          ]
        },
        chart_data: null
      },
      {
        slide_type: 'go_to_market',
        layout: 'single_column',
        content: {
          title: 'Sales Pipeline & Customer Acquisition Wins',
          subtitle: 'Closed 6 major enterprise logos including global logistics provider.',
          bullets: [
            'New Key Logos Added: Apex Logistics, Nova Capital, Zenith Health.',
            'Average Contract Value (ACV) increased from $42K to $68K.',
            'Current Sales Pipeline: $1.8M weighted contract value for Q4.'
          ]
        },
        chart_data: null
      },
      {
        slide_type: 'risk_mitigation',
        layout: 'two_column',
        content: {
          title: 'Key Challenges & Strategic Mitigation',
          subtitle: 'Proactive management of operational bottlenecks.',
          bullets: [
            'Challenge: Enterprise procurement cycles stretched from 45 to 65 days.',
            'Mitigation: Introduced standardized security pre-clearance packages to accelerate IT review.',
            'Challenge: Senior DevOps hiring competition.',
            'Mitigation: Partnered with specialized executive recruitment agency with candidate pipeline.'
          ]
        },
        chart_data: null
      },
      {
        slide_type: 'roadmap',
        layout: 'single_column',
        content: {
          title: 'Q4 Key Performance Indicators & OKRs',
          subtitle: 'Strategic goals set for the upcoming quarter.',
          bullets: [
            'Reach $5.0M ARR by end of Q4.',
            'Complete ISO27001 audit and security certification.',
            'Close Series A Lead Investor terms by late Q4 / early Q1.'
          ]
        },
        chart_data: null
      },
      {
        slide_type: 'closing',
        layout: 'hero',
        content: {
          title: 'Board Actions & Asks from Investors',
          subtitle: 'How our investors and advisors can help accelerate Q4 growth.',
          bullets: [
            'Customer Introductions: Warm intros to CFOs at Mid-Market Fintech & Logistics firms.',
            'VP of Product Candidate Referrals: Looking for proven leader with fintech scaleup experience.',
            'Next Board Meeting: Scheduled for December 15th.'
          ],
          callout: 'Thank you for your ongoing partnership and strategic support.'
        },
        chart_data: null
      }
    ]
  },
  {
    id: 'agency-proposal',
    name: 'Agency & Consulting Proposal',
    category: 'Agency & Proposals',
    badge: 'Client Ready',
    description: 'High-converting sales deck and proposal presentation for creative agencies, IT consultants, and digital service firms.',
    style: 'creative',
    backgroundPreset: 'deep-purple',
    numSlides: 8,
    tags: ['Agency', 'Proposal', 'Services', 'Pricing', 'Case Studies'],
    slides: [
      {
        slide_type: 'title',
        layout: 'hero',
        content: {
          title: 'Nexus Digital Studio',
          subtitle: 'Full-Funnel Digital Brand Transformation & High-Converting UX Redesign',
          callout: 'Prepared for Enterprise Client Proposal • Turnkey Product Strategy'
        },
        chart_data: null
      },
      {
        slide_type: 'problem',
        layout: 'two_column',
        content: {
          title: 'The Brand & Conversion Bottleneck',
          subtitle: 'Outdated digital touchpoints are leaking high-intent prospective customers.',
          bullets: [
            'Current web application conversion rate sits at 1.2% (vs 3.8% industry benchmark).',
            'Inconsistent brand visual design across mobile app and web marketing landing pages.',
            'Page load latency exceeds 4.2 seconds on mobile networks leading to 65% dropoff.'
          ],
          callout: 'An optimized digital experience can yield a 3x increase in enterprise qualified leads.'
        },
        chart_data: null
      },
      {
        slide_type: 'solution',
        layout: 'hero',
        content: {
          title: 'Comprehensive Brand & UX Transformation',
          subtitle: 'Data-driven redesign, ultra-fast web performance, and brand repositioning.',
          bullets: [
            'Complete Design System: Modular UI/UX component library built for rapid scaling.',
            'Sub-Second Performance: Modern Headless React/Next.js architecture with instant response.',
            'Conversion-Optimized Funnel: Built-in A/B testing and interactive lead capture widgets.'
          ]
        },
        chart_data: null
      },
      {
        slide_type: 'testimonials',
        layout: 'chart_focus',
        content: {
          title: 'Proven Client Case Studies & Impact',
          subtitle: 'Delivering average 240% ROI increase across enterprise client projects.',
          bullets: [
            'FinTech ScaleUp: Redesigned onboarding funnel resulting in +180% user registration.',
            'HealthTech Brand: Built modern web portal that cut customer acquisition costs by 42%.',
            'E-Commerce Global: Optimized checkout flow boosting mobile revenue by $2.4M.'
          ]
        },
        chart_data: {
          type: 'bar',
          title: 'Average Client Performance Uplift (%)',
          labels: ['Conversion Rate', 'Site Speed', 'Lead Volume'],
          datasets: [
            {
              label: 'Uplift Metric (%)',
              data: [185, 320, 240],
              backgroundColor: '#a855f7'
            }
          ]
        }
      },
      {
        slide_type: 'roadmap',
        layout: 'single_column',
        content: {
          title: 'Project Roadmap & 8-Week Scope of Work',
          subtitle: 'Structured agile sprints ensuring timely execution and full transparency.',
          bullets: [
            'Weeks 1-2: Discovery, User Research & UX Architecture Wireframing',
            'Weeks 3-4: Visual UI Design System, Brand Guidelines & Interactive Prototypes',
            'Weeks 5-6: Frontend/Backend Development, CMS Integration & Analytics Wiring',
            'Weeks 7-8: Rigorous QA Testing, SEO Optimization, Staff Training & Launch'
          ]
        },
        chart_data: null
      },
      {
        slide_type: 'team',
        layout: 'team_grid',
        content: {
          title: 'Dedicated Senior Project Team',
          subtitle: 'Award-winning designers, engineers, and digital growth strategists.',
          members: [
            { name: 'Marcus Sterling', role: 'Creative Director', bio: 'Ex-IDEO Design Lead, 12+ years digital product design' },
            { name: 'Sophia Lin', role: 'Lead UX/UI Architect', bio: 'Specialist in enterprise design systems and accessibility' },
            { name: 'Julian Vance', role: 'Head of Engineering', bio: 'Full-stack React/Node architect, built platforms for 2M+ users' }
          ]
        },
        chart_data: null
      },
      {
        slide_type: 'business_model',
        layout: 'two_column',
        content: {
          title: 'Transparent Investment Options',
          subtitle: 'Tailored engagement models designed to fit your operational timeline.',
          bullets: [
            'Option A: Core Turnkey Redesign — $35,000 (8-Week Delivery)',
            'Option B: Premium Turnkey + Custom AI Integration — $55,000 (10-Week Delivery)',
            'Option C: Ongoing Growth Retainer — $6,500/mo (Continuous Optimization & A/B Testing)'
          ]
        },
        chart_data: null
      },
      {
        slide_type: 'closing',
        layout: 'hero',
        content: {
          title: 'Next Steps to Get Started',
          subtitle: 'We are ready to ignite your brand digital transformation.',
          bullets: [
            '1. Proposal Approval & Statement of Work Execution',
            '2. Stakeholder Kickoff Workshop (Scheduled within 5 business days)',
            '3. Dedicated Slack Channel & Weekly Sprint Reviews Established'
          ],
          callout: 'Contact: proposals@nexusdigital.studio • Let’s build something extraordinary together.'
        },
        chart_data: null
      }
    ]
  },
  {
    id: 'fintech-scale',
    name: 'Fintech & Financial Infra Pitch',
    category: 'Fintech',
    badge: 'Enterprise',
    description: 'Institutional-grade pitch deck for financial platforms, neo-banks, payment APIs, and blockchain financial infrastructure.',
    style: 'corporate',
    backgroundPreset: 'corporate-navy',
    numSlides: 10,
    tags: ['Fintech', 'Payments', 'Banking', 'Compliance', 'Series A'],
    slides: [
      {
        slide_type: 'title',
        layout: 'hero',
        content: {
          title: 'PayFlow Global',
          subtitle: 'Real-Time Cross-Border Payment & Treasury Settlement Infrastructure',
          callout: 'Raising $6.5M Series A • Processing $120M Monthly Transaction Volume'
        },
        chart_data: null
      },
      {
        slide_type: 'problem',
        layout: 'two_column',
        content: {
          title: 'The Friction of Global B2B Banking',
          subtitle: 'Legacy SWIFT networks are slow, expensive, and lack real-time visibility.',
          bullets: [
            'Cross-border bank transfers take 3-5 business days to clear.',
            'Hidden correspondent bank fees erode up to 4.5% of transaction value.',
            'Manual compliance checks freeze legitimate business payments unexpectedly.'
          ],
          callout: 'Businesses lose $140B in friction costs annually on cross-border payments.'
        },
        chart_data: null
      },
      {
        slide_type: 'solution',
        layout: 'hero',
        content: {
          title: 'Instant Multi-Currency Liquidity API',
          subtitle: 'Single integration API for real-time settlement across 40+ fiat currencies.',
          bullets: [
            'Instant Settlement: Sub-10 second execution using localized banking corridors.',
            'Ultra-Low Cost: 80% cheaper than traditional SWIFT wire transfers.',
            'Automated AML/KYC: Embedded AI compliance pre-clears 99.4% of transactions.'
          ]
        },
        chart_data: null
      },
      {
        slide_type: 'traction',
        layout: 'chart_focus',
        content: {
          title: 'Monthly Transaction Volume & Revenue Growth',
          subtitle: 'Scaling payment processing volume exponentially with enterprise clients.',
          bullets: [
            '$120M Monthly Payment Volume (TPV) reached in Q3.',
            'Net Take Rate: 0.35% generating $420K monthly net revenue ($5.04M annualized).',
            'Zero Fraud Loss record across 500,000+ processed transactions.'
          ]
        },
        chart_data: {
          type: 'line',
          title: 'Monthly Payment Volume TPV ($ Millions)',
          labels: ['Q1', 'Q2', 'Q3', 'Q4 (Est)'],
          datasets: [
            {
              label: 'TPV ($M)',
              data: [25, 58, 120, 195],
              borderColor: '#0284c7',
              backgroundColor: 'rgba(2, 132, 199, 0.2)'
            }
          ]
        }
      },
      {
        slide_type: 'market_size',
        layout: 'single_column',
        content: {
          title: 'Enormous Addressable Payment Market',
          subtitle: 'Unlocking global liquidity for international trade.',
          bullets: [
            'TAM: $156 Trillion Cross-Border Corporate Payment Market',
            'SAM: $22 Trillion Mid-Market B2B Cross-Border Transactions',
            'SOM: $45 Billion Initial Focus — LATAM & SEA Commerce Corridors'
          ]
        },
        chart_data: null
      },
      {
        slide_type: 'business_model',
        layout: 'two_column',
        content: {
          title: 'High-Margin Transaction Monetization',
          subtitle: 'Multiple recurring revenue streams built directly into processing flow.',
          bullets: [
            'Payment Take Rate: 0.35% per processed transaction volume.',
            'FX Markup: 0.20% spread on foreign currency conversions.',
            'Treasury SaaS Subscription: $2,500/mo enterprise treasury analytics portal fee.'
          ]
        },
        chart_data: null
      },
      {
        slide_type: 'go_to_market',
        layout: 'single_column',
        content: {
          title: 'Partnership Distribution Engine',
          subtitle: 'Embedding our payment API directly inside ERPs and B2B Marketplaces.',
          bullets: [
            'ERP Integrations: Pre-built connectors for NetSuite, SAP, and QuickBooks.',
            'Marketplace Embedded Payments: Co-branded checkout for B2B export platforms.',
            'Licensed Partner Banks: Partnered with 6 regional tier-1 clearing banks.'
          ]
        },
        chart_data: null
      },
      {
        slide_type: 'team',
        layout: 'team_grid',
        content: {
          title: 'Seasoned Financial Tech & Compliance Executives',
          subtitle: 'Proven track record scaling regulated financial platforms.',
          members: [
            { name: 'Gabriel Santos', role: 'CEO & Co-Founder', bio: 'Ex-Stripe LatAm Country Manager, 15 years fintech' },
            { name: 'Nadia Kowalski', role: 'Chief Compliance Officer', bio: 'Ex-PayPal Global Regulatory Counsel, FinCEN liaison' },
            { name: 'Tariq Al-Mansoor', role: 'CTO & Co-Founder', bio: 'Ex-Goldman Sachs Core Engineering Director, Financial Systems' }
          ]
        },
        chart_data: null
      },
      {
        slide_type: 'financials',
        layout: 'chart_focus',
        content: {
          title: '3-Year Financial & Unit Margins',
          subtitle: 'Expanding operating leverage as banking network volume grows.',
          bullets: [
            'Year 1 Net Revenue: $5.0M | Year 2 Target: $16.5M | Year 3 Target: $42.0M',
            'Net Margin: 68% driven by direct banking API clearing integrations.'
          ]
        },
        chart_data: {
          type: 'bar',
          title: 'Net Revenue Scaling ($ Millions)',
          labels: ['Year 1', 'Year 2', 'Year 3'],
          datasets: [
            {
              label: 'Net Revenue ($M)',
              data: [5.0, 16.5, 42.0],
              backgroundColor: '#0ea5e9'
            }
          ]
        }
      },
      {
        slide_type: 'funding_ask',
        layout: 'hero',
        content: {
          title: 'Series A Investment Terms',
          subtitle: 'Raising $6.5M to acquire regional payment licenses and expand sales.',
          bullets: [
            '50% Banking Licenses & Regional Regulatory Capital Reserves',
            '35% Sales & Integration Engineering Expansion',
            '15% Security & SOC2/PCI-DSS Level 1 Infrastructure'
          ],
          callout: 'Contact: investors@payflowglobal.com • Building the next-generation global payment network.'
        },
        chart_data: null
      }
    ]
  }
];

module.exports = { PRESET_TEMPLATES };
