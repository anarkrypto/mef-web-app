import Link from 'next/link'
import Image, { StaticImageData } from 'next/image'
import { Metadata } from 'next'
import { Button } from '@/components/ui/button'
import HeroOverlayImage from '@/images/hero-overlay-3000x2000.jpg'
import RoundsTableImage from '@/images/rounds-table-1000x750.jpg'
import CoinsBottleImage from '@/images/coins-bottle-1000x750.jpg'
import ColleagesMeetingImage from '@/images/colleagues-meeting-1000x750.jpg'
import CommunityMembersImage from '@/images/community-members-1000x750.jpg'
import { FundingRoundService } from '@/services'
import prisma from '@/lib/prisma'
import { Suspense } from 'react'
import { FundingRound } from '@/types/funding-round'
import { CheckCheckIcon } from 'lucide-react'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
	title: 'MEF | Get Involved',
	description:
		'Join the movement and help shape the future of the Mina Protocol. Submit a proposal to drive community growth and innovation.',
}

const getLastFundingRound = async (): Promise<FundingRound | null> => {
	const fundingRoundService = new FundingRoundService(prisma)
	return await fundingRoundService.getLastPublicFundingRound()
}

export default function LandingPage() {
	return (
		<div className="divide-y divide-border">
			<Hero />
			<WhatIsMEF />
			<Suspense fallback={<ActiveFundsSkeleton />}>
				<ActiveFunds />
			</Suspense>
			<Community />
			<ContactSection />
		</div>
	)
}

function Hero() {
	return (
		<div className="relative flex min-h-screen items-center">
			<div className="absolute inset-0 z-0">
				<Image
					src={HeroOverlayImage}
					alt="Community gathering"
					className="h-full w-full object-cover"
					quality={100}
				/>
				<div className="absolute inset-0 bg-black/40" />
			</div>
			<div className="relative z-10 mx-auto max-w-4xl px-4 text-center sm:px-6 md:text-left lg:px-8">
				<h1 className="mb-6 text-6xl font-bold text-white lg:text-7xl">
					MEF: Mina Ecosystem Funding
				</h1>
				<p className="mb-8 max-w-2xl text-lg text-white/90 sm:text-xl">
					Join the movement and help shape the future of the Mina Protocol.
					Submit a proposal to drive community growth and innovation.
				</p>
				<Link href="/proposals">
					<Button variant="secondary" size="lg" className="text-lg">
						Submit a Proposal
					</Button>
				</Link>
			</div>
		</div>
	)
}

function WhatIsMEF() {
	return (
		<section className="py-12 md:py-24">
			<div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
				<div className="flex flex-col gap-6 md:flex-row-reverse md:gap-12">
					<div className="md:w-1/2">
						<Image
							src={CoinsBottleImage}
							alt="Community gathering"
							className="rounded-2xl object-cover"
							quality={100}
						/>
					</div>
					<div className="w-full md:w-1/2">
						<h2 className="mb-4 text-4xl font-bold text-gray-900">
							What is MEF
						</h2>
						<div className="space-y-6 text-gray-600">
							<p className="text-lg leading-relaxed">
								A <b>community-driven funding process</b> designed to support
								teams and initiatives that contribute to the Mina Protocol
								ecosystem. Community members are encouraged to{' '}
								<b>submit proposals</b> for relevant projects, which will be{' '}
								<b>evaluated by subject-matter experts</b> before proceeding to
								a <b>community vote</b>.
							</p>
							<p className="text-lg leading-relaxed">
								Approved projects will receive funding, with{' '}
								<b>transparent reporting requirements</b> to ensure
								accountability and allow the broader community to track their
								progress.
							</p>
						</div>
						<Link
							href="/how-it-works"
							className="mt-8 inline-block font-medium text-secondary hover:underline"
						>
							Learn how it works →
						</Link>
					</div>
				</div>
			</div>
		</section>
	)
}

async function ActiveFunds() {
	const fund = await getLastFundingRound()

	if (!fund) {
		return null
	}

	const formatDate = (date: Date) =>
		`${date.toLocaleString('default', { month: 'short' })} ${date.getDate()}, ${date.getFullYear()}`

	const STATUSES = [
		{
			status: 'UPCOMING',
			label: 'Upcoming',
			indicator: (
				<div className="h-5 w-5 animate-pulse rounded-full bg-yellow-400" />
			),
			button: {
				label: 'View Details',
				href: `/funding-rounds/${fund.id}`,
			},
		},
		{
			status: 'ACTIVE',
			label: 'Active',
			indicator: (
				<div className="h-5 w-5 animate-pulse rounded-full bg-green-400" />
			),
			button: {
				label: 'I want to participate!',
				href: `/funding-rounds/${fund.id}`,
			},
		},
		{
			status: 'COMPLETED',
			label: 'Completed',
			indicator: (
				<CheckCheckIcon className="h-6 w-6 animate-pulse rounded-full text-white" />
			),
			button: {
				label: 'View Summary',
				href: `/funding-rounds/${fund.id}/summaries`,
			},
		},
	]

	const currentStatus = STATUSES.find(s => s.status === fund.status)!

	return (
		<section className="space-y-8 bg-gray-50 py-12 md:py-24">
			{fund && (
				<div key={fund.id} className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
					<div className="flex overflow-hidden rounded-xl border border-border">
						<div className="hidden bg-muted md:block md:w-1/2">
							<Image
								src={RoundsTableImage}
								alt="Community collaboration"
								className="aspect-4/3 h-auto min-h-full w-full object-cover"
							/>
						</div>
						<div className="w-full bg-secondary p-12 text-white md:w-1/2">
							<div className="mb-6 flex items-center space-x-2">
								{currentStatus.indicator}
								<span className="text-xl font-medium">
									{currentStatus.label}
								</span>
							</div>
							<h3 className="mb-4 text-3xl font-bold">{fund.name}</h3>
							<p className="mb-6 text-white/80">
								From <b>{formatDate(new Date(fund.startDate))}</b> to{' '}
								<b>{formatDate(new Date(fund.endDate))}</b>
							</p>
							<p className="mb-8 text-lg">
								Be a driving force in unlocking new opportunities and resources
								to empower the growth and success of the Mina ecosystem.
							</p>
							<Link href={currentStatus.button.href}>
								<Button
									variant="secondary"
									size="lg"
									className="bg-white px-6 text-lg text-secondary hover:bg-gray-100"
								>
									{currentStatus.button.label}
								</Button>
							</Link>
						</div>
					</div>
				</div>
			)}
		</section>
	)
}

async function ActiveFundsSkeleton() {
	return (
		<section className="space-y-8 bg-gray-50 py-12 md:py-24">
			<div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
				<div className="flex overflow-hidden rounded-xl border border-border md:flex-row-reverse">
					<div className="w-full bg-secondary p-12 text-white md:w-1/2">
						<div className="mb-8 flex items-center space-x-2">
							<div className="h-5 w-5 animate-pulse rounded-full bg-muted" />
							<div className="h-6 w-40 animate-pulse rounded-lg bg-muted" />
						</div>
						<div className="mb-4 h-20 w-full animate-pulse rounded-lg bg-muted md:h-10" />
						<div className="mb-8 h-5 w-full animate-pulse rounded-lg bg-muted" />
						<div className="mb-8 h-36 animate-pulse rounded-lg bg-muted lg:h-20" />
						<div className="h-10 w-56 animate-pulse rounded-md bg-muted" />
					</div>
					<div className="relative hidden w-1/2 md:block">
						<Image
							src={RoundsTableImage}
							alt="Community collaboration"
							className="h-full w-full animate-pulse object-cover blur-xl"
						/>
					</div>
				</div>
			</div>
		</section>
	)
}

function Community() {
	const communityCards: {
		title: string
		description: string
		image: StaticImageData
		buttons: { label: string; variant: 'secondary' | 'outline'; href: string }[]
	}[] = [
		{
			title: 'Reviewer',
			description: `
			Subject matter experts evaluate project proposals to ensure they
							meet the defined acceptance criteria before advancing in the
							funding process. Their role is essential in maintaining quality,
							fairness, and alignment with the community's funding objectives.`,
			image: ColleagesMeetingImage,
			buttons: [
				{
					label: 'Enroll via web form',
					variant: 'secondary',
					href: 'https://docs.google.com/forms/d/e/1FAIpQLSevCzfZczeLsJkoPcwyCukvz1Af0xHjxcahYa4HFbOadJfdkw/viewform',
				},
				{
					label: 'Learn more',
					variant: 'outline',
					href: '/how-it-works#reviewers',
				},
			],
		},
		{
			title: 'Community Member',
			description: `
				Community members contribute by proposing, discussing, voting, and
							ensuring accountability, helping to direct resources toward
							impactful initiatives while maintaining a fair and transparent
							funding process.
							`,
			image: CommunityMembersImage,
			buttons: [
				{
					label: 'Vote on a Proposal',
					variant: 'secondary',
					href: '/funding-rounds',
				},
				{
					label: 'Learn more',
					variant: 'outline',
					href: '/how-it-works#community-member',
				},
			],
		},
	]

	return (
		<section className="py-12 md:py-24">
			<div className="mx-auto flex max-w-6xl flex-col gap-y-8 px-4 sm:px-6 md:gap-y-16 lg:px-8">
				<div>
					<h2 className="mb-4 text-center text-4xl font-bold text-gray-900">
						Empowering the Community to Shape the Future
					</h2>
					<p className="text-center text-lg text-gray-600">
						You have the opportunity to participate in the funding process in a
						way that aligns with your interests. Whether it&apos;s proposing new
						initiatives, reviewing and refining ideas, voting on projects,
						ensuring transparency, or influencing key decisions, your
						involvement plays a crucial role in ensuring a fair and effective
						funding system.
					</p>
				</div>
				{communityCards.map((card, index) => (
					<div
						key={index}
						className="flex w-full flex-col items-center gap-6 text-lg md:h-[260px] md:grid-cols-2 md:flex-row md:odd:flex-row-reverse lg:gap-10"
					>
						<div className="w-full py-8 md:w-3/5">
							<h3 className="mb-4 text-3xl font-bold">{card.title}</h3>
							<p className="mb-6 text-gray-600">{card.description}</p>
							<div className="flex space-x-4">
								{card.buttons.map((button, index) => (
									<Link href={button.href} key={index}>
										<Button key={index} variant={button.variant}>
											{button.label}
										</Button>
									</Link>
								))}
							</div>
						</div>
						<div className="hidden h-full w-2/5 overflow-hidden rounded-2xl bg-muted md:block">
							<Image
								src={card.image}
								alt="Community collaboration"
								className="aspect-4/3 h-auto min-h-full w-full object-cover"
								quality={100}
							/>
						</div>
					</div>
				))}
			</div>
		</section>
	)
}

function ContactSection() {
	return (
		<section className="bg-gray-900 py-12 text-white md:py-24">
			<div className="mx-auto max-w-6xl px-4 text-center sm:px-6 lg:px-8">
				<h2 className="mb-8 text-3xl font-bold">Contact Us</h2>
				<p className="mx-auto mb-8 max-w-2xl text-gray-300">
					Join the Mina Foundation&apos;s Protocol Governance Discord channel
					and be part of the conversation shaping Mina&apos;s future.
				</p>
				<a
					href="https://discord.com/channels/1229012241710448640/1328303180701761618"
					target="_blank"
				>
					<Button variant="secondary" size="lg" className="text-lg">
						<svg
							width="800px"
							height="800px"
							viewBox="0 -28.5 256 256"
							version="1.1"
							preserveAspectRatio="xMidYMid"
						>
							<g>
								<path
									d="M216.856339,16.5966031 C200.285002,8.84328665 182.566144,3.2084988 164.041564,0 C161.766523,4.11318106 159.108624,9.64549908 157.276099,14.0464379 C137.583995,11.0849896 118.072967,11.0849896 98.7430163,14.0464379 C96.9108417,9.64549908 94.1925838,4.11318106 91.8971895,0 C73.3526068,3.2084988 55.6133949,8.86399117 39.0420583,16.6376612 C5.61752293,67.146514 -3.4433191,116.400813 1.08711069,164.955721 C23.2560196,181.510915 44.7403634,191.567697 65.8621325,198.148576 C71.0772151,190.971126 75.7283628,183.341335 79.7352139,175.300261 C72.104019,172.400575 64.7949724,168.822202 57.8887866,164.667963 C59.7209612,163.310589 61.5131304,161.891452 63.2445898,160.431257 C105.36741,180.133187 151.134928,180.133187 192.754523,160.431257 C194.506336,161.891452 196.298154,163.310589 198.110326,164.667963 C191.183787,168.842556 183.854737,172.420929 176.223542,175.320965 C180.230393,183.341335 184.861538,190.991831 190.096624,198.16893 C211.238746,191.588051 232.743023,181.531619 254.911949,164.955721 C260.227747,108.668201 245.831087,59.8662432 216.856339,16.5966031 Z M85.4738752,135.09489 C72.8290281,135.09489 62.4592217,123.290155 62.4592217,108.914901 C62.4592217,94.5396472 72.607595,82.7145587 85.4738752,82.7145587 C98.3405064,82.7145587 108.709962,94.5189427 108.488529,108.914901 C108.508531,123.290155 98.3405064,135.09489 85.4738752,135.09489 Z M170.525237,135.09489 C157.88039,135.09489 147.510584,123.290155 147.510584,108.914901 C147.510584,94.5396472 157.658606,82.7145587 170.525237,82.7145587 C183.391518,82.7145587 193.761324,94.5189427 193.539891,108.914901 C193.539891,123.290155 183.391518,135.09489 170.525237,135.09489 Z"
									fill="#fff"
									fillRule="nonzero"
								></path>
							</g>
						</svg>
						Join
					</Button>
				</a>
			</div>
		</section>
	)
}
