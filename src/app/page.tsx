import Link from 'next/link'
import Image from 'next/image'
import { Metadata } from 'next'
import { Button } from '@/components/ui/button'
import HeroOverlayImage from '@/images/hero-overlay-3000x2000.jpg'
import RoundsTableImage from '@/images/rounds-table-1000x750.jpg'
import CoinsBottleImage from '@/images/coins-bottle-1000x750.jpg'
import ColleagesMeetingImage from '@/images/colleagues-meeting-1000x750.jpg'
import CommunityMembersImage from '@/images/community-members-1000x750.jpg'

export const metadata: Metadata = {
	title: 'MEF | Get Involved',
	description:
		'Join the movement and help shape the future of the Mina Protocol. Submit a proposal to drive community growth and innovation.',
}

export default function LandingPage() {
	return (
		<div className="divide-y divide-border">
			<Hero />
			<WhatIsMEF />
			<ActiveFund />
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
				<Button variant="secondary" size="lg" className="text-lg">
					Submit a Proposal
				</Button>
			</div>
		</div>
	)
}

function WhatIsMEF() {
	return (
		<section className="py-12 md:py-24">
			<div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
				<div className="grid grid-cols-1 items-start gap-8 md:grid-cols-2 md:gap-12">
					<Image
						src={CoinsBottleImage}
						alt="Community gathering"
						className="rounded-2xl object-cover"
						quality={100}
					/>
					<div>
						<h2 className="mb-8 text-4xl font-bold text-gray-900">
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

function ActiveFund() {
	return (
		<section className="bg-gray-50 py-12 md:py-24">
			<div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
				<div className="grid grid-cols-1 overflow-hidden rounded-xl border border-border md:grid-cols-2">
					<div className="bg-secondary p-12 text-white">
						<div className="mb-6 flex items-center space-x-2">
							<div className="h-5 w-5 animate-pulse rounded-full bg-green-400" />
							<span className="text-xl font-medium">ACTIVE</span>
						</div>
						<h3 className="mb-4 text-3xl font-bold">&lt;MEF Fund 1&gt;</h3>
						<p className="mb-6 text-white/80">
							&lt;From XX/2025 to XX/2025&gt;
						</p>
						<p className="mb-8 text-lg">
							Be a driving force in unlocking new opportunities and resources to
							empower the growth and success of the Mina ecosystem.
						</p>
						<Button
							variant="secondary"
							size="lg"
							className="bg-white px-6 text-lg text-secondary hover:bg-gray-100"
						>
							I want to participate!
						</Button>
					</div>
					<div className="relative hidden md:block">
						<Image
							src={RoundsTableImage}
							alt="Community collaboration"
							className="h-full w-full object-cover"
						/>
					</div>
				</div>
			</div>
		</section>
	)
}

function Community() {
	const communityCards = [
		{
			title: 'Reviewer',
			description: `
			Subject matter experts evaluate project proposals to ensure they
							meet the defined acceptance criteria before advancing in the
							funding process. Their role is essential in maintaining quality,
							fairness, and alignment with the community's funding objectives.`,
			image: ColleagesMeetingImage,
			buttons: [
				{ label: 'Check our team', variant: 'secondary' },
				{ label: 'Learn more', variant: 'outline' },
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
				},
				{ label: 'Learn more', variant: 'outline' },
			],
		},
	]

	return (
		<section className="py-12 md:py-24">
			<div className="mx-auto flex max-w-5xl flex-col gap-y-8 px-4 sm:px-6 md:gap-y-16 lg:px-8">
				<div>
					<h2 className="mb-4 text-center text-4xl font-bold text-gray-900">
						Empowering the Community to Shape the Future
					</h2>
					<p className="mx-auto max-w-5xl text-center text-lg text-gray-600">
						You have the opportunity to participate in the funding process in a
						way that aligns with your interests. Whether it's proposing new
						initiatives, reviewing and refining ideas, voting on projects,
						ensuring transparency, or influencing key decisions, your
						involvement plays a crucial role in ensuring a fair and effective
						funding system.
					</p>
				</div>
				{communityCards.map((card, index) => (
					<div
						key={index}
						className="flex w-full flex-col items-center overflow-hidden rounded-2xl border border-border md:h-[340px] md:grid-cols-2 md:flex-row md:odd:flex-row-reverse"
					>
						<div className="max-w-sm p-8 lg:max-w-lg">
							<h3 className="mb-4 text-3xl font-bold">{card.title}</h3>
							<p className="mb-6 text-gray-600">{card.description}</p>
							<div className="flex space-x-4">
								{card.buttons.map(button => (
									<Button variant={button.variant as any}>
										{button.label}
									</Button>
								))}
							</div>
						</div>
						<div className="relative hidden h-full w-full md:block">
							<Image
								src={card.image}
								alt="Community collaboration"
								className="absolute left-1/2 top-1/2 h-auto min-h-full w-full -translate-x-1/2 -translate-y-1/2"
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
			<div className="mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
				<h2 className="mb-8 text-3xl font-bold">Contact Us</h2>
				<p className="mx-auto mb-8 max-w-2xl text-gray-300">
					Join the Mina Foundation's Protocol Governance Discord channel and be
					part of the conversation shaping Mina's future.
				</p>
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
								fill-rule="nonzero"
							></path>
						</g>
					</svg>
					Join
				</Button>
			</div>
		</section>
	)
}
