import { createContext, useContext, useState } from 'react'

const AuthContext = createContext(null)

const DEMO_USER = {
  id: 'u-001',
  first_name: 'Hector',
  last_name: 'Miranda',
  email: 'hector.miranda@yale.edu',
  phone: '+1 (203) 555-0142',
  handle: '@hector.m',
  location: 'New Haven, CT',
  headline: 'PhD student managing federal loans on a research stipend. Building toward long-term stability.',
  priority: 'Education Debt',
  joined: 'Jan 2025',
  avatar: 'HM',
  photo: 'https://randomuser.me/api/portraits/men/75.jpg',
  villages: ['v-001', 'v-002'],
  financial: {
    income: [
      { key: 'wage_income',  amount: 33600 },
      { key: 'other_income', amount: 10800 },
    ],
    debts: [
      { key: 'education1_debt', amount: 34200 },
      { key: 'creditcard_debt', amount: 1850 },
    ],
    assets: [
      { key: 'savingsmma1_worth', amount: 4100 },
      { key: 'rothira_worth',     amount: 2300 },
    ],
  },
}

export const DEMO_VILLAGES = [
  {
    id: 'v-001',
    name: 'New Haven Collective',
    photo: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=400&h=400&fit=crop&q=80',
    goal: 'Education Debt',
    goalType: 'debt',
    members: 8,
    maxMembers: 12,
    pooled: 24400,
    target: 60000,
    myContribution: 3200,
    nextContribution: 400,
    nextDate: 'Apr 1, 2026',
    intervalLabel: 'Monthly',
    color: 'green',
    founded: 'Sep 2025',
    memberList: [
      { id: 'm1', initials: 'HM', name: 'Hector M.', role: 'Founder',   contrib: 3200, status: 'active',  joined: 'Sep 4, 2025',  photo: 'https://randomuser.me/api/portraits/men/75.jpg' },
      { id: 'm2', initials: 'RG', name: 'Richie G.', role: 'Treasurer', contrib: 3200, status: 'active',  joined: 'Sep 4, 2025',  photo: 'https://randomuser.me/api/portraits/men/22.jpg' },
      { id: 'm3', initials: 'MD', name: 'Matt D.',   role: 'Member',    contrib: 3200, status: 'active',  joined: 'Sep 4, 2025',  photo: 'https://randomuser.me/api/portraits/men/35.jpg' },
      { id: 'm4', initials: 'AK', name: 'Amara K.',  role: 'Member',    contrib: 3200, status: 'active',  joined: 'Sep 4, 2025',  photo: 'https://randomuser.me/api/portraits/women/12.jpg' },
      { id: 'm5', initials: 'DL', name: 'Diana L.',  role: 'Member',    contrib: 2000, status: 'active',  joined: 'Oct 12, 2025', photo: 'https://randomuser.me/api/portraits/women/24.jpg' },
      { id: 'm6', initials: 'JR', name: 'James R.',  role: 'Member',    contrib: 2000, status: 'active',  joined: 'Oct 12, 2025', photo: 'https://randomuser.me/api/portraits/men/43.jpg' },
      { id: 'm7', initials: 'PW', name: 'Priya W.',  role: 'Secretary', contrib: 3200, status: 'active',  joined: 'Sep 4, 2025',  photo: 'https://randomuser.me/api/portraits/women/36.jpg' },
      { id: 'm8', initials: 'TN', name: 'Tom N.',    role: 'Member',    contrib: 800,  status: 'active',  joined: 'Jan 28, 2026', photo: 'https://randomuser.me/api/portraits/men/52.jpg' },
    ],
    recentActivity: [
      { type: 'contribution', actor: 'All members',  amount: 3200, date: 'Mar 1',  note: 'Monthly round, 8 contributors' },
      { type: 'vote',         actor: 'Village',      amount: null, date: 'Feb 28', note: 'Vote opened: Allocate $3,200 to Amara K.' },
      { type: 'allocation',   actor: 'Village',      amount: 2400, date: 'Feb 21', note: 'Allocated to Richie G.: Education Debt payoff' },
      { type: 'vote',         actor: 'Village',      amount: null, date: 'Feb 20', note: 'Vote passed: allocate $2,400 to Richie G. student loan' },
      { type: 'contribution', actor: 'All members',  amount: 3200, date: 'Feb 1',  note: 'Monthly round, 8 contributors' },
      { type: 'join',         actor: 'Tom N.',       amount: null, date: 'Jan 28', note: 'New member joined, admitted via village vote Jan 25' },
      { type: 'contribution', actor: 'All members',  amount: 2800, date: 'Jan 1',  note: 'Monthly round, 7 contributors' },
      { type: 'allocation',   actor: 'Village',      amount: 3200, date: 'Dec 18', note: 'Allocated to Matt D.: federal loan payoff (cycle 3)' },
      { type: 'contribution', actor: 'All members',  amount: 2800, date: 'Dec 1',  note: 'Monthly round, 7 contributors' },
    ],
    chat: [
      { id: 'c1',  author: 'Priya W.',  initials: 'PW', photo: 'https://randomuser.me/api/portraits/women/36.jpg', text: "Quick reminder: contributions are due March 1. Please confirm you've scheduled your transfer.", time: 'Feb 26, 9:05 AM', mine: false },
      { id: 'c2',  author: 'Amara K.',  initials: 'AK', photo: 'https://randomuser.me/api/portraits/women/12.jpg', text: 'Done ✓', time: 'Feb 26, 9:18 AM', mine: false },
      { id: 'c3',  author: 'You',       initials: 'HM', photo: 'https://randomuser.me/api/portraits/men/75.jpg',   text: 'Confirmed on my end too.', time: 'Feb 26, 9:31 AM', mine: true },
      { id: 'c4',  author: 'James R.',  initials: 'JR', photo: 'https://randomuser.me/api/portraits/men/43.jpg',   text: 'Scheduled for Friday, one day early this month.', time: 'Feb 26, 10:02 AM', mine: false },
      { id: 'c5',  author: 'Richie G.', initials: 'RG', photo: 'https://randomuser.me/api/portraits/men/22.jpg',   text: "Hey everyone, should we vote on allocating this month's pool to Amara's loan?", time: 'Feb 27, 2:14 PM', mine: false },
      { id: 'c6',  author: 'Amara K.',  initials: 'AK', photo: 'https://randomuser.me/api/portraits/women/12.jpg', text: "Would really appreciate that. I'm at $18k remaining on my federal loan.", time: 'Feb 27, 2:18 PM', mine: false },
      { id: 'c7',  author: 'You',       initials: 'HM', photo: 'https://randomuser.me/api/portraits/men/75.jpg',   text: "Let's put it to a vote. I'll create a motion.", time: 'Feb 27, 2:21 PM', mine: true },
      { id: 'c8',  author: 'Matt D.',   initials: 'MD', photo: 'https://randomuser.me/api/portraits/men/35.jpg',   text: 'Agreed. The fund is at $24k now, we have room.', time: 'Feb 27, 2:22 PM', mine: false },
      { id: 'c9',  author: 'Priya W.',  initials: 'PW', photo: 'https://randomuser.me/api/portraits/women/36.jpg', text: 'Support. Amara joined early and has contributed consistently.', time: 'Feb 27, 2:35 PM', mine: false },
      { id: 'c10', author: 'Diana L.',  initials: 'DL', photo: 'https://randomuser.me/api/portraits/women/24.jpg', text: "Also in favor. She's been carrying the group through the slow months.", time: 'Feb 27, 3:10 PM', mine: false },
      { id: 'c11', author: 'Tom N.',    initials: 'TN', photo: 'https://randomuser.me/api/portraits/men/52.jpg',   text: "I'm still in probation so I can't vote, but for what it's worth, fully supportive.", time: 'Feb 27, 3:44 PM', mine: false },
      { id: 'c12', author: 'You',       initials: 'HM', photo: 'https://randomuser.me/api/portraits/men/75.jpg',   text: "Resolution is up. Check the Votes tab, closes in 3 days.", time: 'Feb 27, 4:00 PM', mine: true },
    ],
    votes: [
      { id: 'vote-1', title: 'Allocate $3,200 to Amara K.: Education Loan', description: "Amara has been a consistent contributor since day one and has $18k remaining on her federal loan. Allocating this month's pool to her aligns with our group goal and our rotating payout structure.", amount: 3200, status: 'open', yes: 5, no: 1, abstain: 1, total: 8, proposedBy: 'Hector M.', myVote: null, expiresAt: new Date('2026-03-21T23:59:00').getTime() },
      { id: 'vote-2', title: 'Increase monthly contribution to $450 from April', description: 'A small bump would accelerate our pooling timeline by approximately 3 months without straining members on income-driven repayment. Matt ran the projections; see the attached note in chat.', amount: 450, status: 'open', yes: 3, no: 2, abstain: 0, total: 8, proposedBy: 'Matt D.', myVote: null, expiresAt: new Date('2026-03-23T23:59:00').getTime() },
      { id: 'vote-3', title: 'Allocate $2,400 to Richie G.: Education Debt', description: 'Richie has $9,600 remaining on his federal loan and is next in the rotation. Full consensus on this one.', amount: 2400, status: 'passed', yes: 7, no: 0, abstain: 1, total: 8, proposedBy: 'Hector M.', myVote: 'yes', expiresAt: new Date('2026-02-20T23:59:00').getTime() },
      { id: 'vote-4', title: 'Amend constitution: extend probation period to 3 months', description: 'Following the Tom N. situation, several members proposed extending the probationary period from 1 month to 3 months for all new members. This would not affect existing members.', amount: null, status: 'failed', yes: 3, no: 4, abstain: 1, total: 8, proposedBy: 'Priya W.', myVote: 'no', expiresAt: new Date('2026-01-15T23:59:00').getTime() },
      { id: 'vote-5', title: 'Allocate $3,200 to Matt D.: Student Loan (cycle 3)', description: '', amount: 3200, status: 'passed', yes: 8, no: 0, abstain: 0, total: 8, proposedBy: 'Hector M.', myVote: 'yes', expiresAt: new Date('2025-12-18T23:59:00').getTime() },
      { id: 'vote-6', title: 'Admit Tom N. as member', description: 'Tom was referred by Richie G. and completed the onboarding form. First contribution pending.', amount: null, status: 'passed', yes: 6, no: 1, abstain: 1, total: 7, proposedBy: 'Richie G.', myVote: 'yes', expiresAt: new Date('2026-01-25T23:59:00').getTime() },
    ],
    structure: {
      accountType: 'hysa',
      payInFrequency: 'monthly',
      poolTarget: 60000,
      minContribution: 400,
      payoutStructure: 'rotating',
      amendmentThreshold: 'two_thirds',
      quorum: 'two_thirds',
      dishonorableExit: 'returned_no_interest',
      probationPeriod: '1_month',
      latePaymentPolicy: 'grace_7',
      exitNoticePeriod: '1_month',
      memberAdmission: 'vote_required',
    },
    joinRequests: [
      { id: 'jr-1', initials: 'SC', name: 'Sofia C.',  handle: '@sofia_c', location: 'New Haven, CT', requestedAt: 'Mar 15, 2026', photo: 'https://randomuser.me/api/portraits/women/66.jpg', message: "Hi, I'm a grad student at Yale with $22k in federal loans. I heard about this group through Priya and would love to join. I've been contributing consistently to a savings account for the past year and take financial commitments seriously." },
      { id: 'jr-2', initials: 'BK', name: 'Ben K.',    handle: '@benk',    location: 'New Haven, CT', requestedAt: 'Mar 18, 2026', photo: 'https://randomuser.me/api/portraits/men/8.jpg',   message: null },
    ],
  },
  {
    id: 'v-002',
    name: 'Uptown Savers',
    photo: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=400&h=400&fit=crop&q=80',
    goal: 'Emergency Fund',
    goalType: 'saving',
    members: 6,
    maxMembers: 10,
    pooled: 14800,
    target: 50000,
    myContribution: 1350,
    nextContribution: 350,
    nextDate: 'Apr 1, 2026',
    intervalLabel: 'Monthly',
    color: 'green',
    founded: 'Nov 2025',
    memberList: [
      { id: 'm1', initials: 'HM', name: 'Hector M.', role: 'Member',    contrib: 1350, status: 'active',  joined: 'Nov 14, 2025', photo: 'https://randomuser.me/api/portraits/men/75.jpg' },
      { id: 'm2', initials: 'CJ', name: 'Carmen J.', role: 'Founder',   contrib: 1650, status: 'active',  joined: 'Nov 1, 2025',  photo: 'https://randomuser.me/api/portraits/women/48.jpg' },
      { id: 'm3', initials: 'BW', name: 'Ben W.',    role: 'Treasurer', contrib: 1650, status: 'active',  joined: 'Nov 1, 2025',  photo: 'https://randomuser.me/api/portraits/men/61.jpg' },
      { id: 'm4', initials: 'SK', name: 'Sara K.',   role: 'Member',    contrib: 1650, status: 'active',  joined: 'Nov 1, 2025',  photo: 'https://randomuser.me/api/portraits/women/60.jpg' },
      { id: 'm5', initials: 'OT', name: 'Olu T.',    role: 'Member',    contrib: 1650, status: 'active',  joined: 'Nov 1, 2025',  photo: 'https://randomuser.me/api/portraits/women/72.jpg' },
      { id: 'm6', initials: 'NR', name: 'Nina R.',   role: 'Member',    contrib: 350,  status: 'pending', joined: 'Feb 15, 2026', photo: 'https://randomuser.me/api/portraits/women/84.jpg' },
    ],
    recentActivity: [
      { type: 'contribution', actor: 'All members',  amount: 2100, date: 'Mar 1',  note: 'Monthly round, 6 contributors' },
      { type: 'vote',         actor: 'Village',      amount: null, date: 'Mar 3',  note: 'Vote opened: Admit Nina R. as full member' },
      { type: 'join',         actor: 'Nina R.',      amount: null, date: 'Feb 15', note: 'New member, matched via algorithm' },
      { type: 'contribution', actor: 'All members',  amount: 1750, date: 'Feb 1',  note: 'Monthly round, 5 contributors' },
      { type: 'contribution', actor: 'All members',  amount: 1750, date: 'Jan 1',  note: 'Monthly round, 5 contributors' },
      { type: 'vote',         actor: 'Village',      amount: null, date: 'Dec 20', note: 'Vote passed: increase min contribution to $350' },
      { type: 'contribution', actor: 'All members',  amount: 1500, date: 'Dec 1',  note: 'Monthly round, 5 contributors' },
      { type: 'join',         actor: 'Hector M.',    amount: null, date: 'Nov 14', note: 'New member joined, referred by Olu T.' },
    ],
    chat: [
      { id: 'c1',  author: 'Carmen J.', initials: 'CJ', photo: 'https://randomuser.me/api/portraits/women/48.jpg', text: "Welcome to the group Hector! Glad Olu brought you in. We're focused and consistent here, you'll fit right in.", time: 'Nov 14, 9:00 AM', mine: false },
      { id: 'c2',  author: 'You',       initials: 'HM', photo: 'https://randomuser.me/api/portraits/men/75.jpg',   text: "Thanks Carmen. Happy to be here: I've been wanting to build up an emergency fund for a while.", time: 'Nov 14, 9:22 AM', mine: true },
      { id: 'c3',  author: 'Olu T.',    initials: 'OT', photo: 'https://randomuser.me/api/portraits/women/72.jpg', text: "This group stays disciplined. We haven't missed a month yet.", time: 'Nov 14, 9:45 AM', mine: false },
      { id: 'c4',  author: 'Ben W.',    initials: 'BW', photo: 'https://randomuser.me/api/portraits/men/61.jpg',   text: "Just a note: contributions for December are due Dec 1. I'll send a reminder the week before.", time: 'Nov 28, 3:15 PM', mine: false },
      { id: 'c5',  author: 'Sara K.',   initials: 'SK', photo: 'https://randomuser.me/api/portraits/women/60.jpg', text: "Should we discuss bumping the minimum now that we're 6 months in? $300 feels low.", time: 'Dec 10, 11:00 AM', mine: false },
      { id: 'c6',  author: 'Carmen J.', initials: 'CJ', photo: 'https://randomuser.me/api/portraits/women/48.jpg', text: "Agreed. I'll draft a resolution for $350 minimum starting Jan.", time: 'Dec 10, 11:18 AM', mine: false },
      { id: 'c7',  author: 'You',       initials: 'HM', photo: 'https://randomuser.me/api/portraits/men/75.jpg',   text: "Works for me. That's manageable.", time: 'Dec 10, 11:35 AM', mine: true },
      { id: 'c8',  author: 'Carmen J.', initials: 'CJ', photo: 'https://randomuser.me/api/portraits/women/48.jpg', text: "We're at $14.8k, on track to hit target by Q1 2027 at this rate.", time: 'Mar 2, 10:02 AM', mine: false },
      { id: 'c9',  author: 'You',       initials: 'HM', photo: 'https://randomuser.me/api/portraits/men/75.jpg',   text: "Great pace. Anyone want to discuss bumping contributions in April?", time: 'Mar 2, 10:15 AM', mine: true },
      { id: 'c10', author: 'Olu T.',    initials: 'OT', photo: 'https://randomuser.me/api/portraits/women/72.jpg', text: "I'm open to it. Maybe +$50?", time: 'Mar 2, 11:30 AM', mine: false },
      { id: 'c11', author: 'Ben W.',    initials: 'BW', photo: 'https://randomuser.me/api/portraits/men/61.jpg',   text: "Let's see how Nina's first full month goes, then revisit. Don't want to scare off a new member.", time: 'Mar 2, 12:05 PM', mine: false },
      { id: 'c12', author: 'Sara K.',   initials: 'SK', photo: 'https://randomuser.me/api/portraits/women/60.jpg', text: "Fair point. Tabling until April then.", time: 'Mar 2, 12:20 PM', mine: false },
    ],
    votes: [
      { id: 'vote-a1', title: 'Admit Nina R. as full member (first contribution cleared)', description: 'Nina submitted her first contribution of $350 last week. Formal vote to move her to full member status per village charter, unlocking her voting rights.', amount: null, status: 'open', yes: 4, no: 0, abstain: 1, total: 6, proposedBy: 'Carmen J.', myVote: 'yes', expiresAt: new Date('2026-03-22T23:59:00').getTime() },
      { id: 'vote-a2', title: 'Increase minimum monthly contribution to $400 from April', description: "With the fund at $14.8k and 6 active contributors, a bump to $400 minimum would reach our $50k target 4 months earlier. Members on tighter budgets may contribute their current amount during a 2-month grace window.", amount: 400, status: 'open', yes: 2, no: 1, abstain: 0, total: 6, proposedBy: 'Hector M.', myVote: 'yes', expiresAt: new Date('2026-03-22T23:59:00').getTime() },
      { id: 'vote-a3', title: 'Increase minimum contribution to $350 starting January', description: 'Original minimum of $300 set at launch. Group has been consistent. $350 is a reasonable step up.', amount: 350, status: 'passed', yes: 5, no: 0, abstain: 1, total: 5, proposedBy: 'Carmen J.', myVote: 'yes', expiresAt: new Date('2025-12-20T23:59:00').getTime() },
      { id: 'vote-a4', title: 'Admit Hector M. as member (referred by Olu T.)', description: 'Hector is a PhD student with a stable stipend income and a clear savings goal. Olu vouches for him directly.', amount: null, status: 'passed', yes: 4, no: 0, abstain: 1, total: 5, proposedBy: 'Olu T.', myVote: null, expiresAt: new Date('2025-11-10T23:59:00').getTime() },
      { id: 'vote-a5', title: 'Set emergency fund target at $50,000', description: 'Founding vote to establish the pool target for the group. Represents approximately 3–6 months of living expenses for a household of two in the NYC metro.', amount: 50000, status: 'passed', yes: 5, no: 0, abstain: 0, total: 5, proposedBy: 'Carmen J.', myVote: null, expiresAt: new Date('2025-11-05T23:59:00').getTime() },
    ],
    structure: {
      accountType: 'hysa',
      payInFrequency: 'monthly',
      poolTarget: 50000,
      minContribution: 350,
      payoutStructure: 'voted',
      amendmentThreshold: 'majority',
      quorum: 'two_thirds',
      dishonorableExit: 'returned_with_interest',
      probationPeriod: '3_months',
      latePaymentPolicy: 'removal_3_missed',
      exitNoticePeriod: '2_months',
      memberAdmission: 'vote_required',
    },
    joinRequests: [
      { id: 'jr-3', initials: 'NW', name: 'Nia W.',    handle: '@niaw',    location: 'Brooklyn, NY', requestedAt: 'Mar 12, 2026', photo: 'https://randomuser.me/api/portraits/women/78.jpg', message: "I've been managing a variable freelance income for 3 years and finally have the stability to commit to a group like this. My goal is a 6-month emergency fund. Happy to share more details if helpful." },
      { id: 'jr-4', initials: 'DP', name: 'Darius P.', handle: '@dariusp', location: 'Bronx, NY',     requestedAt: 'Mar 19, 2026', photo: 'https://randomuser.me/api/portraits/men/89.jpg',   message: null },
      { id: 'jr-5', initials: 'LT', name: 'Lena T.',   handle: '@lenat',   location: 'Queens, NY',    requestedAt: 'Mar 20, 2026', photo: 'https://randomuser.me/api/portraits/women/90.jpg', message: "Referred by Kemi O., she said this group has real accountability. I'm in healthcare, steady income, just trying to build something real." },
    ],
  },
]

export const EXPLORE_VILLAGES = [
  {
    id: 'e1', name: 'First Home Circle', handle: '@firsthomecircle', goal: 'Down Payment',
    photo: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=400&h=400&fit=crop&q=80',
    location: 'New York, NY', members: 6, maxMembers: 8, pooled: 38900, target: 80000,
    color: 'green', match: 92, founded: 'Mar 2025',
    headline: 'First-time homebuyers in the NYC metro pooling toward down payments on a monthly cadence',
    intervalLabel: 'Monthly', myContribution: 0, nextContribution: 0, nextDate: 'Pending',
    structure: { accountType: 'hysa', payInFrequency: 'monthly', poolTarget: 80000, minContribution: 300, payoutStructure: 'voted', amendmentThreshold: 'two_thirds', quorum: 'two_thirds', dishonorableExit: 'returned_no_interest', probationPeriod: '3_months', latePaymentPolicy: 'grace_7', exitNoticePeriod: '1_month', memberAdmission: 'vote_required' },
    memberList: [
      { id: 'm1', initials: 'LF', name: 'Layla F.',  role: 'Founder',   contrib: 7200, status: 'active', joined: 'Mar 8, 2025', photo: 'https://randomuser.me/api/portraits/women/7.jpg' },
      { id: 'm2', initials: 'JO', name: 'Jerome O.', role: 'Treasurer', contrib: 7200, status: 'active', joined: 'Mar 8, 2025', photo: 'https://randomuser.me/api/portraits/men/70.jpg' },
    ],
    recentActivity: [
      { type: 'contribution', actor: 'All members', amount: 1800, date: 'Mar 1', note: 'Monthly round, 6 contributors' },
    ],
    chat: [], votes: [],
  },
  {
    id: 'e2', name: 'Harlem Builders', handle: '@harlembuilders', goal: 'Small Business',
    photo: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=400&h=400&fit=crop&q=80',
    location: 'Harlem, NY', members: 9, maxMembers: 12, pooled: 47800, target: 100000,
    color: 'terra', match: 87, founded: 'Jan 2025',
    headline: 'Community-backed capital fund for Harlem small business owners with flexible payout conditions',
    intervalLabel: 'Monthly', myContribution: 0, nextContribution: 0, nextDate: 'Pending',
    structure: { accountType: 'checking', payInFrequency: 'monthly', poolTarget: 100000, minContribution: 500, payoutStructure: 'voted', amendmentThreshold: 'two_thirds', quorum: 'two_thirds', dishonorableExit: 'withheld', probationPeriod: '3_months', latePaymentPolicy: 'removal_3_missed', exitNoticePeriod: '2_months', memberAdmission: 'vote_required' },
    memberList: [], recentActivity: [], chat: [], votes: [],
  },
  {
    id: 'e3', name: 'Retirement Ready', handle: '@retirementready', goal: 'Retirement',
    photo: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400&h=400&fit=crop&q=80',
    location: 'Jersey City, NJ', members: 14, maxMembers: 20, pooled: 112000, target: 500000,
    color: 'green', match: 78, founded: 'Jun 2024',
    headline: 'Long-horizon retirement savings collective for adults aged 30–45 with an index-focused strategy',
    intervalLabel: 'Monthly', myContribution: 0, nextContribution: 0, nextDate: 'Pending',
    structure: { accountType: 'brokerage', payInFrequency: 'monthly', poolTarget: 500000, minContribution: 400, payoutStructure: 'proportional', amendmentThreshold: 'two_thirds', quorum: 'all', dishonorableExit: 'returned_with_interest', probationPeriod: '6_months', latePaymentPolicy: 'grace_7', exitNoticePeriod: '3_months', memberAdmission: 'invite_no_vote' },
    memberList: [], recentActivity: [], chat: [], votes: [],
  },
  {
    id: 'e4', name: 'Student Debt Crew', handle: '@studentdebtcrew', goal: 'Education Debt',
    photo: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=400&h=400&fit=crop&q=80',
    location: 'New Haven, CT', members: 5, maxMembers: 10, pooled: 18200, target: 60000,
    color: 'terra', match: 95, founded: 'Aug 2025',
    headline: 'Accelerating payoff of federal and private student loans through collective monthly contributions',
    intervalLabel: 'Monthly', myContribution: 0, nextContribution: 0, nextDate: 'Pending',
    structure: { accountType: 'hysa', payInFrequency: 'monthly', poolTarget: 60000, minContribution: 200, payoutStructure: 'rotating', amendmentThreshold: 'majority', quorum: 'two_thirds', dishonorableExit: 'returned_no_interest', probationPeriod: '1_month', latePaymentPolicy: 'grace_7', exitNoticePeriod: '1_month', memberAdmission: 'any_member' },
    memberList: [], recentActivity: [], chat: [], votes: [],
  },
  {
    id: 'e5', name: 'South Bronx Safety Net', handle: '@sbs_net', goal: 'Emergency Fund',
    photo: 'https://images.unsplash.com/photo-1517457373958-b7bdd4587205?w=400&h=400&fit=crop&q=80',
    location: 'Bronx, NY', members: 8, maxMembers: 12, pooled: 29600, target: 80000,
    color: 'terra', match: 81, founded: 'Sep 2025',
    headline: 'Working families in the South Bronx building shared emergency reserves: monthly contributions, voted access',
    intervalLabel: 'Monthly', myContribution: 0, nextContribution: 0, nextDate: 'Pending',
    structure: { accountType: 'checking', payInFrequency: 'monthly', poolTarget: 80000, minContribution: 200, payoutStructure: 'voted', amendmentThreshold: 'majority', quorum: 'two_thirds', dishonorableExit: 'returned_no_interest', probationPeriod: '1_month', latePaymentPolicy: 'grace_7', exitNoticePeriod: '1_month', memberAdmission: 'invite_no_vote' },
    memberList: [], recentActivity: [], chat: [], votes: [],
  },
  {
    id: 'e6', name: 'Greenpoint Growth Fund', handle: '@greenpointgrowth', goal: 'Wealth Building',
    photo: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=400&h=400&fit=crop&q=80',
    location: 'Brooklyn, NY', members: 10, maxMembers: 15, pooled: 78500, target: 250000,
    color: 'green', match: 69, founded: 'Feb 2025',
    headline: 'Mid-career professionals building long-term wealth through a diversified brokerage collective',
    intervalLabel: 'Monthly', myContribution: 0, nextContribution: 0, nextDate: 'Pending',
    structure: { accountType: 'brokerage', payInFrequency: 'monthly', poolTarget: 250000, minContribution: 400, payoutStructure: 'proportional', amendmentThreshold: 'two_thirds', quorum: 'two_thirds', dishonorableExit: 'returned_with_interest', probationPeriod: '3_months', latePaymentPolicy: 'grace_7', exitNoticePeriod: '3_months', memberAdmission: 'vote_required' },
    memberList: [], recentActivity: [], chat: [], votes: [],
  },
]

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [villages, setVillages] = useState(DEMO_VILLAGES)
  const [dms, setDms] = useState([])

  const login = () => {
    setUser(DEMO_USER)
    return true
  }

  const signup = (data) => {
    const initials = `${data.first_name?.[0] || '?'}${data.last_name?.[0] || '?'}`.toUpperCase()
    setUser({
      id: `u-${Date.now()}`,
      first_name: data.first_name || '',
      last_name:  data.last_name  || '',
      email:      data.email      || '',
      phone:      data.phone      || '',
      avatar:     initials,
      priority:   '',
      joined:     new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
      financial: {
        income: data.income || [],
        debts:  data.debts  || [],
        assets: data.assets || [],
      },
    })
    setVillages([])
    return true
  }

  const logout = () => setUser(null)

  const castVote = (villageId, voteId, choice) => {
    setVillages(prev => prev.map(v => {
      if (v.id !== villageId) return v
      return {
        ...v,
        votes: v.votes.map(vote => {
          if (vote.id !== voteId || vote.myVote) return vote
          return { ...vote, myVote: choice, [choice]: vote[choice] + 1 }
        }),
      }
    }))
  }

  const cancelVote = (villageId, voteId) => {
    setVillages(prev => prev.map(v => {
      if (v.id !== villageId) return v
      return { ...v, votes: v.votes.filter(vote => vote.id !== voteId) }
    }))
  }

  const sendMessage = (villageId, text) => {
    setVillages(prev => prev.map(v => {
      if (v.id !== villageId) return v
      return {
        ...v,
        chat: [...v.chat, {
          id: `c${Date.now()}`,
          author: 'You',
          initials: user?.avatar || 'ME',
          text,
          time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
          mine: true,
        }],
      }
    }))
  }

  const draftResolution = (villageId, { title, description, amount }) => {
    setVillages(prev => prev.map(v => {
      if (v.id !== villageId) return v
      const newVote = {
        id: `vote-${Date.now()}`,
        title,
        description: description || '',
        amount: amount ? Number(amount) : null,
        status: 'open',
        yes: 0, no: 0, abstain: 0,
        total: v.members,
        proposedBy: `${user?.first_name || ''} ${user?.last_name?.[0] || ''}.`,
        myVote: null,
        expiresAt: Date.now() + 3 * 24 * 60 * 60 * 1000,
      }
      return { ...v, votes: [newVote, ...v.votes] }
    }))
  }

  const joinVillage = (v, message = '') => {
    if (villages.find(existing => existing.id === v.id)) return
    if (villages.length >= 2) return
    const today = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    const meEntry = {
      id: 'me', initials: user?.avatar || '?',
      name: `${user?.first_name || ''} ${user?.last_name?.[0] || ''}.`,
      role: 'Pending', contrib: 0, status: 'pending',
    }
    const joinActivity = {
      type: 'join', actor: `${user?.first_name || ''} ${user?.last_name || ''}`,
      amount: null, date: today,
      note: message ? `Join request sent, "${message}"` : 'Join request sent, awaiting approval',
    }
    const newVillage = {
      ...v,
      color: 'green',
      goalType: v.goal.toLowerCase().replace(/ /g, '_'),
      myContribution: 0,
      nextContribution: 0,
      nextDate: 'Pending approval',
      memberList: [...(v.memberList || []), meEntry],
      recentActivity: [joinActivity, ...(v.recentActivity || [])],
      chat: v.chat || [],
      votes: v.votes || [],
    }
    setVillages(prev => [...prev, newVillage])
  }

  const leaveVillage = (villageId) => {
    setVillages(prev => prev.filter(v => v.id !== villageId))
  }

  const updateFinancial = (financial) => {
    setUser(prev => ({ ...prev, financial }))
  }

  const startDM = (person) => {
    setDms(prev => {
      if (prev.find(d => d.personId === person.id)) return prev
      return [...prev, { personId: person.id, person, messages: [] }]
    })
  }

  const sendDM = (personId, text) => {
    setDms(prev => prev.map(d => {
      if (d.personId !== personId) return d
      return {
        ...d,
        messages: [...d.messages, {
          id: `dm-${Date.now()}`,
          text,
          mine: true,
          time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
        }],
      }
    }))
  }

  return (
    <AuthContext.Provider value={{
      user, villages, setVillages,
      login, signup, logout,
      castVote, cancelVote,
      sendMessage, draftResolution,
      joinVillage, leaveVillage,
      updateFinancial,
      dms, startDM, sendDM,
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
