/** @type {import('next').NextConfig} */
const config = {
	output: 'standalone',
	experimental: {
		serverActions: {
			bodySizeLimit: '2mb',
		},
	},
	serverExternalPackages: ['@prisma/client'],
	webpack: (config, { isServer }) => {
		if (isServer) {
			config.externals = [...(config.externals || []), '@prisma/client']
		}
		return config
	},
}

export default config
