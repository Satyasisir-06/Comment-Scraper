import type { AnalyzeResponse } from '../types';

export const mockAnalysisResult: AnalyzeResponse = {
  job_id: 'job_sample_demo_101',
  timestamp: new Date().toISOString(),
  metadata: {
    source_type: 'youtube',
    source_title: 'Understanding Modern Web Architecture in 2026',
    total_comments_scanned: 185,
    questions_found: 34,
    themes_count: 3,
  },
  themes: [
    {
      theme_id: 'theme_1',
      name: 'State Management & Performance',
      summary: 'Audience frequently inquires about avoiding re-renders, choosing between local state vs signals, and server components.',
      sentiment: 'curious',
      questions: [
        {
          id: 'q_101',
          author: '@alex_codes',
          text: 'How do you handle deeply nested state without re-rendering the entire component tree?',
          likes: 42,
          published_at: '2026-09-20T10:15:00Z',
        },
        {
          id: 'q_102',
          author: '@dev_dan',
          text: 'Is Redux still relevant in 2026 or should everyone switch to signals / zustand?',
          likes: 28,
          published_at: '2026-09-21T14:22:00Z',
        },
        {
          id: 'q_103',
          author: '@frontend_pro',
          text: 'Can React 19 compiler completely replace useMemo and useCallback in real production apps?',
          likes: 19,
          published_at: '2026-09-22T09:40:00Z',
        },
      ],
      generated_ideas: [
        {
          id: 'idea_1',
          title: 'Deep Dive: Stop Re-rendering in Modern React',
          format: 'Tutorial / Video',
          target_audience: 'Intermediate Developers',
          description: 'A focused walkthrough comparing Zustand vs Signals vs React Compiler for zero-friction re-renders.',
        },
        {
          id: 'idea_2',
          title: 'State Management Decision Matrix 2026',
          format: 'Infographic / Cheat Sheet',
          target_audience: 'Architects & Team Leads',
          description: 'Visual flow diagram deciding when to use local state, context, or external global stores.',
        },
      ],
    },
    {
      theme_id: 'theme_2',
      name: 'Hosting, Cloud Costs & DevOps',
      summary: 'Questions regarding Docker configuration, cloud cost surprises, and minimal CI/CD pipelines.',
      sentiment: 'frustrated',
      questions: [
        {
          id: 'q_201',
          author: '@cloud_novice',
          text: 'What is the cheapest way to host this stack without getting hit by surprise serverless egress fees?',
          likes: 35,
          published_at: '2026-09-22T08:00:00Z',
        },
        {
          id: 'q_202',
          author: '@devops_dan',
          text: 'Do you recommend self-hosting with Coolify or sticking to managed platforms like Render / Railway?',
          likes: 21,
          published_at: '2026-09-23T11:15:00Z',
        },
      ],
      generated_ideas: [
        {
          id: 'idea_3',
          title: 'Hosting Under $5/Month: Zero-Surprise Cloud Architecture',
          format: 'Case Study',
          target_audience: 'Indie Hackers & Solo Devs',
          description: 'Step-by-step breakdown using lightweight VPS (Hetzner/DigitalOcean) + Coolify vs serverless providers.',
        },
      ],
    },
    {
      theme_id: 'theme_3',
      name: 'Authentication & Security',
      summary: 'Concerns about OAuth tokens, cookie security, and preventing session hijacking with AI agents.',
      sentiment: 'cautious',
      questions: [
        {
          id: 'q_301',
          author: '@sec_dev',
          text: 'Where should JWT tokens be stored securely if local storage is prone to XSS attacks?',
          likes: 54,
          published_at: '2026-09-24T16:20:00Z',
        },
      ],
      generated_ideas: [
        {
          id: 'idea_4',
          title: 'The Modern Auth Playbook: HttpOnly Cookies & Refresh Rotation',
          format: 'Hands-on Workshop',
          target_audience: 'Full-stack Developers',
          description: 'Implement ironclad authentication with CSRF prevention and secure cookie rotation.',
        },
      ],
    },
  ],
  raw_comments: [
    {
      id: 'c_1',
      author: '@alex_codes',
      text: 'How do you handle deeply nested state without re-rendering the entire component tree?',
      likes: 42,
      published_at: '2026-09-20T10:15:00Z',
    },
    {
      id: 'c_2',
      author: '@dev_dan',
      text: 'Is Redux still relevant in 2026 or should everyone switch to signals / zustand?',
      likes: 28,
      published_at: '2026-09-21T14:22:00Z',
    },
    {
      id: 'c_3',
      author: '@tech_guru',
      text: 'Great video! The explanation on compiler optimizations was super helpful.',
      likes: 15,
      published_at: '2026-09-21T18:05:00Z',
    },
    {
      id: 'c_4',
      author: '@cloud_novice',
      text: 'What is the cheapest way to host this stack without getting hit by surprise serverless egress fees?',
      likes: 35,
      published_at: '2026-09-22T08:00:00Z',
    },
    {
      id: 'c_5',
      author: '@sec_dev',
      text: 'Where should JWT tokens be stored securely if local storage is prone to XSS attacks?',
      likes: 124,
      published_at: '2026-09-24T16:20:00Z',
    },
    {
      id: 'c_6',
      author: '@web_enthusiast',
      text: 'Thanks for making this video, really appreciated the clear code examples!',
      likes: 8,
      published_at: '2026-09-25T11:00:00Z',
    },
    {
      id: 'c_7',
      author: '@curious_learner',
      text: 'Can you do a video on micro-frontends with Vite module federation next?',
      likes: 0,
      published_at: '2026-09-25T15:30:00Z',
    },
    {
      id: 'c_8',
      author: '@nextjs_fan',
      text: 'How does this compare with App Router server actions in Next.js 15?',
      likes: 62,
      published_at: '2026-09-26T09:12:00Z',
    },
    {
      id: 'c_9',
      author: '@beginner_coder',
      text: 'Is there a starter GitHub repository with these exact configuration files?',
      likes: 0,
      published_at: '2026-09-26T12:05:00Z',
    },
  ],
};

